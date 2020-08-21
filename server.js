//============== Packages ==============

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


//============== Global Variables ==============

const PORT = process.env.PORT || 3003;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
const YELP_API_KEY = process.env.YELP_API_KEY;
const app = express();

//======configure the server and database =====

app.use(cors());
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.error(error));

//=============== Routes ======================

app.get('/location', sendLocationData);
app.get('/weather', sendWeatherData);
app.get('/trails', sendTrailData);
app.get('/movies', sendMovieData);
app.get('/yelp'), sendYelpData;

//========== Route Handlers ===================
function sendLocationData(request, response){
  const city = request.query.city;
  const urlToSearch = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;

  client.query('SELECT * FROM cities WHERE search_query=$1', [city])
    .then(resultFromPG => {
      if(resultFromPG.rowCount === 1){
        //send the city to the front end and do nothing else (already in DB)
        response.send(resultFromPG.rows[0]);
      } else {
        superagent.get(urlToSearch)
          .then(whateverComesBack =>{
            const superagentResultArray = whateverComesBack.body;
            const constructedLocation = new Location(superagentResultArray);
            response.send(constructedLocation);

            const saveLocationQuery = 'INSERT INTO cities (formatted_query, longitude, latitude, search_query)VALUES ($1, $2, $3, $4)';
            const locationArray = [constructedLocation.formatted_query, constructedLocation.longitude, constructedLocation.latitude, constructedLocation.search_query];
            client.query(saveLocationQuery, locationArray)
              .then(() => console.log('it saved'))
              .catch(error => console.error(error));
          })
          .catch(error => {
            console.log(error);
            response.status(500).send(error.message);
          });
      }
    });
}



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

function sendTrailData(request, response){
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  const urlToSearchForTrail = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${TRAIL_API_KEY}`;

  superagent.get(urlToSearchForTrail)
    .then(trailsComingBack =>{
      const trailPass = trailsComingBack.body.trails;
      const trailArr = trailPass.map(index => new Trail(index));
      response.send(trailArr);
    })
    .catch(error =>{
      console.log(error);
      response.status(500).send(error.message);
    });
}

function sendMovieData(request, response){
  const urlToSearchForMovie = `https://api.themoviedb.org/3/movie/550?api_key=${MOVIE_API_KEY}`;

  superagent.get(urlToSearchForMovie)
    .then(moviesComingBack =>{
      const moviePass = moviesComingBack;
      console.log(moviesComingBack);
      const movieArr = moviePass.map(index => new Movie(index));
      response.send(movieArr);
    })
    .catch(error =>{
      console.log(error);
      response.status(500).send(error.message);
    });
}

// function sendYelpData(request, response){
//   const urlToSearchForYelp = `https://api.yelp.com/v3/businesses/{id}`
// }

//================= Other Functions ================
function Location(jsonLocationObject, city){
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
  this.name = jsonTrailObject.name;
  this.location = jsonTrailObject.location;
  this.length = jsonTrailObject.length;
  this.stars = jsonTrailObject.stars;
  this.star_votes = jsonTrailObject.star_votes;
  this.summary = jsonTrailObject.summary;
  this.trail_url = jsonTrailObject.trail_url;
  this.conditions = jsonTrailObject.conditions;
  this.condition_date = jsonTrailObject.condition_date;
  this.condition_time = jsonTrailObject.condition_time;
}

function Movie(jsonMovieObject){
  this.title = jsonMovieObject.title;
  this.overview = jsonMovieObject.overview;
  this.average_votes = jsonMovieObject.average_votes;
  this.total_votes = jsonMovieObject.total_votes;
  this.image_url = jsonMovieObject.url;
  this.popularity = jsonMovieObject.popularity;
  this.realeased_on = jsonMovieObject.realeased_on;
}

function Yelp(jsonYelpObject){
  this.name = jsonYelpObject.name;
  this.image_url = jsonYelpObject.image_url;
  this.price = jsonYelpObject.price;
  this.rating = jsonYelpObject.rating;
  this.url = jsonYelpObject.url;
}

//===============Start the Server====================
client.connect()
  .then (() => {
    app.listen(PORT, () => console.log(`we are running on PORT : ${PORT}`));
  });
