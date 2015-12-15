'use strict';

var fs       = require('fs');
var path     = require('path');
var basename = path.basename(module.filename);
var ctrls    = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    ctrls[file.slice(0,-3)] = require(path.join(__dirname, file));
  });

module.exports = ctrls;
