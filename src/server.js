const express = require('express');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();

app.use(express.json());


const places = [
    {
        id: 'f92e2a09-fa07-4f7d-b02c-883a81dba496',
        title: 'Central Railway Station',
        description: 'Railway station',
        position: {
            lat: 60.1712,
            lng: 24.9415
        },
        openingHours: {
            start: '04:00',
            end: '01:00'
        }
    },
    {
        id: '56487fc1-398a-4c8d-ab1b-b59fec68ac1b',
        title: 'Stockmann',
        description: 'Department store',
        position: {
            lat: 60.1683,
            lng: 24.9421
        },
        openingHours: {
            start: '10:00',
            end: '20:00'
        }
    }
];

function checkPlaceRequestBody(body) {
    const { title, description, position, openingHours } = body;
    const isInvalid = !title || !description
        || !position || !position.lat || !position.lng
        || !openingHours || !openingHours.start || !openingHours.end
        || typeof title !== 'string'
        || typeof description !== 'string'
        || typeof position.lat !== 'number'
        || typeof position.lng !== 'number'
        || typeof openingHours.start !== 'string'
        || typeof openingHours.end !== 'string'
    return isInvalid;
}

app.get('/places', (req, res) => {
    res.json(places.map(p => ({ ...p, keywords: getKeywordsForPlace(p.id) })));
});

app.get('/places/:id', (req, res) => {
    const place = places.find(p => p.id === req.params.id);

    if (place) {
        res.json({ ...place, keywords: getKeywordsForPlace(place.id) });
    } else {
        res.status(404).json({ error: `place ${req.params.id} not found` });
    }
});

app.post('/places', (req, res) => {
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

    const place = {
        id: uuidv4(),
        title,
        description,
        position: {
            lat: position.lat,
            lng: position.lng
        },
        openingHours: {
            start: openingHours.start,
            end: openingHours.end
        }
    };
    places.push(place);

    res.json({ ...place, keywords: [] });
});

app.put('/places/:id', (req, res) => {
    const place = places.find(p => p.id === req.params.id);
    if (!place) {
        res.status(404).json({ error: `place ${req.params.id} not found` });
        return;
    }

    const isInvalid = checkPlaceRequestBody(req.body);
    if (isInvalid) {
        res.status(400).json({ error: 'invalid request' });
        return;
    }

    const { title, description, position, openingHours } = req.body;
    place.title = title;
    place.description = description;
    place.position = {
        lat: position.lat,
        lng: position.lng
    };
    place.openingHours = {
        start: openingHours.start,
        end: openingHours.end
    };

    res.json({ place, keywords: getKeywordsForPlace(place.id) });
});

app.delete('/places/:id', (req, res) => {
    const index = places.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        places.splice(index, 1);
        res.status(200).end();
    } else {
        res.status(404).json({ error: `place ${req.params.id} not found` });
    }
});


const keywords = [
    {
        id: 'c1406745-37bd-4da3-99ec-b40829e7acf2',
        label: 'Transit',
        places: ['f92e2a09-fa07-4f7d-b02c-883a81dba496']
    }
];

function getKeywordsForPlace(placeId) {
    return keywords
        .filter(k => k.places.indexOf(placeId) !== -1)
        .map(({ id, label }) => ({ id, label }));
}

app.get('/keywords', (req, res) => {
    res.json(keywords);
});

app.get('/keywords/:id', (req, res) => {
    const keyword = keywords.find(k => k.id === req.params.id);

    if (keyword) {
        res.json(keyword);
    } else {
        res.status(404).json({ error: `keyword ${req.params.id} not found` });
    }
});

app.post('/keywords', (req, res) => {
    if (req.body === undefined) {
        res.status(400).json({ error: 'invalid request' });
        return
    }

    const { label } = req.body;
    if (!label || typeof label !== 'string') {
        res.status(400).json({ error: 'invalid request' });
        return
    }

    const keyword = {
        id: uuidv4(),
        label,
        places: []
    }
    keywords.push(keyword);

    res.json(keyword);
});

app.put('/keywords/:id', (req, res) => {
    const keyword = keywords.find(k => k.id === req.params.id);
    if (!keyword) {
        res.status(404).json({ error: `keyword ${req.params.id} not found` });
        return;
    }

    const { label } = req.body;
    if (!label || typeof label !== 'string') {
        res.status(400).json({ error: 'invalid request' });
        return
    }

    keyword.label = label;

    res.json(keyword);
});

app.delete('/keywords/:id', (req, res) => {
    const index = keywords.findIndex(k => k.id === req.params.id);
    if (index !== -1) {
        keywords.splice(index, 1);
        res.status(200).end();
    } else {
        res.status(404).json({ error: `keyword ${req.params.id} not found` });
    }
});

app.post('/keywords/:id/places/:placeId', (req, res) => {
    const keyword = keywords.find(k => k.id === req.params.id);
    if (!keyword) {
        res.status(404).json({ error: `keyword ${req.params.id} not found` });
        return;
    }

    keyword.places.push(req.parmas.placeId);
    res.json(keyword);
});

app.delete('/keywords/:id/places/:placeId', (req, res) => {
    const keyword = keywords.find(k => k.id === req.params.id);
    if (!keyword) {
        res.status(404).json({ error: `keyword ${req.params.id} not found` });
        return;
    }

    const index = keyword.places.findIndex(id => id === req.params.placeId);
    if (index !== -1) {
        keyword.places.splice(index, 1);
    }
    res.status(200).end();
});

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
