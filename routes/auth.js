const express = require('express');

const router = express.Router();

router.get('/loginSignup', function(req, res, next) {
    res.render('loginSignup');
});

module.exports = router;