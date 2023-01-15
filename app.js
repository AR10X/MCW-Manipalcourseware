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


const User = require("./models/user"); // User model

//set up template engine
app.set('view engine', 'ejs');


app.get("/", (req, res) => {
  res.render("loginSignup");
});

//fire controllers
controllerRouting(app);

//static files
app.use(express.static('./public'));
app.use('/loginSignup', express.static('./public'));
// app.use('/crowdsource', express.static('./public'))
app.use(bodyParser.urlencoded({extended : false}));
app.use(methodOverride('_method'));


//Database config
const db_key = process.env.DATABASE_KEY;
const uri = "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=true&w=majority";


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
    mongoUrl: "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=false&w=majority"
  }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());



app.get('/loginSignup', function(req, res, next) {
  res.render('loginSignup');
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("error", "Invalid email or password");
      console.log(req.flash());
      return res.redirect("/loginSignup");
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash("success", "You have successfully logged in!");
      console.log(req.flash());
      return res.redirect("/explore");
    });
  })(req, res, next);
});



// Signup route
app.post("/signup", (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        req.flash("error", "Email already exists");
        console.log(req.flash());
        return res.redirect("/loginSignup");
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      const newUser = new User({ email, password: hash });
      return newUser.save();
    })
    .then(() => {
      req.flash("success", "You have successfully signed up! Now you can log in.");
      console.log(req.flash());
      res.redirect("/loginSignup");
    })
    .catch((err) => {
      next(err);
    });
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("islogged in deserialize");
    return next();
  }
  req.flash("error", "You must be logged in to access this page");
  console.log(req.flash());
  res.redirect("/loginSignup");
}

app.get('/explore', isLoggedIn, (req, res)=>{
  console.log(req.user);
  res.render('explore');
});

app.get('/videoConsole', isLoggedIn, (req, res)=>{
  console.log(req.user);
  res.render('videoConsole');
});

app.delete("/logout", (req, res, next) => {
  req.session.destroy(function(err) {
    if (err) { return next(err); }
    
    console.log(req.user);
    res.redirect("/loginSignup");
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
        res.render('videoConsole', {print: result, branch:branch, section: section, subject: subject});
      });
    });
});


// app.post('/video-page/:param', function(req, res){
//     const link_val = req.params.param;
//     res.render('video-page', {printvalue:link_val});
// });

//listen to port
app.listen(3100);
console.log('You are listening to port 3100...');