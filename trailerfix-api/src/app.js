import cors from 'cors';
import express from 'express';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import routes from './routers/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
