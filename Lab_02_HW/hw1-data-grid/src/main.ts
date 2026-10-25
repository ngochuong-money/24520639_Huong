import './style.css'

import './style.css';
import { createDataGrid } from './components/DataGrid';

interface Student {
  id: number;
  name: string;
  age: number;
}

const students: Student[] = Array.from(
  { length: 25 },
  (_, index) => ({
    id: index + 1,
    name: `Student ${index + 1}`,
    age: 18 + (index % 5),
  })
);


const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App element not found');
}

const main = document.createElement('main');
const heading = document.createElement('h1');
heading.textContent = 'Accessible DataGrid Test';
main.appendChild(heading);

const grid = createDataGrid<Student>({
  data: students,
  columns: [
    { header: 'ID', accessorKey: 'id', sortable: true },
    { header: 'Name', accessorKey: 'name', sortable: true },
    { header: 'Age', accessorKey: 'age', sortable: false },
  ],
  ariaLabel: 'Student data grid',
  onRowSelect: (student) => {
    console.log('Selected student:', student);
  },
});

main.appendChild(grid);
app.appendChild(main);



