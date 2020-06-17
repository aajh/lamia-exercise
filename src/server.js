const express = require('express');
const pg = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

app.use(express.json());

const router = require("express-promise-router")();
const pool = new pg.Pool({
    connectionString: process.env[process.env.NODE_ENV === 'production' ? 'DATABASE_URL' : 'DEV_DATABASE_URL']
});


function checkPlaceRequestBody(body) {
    const { title, description, position, openingHours } = body;
    const isInvalid = !title || !description
        || !position || !position.lat || !position.lng
        || !openingHours || !openingHours.start || !openingHours.end
        || typeof title !== 'string' || title.length > 512
        || typeof description !== 'string'
        || typeof position.lat !== 'number'
        || typeof position.lng !== 'number'
        || typeof openingHours.start !== 'string' || openingHours.start.length !== 5
        || typeof openingHours.end !== 'string' || openingHours.end.length !== 5
    return isInvalid;
}

async function transformSqlPlace(client, { id, title, description, lat, lng, opening_hours_start, opening_hours_end}) {
    const keywords = await getKeywordsForPlace(client, id);
    return {
        id,
        title,
        description,
        position: {
            lat,
            lng
        },
        openingHours: {
            start: opening_hours_start,
            end: opening_hours_end
        },
        keywords
    }
}

router.get('/places', async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows: sqlPlaces } = await client.query('SELECT * FROM places');
        const places = await Promise.all(sqlPlaces.map(p => transformSqlPlace(client, p)));
        res.json(places);
    } finally {
        client.release();
    }
});

router.get('/places/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query('SELECT * FROM places WHERE id = $1', [req.params.id]);
        if (rows.length > 0) {
            res.json(await transformSqlPlace(client, rows[0]));
        } else {
            res.status(404).json({ error: `place ${req.params.id} not found` });
        }
    } finally {
        client.release();
    }
});

router.post('/places', async (req, res) => {
    const client = await pool.connect();
    try {
        if (req.body === undefined) {
            res.status(400).json({ error: 'invalid request' });
            return
        }

        const { title, description, position, openingHours } = req.body;
        const isInvalid = checkPlaceRequestBody(req.body);
        if (isInvalid) {
            res.status(400).json({ error: 'invalid request' });
            return;
        }

        const id = uuidv4();

        const { rows } = await client.query(`
            INSERT INTO places(id, title, description, lat, lng, opening_hours_start, opening_hours_end)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [id, title, description, position.lat, position.lng, openingHours.start, openingHours.end]
        );

        res.json(await transformSqlPlace(client, rows[0]));
    } finally {
        client.release();
    }
});

router.put('/places/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows: existsRows } = await client.query('SELECT id FROM places WHERE id = $1', [req.params.id]);
        if (existsRows.length === 0) {
            res.status(404).json({ error: `place ${req.params.id} not found` });
            return;
        }

        const isInvalid = checkPlaceRequestBody(req.body);
        if (isInvalid) {
            res.status(400).json({ error: 'invalid request' });
            return;
        }

        const { title, description, position, openingHours } = req.body;

        const { rows } = await client.query(`
            UPDATE places
            SET title = $1, description = $2, lat = $3, lng = $4, opening_hours_start = $5, opening_hours_end = $6
            WHERE id = $7
            RETURNING *`,
            [title, description, position.lat, position.lng, openingHours.start, openingHours.end, req.params.id]
        );

        res.json(await transformSqlPlace(client, rows[0]));
    } finally {
        client.release();
    }
});

router.delete('/places/:id', async (req, res) => {
    await pool.query('DELETE FROM places WHERE id = $1', [req.params.id]);
    res.status(200).end();
});


async function getKeywordsForPlace(client, placeId) {
    const { rows } = await client.query(`
        SELECT keyword_id as id, label
        FROM keyword_places
        LEFT JOIN keywords ON keyword_id = keywords.id
        WHERE place_id = $1
    `, [placeId]);

    return rows;
}

router.get('/keywords', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM keywords');
    res.json(rows);
});

router.get('/keywords/:id', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM keywords WHERE id = $1', [req.params.id]);
    if (rows.length > 0) {
        res.json(rows[0]);
    } else {
        res.status(404).json({ error: `keyword ${req.params.id} not found` });
    }
});

router.post('/keywords', async (req, res) => {
    if (req.body === undefined) {
        res.status(400).json({ error: 'invalid request' });
        return
    }

    const { label } = req.body;
    if (!label || typeof label !== 'string') {
        res.status(400).json({ error: 'invalid request' });
        return
    }

    const id = uuidv4();

    await pool.query('INSERT INTO keywords(id, label) VALUES ($1, $2)', [id, label])

    res.json({ id, label });
});

router.put('/keywords/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows } = await client.query('SELECT id FROM keywords WHERE id = $1', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ error: `keyword ${req.params.id} not found` });
            return;
        }

        const { label } = req.body;
        if (!label || typeof label !== 'string') {
            res.status(400).json({ error: 'invalid request' });
            return
        }

        await client.query('UPDATE keywords SET label = $1 WHERE id = $2', [label, req.params.id]);

        res.json({ id: req.params.id, label });
    } finally {
        client.release();
    }
});

router.delete('/keywords/:id', async (req, res) => {
    await pool.query('DELETE FROM keywords WHERE id = $1', req.params.id);
    res.status(200).end();
});

router.post('/keywords/:id/places/:placeId', async (req, res) => {
    await pool.query(
        'INSERT INTO keyword_places(keyword_id, place_id) VALUES ($1, $2)',
        [req.params.id, req.params.placeId]
    );
    res.status(200).end();
});

router.delete('/keywords/:id/places/:placeId', async (req, res) => {
    await pool.query(
        'DELETE FROM keyword_places WHERE keyword_id = $1 AND place_id = $2',
        [req.params.id, req.params.placeId]
    );
    res.status(200).end();
});


app.use(router);
app.use(express.static('dist'));
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
        next(err);
        return;
    }
    res.status(500).json({ error: 'Internal Server Error' });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`server started at http://localhost:${port} in ${process.env.NODE_ENV} mode`);
});
