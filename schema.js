var pg = require('pg').native
  , connectionString = process.env.DATABASE_URL
  , client
  , query;

var quotes = [
  { author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!"},
  { author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"},
  { author : 'Unknown', text : "Even the greatest was once a beginner. Don’t be afraid to take that first step."},
  { author : 'Neale Donald Walsch', text : "You are afraid to die, and you’re afraid to live. What a way to exist."}
];

client = new pg.Client(connectionString);
client.connect();
query = client.query ('drop table quote');
query = client.query('CREATE TABLE quote (id int primary key , author varchar(20) not null , text text not null)');
for ( var id = 0 ; id <4 ; id++){
	
query = client.query('INSERT INTO quote (id , author , text) VALUES($1, $2,$3)', [id, quotes[id].author , 
quotes[id].text]);
}
query.on('end', function(result) { client.end(); });
