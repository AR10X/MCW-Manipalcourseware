module.exports = (app)=>{
    app.get('/explore', (req, res)=>{
        res.render('explore');
      });
    app.get('/loginSignup', (req, res)=>{
        res.render('loginSignup');
      });
    app.get('/crowdsource', (req, res)=>{
        res.render('crowdsource');
    });
    
};

