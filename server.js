/* Minimal static file server for Heroku — serves index.html + the data/charts/app/styles assets. */
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(__dirname));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Shopper Agent analytics running on port ' + port));
