import mongoose from 'mongoose';
import { loadConfig } from './config.js';
import { app } from './app.js';

let config;
try {
  config = loadConfig();
} catch (err) {
  console.error(`[config] ${err.message}`);
  process.exit(1); // fail fast: never start without a database URI
}

try {
  await mongoose.connect(config.mongoUri); // Mongoose 8: no useNewUrlParser / useUnifiedTopology
  console.log('MongoDB connected');
  app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
} catch (err) {
  console.error(`[db] Connection failed: ${err.message}`);
  process.exit(1);
}
