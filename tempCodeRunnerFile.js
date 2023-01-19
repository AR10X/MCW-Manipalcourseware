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