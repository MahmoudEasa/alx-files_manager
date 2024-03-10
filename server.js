import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default (app);
