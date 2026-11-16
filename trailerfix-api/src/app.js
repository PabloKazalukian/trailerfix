import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import environment from './config/environment.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import routes from './routers/index.js';

const app = express();

const corsOptions = {
  origin: environment.cors.origins.length > 0 ? environment.cors.origins : true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;