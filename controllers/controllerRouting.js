module.exports = (app)=>{

    app.get('/explore', (req, res)=>{
        res.render('explore');
        });
    
    app.get('/video-page', (req, res)=>{
        res.render('video-page');
    });
   
    app.post('/video-list', (req, res)=>{
        const branch = req.body.branch;
        const section = req.body.section;
        const subject = req.body.subject;
        
    
        //querying data from database
        var sql = "SELECT * FROM master_table WHERE branch_code=? AND section=? AND subject_code=? ORDER BY lecture_no ASC";
    
        connection.query(sql,[branch,section,subject],(error, results)=>{
            if (error) {
              return console.error(error.message);
              }
            else{
              res.render('video-list', {print: results});
            }
          });
      });
    
      
    
      app.post('/video-page/:param1', function(req, res){
          videovalue= req.params;
          var sql1 = "SELECT * FROM master_table WHERE link=?";
    
        connection.query(sql1,[videovalue.param1],(error, results1)=>{
            if (error) {
              return console.error(error.message);
              }
            else{
              res.render('video-page', {printvalue: results1});
            }
          });
      });
};

