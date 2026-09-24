import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/rateLimiter.middleware';

const app = express();

// ─── Security & Parsing ───
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(generalLimiter);

// ─── Health Check ───
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Proyojon API is running' });
});

// ─── API Routes (versioned) ───
app.use('/v1', routes);

// ─── Global Error Handler (must be last) ───
app.use(errorMiddleware);

export default app;
