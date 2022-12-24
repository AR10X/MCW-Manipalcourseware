module.exports = function(app){

    app.get('/explore',function(req, res){
        res.render('explore');
        });
    
    app.get('/video-page', function(req, res){
        res.render('video-page');
    });
   
};

