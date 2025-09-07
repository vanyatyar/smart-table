import './fonts/ys-display/fonts.css'
import './style.css'

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initSearching} from "./components/searching.js";
import {initFiltering} from "./components/filtering.js";
import {initSorting} from "./components/sorting.js";
import {initPagination} from "./components/pagination.js";
const api = initData();

/**
 * @returns {Object}
 */
function collectState() {
    try {
        const formData = new FormData(sampleTable.container);
        const state = processFormData(formData);
        const pageInput = sampleTable.container.querySelector('input[name="page"]:checked');
        const pageValue = pageInput ? parseInt(pageInput.value) : 1;
        
        return {
            search: '',
            searchBySeller: '',
            rowsPerPage: 10,
            page: pageValue,
            ...state,
            rowsPerPage: parseInt(state.rowsPerPage || 10),
            page: parseInt(state.page || pageValue || 1)
        };
    } catch (error) {
        console.error('Error collecting state:', error);
        return {
            search: '',
            searchBySeller: '',
            rowsPerPage: 10,
            page: 1
        };
    }
}

/**
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState();
    let query = {};
    
    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    const { total, items } = await api.getRecords(query);
    
    updatePagination(total, query);

    sampleTable.render(items);
}

let applySearching, applySorting;
let applyFiltering, updateIndexes;
let applyPagination, updatePagination;

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

async function init() {
    const indexes = await api.getIndexes();
    
    applySearching = initSearching('search');
    
    const filtering = initFiltering(sampleTable.filter.elements);
    applyFiltering = filtering.applyFiltering;
    updateIndexes = filtering.updateIndexes;
    
    applySorting = initSorting([
        sampleTable.header.elements.sortByDate,
        sampleTable.header.elements.sortByTotal
    ]);
    
    const pagination = initPagination(
        sampleTable.pagination.elements,
        (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            input.value = page;
            input.checked = isCurrent;
            label.textContent = page;
            return el;
        }
    );
    applyPagination = pagination.applyPagination;
    updatePagination = pagination.updatePagination;

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });

    const appRoot = document.querySelector('#app');
    appRoot.appendChild(sampleTable.container);

    render();
}
init().catch(error => {
    console.error('Failed to initialize app:', error);
});