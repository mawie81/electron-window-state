'use strict';

const electron = require('electron');
const app = electron.app;
const screen = electron.screen;
const jsonfile = require('jsonfile');
const path = require('path');
const mkdirp = require('mkdirp');
const objectAssign = require('object-assign');
const deepEqual = require('deep-equal');

module.exports = function (options) {
  const config = objectAssign({}, {file: 'window-state.json', path: app.getPath('userData')}, options);
  const fullStoreFileName = path.join(config.path, config.file);

  let state;

  try {
    state = jsonfile.readFileSync(fullStoreFileName);
  } catch (err) {
    // Don't care
  }

  if (state && state.displayBounds) {
    // If the display where the app window was displayed is no longer available,
    // we should drop the stored state
    const displayBounds = screen.getDisplayMatching(state).bounds;
    if (!deepEqual(state.displayBounds, displayBounds, {strict: true})) {
      state = null;
    }
  }

  if (!state) {
    state = {
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600
    };
  }

  var saveState = function (win) {
    const winBounds = win.getBounds();
    const isMaximized = win.isMaximized();
    if (!isMaximized && !win.isMinimized()) {
      state.x = winBounds.x;
      state.y = winBounds.y;
      state.width = winBounds.width;
      state.height = winBounds.height;
    }
    state.isMaximized = isMaximized;
    state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
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
