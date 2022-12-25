//Required dependencies and frameworks
const express = require('express');
const app = express();
const controllerRouting = require('./controllers/controllerOne');
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config({path: __dirname + '/process.env'});
const MongoClient = require('mongodb').MongoClient;


//set up template engine
app.set('view engine', 'ejs');

//fire controllers
controllerRouting(app);

//static files
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended : false}));

const host = process.env.DATABASE_HOST;
const pswd = process.env.DATABASE_PASSWORD;

const uri = "mongodb+srv://"+host+":"+pswd+":@cluster0.mongodb.net/test?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database connected!");
  db.close();
});

app.post('/video-list', (req, res)=>{
    const branch = req.body.branch;
    const section = req.body.section;
    const subject = req.body.subject;
    
    
    //querying data from database
    // var sql = "SELECT * FROM master_table WHERE branch_code=? AND section=? AND subject_code=? ORDER BY lecture_no ASC";

    // connection.query(sql,[branch,section,subject],(error, results)=>{
    //     if (error) {
    //       return console.error(error.message);
    //       }
    //     else{
    //       res.render('video-list', {print: results});
    //     }
    //   });
  });

  

  // app.post('/video-page/:param1', function(req, res){
  //     videovalue= req.params;
  //     var sql1 = "SELECT * FROM master_table WHERE link=?";

  //   connection.query(sql1,[videovalue.param1],(error, results1)=>{
  //       if (error) {
  //         return console.error(error.message);
  //         }
  //       else{
  //         res.render('video-page', {printvalue: results1});
  //       }
  //     });
  // });
//listen to port
app.listen(3000);
console.log('You are listening to port 3000...');