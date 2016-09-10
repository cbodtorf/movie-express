// let's grab our dependencies:
let express = require('express');
let request = require('superagent');

// Create our express app

let app = express();

// set the view engine to use EJS as well as set the default views directory
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');

// This tells Express out of which directory to serve static assets like CSS and images
app.use(express.static(__dirname + '/public'));

//These two variables we'll get from our Auth0 Movie-Analyst-Website Client.
// Head over the the management dashboard at https://manage.auth0.com
// Find the MovieAnalyst Website Client and copy and paste the Client ID and Secret
let NON_INTERACTIVE_CLIENT_ID = 'HkdTTzH09jgRsbmbGdkxreYH4OB2lgbB';
let NON_INTERACTIVE_CLIENT_SECRET = 'ldSFwlDOhDoxNc88HE9nXuZ0fm5uo_rKK1kYHWGKsCHWF9ToSb5BIViF19m7t30b';

// Next, let's define an object that we'll use to exchange our credentials for an access token.
let authData = {
  client_id: NON_INTERACTIVE_CLIENT_ID,
  client_secret: NON_INTERACTIVE_CLIENT_SECRET,
  grant_type: 'client_credentials',
  audience: 'http://movie-express.surge.sh'
}

// We'll create a middleware to make a request to oauth/token Auth0 API with our authData we created above.
// Our data will be validated and if everything is correct, we'll get back an access token.
// We'll store this token in the request.access_token variable and continue the request execution.
// It may be repetitive to call this endpoint each time and not very performant, so you can cache the access_token once it is received.
function getAccessToken(req, res, next) {
  request
    .post('https://theyada.auth0.com/oauth/token')
    .send(authData)
    .end((err, res) => {
        req.access_token = res.body.access_token;
        next();
    })
}


// The hompage route of our application does not interface with the Movie-Analyst-API and is always accessible.
// We won't use the getAccessToken middleware here. We'll simply render the index.ejs view.
app.get('/', (req, res) => {
  res.render('index');
})

// For the movies route we'll call the getAccessToken middle ware to ensure we have an access token,
// If we do have a valid access_token, we'll make a request with the superagent library,
// and we'll be sure to add our access_token in an Authorization header before making the request to our API.
// Once the request is sent out, our API will validate that the access_token has the right scope to request the /movies resource,
// and if it does, will return the movie data. We'll take this movie data, and pass it w/ movies.ejs template for rendering.
app.get('/movies', getAccessToken, (req, res) => {
  request
    .get('http://localhost:8080/movies')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end((err, data) => {
      if(data.status == 403) {
        res.send(403, '403 Forbidden');
      } else {
        let movies = data.body;
        res.render('movies', {movies: movies} );
      }
    })
})

// The process will be the same for the remaining routes. We'll make sure to get the access_token first and then make the request to our API to get the data.
// The key difference on the authors route, is that for our client, we’re naming the route /authors, but our API endpoint is /reviewers.
// Our route on the client does not have to match the API endpoint route.
app.get('/authors', getAccessToken, (req, res) => {
  request
    .get('http://localhost:8080/reviewers')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end((err, data) => {
      if(data.status == 403){
        res.send(403, '403 Forbidden');
      } else {
        let authors = data.body;
        res.render('authors', {authors: authors} );
      }
    })
})

app.get('/publications', getAccessToken, (req, res) => {
  request
    .get('http://localhost:8080/publications')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end((err, data) => {
      if(data.status == 403) {
        res.send(403, '403 Forbidden');
      } else {
        let publications = data.body;
        res.render('publications', {publications: publications} );
      }
    })
})

// We’ve added the pending route, but calling this route from the MovieAnalyst Website will always result in a,
// 403 Forbidden error as this client does not have the admin scope required to get the data.
app.get('/pending', getAccessToken, (req, res) => {
  request
    .get('http://localhost:8080/pending')
    .set('Authorization', 'Bearer ' + req.access_token)
    .end((err, data) => {
      if(data.status == 403) {
        res.send(403, '403 Forbidden');
      }
    })
})

// Our Movie-Analyst-Website will listen on port 3000.
app.listen(3000);
