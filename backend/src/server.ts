import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initScheduler } from './jobs/scheduler';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Proyojon API running on port ${PORT}`);
  initScheduler();
});
