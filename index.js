'use strict';

var app = require('app');
var jsonfile = require('jsonfile');
var path = require('path');
var mkdirp = require('mkdirp');
var objectAssign = require('object-assign');
var deepEqual = require('deep-equal');

module.exports = function (options) {
  var screen = require('screen');
  var state;
  var winRef;
  var resizeTimer;
  var moveTimer;
  var eventHandlingDelay = 100;
  var config = objectAssign({}, {
    file: 'window-state.json',
    path: app.getPath('userData')
  }, options);
  var fullStoreFileName = path.join(config.path, config.file);

  function isNormal(win) {
    return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
  }

  function saveState(win) {
    if (win) {
      // Update state
      var winBounds = win.getBounds();
      if (isNormal(win)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
        state.width = winBounds.width;
        state.height = winBounds.height;
      }
      state.isMaximized = win.isMaximized();
      state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
    }

    // Save state
    try {
      mkdirp.sync(path.dirname(fullStoreFileName));
      jsonfile.writeFileSync(fullStoreFileName, state);
    } catch (e) {
      // Don't care
    }
  }

  function resizeHandler() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var winBounds = winRef.getBounds();
      if (isNormal(winRef)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
        state.width = winBounds.width;
        state.height = winBounds.height;
      }
    }, eventHandlingDelay);
  }

  function moveHandler() {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function () {
      var winBounds = winRef.getBounds();
      if (isNormal(winRef)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
      }
    }, eventHandlingDelay);
  }

  function closeHandler() {
    // Note: We wrap saveState because the first parameter of the close event is
    // an event object and not the window object like it expects
    saveState(winRef);
  }

  function closedHandler() {
    // Unregister listeners and save state
    unregister();
    saveState();
  }

  function register(win) {
    win.on('resize', resizeHandler);
    win.on('move', moveHandler);
    win.on('close', closeHandler);
    win.on('closed', closedHandler);
    winRef = win;
  }

  function unregister() {
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

  // Load previous state
  try {
    state = jsonfile.readFileSync(fullStoreFileName);
  } catch (err) {
    // Don't care
  }

  // If the display where the app window was displayed is no longer available,
  // we should drop the stored state
  if (state && state.displayBounds) {
    var displayBounds = screen.getDisplayMatching(state).bounds;
    if (!deepEqual(state.displayBounds, displayBounds, {strict: true})) {
      state = null;
    }
  }

  // Set state defaults if needed
  if (!state) {
    state = {
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600
    };
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
