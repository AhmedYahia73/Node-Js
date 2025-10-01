// app.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const routes = require('./routes/admin');
const db = require('./models');
const path = require('path');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
require('dotenv').config();

app.use(express.json());
app.use('/admin', routes);


db.sequelize.sync({ force: false }).then(() => {
  const server = app.listen(3000, () => {
    const { address, port } = server.address();
    console.log('🚀 Server running on http://' + (address === '::' ? 'localhost' : address) + ':' + port);console.log("Uploads dir:", path.join(process.cwd(), "uploads"));

  });
});
