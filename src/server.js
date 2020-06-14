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
    res.json(places);
});

app.get('/places/:id', (req, res) => {
    const place = places.find(p => p.id === req.params.id);

    if (place) {
        res.json(place);
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

    res.json(place);
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

    res.json(place);
});

app.delete('/places/:id', (req, res) => {
    const index = places.findIndex(p => p.id == req.params.id);
    places.splice(index, 1);
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
