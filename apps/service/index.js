import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

app.use(express.json());
app.use(
  express.static(
    path.join(__dirname, './angular-app/dist/angular-app/browser')
  )
);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(
    `🚀 Server is running on port ${port}, http://localhost:${port}`
  );
});
