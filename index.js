'use strict';

var app = require('app');
var jsonfile = require('jsonfile');
var path = require('path');

module.exports = function (name, defaults) {
  
  var userDataDir = app.getPath('userData');
  var stateStoreFile = 'window-state-' + name +'.json';
  var fullStoreFileName = path.join(userDataDir, stateStoreFile);

  var state;

  try {
    state = jsonfile.readFileSync(fullStoreFileName);
  } catch(err) {
    state = {
      width: defaults.width,
      height: defaults.height
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
