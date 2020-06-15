import { initKeywordAutocomplete, selectedKeywords, changeTitleRegExp, filterPlaceMarkers } from './index';
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
        keyword => selectedKeywords.indexOf(keyword) === -1
    );
}

function addKeywordFilter(keyword) {
    selectedKeywords.push(keyword);
    const span = document.createElement('span');
    span.innerText = keyword.label;

    const closeLink = document.createElement('a');
    closeLink.innerText = 'X';
    closeLink.addEventListener('click', () => {
        span.parentNode.removeChild(span);
        const index = selectedKeywords.indexOf(keyword);
        selectedKeywords.splice(index, 1);
        filterPlaceMarkers();
    });
    span.appendChild(closeLink);

    document.getElementById('selected-keywords').appendChild(span);
    filterPlaceMarkers();
}
