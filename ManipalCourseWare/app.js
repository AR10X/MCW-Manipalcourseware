//Required dependencies and frameworks
const express = require('express');
const app = express();
const controllerOne = require('./controllers/controllerOne');
const bodyParser = require("body-parser");
const ejs = require("ejs");


//set up template engine
app.set('view engine', 'ejs');

//static files
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended : false}));

//fire controllers
controllerOne(app);

//listen to port
app.listen(3000);
console.log('You are listening to port 3000...');