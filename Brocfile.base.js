module.exports = function(pathName) {
  var env = require('broccoli-env').getEnv();
  var fastBrowserify = require('broccoli-fast-browserify');
  var broccoli = require('broccoli');
  var path = require('path');
  var watchify = require('broccoli-watchify');
  var eyeglassSass = require('broccoli-eyeglass');
  var Funnel = require('broccoli-funnel');
  var BroccoliMergeTrees = require('broccoli-merge-trees');

  var compileCoffeescript = function(inputTree) {
    var options;
    options = {
      browserify: {
        entries: ['./app.coffee'],
        insertGlobals : true,
        debug: true
      },
      outputFile: 'app.js',
      cache: true,
      init: function(b) {
        b.transform('coffeeify');
        b.transform('optionalrequirfy');
        b.transform('globify');
        b.transform('debowerify');
        return b.external('$');
      }
    };
    return watchify(inputTree, options);
  };

  var compileSass = function(inputTree) {
    var options = {
      cssDir: "styles",
      fullException: false,
      root: path.resolve(path.join(inputTree, '..')),
      includePaths: [path.resolve(path.join(inputTree, '..', 'bower_components')), path.resolve(path.join(inputTree, '..', 'bower_components', 'susy', 'sass'))]
    }
    return new eyeglassSass(inputTree, options);
  }

  var imageFiles = function(inputTree) {
    return new Funnel(inputTree, {destDir: 'images'});
  };

  var jsFiles = compileCoffeescript(path.join(pathName, "scripts"));
  var css = compileSass(path.join(pathName, "styles"));
  var images = imageFiles(path.join(pathName, "images"));

  sourceTrees = [
    new Funnel(path.join(pathName, 'scripts'), {include: ['**/*.html'], destDir:'scripts'}),
    new Funnel(jsFiles, {destDir: 'scripts'}),
    css,
    images
  ];

  var combined = new BroccoliMergeTrees(sourceTrees, {
    overwrite: true
  });

  // Short circut in dev mode do not need cache busting
  if(env === 'development') {
    return combined;
  }


  var AssetRev = require('broccoli-asset-rev');
  var renameFiles = require('broccoli-rename-files');
  var filterNgMin = require('broccoli-ng-min');


  var hbs = new Funnel(pathName, {include: ['index.handlebars'], destDir:'.'});

  var template = renameFiles(hbs, {
    transformFilename: function(filename, basename, extname) {
     return 'index.html'
    }
  });

  var ngMin = filterNgMin(combined);

  var combined = new BroccoliMergeTrees([ngMin, template], {
    overwrite: true
  });

  var assetNode = new AssetRev(combined, {
    extensions: ['js', 'css', 'png', 'jpg', 'gif'],
    replaceExtensions: ['html', 'js', 'css'],
  });

  return assetNode;
};
