module.exports = (app)=>{

    app.get('/explore', (req, res)=>{
        res.render('explore');
        });
    
    app.get('/video-page', (req, res)=>{
        res.render('video-page');
    });
   
    
};

