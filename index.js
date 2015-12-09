'use strict';

var app = require('app');
var screen = require('screen');
var jsonfile = require('jsonfile');
var path = require('path');
var mkdirp = require('mkdirp');
var objectAssign = require('object-assign');
var deepEqual = require('deep-equal');

module.exports = function (options) {
  var config = objectAssign({}, {
    file: 'window-state.json',
    path: app.getPath('userData')
  }, options);
  var fullStoreFileName = path.join(config.path, config.file);
  var delay = 100; // Number of milliseconds to postpone handling the event
  var state;
  var winRef;

  try {
    state = jsonfile.readFileSync(fullStoreFileName);
  } catch (err) {
    // Don't care
  }

  if (state && state.displayBounds) {
    // If the display where the app window was displayed is no longer available,
    // we should drop the stored state
    var displayBounds = screen.getDisplayMatching(state).bounds;
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

  var isNormal = function (win) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  }

  var saveState = function (win) {
    var winBounds = win.getBounds();
    if (isNormal(win)) {
      state.x = winBounds.x;
      state.y = winBounds.y;
      state.width = winBounds.width;
      state.height = winBounds.height;
    }
    state.isMaximized = win.isMaximized();
    state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
    mkdirp.sync(path.dirname(fullStoreFileName));
    jsonfile.writeFileSync(fullStoreFileName, state);
  };

  var resizeTimer;
  var resizeHandler = function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var winBounds = winRef.getBounds();
      if (isNormal(winRef)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
        state.width = winBounds.width;
        state.height = winBounds.height;
      }
    }, delay);
  }

  var moveTimer;
  var moveHandler = function () {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function () {
      var winBounds = winRef.getBounds();
      if (isNormal(winRef)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
      }
    }, delay);
  }

  var closeHandler = function () {
    // Note: We wrap saveState because the first parameter of the close event is
    // an event object and not the window object like it expects
    saveState(winRef);
  }

  var closedHandler = function () {
    unregister();
  }

  var register = function (win) {
    win.on('resize', resizeHandler);
    win.on('move', moveHandler);
    win.on('close', closeHandler);
    win.on('closed', closedHandler);
    winRef = win;
  }

  var unregister = function () {
    if (winRef) {
      winRef.removeListener('resize', resizeHandler);
      clearTimeout(resizeTimer);
      winRef.removeListener('move', moveHandler);
      clearTimeout(moveTimer);
      winRef.removeListener('close', closeHandler);
      winRef.removeListener('closed', closedHandler);
      winRef = null;
    }
  }

  return {
    get x() { return state.x; },
    get y() { return state.y; },
    get width() { return state.width; },
    get height() { return state.height; },
    get isMaximized() { return state.isMaximized; },
    saveState: saveState,
    register: register,
    unregister: unregister
  };
};
