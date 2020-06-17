import { initKeywordAutocomplete, filterPlaceMarkers, deletePlace, findKeywordByLabel, addKeyword } from './index'
import { showEditPlaceDetails } from './editPlaceDetails';

let selectedPlace = null;

export function getSelectedPlace() {
    return selectedPlace;
}

export function updateSelectedPlace(place) {
    for (let key of Object.keys(place)) {
        selectedPlace[key] = place[key];
    }
    selectedPlace.marker.setPosition(place.position);
    selectedPlace.marker.setTitle(place.title);
    filterPlaceMarkers();
}

export function initPlaceDetails() {
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

    const editKeywordsEl = document.getElementById('place-details__edit-keywords');
    editKeywordsEl.addEventListener('click', () => {
        const keywordsEl = document.getElementById('place-details__keywords');
        const addKeywordEl = document.getElementById('place-details__add-keyword');
        if (addKeywordEl.classList.contains('hidden')) {
            keywordsEl.classList.remove('place-details__keywords--hide-delete');
            addKeywordEl.classList.remove('hidden');
            editKeywordsEl.innerText = 'Done';
        } else {
            keywordsEl.classList.add('place-details__keywords--hide-delete');
            addKeywordEl.classList.add('hidden');
            editKeywordsEl.innerText = 'Edit';
        }
    });

    initKeywordAutocomplete(
        document.getElementById('place-details__add-keyword'),
        addKeywordToSelectedPlace,
        keyword => selectedPlace.keywords.findIndex(k => k.id === keyword.id) === -1
    );

    document.getElementById('place-details__add-keyword-form').addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('place-details__add-keyword');
        const keywordLabel = input.value;
        createAndAddKeywordToSelectedPlace(keywordLabel);
        input.value = '';
        input.dispatchEvent(new Event('input')); // Clear the autocomplete list
    });
}

export function showPlaceDetails(place) {
    selectedPlace = place;
    const placeDetailsEl = document.getElementById('place-details');
    
    document.getElementById('place-details__title').textContent
        = place.title;
    document.getElementById('place-details__description').textContent
        = place.description;
    document.getElementById('place-details__opening-hours').textContent
        = `${place.openingHours.start} - ${place.openingHours.end}`;

    const keywordsEl = document.getElementById('place-details__keywords');
    keywordsEl.innerHTML = '';
    for (let keyword of selectedPlace.keywords) {
        const el = document.createElement('span');
        el.innerText = keyword.label;

        const remove = document.createElement('a');
        remove.innerText = 'X';
        remove.addEventListener('click', () => {
            removeKeywordFromSelectedPlace(keyword);
        });
        el.appendChild(remove);

        keywordsEl.appendChild(el);
    }
        
    placeDetailsEl.classList.remove('hidden');
}

export function hidePlaceDetails() {
    document.getElementById('place-details').classList.add('hidden');
    selectedPlace = null;
}

async function addKeywordToSelectedPlace(keyword) {
    const response = await fetch(`/keywords/${keyword.id}/places/${selectedPlace.id}`, {
        method: 'POST'
    });
    if (response.ok) {
        selectedPlace.keywords.push(keyword);
        showPlaceDetails(selectedPlace);
        filterPlaceMarkers();
    }
}

async function createAndAddKeywordToSelectedPlace(keywordLabel) {
    const existingKeyword = findKeywordByLabel(keywordLabel);
    if (existingKeyword) {
        // Add existing keyword, if it has not been added
        if (selectedPlace.keywords.findIndex(k => k.id === existingKeyword.id) === -1) {
            addKeywordToSelectedPlace(existingKeyword);
        }
    } else {
        const response = await fetch('/keywords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ label: keywordLabel })
        });
        const keyword = await response.json();
        addKeyword(keyword);
        addKeywordToSelectedPlace(keyword);
    }
}

async function removeKeywordFromSelectedPlace(keyword) {
    const response = await fetch(`/keywords/${keyword.id}/places/${selectedPlace.id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        const index = selectedPlace.keywords.findIndex(k => k.id === keyword.id);
        selectedPlace.keywords.splice(index, 1);
        showPlaceDetails(selectedPlace);
        filterPlaceMarkers();
    }
}

async function deleteSelectedPlace() {
    const response = await fetch(`/places/${selectedPlace.id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        deletePlace(selectedPlace.id);
        selectedPlace = null;
        document.getElementById('place-details').classList.add('hidden');
    }
}
