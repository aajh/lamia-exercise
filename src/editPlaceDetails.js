import { createNewPlace } from './index';
import { getSelectedPlace, showPlaceDetails, updateSelectedPlace } from './placeDetails';

export function initEditPlaceDetails() {
    const editPlaceDetailsEl = document.getElementById('edit-place-details');
    document.getElementById('edit-place-details__close').addEventListener('click', () => {
        editPlaceDetailsEl.classList.add('hidden');
    });
    editPlaceDetailsEl.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(editPlaceDetailsEl);
        savePlaceDetails(formData);
    });
}

export function showEditPlaceDetails() {
    const place = getSelectedPlace();
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

    const selectedPlace = getSelectedPlace();
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
            updateSelectedPlace(place);
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
            createNewPlace(newPlace);
            document.getElementById('edit-place-details').classList.add('hidden');
            showPlaceDetails(newPlace);
        }
    }

    submitButton.disabled = false;
}
