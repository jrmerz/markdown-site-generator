var rimraf = require('rimraf');
var crawler = require('./lib/crawl');
var generate = require('./lib/generate');
var bower = require('./lib/bower');
var path = require('path');
var fs = require('fs');

var root = path.join(__dirname, '/../website');
var build = 'build';

var config = {};
if( fs.existsSync(path.join(root, '.config')) ) {
  config = eval('(' + fs.readFileSync(path.join(root, '.config'), 'utf-8') +' )');
}

if( config.ignore ) {
  for( var i = 0; i < config.ignore.length; i++ ) {
    config.ignore[i] = path.join(root, config.ignore[i]);
  }
}

rimraf(path.join(root, build), function(err){
  fs.mkdirSync(path.join(root, build));

  crawler.run(root, config, function(err, data){
    generate.run('../website/build', data, function(){
      bower.install(root, build, config, function(){
        console.log('done');
      });
    });
  });
});
