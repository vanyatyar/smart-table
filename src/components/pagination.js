// pagination.js
import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.innerHTML = '';

    let pageCount;

    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if (action) {
            switch(action.name) {
                case 'prev': 
                    page = Math.max(1, page - 1); 
                    break;
                case 'next': 
                    page = Math.min(pageCount || 1, page + 1); 
                    break;
                case 'first': 
                    page = 1; 
                    break;
                case 'last': 
                    page = pageCount || 1; 
                    break;
                default:
                    if (action.name === 'page' && action.value) {
                        const newPage = parseInt(action.value);
                        if (!isNaN(newPage)) {
                            page = Math.min(Math.max(newPage, 1), pageCount || 1);
                        }
                    }
                    break;
            }
        }
        return Object.assign({}, query, {
            limit,
            page
        });
    }
    const updatePagination = (total, {page, limit}) => {
        pageCount = Math.ceil(total / limit) || 1;
        const currentPage = Math.min(Math.max(page || 1, 1), pageCount);

        const visiblePages = getPages(currentPage, pageCount, 5);
        const pageElements = visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === currentPage);
        });
        
        pages.replaceChildren(...pageElements);
        const startIndex = (currentPage - 1) * limit;
        const endIndex = Math.min(startIndex + limit, total);
        fromRow.textContent = total > 0 ? startIndex + 1 : 0;
        toRow.textContent = endIndex;
        totalRows.textContent = total;
    }

    return {
        applyPagination,
        updatePagination
    };
}