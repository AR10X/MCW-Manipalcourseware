app.post("/signup", (req, res, next) => {
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