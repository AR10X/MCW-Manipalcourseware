module.exports = (app)=>{
    
    
    app.get('/crowdsource', (req, res)=>{
        res.render('crowdsource');
    });
    
};

