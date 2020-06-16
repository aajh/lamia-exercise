import { initPlaceDetails, showPlaceDetails } from './placeDetails';
import { initEditPlaceDetails } from './editPlaceDetails';
import { initToolbar } from './toolbar';

const initialMapPosition = { lat: 60.171, lng: 24.941 };
const initialMapZoom = 13;

let map = null;
export let keywords = [];
export let selectedKeywords = [];
let places = [];
let titleRegExp = null;
let shouldFilterOpenPlaces = false;

export function setShouldFilterOpenPlaces(should) {
    shouldFilterOpenPlaces = should;
}

function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function createMarker(place) {
    place.marker = new google.maps.Marker({
        position: place.position,
        map,
        title: place.title
    });

    place.marker.addListener('click', () => {
        showPlaceDetails(place);
    });
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function isPlaceOpen(place) {
    const now = new Date();

    const start = new Date();
    start.setHours(place.openingHours.start.substring(0,2));
    start.setMinutes(place.openingHours.start.substring(3,5));

    const end = new Date();
    end.setHours(place.openingHours.end.substring(0,2));
    end.setMinutes(place.openingHours.end.substring(3,5));

    if (start <= end) {
        return start <= now && now <= end;
    } else {
        // Either start or end is on another day

        const newStart = addDays(start, -1);
        const newEnd = addDays(end, 1);

        return newStart <= now && now <= end || start <= now && now <= newEnd;
    }
}

export function filterPlaceMarkers() {
    for (let place of places) {
        const titleFilter = titleRegExp === null || titleRegExp.test(place.title);
        const isOpenFilter = shouldFilterOpenPlaces ? isPlaceOpen(place) : true;

        let keywordFilter = selectedKeywords.length === 0;
        for (let keyword of selectedKeywords) {
            if (place.keywords.findIndex(k => k.id === keyword.id) !== -1) {
                keywordFilter = true;
                break;
            }
        }

        if (titleFilter && isOpenFilter && keywordFilter) {
            place.marker.setMap(map);
        } else {
            place.marker.setMap(null);
        }
    }
}

export function changeTitleRegExp(search) {
    titleRegExp = search === '' ? null : new RegExp(escapeRegExp(search), 'i');
    filterPlaceMarkers();
}

export function initKeywordAutocomplete(input, onComplete, keywordFilter) {
    function closeList() {
        const list = input.parentNode.querySelector('.autocomplete-items');
        if (list !== null) {
            list.parentNode.removeChild(list);
        }
    }

    input.addEventListener('input', () => {
        closeList();
        if (!input.value) {
            return;
        }

        const completionItems = document.createElement('div');
        completionItems.classList.add('autocomplete-items');
        input.parentNode.appendChild(completionItems);

        const regExp = new RegExp(escapeRegExp(input.value), 'i');

        for (let keyword of keywords) {
            if (keywordFilter(keyword) && regExp.test(keyword.label)) {
                const option = document.createElement('div');
                option.innerText = keyword.label;
                option.addEventListener('click', () => {
                    onComplete(keyword);
                    input.value = '';
                    closeList();
                })

                completionItems.appendChild(option);
            }
        }
    });

    document.addEventListener('click', closeList);
}

async function initUi() {
    const keywordPromise = fetch('/keywords');

    initPlaceDetails();
    initEditPlaceDetails();
    initToolbar();

    const response = await keywordPromise;
    keywords = await response.json();
}

async function initMap() {
    initUi();

    map = new google.maps.Map(document.getElementById("map"), {
        center: initialMapPosition,
        zoom: initialMapZoom,
        disableDefaultUI: true,
        zoomControl: true
    });

    const response = await fetch(`/places`);
    places = await response.json();

    for (let place of places) {
        createMarker(place);
    }
}
window.initMap = initMap;
