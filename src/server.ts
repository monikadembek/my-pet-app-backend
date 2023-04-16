import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsPath = __dirname + '/src/views';

const corsOptions = {
  origin: 'http://localhost:4200'
};

app.use(cors(corsOptions));
app.use(express.static(viewsPath));
app.use(express.json());

app.get('', (req, res) => {
  res.sendFile(viewsPath + 'index.html');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.log('uncaught exception');
  console.error(err);
});
