
import type { DataGridProps } from '../types/dataGrid';

let gridCounter = 0;

export function createDataGrid<T>(
    props: DataGridProps<T>
): HTMLTableElement {
    const { data, columns, onRowSelect, ariaLabel } = props;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const gridId = `data-grid-${++gridCounter}`;
    const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
    });

    let sortColumn: number | null = null;
    let sortDirection: 'ascending' | 'descending' = 'ascending';

    // Each row keeps its original index for stable sorting and IDs.
    const originalRows = data.map((item, index) => ({
        item,
        index,
    }));

    let visibleRows = [...originalRows];
    let filterQuery = '';
    const pageSize = 10;
    let currentPage = 1;

    table.id = gridId;
    table.setAttribute('role', 'grid');
    table.setAttribute('aria-label', ariaLabel);

    // Accessible filter control
    const caption = document.createElement('caption');

    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Search rows';
    filterLabel.htmlFor = `${gridId}-filter`;

    const filterInput = document.createElement('input');
    filterInput.id = `${gridId}-filter`;
    filterInput.type = 'search';
    filterInput.placeholder = 'Filter rows...';

    caption.appendChild(filterLabel);
    caption.appendChild(filterInput);
    table.appendChild(caption);


    // Column headers
    const headerRow = document.createElement('tr');

    columns.forEach((column, columnIndex) => {
        const th = document.createElement('th');

        th.id = `${gridId}-header-${columnIndex}`;
        th.scope = 'col';

        if (column.sortable) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = column.header;
            button.dataset.sortColumn = String(columnIndex);

            th.appendChild(button);
        } else {
            th.textContent = column.header;
        }

        headerRow.appendChild(th);
    });

    if (onRowSelect) {
        const actionHeader = document.createElement('th');
        actionHeader.scope = 'col';
        actionHeader.textContent = 'Action';

        headerRow.appendChild(actionHeader);
    }

    thead.appendChild(headerRow);

    // Pagination controls
    const tfoot = document.createElement('tfoot');
    const paginationRow = document.createElement('tr');
    const paginationCell = document.createElement('td');

    paginationCell.setAttribute('role', 'gridcell');
    paginationCell.colSpan = Math.max(
        1,
        columns.length + (onRowSelect ? 1 : 0)
    );

    const pagination = document.createElement('nav');
    pagination.setAttribute('aria-label', `${ariaLabel} pagination`);

    const previousButton = document.createElement('button');
    previousButton.type = 'button';
    previousButton.textContent = 'Previous';
    previousButton.dataset.pageAction = 'previous';

    const pageInfo = document.createElement('span');
    pageInfo.setAttribute('aria-live', 'polite');

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.textContent = 'Next';
    nextButton.dataset.pageAction = 'next';

    pagination.appendChild(previousButton);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextButton);

    paginationCell.appendChild(pagination);
    paginationRow.appendChild(paginationCell);
    tfoot.appendChild(paginationRow);

    function updatePagination(): void {
        const totalPages = Math.max(
            1,
            Math.ceil(visibleRows.length / pageSize)
        );

        currentPage = Math.min(
            Math.max(1, currentPage),
            totalPages
        );

        previousButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        pageInfo.textContent =
            ` Page ${currentPage} of ${totalPages} `;
    }


    // Compare cell values without modifying source data.
    function compareValues(a: unknown, b: unknown): number {
        if (a == null && b == null) return 0;
        if (a == null) return 1;
        if (b == null) return -1;

        if (typeof a === 'number' && typeof b === 'number') {
            if (Number.isNaN(a)) return Number.isNaN(b) ? 0 : 1;
            if (Number.isNaN(b)) return -1;
            return a - b;
        }

        if (typeof a === 'boolean' && typeof b === 'boolean') {
            return Number(a) - Number(b);
        }

        return collator.compare(String(a), String(b));
    }

    // Render rows from the current sorted order.
    function renderRows(): void {

        updatePagination();

        const fragment = document.createDocumentFragment();

        const startIndex = (currentPage - 1) * pageSize;
        const pageRows = visibleRows.slice(
            startIndex,
            startIndex + pageSize
        );

        pageRows.forEach(({ item, index }, displayIndex) => {

            const tr = document.createElement('tr');
            tr.id = `${gridId}-row-${index}`;

            columns.forEach((column, columnIndex) => {
                const td = document.createElement('td');

                td.id = `${gridId}-cell-${index}-${columnIndex}`;
                td.setAttribute('role', 'gridcell');

                const value = item[column.accessorKey];
                td.textContent = value == null ? '' : String(value);

                tr.appendChild(td);
            });

            if (onRowSelect) {
                const actionCell = document.createElement('td');
                actionCell.id = `${gridId}-cell-${index}-action`;
                actionCell.setAttribute('role', 'gridcell');

                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = 'Select row';
                button.dataset.rowIndex = String(
                    startIndex + displayIndex
                );
                button.setAttribute(
                    'aria-label',
                    `Select row ${displayIndex + 1}`
                );

                actionCell.appendChild(button);
                tr.appendChild(actionCell);
            }

            fragment.appendChild(tr);
        });

        if (visibleRows.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');

            emptyCell.setAttribute('role', 'gridcell');
            emptyCell.colSpan = Math.max(
                1,
                columns.length + (onRowSelect ? 1 : 0)
            );
            emptyCell.textContent =
                filterQuery && originalRows.length > 0
                    ? 'No matching results'
                    : 'No data available';

            emptyRow.appendChild(emptyCell);
            fragment.appendChild(emptyRow);
        }

        tbody.replaceChildren(fragment);
    }

    function updateVisibleRows(): void {
        // Step 1: Filtering
        visibleRows = originalRows.filter(({ item }) =>
            columns.some((column) => {
                const value = item[column.accessorKey];

                return value != null &&
                    String(value).toLocaleLowerCase()
                        .includes(filterQuery);
            })
        );

        // Step 2: Sorting
        if (sortColumn !== null) {
            const column = columns[sortColumn];

            if (column?.sortable) {
                const direction =
                    sortDirection === 'ascending' ? 1 : -1;

                visibleRows.sort((a, b) => {
                    const valueA = a.item[column.accessorKey];
                    const valueB = b.item[column.accessorKey];

                    if (valueA == null || valueB == null) {
                        if (valueA == null && valueB == null) {
                            return a.index - b.index;
                        }

                        return valueA == null ? 1 : -1;
                    }

                    const result = compareValues(valueA, valueB);

                    return result === 0
                        ? a.index - b.index
                        : result * direction;
                });
            }
        }

        renderRows();
    }


    function sortRows(columnIndex: number): void {
        const column = columns[columnIndex];

        if (!column?.sortable) return;

        if (sortColumn === columnIndex) {
            sortDirection =
                sortDirection === 'ascending'
                    ? 'descending'
                    : 'ascending';
        } else {
            sortColumn = columnIndex;
            sortDirection = 'ascending';
        }

        // Update aria-sort only on the active column.
        headerRow.querySelectorAll('th').forEach((th, index) => {
            if (index === sortColumn) {
                th.setAttribute('aria-sort', sortDirection);
            } else {
                th.removeAttribute('aria-sort');
            }
        });

        updateVisibleRows();
    }

    // Filtering through event delegation
    table.addEventListener('input', (event: Event) => {
        if (event.target !== filterInput) return;

        filterQuery = filterInput.value
            .trim()
            .toLocaleLowerCase();

        currentPage = 1;
        updateVisibleRows();
    });


    // Event delegation for sorting and row selection.
    table.addEventListener('click', (event: MouseEvent) => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const button = target.closest<HTMLButtonElement>('button');

        if (!button || !table.contains(button)) return;

        // Handle pagination
        const pageAction = button.dataset.pageAction;

        if (pageAction && !button.disabled) {
            const totalPages = Math.max(
                1,
                Math.ceil(visibleRows.length / pageSize)
            );

            if (pageAction === 'previous' && currentPage > 1) {
                currentPage--;
                renderRows();
            }

            if (pageAction === 'next' && currentPage < totalPages) {
                currentPage++;
                renderRows();
            }

            return;
        }


        if (button.dataset.sortColumn !== undefined) {
            sortRows(Number(button.dataset.sortColumn));
            return;
        }

        if (
            onRowSelect &&
            button.dataset.rowIndex !== undefined
        ) {
            const rowIndex = Number(button.dataset.rowIndex);
            const selectedRow = visibleRows[rowIndex];

            if (selectedRow) {
                onRowSelect(selectedRow.item);
            }
        }
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    table.appendChild(tfoot);

    renderRows();

    return table;
}
