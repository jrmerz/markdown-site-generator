var rimraf = require('rimraf');
var crawler = require('./lib/crawl');
var generate = require('./lib/generate');
var bower = require('./lib/bower');
var seo = require('./lib/seo');
var path = require('path');
var fs = require('fs');
var watch = require('watch');
var argv = require('minimist')(process.argv.slice(2));

var dir = argv._[0];

var root = path.join(process.cwd(), dir);
var buildDir = 'build';

var config = {};
if( fs.existsSync(path.join(root, '.config')) ) {
  config = eval('(' + fs.readFileSync(path.join(root, '.config'), 'utf-8') +' )');
}

if( config.build ) {
  buildDir = config.build;
}
config.buildDir = buildDir;

if( config.ignore ) {
  for( var i = 0; i < config.ignore.length; i++ ) {
    config.ignore[i] = path.join(root, config.ignore[i]);
  }
}

config.buildPath = path.join(root, buildDir);
config.root = root;
config.log = function(msg) {
  if( this.silent ) return;
  console.log(msg);
};

// setup watcher
if( argv.watch || argv.w ) {
  config.log('Setting up directory watcher');

  var ignore = ['bower_components', '.git', buildDir];
  watch.watchTree(root,
    {
      filter : function(file, dir) {
        var name = file.replace(/.*\//,'');
        if( ignore.indexOf(name) > -1 ) {
          return false;
        }
        return true;
      }
    },
    function (f, curr, prev) {
        build();
    }
  );
} else {
  build();
}

var building = false;
function build() {
  if( building ) {
    return console.log('Still building, please try again');
  }
  building = true;

  config.log('***** BUILDING *****');
  config.log(config.root);

  rimraf(config.buildPath, function(err){
    fs.mkdirSync(config.buildPath);

    crawler.run(config, function(err, data){
      config.log('Generating content in: '+config.buildPath)
      generate.run(config.buildPath, data, function(){
        bower.install(config, function(){

          if( argv.seo ) {
            seo.build(argv.seo, config.buildPath, data);
          }

          console.log('Done.');
          building = false;
        });
      });
    });
  });
}

global.config = config;
global.log = function(msg) {

}
