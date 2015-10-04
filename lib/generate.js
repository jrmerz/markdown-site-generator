var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

handlebars.registerHelper('content', function() {
  return new handlebars.SafeString(this.content);
});

function run(root, data, callback) {
  for( var key in data.templates ) {
    data.templates[key] = processImports(data.templates[key], data.templates);
  }
  for( var key in data.templates ) {
    data.templates[key] = handlebars.compile(data.templates[key]);
  }

  createDirectory(root, data.content, data.templates, callback);
}

function createDirectory(root, data, templates, callback) {

  for( var key in data ) {
    var item = data[key];
    if( item.__dir__ ) {
      var dir = path.join(root, item.name);
      fs.mkdirSync(dir);
      createDirectory(dir, item.children, templates);
    } else {
      createFile(root, item, templates);
    }
  }

  if( callback ) callback();
}

function createFile(root, item, templates) {
  if( item.__resource__ ) {
    var newFile = path.join(root, item.name);
    fs.createReadStream(item.path).pipe(fs.createWriteStream(newFile));
    return;
  }

  var file = path.join(root, item.name.replace(/\.md$/i,'.html'));

  var template = templates.default;
  if( item.template && templates[item.template] ) {
    template = templates[item.template];
  }

  if( template ) {
    fs.writeFileSync(file, template(item));
  } else {
    fs.writeFileSync(file, item.content);
  }
}

function processImports(template, templates) {
  var parts = template.split('\n');

  for( var i = 0; i < parts.length; i++ ) {
    var matches = parts[i].match(/\{\{@import\s\w*\}\}/);
    if( !matches ) continue;

    matches.forEach(function(match){
        var name = match.replace(/\{\{@import\s/,'').replace(/\}\}/,'');
        if( templates[name] ) {
          parts[i] = parts[i].replace(match, templates[name]);
        } else {
          console.log('Unable to import template: '+name);
          parts[i] = parts[i].replace(match, '<!-- @import "'+name+'" not found !>');
        }
    });
  }

  return parts.join('\n');
}

module.exports = {
  run : run
};
