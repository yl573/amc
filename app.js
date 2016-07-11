try
{
  var express = require('express');
  var formidable = require('formidable');
  var path = require('path');
  var fs = require('fs');
  var morgan = require('morgan');


  var app = express();
  app.use(morgan('dev'));
  app.use(express.static(__dirname));

  app.use('/upload', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.uploadDir = path.join(__dirname, '/files');

    form.on('file', function(field, file) {
      fs.rename(file.path, path.join(form.uploadDir, file.name));
      res.write('Your pdf ' + file.name + ' has been add!');
    });

    form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
    });

    form.on('end', function() {
      res.end();
    });

    form.parse(req);  
  });

  app.use('/download', function(req, res, next){ 
    fs.readdir(__dirname + '/files', function(err, files) {
      if (err) return;
      var download_path = path.resolve('./files/' + files[0]);
      console.log("download " + download_path);
      res.download(download_path, 'bomba.pdf');
    })
  });

  app.listen(8080);

}
catch(err)
{
  console.log(err);
}