import { initKeywordAutocomplete, changeTitleRegExp, setShouldFilterOpenPlaces, isKeywordSelected, addSelectedKeyword, removeSelectedKeyword } from './index';
import { hidePlaceDetails } from './placeDetails';
import { showEditPlaceDetails } from './editPlaceDetails';

export function initToolbar() {
    document.getElementById('add-place').addEventListener('click', () => {
        hidePlaceDetails();
        showEditPlaceDetails();
    });

    const titleSearch =  document.getElementById('title-search');
    titleSearch.addEventListener('input', () => {
        changeTitleRegExp(titleSearch.value);
    });

    initKeywordAutocomplete(
        document.getElementById('keyword-search'),
        addKeywordFilter,
        isKeywordSelected
    );

    const filterOpenPlaces = document.getElementById('filter-open-places');
    filterOpenPlaces.addEventListener('change', () => {
        setShouldFilterOpenPlaces(filterOpenPlaces.checked);
    });
}

function addKeywordFilter(keyword) {
    addSelectedKeyword(keyword);
    const span = document.createElement('span');
    span.innerText = keyword.label;

    const closeLink = document.createElement('a');
    closeLink.innerText = 'X';
    closeLink.addEventListener('click', () => {
        span.parentNode.removeChild(span);
        removeSelectedKeyword(keyword);
    });
    span.appendChild(closeLink);

    document.getElementById('selected-keywords').appendChild(span);
}
