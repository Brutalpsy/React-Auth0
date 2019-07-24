checkRole = role => {
  return (req, res, next) => {
    const assignedRoles = req.user['http://localhost:3000/roles'];
    if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
      return next();
    } else {
      return res.status(401).send('Insufficieent role');
    }
  };
};

var express = require('express');
var app = express();
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
const checkScope = require('express-jwt-authz');

var port = process.env.PORT || 8080;

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://reactjscourse-dev.auth0.com/.well-known/jwks.json'
  }),
  audience: 'http://localhost:3001',
  issuer: 'https://reactjscourse-dev.auth0.com/',
  algorithms: ['RS256']
});

app.use(jwtCheck);

app.get('/public', (req, res) => {
  res.json({
    message: 'Hellow froma public API'
  });
});

app.get('/private', jwtCheck, (req, res) => {
  res.json({
    message: 'Hellow froma PRIVATE API'
  });
});

app.get('/course', jwtCheck, checkScope(['read:courses']), (req, res) => {
  res.json({
    courses: [{ id: 1, title: 'prvi title' }, { id: 2, title: 'drugi title' }]
  });
});

app.get('/admin', jwtCheck, checkRole('admin'), (req, res) => {
  res.json({
    message: 'Hellow from a admin API'
  });
});

app.listen(3001);
console.log(`listening on ${process.env.REACT_APP_API_URI}`);
