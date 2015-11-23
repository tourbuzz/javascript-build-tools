var fs = require('fs');
var Handlebars = require('handlebars')
var express = require('express');
var exphbs  = require('express-handlebars');
var assetPipeline = require('broccoli-middleware');
var app = express();
module.exports = function(serverPort) {

  var hbs = exphbs.create({
    helpers: {
      tourData: function() {
        var safeJson = fs.readFileSync(path.join(__dirname, 'config', 'tourData.json'), {encoding: 'utf-8'});
        safeJson = JSON.parse(safeJson);
        return new Handlebars.SafeString(JSON.stringify(safeJson)+ ';');
      }
    }
  });

  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');

  app.get('/', function (req, res) {
    res.render('../index');
  });


  app.use(assetPipeline({useLiveReload: true}));

  var server = app.listen(serverPort, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
  });
};
