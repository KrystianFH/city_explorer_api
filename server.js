//============== Packages ==============

const express = require('express');
require('dotenv').config();
const cors = require('cors');
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

app.get('/weather', sendWeatherData);

function sendWeatherData(request, response){
  const jsonWeatherObject = require('./data/weather.json');
  const constructedWeather = new Weather(jsonWeatherObject);

  response.send(weatherArr);
}

//================= Other Functions ================
function Location(jsonLocationObject, city){
  console.log(jsonLocationObject);

  this.formatted_query = jsonLocationObject[0].display_name;
  this.latitude = jsonLocationObject[0].lat;
  this.longitude = jsonLocationObject[0].lon;
  this.search_query = city;
}

let weatherArr = [];

function Weather(jsonWeatherObject){

  for(let i in jsonWeatherObject.data){
    this.forecast = jsonWeatherObject.data[i].weather.description;
    this.date = jsonWeatherObject.data[i].datetime;
  }
  weatherArr.push(this.forecast, this.time);  
}
//===============Start the Server====================
app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));

