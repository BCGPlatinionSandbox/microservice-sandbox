var express = require('express');
var router = express.Router();
const path = require('path');
const multer = require("multer");
const fileDir = process.env.RESOURCE_DIR ? path.join(process.env.RESOURCE_DIR, 'uploadedFiles') :  path.join(__dirname,'../uploadedFiles/');
const upload = multer({ dest: fileDir});
const crypto = require('crypto'), fs = require('fs');
const mime = require('mime-types')



/* GET home page. */
router.get('/', function (req, res, next) {
  try {
    const token = req.query.t;
    router.app.cassandraClient.readFile(token,(err, result) => {
      if (!err) {
        res.header("Content-Type", result.mime);
        res.send(result.data);
      } else {
        res.status(err.errno).send(err.message);
      }
    });

  }

  catch (error) {
    res.status(500).send('Error accessing file');
  }

});

/* POST home page. */
router.post('/',upload.any(),  function (req, res, next) {

  try {
    const fileInfo = req.files.length > 0 ? {filename: req.files[0].filename, originalname: req.files[0].originalname, path:req.files[0].path, destination:req.files[0].destination, mime:req.files[0].mimetype, extension:mime.extension(req.files[0].mimetype)} : null;

    if (fileInfo) {
      const hash = crypto.createHash('sha1');
      const stream = fs.createReadStream(fileInfo.path);

      stream.on('data', function (data) {
        hash.update(data, 'utf8')
      })

      stream.on('end', function () {
        const timestanp = Date.now();
        const token = (crypto.createHash('md5').update(timestanp + fileInfo.originalname).digest("hex")).slice(0,12);

        fs.readFile(fileInfo.path, (err, data) => {
          if (!err) {
            router.app.cassandraClient.writeFile(token,fileInfo.originalname,data,fileInfo.mime,60,(err) => {

              if (!err) {
                //console.log('headers: ',req.headers);
                const newName = hash.digest('hex') + '.' + fileInfo.extension;
                const url = req.headers.origin + '/file/'  + newName + '?t=' + token;
                res.json({url:url, name:fileInfo.originalname});
              }
              else {
                res.status(500).send('Error while uploading');
              }
              fs.unlink(fileInfo.path, (err) => {});
            });
          }
          else {
            res.status(500).send('Error while uploading');
          }
        });
      })


    } else {
      res.status(500).send('Error while uploading');
    }
  }

  catch (error) {
    res.status(500).send('Error while uploading');
  }

});

module.exports = router;
