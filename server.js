//============== Packages ==============

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { request, response } = require('express');

//============== Global Variables ==============

const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());

//=============== Routes ======================
app.get('/location', (request, response) =>{
  const jsonLocationObject = require('./data/location.json');
  const constructedLocation = new Location(jsonLocationObject);

  response.send(constructedLocation);
});

// app.get('/weather', sendWeatherData);

// function sendWeatherData(request, response){
//   const jsonWeatherObject = require('./data/weather.json');
//   const arrWeatherJson = jsonWeatherObject.
// }
  

