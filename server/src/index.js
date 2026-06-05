import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import publicRoutes from './routes/public.js';
import { errorHandler } from './middleware/errors.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const clientDist = path.resolve(process.cwd(), process.env.CLIENT_DIST || '../client/dist');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/assets', express.static(path.resolve(process.cwd(), '../client/public/assets')));
app.use('/api', publicRoutes);

app.use(express.static(clientDist));
app.get('*', (_request, response) => {
  response.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
