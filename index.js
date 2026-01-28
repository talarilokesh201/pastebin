const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

require('dotenv').config();
const { connect } = require('./db');
const routes = require('./routes');

const PORT = process.env.PORT || 3000;
console.log('PORT:', PORT);

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('layout', 'layout');

// routes
app.get('/', (req, res) => {
  res.render('create');
});

app.use(routes);

// start server
app.listen(PORT, async () => {
  try {
    await connect();
    console.log('DB Connected');
  } catch (err) {
    console.log('DB Not Connected');
    process.exit(1);
  }

  console.log('Server is running on port ' + PORT);
});
