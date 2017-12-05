var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Upload File service' ,  subtitle:'A simple micro-serviced app'});
});

module.exports = router;
