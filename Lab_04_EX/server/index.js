import 'dotenv/config';
import { connectDb } from './db.js';

const port = process.env.PORT ?? 3000;

try {
  await connectDb();
  console.log(`Ready on port ${port}`);
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
