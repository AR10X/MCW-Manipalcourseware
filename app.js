//Import libraries and packages
const express = require('express');
const session = require('express-session');
const app = express();
const controllerRouting = require('./routes/controllerRouting');
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config({path: __dirname + '/process.env'});
const { MongoClient } = require("mongodb");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const flash = require("connect-flash");
const crypto = require("crypto");
const secret = crypto.randomBytes(64).toString("hex");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const methodOverride = require('method-override');
const { ObjectId } = require('mongodb');




const User = require("./models/user"); // User model

//set up template engine
app.set('view engine', 'ejs');

//fire controllers
controllerRouting(app);

//static files
app.use(express.static('./public'));
app.use('/', express.static('./public'));
app.use('error', express.static('./public'))
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.use(methodOverride('_method'));


//Database config
const db_key = process.env.DATABASE_KEY;
const uri = "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=false&w=majority";


//Mongoose connecting to MongoDB

mongoose.connect( uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// login and signup authentication 
// start

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, {
            errors: { "email or password": "is invalid" },
          });
        }
        if (!user.isActive || user.isLocked) {
          return done(null, false, {
            errors: { "user": "is not active or is locked" },
          });
        }
        if (!(await user.validatePassword(password))) {
          return done(null, false, {
            errors: { "email or password": "is invalid" },
          });
        }
        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  try {
      if (!user.id) {
          throw new Error("User object does not contain an id property");
      }
      const { id } = user;
      console.log("serialize");
      console.log(user.id);
      done(null, id);
  } catch (error) {
      done(error);
  }
});


passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      if (!user) {
          throw new Error(`User with id ${id} not found`);
      }
      console.log("deserialize");
      console.log(user.id);
      done(null, user);
  } catch (error) {
      done(error);
  }
});



app.use(session({
  secret: secret,
  store: MongoStore.create({
    mongoUrl: uri
  }),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// function isLoggedInFirstTime(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   req.flash("error", "You must be logged in to access this page");
//   console.log(req.flash());
//   res.redirect("/");
// }

let loggedOut = false;

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
      res.render("home", {username: req.user.username});
  }else{
    loggedOut = false;  
    res.render("loginSignup", {message: req.flash(), loggedOut: loggedOut });
  }
});

// app.get("/", (req, res) => {
//     res.render("loginSignup");
// });


// var userNameForHome;

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("error", "Invalid email or password");
      // console.log(req.flash());
      return res.redirect("/");
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash("success", "You have successfully logged in!");
      // console.log(req.flash());
      return res.redirect("/home");
    });
  })(req, res, next);
});



// Signup route
app.post("/signup", (req, res, next) => {
  const { username, email, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        req.flash("error", "Email already exists");
        // console.log(req.flash());
        return res.redirect("/");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      const newUser = new User({ username, email, password: hash});
      return newUser.save();
    })
    .then(() => {
      req.flash("success", "You have successfully signed up! Now you can log in.");
      // console.log(req.flash());
      res.redirect("/");
    })
    .catch((err) => {
      next(err);
    });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be logged in to access this page");
  res.redirect("/");
}


app.get('/home', isLoggedIn, function(req, res) {
  res.render('home', {username: req.user.username, message: req.flash()});
});


app.get('/explore', isLoggedIn, (req, res)=>{
  res.render('explore');
});


// app.get('/videoConsole', isLoggedIn, (req, res)=>{
//   console.log(req.user);
//   res.render('videoConsole');
// });

app.delete("/logout", (req, res, next) => {
  req.session.destroy(function(err) {
    if (err) { return next(err); }
    loggedOut = true;
    res.redirect("/");
  });
});



// end


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

app.get('/videoConsole/:lectureId', (req, res) => {
  const lectureId = req.params.lectureId;
  client.connect((err) => {
      if (err) {
          console.log("Error connecting to MongoDB server:", err);
          return;
      }
      const db = client.db("lecture").collection("videos");
      db.findOne({ _id: ObjectId(lectureId) }, (err, Lecture) => {
          if (err) {
              console.log("Error executing query:", err);
              return;
          }
          console.log("sent modal data again");
          console.log(Lecture);
          res.json(Lecture);
      });
  });
});


app.post('/videoConsole' , isLoggedIn, (req, res)=>{
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
        console.log("succesuffly sent result to front");
        res.render('videoConsole', {print: result, branch:branch, section: section, subject: subject});
      });
    });
});

app.patch('/videoConsole/:id', isLoggedIn, (req, res) => {
  const { id } = req.params;
  let update = { $set: {} };
  
  if (req.body.lecture_no !== null) {
    update.$set.lecture_no = req.body.lecture_no;
  }
  if (req.body.lecture_topic !== null) {
    update.$set.lecture_topic = req.body.lecture_topic;
  }
  if (req.body.date_time !== null) {
    update.$set.date_time = req.body.date_time;
  }
  if (req.body.teacher_name !== null) {
    update.$set.teacher_name = req.body.teacher_name;
  }
  if (req.body.link !== null) {
    update.$set.link = req.body.link;
  }
  client.connect((err) => {
    if (err) {
      console.log("Error connecting to MongoDB server:", err);
      return;
    }

    const db = client.db("lecture").collection("videos");
    var query = { _id: ObjectId(id) };
    console.log("query object id:" + query);

    db.updateOne(query, update, (err, result) => {
      if (err) {
        console.log("Error executing query:", err);
        return;
      }
      res.sendStatus(200);
    });
  });
});




app.delete('/videoConsole/:id', isLoggedIn, (req, res) => {
  const lectureId = req.params.id;
  client.connect((err) => {
      if (err) {
          console.log("Error connecting to MongoDB server:", err);
          return res.status(500).send({ message: 'Internal server error' });
      }
      const db = client.db("lecture").collection("videos");
      db.deleteOne({ _id: ObjectId(lectureId) }, (err, result) => {
          if (err) {
              console.log("Error executing query:", err);
              return res.status(500).send({ message: 'Internal server error' });
          }
          if(result.deletedCount==1){
              return res.status(200).send({ message: 'Successfully Deleted' });
          }else{
              return res.status(404).send({ message: 'lecture not found' });
          }
      });
  });
});


// app.post('/video-page/:param', function(req, res){
//     const link_val = req.params.param;
//     res.render('video-page', {printvalue:link_val});
// });

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: err });
});


app.use(function(req, res, next) {
  res.status(404).render('error', {url: req.originalUrl});
});


//listen to port
app.listen(3100);
console.log('You are listening to port 3100...');