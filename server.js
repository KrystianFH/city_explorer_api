//============== Packages ==============

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');


//============== Global Variables ==============

const PORT = process.env.PORT || 3003;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const app = express();
app.use(cors());

//=============== Routes ======================
app.get('/location', sendLocationData);
function sendLocationData(request, response){
  const city = request.query.city;
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;

  superagent.get(urlToSearch)
    .then(whateverComesBack =>{
      const superagentResultArray = whateverComesBack.body;
      const constructedLocation = new Location(superagentResultArray);
      response.send(constructedLocation);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(error.message);
    });
}


app.get('/weather', sendWeatherData);
function sendWeatherData(request, response){
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const urlToSearchForWeather = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;

  superagent.get(urlToSearchForWeather)
    .then(weatherComingBack =>{
      const weatherPass = weatherComingBack.body.data;
      const weatherArr = weatherPass.map(index => new Weather(index));
      response.send(weatherArr);
    })
    .catch(error =>{
      console.log(error);
      response.status(500).send(error.message);
    });
}

app.get('/trails', sendTrailData);
function sendTrailData(request, response){
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const urlToSearchForTrail = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${TRAIL_API_KEY}`;

  superagent.get(urlToSearchForTrail)
    .then(trailsComingBack =>{
      const trailPass = trailsComingBack.body.data;
      const trailArr = trailPass.map(index => new Trail(index));
      response.send(trailArr);
    })
    .catch(error =>{
      console.log(error);
      response.status(500).send(error.message);
    });
}


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

function Trail(jsonTrailObject){
  this.name = jsonTrailObject[0].name;
  this.length = jsonTrailObject[0].length;
  this.summary = jsonTrailObject[0].summary;
}

//===============Start the Server====================
app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));
