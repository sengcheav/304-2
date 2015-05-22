var express = require('express');

// added cors
var app = express()
	, pg = require('pg').native
   ,bodyParser = require('body-parser')	
   , connectionString = process.env.DATABASE_URL
   , cors = require('cors')
	, port = process.env.PORT
  	, client;

//var bodyParser = require('body-parser');
client = new pg.Client(connectionString);
client.connect();
var quotes = [
  { author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!"},
  { author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"},
  { author : 'Unknown', text : "Even the greatest was once a beginner. Don’t be afraid to take that first step."},
  { author : 'Neale Donald Walsch', text : "You are afraid to die, and you’re afraid to live. What a way to exist."}
];
// make express handle JSON and other requests
app.use(bodyParser.json());
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
//  if(quotes.length <= req.params.id || req.params.id < 0) {
  if(req.params.id < 0 ){
    res.statusCode = 404;
    return res.send('Error 404: No quote found');
  }

 // var q = quotes[req.params.id];
  //res.send(q);
  query = client.query('SELECT author, text FROM quote WHERE id = $1', [req.params.id]);
  query.on('row', function(result) {
    console.log(result);

    if (!result) {
      return res.send('No data found');
    } else {
      res.send(result);
    }
  }); 
   
});


app.post('/quote',  function(req, res) {
  var position =0 ;
  console.log("Im here ");
  console.log(req.body);
  if(!req.body.hasOwnProperty('author') || !req.body.hasOwnProperty('text')) {
    res.statusCode = 400;
    console.log("body error");	
    return res.send('Error 400: Post syntax incorrect.');
  }
   
  var newQuote = {
    author : req.body.author,
    text : req.body.text
  };
  
newQuote.pos = quotes.length;
console.log("FK");
query = client.query('SELECT COUNT(id) AS COUNT FROM quote');
    query.on('row', function( err, result) { 
    	if(err) {console.log (err);console.log("ERR"); }
    	else { console.log ("FK heroku") ;
    	    console.log ("COUNT : --"  + result.count );
    	    query = client.query('INSERT INTO quote (id , author , text) VALUES($1, $2, $3)', [result.count , newQuote.author, newQuote.text]);
	    query.on ('row', function (err, result){
	    if(err) {console.log (err); }
	    else { console.log ("YAY");}
	    });	
    	}
//	if (err){console .log("ERROR"); }	
//	else {console .log("NOT ERROR");
//	 query = client.query('INSERT INTO quote (id , author , text) VALUES($1, $2, $3)', [result.count , 
//newQuote.author, newQuote.text]);
//	 query.on ('row', function (err, result1){
///	 if(err) {console.log ("Post error"); }
//	 else {}
//	 });
//	}

    });
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
