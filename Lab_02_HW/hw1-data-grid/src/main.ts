import './style.css'

import './style.css';
import { createDataGrid } from './components/DataGrid';

interface Student {
  id: number;
  name: string;
  age: number;
}

const students: Student[] = [
  { id: 1, name: 'An', age: 20 },
  { id: 2, name: 'Binh', age: 21 },
  { id: 3, name: 'Chi', age: 22 },
  { id: 4, name: 'Dung', age: 23 },
];


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
  { header: 'Name', accessorKey: 'name' },
  { header: 'Age', accessorKey: 'age' },
],
  ariaLabel: 'Student data grid',
  onRowSelect: (student) => {
    console.log('Selected student:', student);
  },
});

main.appendChild(grid);
app.appendChild(main);



