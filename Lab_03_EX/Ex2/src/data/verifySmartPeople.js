
import { SMART_PEOPLE } from './smartPeople.js';

const ids = SMART_PEOPLE.map((person) => person.id);

const hasUniqueIds = new Set(ids).size === ids.length;

const hasValidRecords = SMART_PEOPLE.every(
  (person) =>
    typeof person.id === 'string' &&
    person.id.trim() !== '' &&
    typeof person.name === 'string' &&
    person.name.trim() !== '' &&
    Number.isInteger(person.age) &&
    person.age > 0 &&
    Number.isInteger(person.iq) &&
    person.iq > 0
);

console.log('Exactly 6 scientists:', SMART_PEOPLE.length === 6);
console.log('Unique IDs:', hasUniqueIds);
console.log('Valid records:', hasValidRecords);
