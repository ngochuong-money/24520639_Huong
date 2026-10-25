
import type { DataGridProps } from '../types/dataGrid';

let gridCounter = 0;

type Row<T> = {
  item: T;
  index: number;
};

export function createDataGrid<T>(
  props: DataGridProps<T>
): HTMLTableElement {
  const { data, columns, onRowSelect, ariaLabel } = props;

  const gridId = `data-grid-${++gridCounter}`;
  const pageSize = 10;

  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  const originalRows: Row<T>[] = data.map((item, index) => ({
    item,
    index,
  }));

  let visibleRows: Row<T>[] = [...originalRows];
  let filterQuery = '';
  let sortColumn: number | null = null;
  let sortDirection: 'ascending' | 'descending' = 'ascending';
  let currentPage = 1;

  // Keyboard focus and selection state
  let activeRowId: number | null = null;
  let activeColumn = 0;
  let selectedRowId: number | null = null;

  // Main table
  const table = document.createElement('table');
  table.id = gridId;
  table.setAttribute('role', 'grid');
  table.setAttribute('aria-label', ariaLabel);

  // Search control
  const caption = document.createElement('caption');

  const filterLabel = document.createElement('label');
  filterLabel.htmlFor = `${gridId}-filter`;
  filterLabel.textContent = 'Search rows';

  const filterInput = document.createElement('input');
  filterInput.type = 'search';
  filterInput.id = filterLabel.htmlFor;
  filterInput.placeholder = 'Filter rows...';

  caption.append(filterLabel, filterInput);
  table.appendChild(caption);

  // Column headers
  const thead = document.createElement('thead');
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
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = 'Action';
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');

  // Pagination
  const tfoot = document.createElement('tfoot');
  const footerRow = document.createElement('tr');
  const footerCell = document.createElement('td');

  footerCell.colSpan = Math.max(
    1,
    columns.length + (onRowSelect ? 1 : 0)
  );
  footerCell.setAttribute('role', 'gridcell');

  const pagination = document.createElement('nav');
  pagination.setAttribute(
    'aria-label',
    `${ariaLabel} pagination`
  );

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

  pagination.append(previousButton, pageInfo, nextButton);
  footerCell.appendChild(pagination);
  footerRow.appendChild(footerCell);
  tfoot.appendChild(footerRow);

  table.append(thead, tbody, tfoot);

  // Compare values for sorting
  function compareValues(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;

    if (typeof a === 'number' && typeof b === 'number') {
      if (Number.isNaN(a)) {
        return Number.isNaN(b) ? 0 : 1;
      }
      if (Number.isNaN(b)) return -1;
      return a - b;
    }

    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return Number(a) - Number(b);
    }

    return collator.compare(String(a), String(b));
  }

  function pageRows(): Row<T>[] {
    const start = (currentPage - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }

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

  // Task 4.3: Get focusable grid cells
  function gridCells(): HTMLTableCellElement[] {
    return Array.from(
      tbody.querySelectorAll<HTMLTableCellElement>(
        'td[data-grid-cell]'
      )
    );
  }

  // Task 4.3: Roving tabIndex
  function setActiveCell(
    cell: HTMLTableCellElement,
    moveFocus = false
  ): void {
    gridCells().forEach((candidate) => {
      candidate.tabIndex = candidate === cell ? 0 : -1;
    });

    activeRowId = Number(cell.dataset.rowId);
    activeColumn = Number(cell.dataset.columnIndex);

    if (moveFocus) {
      cell.focus();
    }
  }

  // Render current page
  function renderRows(): void {
    const focusWasInCell =
      document.activeElement instanceof HTMLTableCellElement &&
      document.activeElement.hasAttribute('data-grid-cell') &&
      tbody.contains(document.activeElement);

    updatePagination();

    const fragment = document.createDocumentFragment();
    const rows = pageRows();

    rows.forEach(({ item, index }) => {
      const tr = document.createElement('tr');

      tr.id = `${gridId}-row-${index}`;
      tr.dataset.rowId = String(index);

      const isSelected = selectedRowId === index;
      tr.setAttribute('aria-selected', String(isSelected));

      if (isSelected) {
        tr.classList.add('data-grid-selected');
      }

      columns.forEach((column, columnIndex) => {
        const td = document.createElement('td');

        td.id = `${gridId}-cell-${index}-${columnIndex}`;
        td.setAttribute('role', 'gridcell');
        td.dataset.gridCell = 'true';
        td.dataset.rowId = String(index);
        td.dataset.columnIndex = String(columnIndex);
        td.tabIndex = -1;

        const value = item[column.accessorKey];
        td.textContent =
          value == null ? '' : String(value);

        tr.appendChild(td);
      });

      if (onRowSelect) {
        const td = document.createElement('td');

        td.id = `${gridId}-cell-${index}-action`;
        td.setAttribute('role', 'gridcell');
        td.dataset.gridCell = 'true';
        td.dataset.rowId = String(index);
        td.dataset.columnIndex = String(columns.length);
        td.tabIndex = -1;

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Select row';
        button.setAttribute(
          'aria-label',
          `Select row ${index + 1}`
        );
        button.dataset.rowId = String(index);

        // Grid cell handles keyboard selection.
        button.tabIndex = -1;

        td.appendChild(button);
        tr.appendChild(td);
      }

      fragment.appendChild(tr);
    });

    // Empty state
    if (rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');

      td.setAttribute('role', 'gridcell');
      td.colSpan = Math.max(
        1,
        columns.length + (onRowSelect ? 1 : 0)
      );

      td.textContent =
        filterQuery && originalRows.length
          ? 'No matching results'
          : 'No data available';

      tr.appendChild(td);
      fragment.appendChild(tr);
    }

    tbody.replaceChildren(fragment);

    // Restore predictable focus after rerendering
    const cells = gridCells();

    const preserved = cells.find(
      (cell) =>
        Number(cell.dataset.rowId) === activeRowId &&
        Number(cell.dataset.columnIndex) === activeColumn
    );

    const maxColumn =
      columns.length + (onRowSelect ? 1 : 0) - 1;

    const fallback = cells.find(
      (cell) =>
        Number(cell.dataset.columnIndex) ===
        Math.min(activeColumn, maxColumn)
    ) ?? cells[0];

    const next = preserved ?? fallback;

    if (next) {
      setActiveCell(next, focusWasInCell);
    } else {
      activeRowId = null;
    }
  }

  // Filtering followed by sorting
  function updateVisibleRows(): void {
    visibleRows = originalRows.filter(({ item }) =>
      columns.some((column) => {
        const value = item[column.accessorKey];

        return (
          value != null &&
          String(value)
            .toLocaleLowerCase()
            .includes(filterQuery)
        );
      })
    );

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

          const comparison = compareValues(valueA, valueB);

          return comparison === 0
            ? a.index - b.index
            : comparison * direction;
        });
      }
    }

    renderRows();
  }

  // Task 4.2: Row selection
  function selectRow(rowId: number, toggle: boolean): void {
    const selected = originalRows[rowId];

    if (!selected) return;

    selectedRowId =
      toggle && selectedRowId === rowId
        ? null
        : rowId;

    tbody
      .querySelectorAll<HTMLTableRowElement>(
        'tr[data-row-id]'
      )
      .forEach((row) => {
        const isSelected =
          Number(row.dataset.rowId) === selectedRowId;

        row.setAttribute(
          'aria-selected',
          String(isSelected)
        );

        row.classList.toggle(
          'data-grid-selected',
          isSelected
        );
      });

    if (!toggle || selectedRowId !== null) {
      onRowSelect?.(selected.item);
    }
  }

  // Filtering event
  table.addEventListener('input', (event) => {
    if (event.target !== filterInput) return;

    filterQuery = filterInput.value
      .trim()
      .toLocaleLowerCase();

    currentPage = 1;
    updateVisibleRows();
  });

  // Event delegation: Pagination, Sorting, Selection
  table.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const button =
      target.closest<HTMLButtonElement>('button');

    if (!button || !table.contains(button)) return;

    // Pagination
    if (button.dataset.pageAction) {
      if (button.disabled) return;

      const totalPages = Math.max(
        1,
        Math.ceil(visibleRows.length / pageSize)
      );

      if (
        button.dataset.pageAction === 'previous' &&
        currentPage > 1
      ) {
        currentPage--;
      } else if (
        button.dataset.pageAction === 'next' &&
        currentPage < totalPages
      ) {
        currentPage++;
      } else {
        return;
      }

      renderRows();
      return;
    }

    // Sorting
    if (button.dataset.sortColumn !== undefined) {
      const index = Number(button.dataset.sortColumn);

      if (!columns[index]?.sortable) return;

      if (sortColumn === index) {
        sortDirection =
          sortDirection === 'ascending'
            ? 'descending'
            : 'ascending';
      } else {
        sortColumn = index;
        sortDirection = 'ascending';
      }

      headerRow
        .querySelectorAll('th')
        .forEach((th, headerIndex) => {
          if (headerIndex === sortColumn) {
            th.setAttribute('aria-sort', sortDirection);
          } else {
            th.removeAttribute('aria-sort');
          }
        });

      updateVisibleRows();
      return;
    }

    // Row selection button
    if (button.dataset.rowId !== undefined) {
      selectRow(Number(button.dataset.rowId), false);
    }
  });

  // Task 4.3: Track current focused cell
  table.addEventListener('focusin', (event) => {
    const target = event.target;

    if (
      target instanceof HTMLTableCellElement &&
      target.hasAttribute('data-grid-cell')
    ) {
      setActiveCell(target);
    }
  });

  // Task 4.1 & 4.2: Keyboard interactions
  table.addEventListener('keydown', (event) => {
    const target = event.target;

    // Do not intercept native input/button keys.
    if (
      !(target instanceof HTMLTableCellElement) ||
      !target.hasAttribute('data-grid-cell')
    ) {
      return;
    }

    const rows = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>(
        'tr[data-row-id]'
      )
    );

    const rowIndex = rows.findIndex(
      (row) =>
        row.dataset.rowId === target.dataset.rowId
    );

    if (rowIndex < 0) return;

    const columnIndex =
      Number(target.dataset.columnIndex);

    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    if (event.key === 'ArrowUp') {
      nextRow--;
    } else if (event.key === 'ArrowDown') {
      nextRow++;
    } else if (event.key === 'ArrowLeft') {
      nextColumn--;
    } else if (event.key === 'ArrowRight') {
      nextColumn++;
    } else if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      selectRow(
        Number(target.dataset.rowId),
        event.key === ' '
      );

      return;
    } else {
      return;
    }

    // Prevent page scrolling
    event.preventDefault();

    // Stay inside grid boundaries
    const boundedRow = Math.min(
      Math.max(0, nextRow),
      rows.length - 1
    );

    const cells = Array.from(
      rows[boundedRow]
        .querySelectorAll<HTMLTableCellElement>(
          'td[data-grid-cell]'
        )
    );

    const boundedColumn = Math.min(
      Math.max(0, nextColumn),
      cells.length - 1
    );

    const nextCell = cells[boundedColumn];

    if (nextCell) {
      setActiveCell(nextCell, true);
    }
  });

  renderRows();

  return table;
}
