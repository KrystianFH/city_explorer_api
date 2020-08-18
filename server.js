//============== Packages ==============

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { response } = require('express');
const { request } = require('http');
// const { json } = require('body-parser');


//============== Global Variables ==============

const PORT = process.env.PORT || 3003;
const app = express();
app.use(cors());

//=============== Routes ======================
app.get('/location', (request, response) =>{
  const jsonLocationObject = require('./data/location.json');
  const city = request.query.city;
  const constructedLocation = new Location(jsonLocationObject, city);

  response.send(constructedLocation);
});

// if(request.query.city !== 'Lynnwood'){
//   return response.status(500).send('Use `Lynnwood`');
// }

app.get('/weather', (request, response) => {
  const jsonWeatherObject = require('./data/weather.json');
  const weatherArr = [];
  jsonWeatherObject.data.forEach(forecast => {
    weatherArr.push(new Weather(forecast));
  });
  response.send(weatherArr);
});

//================= Other Functions ================
function Location(jsonLocationObject, city){
  console.log(jsonLocationObject);

  this.formatted_query = jsonLocationObject[0].display_name;
  this.latitude = jsonLocationObject[0].lat;
  this.longitude = jsonLocationObject[0].lon;
  this.search_query = city;
}

function Weather(jsonWeatherObject){
  this.forecast = jsonWeatherObject.weather.description;
  this.time = jsonWeatherObject.valid_date;
}

//===============Start the Server====================
app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));

