import 'dotenv/config';
import { connectDb } from './db.js';
import { createApp } from './app.js';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason?.message ?? String(reason));
  process.exit(1);
});

const port = process.env.PORT ?? 3000;

try {
  await connectDb();
  const server = createApp().listen(port, () => console.log(`Ready on port ${port}`));
  server.on('error', (err) => {
    console.error('HTTP server failed:', err.message);
    process.exit(1);
  });
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
