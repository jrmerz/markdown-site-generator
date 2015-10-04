var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var exec = require('child_process').exec;

function move(root, build, config, callback) {
  if( !config.bower ) {
    return;
  }

  rimraf(path.join(root, 'bower'), function(err){
    fs.mkdirSync( path.join(root, build, 'bower') );

    for( var key in config.bower ) {
      var bowerFile = path.join(root, 'bower_components', config.bower[key]);
      if( fs.existsSync(bowerFile) ) {
        console.log('copying')
        fs.createReadStream(bowerFile).pipe(fs.createWriteStream(path.join(root, build, 'bower', key)));
      } else {
        console.log('Unable to locate bower resource: '+bowerFile);
      }
    }

    callback();
  });
}

function install(root, build, config, callback) {
  if( !fs.existsSync(path.join(root, 'bower.json')) ) {
    return;
  }

  console.log('Installing bower dependencies');
  exec('cd '+root+' && bower install',
    function (error, stdout, stderr) {
      if( stderr ) {
        console.error('stderr: ' + stderr);
      }
      if (error !== null) {
        console.log('exec error: ' + error);
      }

      move(root, build, config, callback);
    }
  );
}

module.exports = {
  install : install
};
