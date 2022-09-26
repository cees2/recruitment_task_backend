const mongoose = require('mongoose');
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then((connect) => console.log('Successfuly connected to database'));

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
