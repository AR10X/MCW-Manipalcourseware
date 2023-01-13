//Import libraries and packages
const express = require('express');
const session = require('express-session');
const app = express();
const controllerRouting = require('./routes/controllerRouting');
const authRouter = require('./routes/auth');
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
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");


const User = require("./models/user"); // User model
const router = require('./routes/auth');

//set up template engine
app.set('view engine', 'ejs');

//fire controllers
controllerRouting(app);

//static files
app.use(express.static('./public'));
app.use('/loginSignup', express.static('./public'));
// app.use('/crowdsource', express.static('./public'))
app.use(bodyParser.urlencoded({extended : false}));
app.use('/', authRouter);


//Database config
const db_key = process.env.DATABASE_KEY;
const uri = "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=true&w=majority";


//Mongoose connecting to MongoDB

mongoose.connect( "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=true&w=majority", {
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
      done(null, user);
  } catch (error) {
      done(error);
  }
});



app.use(session({
  secret: secret,
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://admin:"+db_key+"@cluster0.alu0pdy.mongodb.net/?retryWrites=true&w=majority"
  }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// function isLoggedIn2(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect("/explore");
// }




// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/explore');
// }
// const router = express.Router();
// router.use(ensureAuthenticated);
// router.get("/explore", (req, res) => {});
// router.get("/videoConsole", (req, res) => {});
// app.use("/", router);

// Login route

// app.post("/login", 
//   passport.authenticate("local", {
//     successRedirect: "/explore",
//     failureRedirect: "/loginSignup",
//     failureFlash: true,
//   })
// );


// app.post("/login", async (req, res, next) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//         req.flash("error", "1Invalid email or password");
//         console.log(req.flash());
//         return res.redirect("/loginSignup");
//     }

//     const isMatched = await bcrypt.compare(password, user.password);
//     if (!isMatched) {
//         req.flash("error", "2Invalid email or password");
//         console.log(req.flash());
//         return res.redirect("/loginSignup");
//     }

//     req.logIn(user, err => {
//       if (err) {
//         return next(err);
//       }
//       req.flash("success", "You have successfully logged in!");
//       console.log(req.flash());
//       return res.redirect("/explore");
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// app.post("/login", passport.authenticate("local", {
//   successRedirect: "/explore",
//   failureRedirect: "/loginSignup",
//   failureFlash: true,
// }));

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
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



// app.post('/login', (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     if (info) {
//       return res.render('loginSignup', { errors: info.errors });
//     }
//     req.login(user, (err) => {
//       if (err) {
//         return next(err);
//       }
//       return res.redirect('/explore');
//     });
//   })(req, res, next);
// });


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


    // const salt = await bcrypt.genSalt(10);
    // const hash = await bcrypt.hash(password, salt);
    // const newUser = new User({ email, password: hash });
    // newUser.save().then(() => {
    //     req.flash("success", "You have successfully signed up! Now you can log in.");
    //     console.log(req.flash("success"));
    //     res.redirect("/loginSignup");
    // })


//     User.findOne({ email })
//     .then((existingUser) => {
//       if (existingUser) {
//         req.flash("error", "Email already exists");
//         console.log(req.flash());
//         return res.redirect("/loginSignup");
//       }
//       return bcrypt.genSalt(10);
//     })
//     .then((salt) => bcrypt.hash(password, salt))
//     .then((hash) => {
//       const newUser = new User({ email, password: hash });
//       return newUser.save();
//     })
//     .then(() => {
//       req.flash("success", "You have successfully signed up! Now you can log in.");
//       console.log(req.flash());
//       res.redirect("/loginSignup");
//     })
//     .catch((err) => {
//       next(err);
//     });
// });



// app.post("/signup", (req, res, next) => {
//   const { email, password } = req.body;

//   User.findOne({ email })
//     .then((user) => {
//       if (user) {
//         req.flash("errors", "Email already exists");
//         console.log(user);
//         console.log(req.flash());
//         return res.redirect("/loginSignup");
//       }

//       const newUser = new User({ email, password });

//       return newUser
//         .save()
//         .then(() => {
//           req.flash("success", "You have successfully signed up! Now you can log in.");
//           res.redirect("/loginSignup");
//         })
//         .catch((err) => {
//           next(err);
//         });
//     })
//     .catch((err) => {
//       next(err);
//     });
// });


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You must be logged in to access this page");
  console.log(req.flash());
  res.redirect("/loginSignup");
}


app.get("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy();
    req.flash("success", "You have successfully logged out!");
    console.log(req.flash());
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

app.post('/videoConsole' , (req, res)=>{
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