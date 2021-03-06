# markdown-site-generator
Generate static website from markdown via handlebars, JSON config files.  Includes bower support.
[Sample](https://github.com/jrmerz/website)

## Directory Structure

The directory contain to markdown you wish to generate should have the following structure.

```
  - .config      # config file
  - bower.json   # bower resources
  - templates    # handlebar templates
    - default.handlebars
```

## Process

All files and directories will be parsed other than those described above and anything
listed in config.ignore.  By default and markdown (.md) file generate a .html
file using default.handlebars placing the converted markdown html in the {{content}}
attribute.  You can provide other attributes or select different template by
providing a .json or .js file.  The .json or .js file needs to have the same
name as the .md file.  So to configure index.md, you create a index.json in the
same directory.

## Command Line Args

- -w or --watch
  - setup a watch task so for auto rebuilds
- --seo=[siteurl]
  - generate a sitemap.xml file containing all pages. 

#### [filename].js or [filename].json

You can provide attributes to render in the handlebars template.  These attributes
will be directly passed to the handlebars compile step.  If a 'template' attribute is
provided, it will be used to select a template by name, instead of using default.

Note.  To select the about.handlebars template file you would just select 'about'.
ex:

```
{
  "template" : "about"
}
```

## .config

Basic structure

```
{
  // map bower resources
  bower : {
    // will copy ./bower_components/jquery/dist/jquery.js to ./build/bower/jquery.js
    'jquery.js' : 'jquery/dist/jquery.js'
  },

  // copy, don't process
  ignore : ['resources']
}
```

#### bower

You can map bower resources using config.bower.  The key will install the bower
resource to bower/[key].  Example. You run 'bower install --save jquery'.
This will install the jquery.js file to bower_components/jquery/dist/jquery.js.
The config above will then copy this jquery.js file to build/bower/jquery.js.
So if you are serving /build via your web server, you can use /bower/jquery to
access the file in your .handlebars files.

'bower install' will be run every time you generate the site if you provide a
bower.json file.

#### ignore

You can provide an array of directory names to config.ignore.  These directories
will be copied to /build and will not be processed.  That means that all .md, .js
and .json files will be ignored.

So if you have some resources your website uses, place them all in a single directory
and point your .handlebars files at them.  Then add the directory to the .ignore folder.

## Handlebars

You can find complete handlebar documentation [here](http://handlebarsjs.com/)

#### {{@import template}}

The generator adds the ability to reference other templates via {{@import template}}.
Let's say you have 'header.handlebars' that you want to use in 'default.handlebars'.
You would simply add {{@import header}} in your default.handlerbars file.
