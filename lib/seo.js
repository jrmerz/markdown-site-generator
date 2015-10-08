var path = require('path');
var fs = require('fs');
var xml =
  '<?xml version=\'1.0\' encoding=\'UTF-8\'?>'+
  '<urlset xmlns=\'http://www.sitemaps.org/schemas/sitemap/0.9\'>'+
    '<url>'+
        '<loc>{{host}}</loc>'+
        '<changefreq>weekly</changefreq>'+
        '<priority>1</priority>'+
    '</url>';

var page =
  '<url>'+
      '<loc>{{page}}</loc>'+
      '<changefreq>weekly</changefreq>'+
      '<priority>.5</priority>'+
  '</url>';

var xmlEnd = '</urlset>';

module.exports.build = function(url, buildPath, data) {
  var xmlStr = [xml.replace('{{host}}', url)];

  if( !url.match(/\/$/) ) url = url + '/';

  createDirectory('', data.content, url, xmlStr);

  fs.writeFileSync(path.join(buildPath, 'sitemap.xml'), xmlStr.join('\n')+xmlEnd);
};

function createDirectory(root, data, url, xml) {
  for( var key in data ) {
    var item = data[key];
    if( item.__dir__ ) {
      var dir = path.join(root, item.name);
      createDirectory(dir, item.children, url, xml);
    } else {
      createFile(root, item, url, xml);
    }
  }
}

function createFile(root, item, url, xml) {
  if( item.__resource__ ) return;

  var file = path.join(root, item.name.replace(/\.md$/i,'.html'));

  xml.push(page.replace('{{page}}', url+file));
}
