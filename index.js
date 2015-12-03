'use strict';

var app = require('app');
var jsonfile = require('jsonfile');
var path = require('path');
var mkdirp = require('mkdirp');
var objectAssign = require('object-assign');

module.exports = function (options) {
  var config = objectAssign({}, {file: 'window-state.json', path: app.getPath('userData')}, options);
  var fullStoreFileName = path.join(config.path, config.file);

  var state;

  try {
    state = jsonfile.readFileSync(fullStoreFileName);
  } catch (err) {
    state = {
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600
    };
  }

  var saveState = function (win) {
    if (!win.isMaximized() && !win.isMinimized()) {
      var position = win.getPosition();
      var size = win.getSize();
      state.x = position[0];
      state.y = position[1];
      state.width = size[0];
      state.height = size[1];
    }
    state.isMaximized = win.isMaximized();
    mkdirp.sync(path.dirname(fullStoreFileName));
    jsonfile.writeFileSync(fullStoreFileName, state);
  };

  return {
    get x() { return state.x; },
    get y() { return state.y; },
    get width() { return state.width; },
    get height() { return state.height; },
    get isMaximized() { return state.isMaximized; },
    saveState: saveState
  };
};
