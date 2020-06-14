let places = [];
let selectedPlace = null;

function createMarker(place, map) {
    place.marker = new google.maps.Marker({
        position: place.position,
        map: map,
        title: place.title
    });

    place.marker.addListener('click', () => {
        showPlaceDetails(place);
    });
}

function showPlaceDetails(place) {
    selectedPlace = place;
    const placeDetailsEl = document.getElementById('place-details');
    
    document.getElementById('place-details__title').textContent
        = place.title;
    document.getElementById('place-details__description').textContent
        = place.description;
    document.getElementById('place-details__opening-hours').textContent
        = `${place.openingHours.start} - ${place.openingHours.end}`;
        
    placeDetailsEl.classList.remove('hidden');
}

async function deleteSelectedPlace() {
    const response = await fetch(`/places/${selectedPlace.id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        const index = places.findIndex(p => p.id == selectedPlace.id);
        places.splice(index, 1);
        selectedPlace.marker.setMap(null);
        document.getElementById('place-details').classList.add('hidden');
    }
}

function showEditPlaceDetails() {
    const place = selectedPlace;
    const editPlaceDetailsEl = document.getElementById('edit-place-details');
    
    document.getElementById('edit-place-details__title').value
        = place && place.title;
    document.getElementById('edit-place-details__description').value
        = place && place.description;
    document.getElementById('edit-place-details__lat').value
        = place && place.position.lat;
    document.getElementById('edit-place-details__lng').value
        = place && place.position.lng;
    document.getElementById('edit-place-details__opening-hours-start').value
        = place && place.openingHours.start;
    document.getElementById('edit-place-details__opening-hours-end').value
        = place && place.openingHours.end;
        
    editPlaceDetailsEl.classList.remove('hidden');
}

async function savePlaceDetails(formData) {
    const submitButton = document.querySelector('#edit-place-details input[type=submit]');
    submitButton.disabled = true;

    const place = {
        title: formData.get('title'),
        description: formData.get('description'),
        position: {
            lat: Number(formData.get('lat')),
            lng: Number(formData.get('lng'))
        },
        openingHours: {
            start: formData.get('openingHours.start'),
            end: formData.get('openingHours.end')
        }
    };

    if (selectedPlace) {
        // Update the place
        place.id = selectedPlace.id;
        const response = await fetch(`/places/${place.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(place)
        });

        if (response.ok) {
            for (let key of Object.keys(place)) {
                selectedPlace[key] = place[key];
            }
            selectedPlace.marker.setPosition(place.position);
            selectedPlace.marker.setTitle(place.title);
            document.getElementById('edit-place-details').classList.add('hidden');
            showPlaceDetails(selectedPlace);
        }
    } else {
        // Create a new place
        const response = await fetch(`/places`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(place)
        });
        if (response.ok) {
            const newPlace = await response.json();
            places.push(newPlace);
            createMarker(newPlace, map);
            document.getElementById('edit-place-details').classList.add('hidden');
            showPlaceDetails(newPlace);
        }
    }

    submitButton.disabled = false;
}

function init() {
    const placeDetailsEl = document.getElementById('place-details');
    document.getElementById('place-details__close').addEventListener('click', () => {
        placeDetailsEl.classList.add('hidden');
    });
    document.getElementById('place-details__edit').addEventListener('click', () => {
        showEditPlaceDetails();
    });
    document.getElementById('place-details__delete').addEventListener('click', () => {
        deleteSelectedPlace();
    });
    
    const editPlaceDetailsEl = document.getElementById('edit-place-details');
    document.getElementById('edit-place-details__close').addEventListener('click', () => {
        editPlaceDetailsEl.classList.add('hidden');
    });
    editPlaceDetailsEl.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(editPlaceDetailsEl);
        savePlaceDetails(formData);
    });

    document.getElementById('add-place').addEventListener('click', () => {
        placeDetailsEl.classList.add('hidden');
        selectedPlace = null;
        showEditPlaceDetails();
    });
}
init();

let map = null;
async function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 60.171, lng: 24.941 },
        zoom: 13
    });

    const response = await fetch(`/places`);
    places = await response.json();

    for (let place of places) {
        createMarker(place, map);
    }
}
window.initMap = initMap;
