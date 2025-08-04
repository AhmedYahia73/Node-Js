// app.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes/user');
const db = require('./models');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

require('dotenv').config();

app.use(express.json());
app.use('/user', routes);


db.sequelize.sync({ force: false }).then(() => {
  const server = app.listen(3000, () => {
    const { address, port } = server.address();
    console.log('🚀 Server running on http://' + (address === '::' ? 'localhost' : address) + ':' + port);
  });
});
