//Import libraries and packages
const express = require('express');
const app = express();
const controllerRouting = require('./controllers/controllerRouting');
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config({path: __dirname + '/process.env'});
const { MongoClient } = require("mongodb");


//set up template engine
app.set('view engine', 'ejs');

//fire controllers
controllerRouting(app);

//static files
app.use(express.static('./public'));
app.use('/video-page', express.static('./public'))
app.use(bodyParser.urlencoded({extended : false}));

//Database config
const db_key = process.env.DATABASE_KEY;
const uri = "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=true&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true });

async function run() {
  try {
    await client.connect();
    await client.db("lecture").command({ ping: 1 });
    console.log("Connected successfully to MongoDB server");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.post('/video-list', (req, res)=>{
    const branch = req.body.branch;
    const section = req.body.section;
    const subject = req.body.subject;
    
    client.connect((err) => {
      if (err) {
        console.log("Error connecting to MongoDB server:", err);
        return;
      }
    
      const db = client.db("lecture").collection("videos");
      var query = {branch_code: branch, section: section, subject_code: subject};
      
      db.find(query).sort({lecture_no: 1}).toArray((err, result) => {
        if (err) {
          console.log("Error executing query:", err);
          return;
        }
        res.render('videoConsole', {print: result});
      });
    });
});


app.post('/video-page/:param', function(req, res){
    const link_val = req.params.param;
    res.render('video-page', {printvalue:link_val});
});

//listen to port
app.listen(3100);
console.log('You are listening to port 3100...');