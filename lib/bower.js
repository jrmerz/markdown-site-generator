var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var exec = require('child_process').exec;

function move(config, callback) {
  if( !config.bower ) {
    return;
  }

  var root = config.root;
  var build = config.buildDir;

  rimraf(path.join(root, 'bower'), function(err){
    fs.mkdirSync( path.join(root, build, 'bower') );

    for( var key in config.bower ) {
      var bowerFile = path.join(root, 'bower_components', config.bower[key]);
      if( fs.existsSync(bowerFile) ) {
        fs.createReadStream(bowerFile).pipe(fs.createWriteStream(path.join(root, build, 'bower', key)));
      } else {
        config.log('Error: Unable to locate bower resource: '+bowerFile);
      }
    }

    callback();
  });
}

function install(config, callback) {
  if( !fs.existsSync(path.join(config.root, 'bower.json')) ) {
    return;
  }

  config.log('Installing bower dependencies');
  exec('cd '+config.root+' && bower install',
    function (error, stdout, stderr) {
      if( stderr ) {
        config.log('stderr: ' + stderr);
      }
      if (error !== null) {
        config.log('exec error: ' + error);
      }

      move(config, callback);
    }
  );
}

module.exports = {
  install : install
};
