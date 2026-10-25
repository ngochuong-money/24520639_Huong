
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

  table.id = gridId;
  table.setAttribute('role', 'grid');
  table.setAttribute('aria-label', ariaLabel);

  // Column headers
  const headerRow = document.createElement('tr');

  columns.forEach((column, columnIndex) => {
    const th = document.createElement('th');

    th.id = `${gridId}-header-${columnIndex}`;
    th.scope = 'col';
    th.textContent = column.header;

    headerRow.appendChild(th);
  });

  if (onRowSelect) {
    const actionHeader = document.createElement('th');
    actionHeader.scope = 'col';
    actionHeader.textContent = 'Action';

    headerRow.appendChild(actionHeader);
  }

  thead.appendChild(headerRow);

  // Data rows
  data.forEach((item, rowIndex) => {
    const tr = document.createElement('tr');

    tr.id = `${gridId}-row-${rowIndex}`;

    columns.forEach((column, columnIndex) => {
      const td = document.createElement('td');

      td.id = `${gridId}-cell-${rowIndex}-${columnIndex}`;
      td.setAttribute('role', 'gridcell');

      const value = item[column.accessorKey];
      td.textContent = value == null ? '' : String(value);

      tr.appendChild(td);
    });

    if (onRowSelect) {
      const actionCell = document.createElement('td');
      actionCell.setAttribute('role', 'gridcell');
      actionCell.id = `${gridId}-cell-${rowIndex}-action`;

      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Select row';
      button.dataset.rowIndex = String(rowIndex);
      button.setAttribute(
        'aria-label',
        `Select row ${rowIndex + 1}`
      );

      actionCell.appendChild(button);
      tr.appendChild(actionCell);
    }

    tbody.appendChild(tr);
  });
  
  // Empty data state
  if (data.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');

    emptyCell.setAttribute('role', 'gridcell');
    emptyCell.colSpan = columns.length + (onRowSelect ? 1 : 0);
    emptyCell.textContent = 'No data available';

    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
  }


  // Event delegation
  if (onRowSelect) {
    table.addEventListener('click', (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const button = target.closest<HTMLButtonElement>(
        'button[data-row-index]'
      );

      if (!button || !table.contains(button)) return;

      const rowIndex = Number(button.dataset.rowIndex);
      const selectedItem = data[rowIndex];

      if (selectedItem !== undefined) {
        onRowSelect(selectedItem);
      }
    });
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}
