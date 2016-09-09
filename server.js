// let's grab our dependencies:
let express = require("express");
let app = express();
let jwt = require('express-jwt');
let rsaValidation = require('auth0-api-jwt-rsa-validation');

// We’ll create a middleware function to validate the access token when our API is called
// Note that the audience field is the identifier you gave to your API.

let jwtCheck = jwt({
  secret: rsaValidation(),
  algorithms: ['RS256'],
  issuer: 'https://theyada.auth0.com',
  audience: 'http://movie-express.surge.sh'
})

// Enable the use of the jwtCheck middleware in all of our routes
app.use(jwtCheck);


// GUARDIANS OF THE GALAXY
let guard = function(request, response, next){
  // let's use a switch case statement on the route requested
  case '/movies' : {
    let permissions = ['general'];
    for(let i = 0; i < permissions.length; i++){
      if(request.user.scope.includes(permissions[i])){
        next();
      } else {
        response.send(403, {message: 'Forbidden'})
      }
    }
    break;
  }

  // Same for the reviewers
  case '/reviewers': {
    var permissions = ['general'];
    for(var i = 0; i < permissions.length; i++){
      if(req.user.scope.includes(permissions[i])){
        next();
      } else {
        res.send(403, {message:'Forbidden'});
      }
    }
    break;
  }

  // Same for publications
  case '/publications': {
    var permissions = ['general'];
    for(var i = 0; i < permissions.length; i++){
      if(req.user.scope.includes(permissions[i])){
        next();
      } else {
        res.send(403, {message:'Forbidden'});
      }
    }
    break;
  }

  // For the pending route, we’ll check to make sure the token has the scope of admin before returning the results.
  case '/pending': {
    var permissions = ['admin'];
    console.log(req.user.scope);
    for(var i = 0; i < permissions.length; i++){
      if(req.user.scope.includes(permissions[i])){
        next();
      } else {
        res.send(403, {message:'Forbidden'});
      }
    }
    break;
  }

}

// If we do not get the correct credentials, we’ll return an appropriate message
app.use(function(error, request, response, next){

  if (error.name === 'UnauthorizedError') {
    response.status(401).json({message: 'Missing or invalid token'})
  }

});

app.use(guard);


// let's define our movie API endpoint

app.get('/movies', function(request, response){
  // grabbing movie title and review score
  let movies = [
    {title : 'Suicide Squad', release: '2016', score: 8, reviewer: 'Robert Smith', publication : 'The Daily Reviewer'},
    {title : 'Batman vs. Superman', release : '2016', score: 6, reviewer: 'Chris Harris', publication : 'International Movie Critic'},
    {title : 'Captain America: Civil War', release: '2016', score: 9, reviewer: 'Janet Garcia', publication : 'MoviesNow'},
    {title : 'Deadpool', release: '2016', score: 9, reviewer: 'Andrew West', publication : 'MyNextReview'},
    {title : 'Avengers: Age of Ultron', release : '2015', score: 7, reviewer: 'Mindy Lee', publication: 'Movies n\' Games'},
    {title : 'Ant-Man', release: '2015', score: 8, reviewer: 'Martin Thomas', publication : 'TheOne'},
    {title : 'Guardians of the Galaxy', release : '2014', score: 10, reviewer: 'Anthony Miller', publication : 'ComicBookHero.com'},
  ];

  // we should send the response as a JSON array
  response.json(movies);
})


// let's define our reviewer API endpoint
app.get('/reviewers', function(request, response){
  // grabbing reviewers
  let authors = [
    {name : 'Robert Smith', publication : 'The Daily Reviewer', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/angelcolberg/128.jpg'},
    {name: 'Chris Harris', publication : 'International Movie Critic', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/bungiwan/128.jpg'},
    {name: 'Janet Garcia', publication : 'MoviesNow', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/grrr_nl/128.jpg'},
    {name: 'Andrew West', publication : 'MyNextReview', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/d00maz/128.jpg'},
    {name: 'Mindy Lee', publication: 'Movies n\' Games', avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/laurengray/128.jpg'},
    {name: 'Martin Thomas', publication : 'TheOne', avatar : 'https://s3.amazonaws.com/uifaces/faces/twitter/karsh/128.jpg'},
    {name: 'Anthony Miller', publication : 'ComicBookHero.com', avatar : 'https://s3.amazonaws.com/uifaces/faces/twitter/9lessons/128.jpg'}
  ];

  // we should send the response as a JSON array
  response.json(authors);
})


// let's define our publications API endpoint
app.get('/publications', function(request, response){
  // grabbing publications
  let publications = [
    {name : 'The Daily Reviewer', avatar: 'glyphicon-eye-open'},
    {name : 'International Movie Critic', avatar: 'glyphicon-fire'},
    {name : 'MoviesNow', avatar: 'glyphicon-time'},
    {name : 'MyNextReview', avatar: 'glyphicon-record'},
    {name : 'Movies n\' Games', avatar: 'glyphicon-heart-empty'},
    {name : 'TheOne', avatar : 'glyphicon-globe'},
    {name : 'ComicBookHero.com', avatar : 'glyphicon-flash'}
  ];

  // we should send the response as a JSON array
  response.json(publications);
})

// let's define our pending movie review API endpoint
app.get('/pending', function(request, response){
  // grabbing pending reviews
  let pending = [
    {title : 'Superman: Homecoming', release: '2017', score: 10, reviewer: 'Chris Harris', publication: 'International Movie Critic'},
    {title : 'Wonder Woman', release: '2017', score: 8, reviewer: 'Martin Thomas', publication : 'TheOne'},
    {title : 'Doctor Strange', release : '2016', score: 7, reviewer: 'Anthony Miller', publication : 'ComicBookHero.com'}
  ];

  // we should send the response as a JSON array
  response.json(pending);
})

// Time to launch our API Server and have it listen on port 8080
app.listen(8080);
