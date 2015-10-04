var walk = require('walk');
var fs = require('fs');
var path = require('path');
var marked = require('marked');
var merge = require('merge');

var ignore = ['templates', 'bower.json', 'bower_components'];

function run(dir, config, callback) {
  readTemplates(path.join(dir, 'templates'), function(err, templates){
    readContent(dir, config, function(err, content){
      callback(null, {
        content: content,
        templates : templates
      });
    });
  });
}

function readContent(dir, config, callback) {
  var arr = [];
  for( var i = 0; i < ignore.length; i++ ) {
    arr.push(path.join(dir, ignore[i]));
  }

  var walker = walk.walk(dir, {
    filters: arr
  });
  var data = {};

  walker.on("file", function (root, fileStats, next) {
    if( fileStats.name.indexOf('.') === 0  || arr.indexOf(path.join(root, fileStats.name)) > -1) {
      return next();
    }

    append(root, dir, fileStats.name, data, config);
    next();
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    next();
  });

  walker.on("end", function () {
    callback(null, data);
  });
}

function readTemplates(dir, callback) {
  var walker = walk.walk(dir, {});
  var templates = {};

  walker.on('file', function (root, fileStats, next) {
    templates[fileStats.name.replace(/\.\w*/,'')] = fs.readFileSync(path.join(root, fileStats.name), 'utf-8');
    next();
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    next();
  });

  walker.on("end", function () {
    callback(null, templates);
  });
}

function append(root, init, filename, data, config) {
  var dirObject = createPath(data, init, root);

  var ignore = false;
  if( config.ignore ) {
    for( var i = 0; i < config.ignore.length; i++ ) {
      if( root.indexOf(config.ignore[i]) === 0 ) {
        ignore = true;
        break;
      }
    }
  }

  var fileInfo = null;
  if( filename.match(/\.md/i) && !ignore ) {
    fileInfo = parseMarkdown(root, filename);
  } else if( (filename.match(/\.js$/i) || filename.match(/.json$/i)) && !ignore ) {
    fileInfo = {
      name : filename,
      metadata : require(path.join(root,filename))
    };
  } else {
    fileInfo = {
      name : filename,
      path : path.join(root, filename),
      '__resource__' : true
    };
  }

  if( fileInfo ) {
    if( dirObject[fileInfo.name] ) {
      dirObject[fileInfo.name] = merge(dirObject[fileInfo.name], fileInfo);
    } else {
      dirObject[fileInfo.name] = fileInfo;
    }
  }
}

function parseMarkdown(root, filename) {
/* TODO
  var lines = content.split('\n');
  var metadata = [];
  var startFound = 0;

  for( var i = 0; i < lines.length; i++ ) {
    if( lines[i].trim() === '' ) continue;
    if( lines[i].match(/^---/, '') ) {
      startFound = true;
    } else if( startFound && !lines[i].match(/^---/, '') ) {
      metadata.push(lines[i].splice())
    } else if ( lines[i].match(/^---/, '') ) {
      return
    }
  }

  var metadata = content.match(/---.*---/);
  if( metadata ) {
    metadata.replace(/^---\n/g, '');
    content.replace(/---.*---/, '');
  }
*/

  return {
    name : filename,
    content : marked(fs.readFileSync(path.join(root, filename), 'utf-8'))
  };
}

function createPath(data, init, root) {
  var parts = root.replace(init, '').split(path.sep);
  for( var i = 0; i < parts.length; i++ ) {
    if( parts[i] === '' ) continue;
    if( data[parts[i]] === undefined ) {
      data[parts[i]] = {
        name : parts[i],
        '__dir__' : true,
        children : {}
      };
    }
    data = data[parts[i]].children;
  }

  return data; // return the current dir object
}

module.exports = {
  run : run
};