// use the express middleware
var express = require('express')
  , pg = require('pg').native
  , connectionString = process.env.DATABASE_URL
  , start = new Date()
  , port = process.env.PORT
  , client;
// make express handle JSON and other requests
var bodyParser = require('body-parser');

// use cross origin resource sharing
var cors = require('cors');

// instantiate app
var app = express();

client = new pg.Client(connectionString);
client.connect();

var quotes = [
  { author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!"},
  { author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"},
  { author : 'Unknown', text : "Even the greatest was once a beginner. Don’t be afraid to take that first step."},
  { author : 'Neale Donald Walsch', text : "You are afraid to die, and you’re afraid to live. What a way to exist."}
];

// make sure we can parse JSON
app.use(bodyParser.json());
app.get('/', function(req, res) {
  var date = new Date();

  client.query('INSERT INTO visits(date) VALUES($1)', [date]);
});
// serve up files from this directory 
app.use(express.static(__dirname));
// make sure we use CORS to avoid cross domain problems
app.use(cors());

app.get('/quote/random', function(req, res) {
  var id = Math.floor(Math.random() * quotes.length);
  var q = quotes[id];
  res.send(q);
});

app.get('/quote/:id', function(req, res) {
  if(quotes.length <= req.params.id || req.params.id < 0) {
    res.statusCode = 404;
    return res.send('Error 404: No quote found');
  }

  var q = quotes[req.params.id];
  res.send(q);
});

app.post('/quote', function(req, res) {
  console.log(req.body);
  if(!req.body.hasOwnProperty('author') || 
!req.body.hasOwnProperty('text')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  }

  var newQuote = {
    author : req.body.author,
    text : req.body.text
  };

  quotes.push(newQuote);
  // should send back the location at this point
  console.log("Added!");
  newQuote.pos = quotes.length-1;
  res.send(newQuote);
});

app.delete('/quote/:id', function(req, res) {
  if(quotes.length <= req.params.id) {
    res.statusCode = 404;
    return res.send('Error 404: No quote found');
  }

  quotes.splice(req.params.id, 1);
  res.json(true);
});

// use PORT set as an environment variable
var server = app.listen(process.env.PORT, function() {
    console.log('Listening on port %d', server.address().port);
});


