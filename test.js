import test from 'ava';
import mockery from 'mockery';
import sinon from 'sinon';

const isWin = require('process').platform === 'win32';

test.before(() => {
  const jsonfileMock = {
    writeFileSync() {},
    readFileSync() {}
  };
  const electronMock = {
    app: {getPath() {return '/temp';}},
    screen: {
      getDisplayMatching() {},
      getPrimaryDisplay() {},
      getAllDisplays() {}
    }
  };
  mockery.registerAllowables(['./', 'path', 'object-assign', 'deep-equal', 'sinon', './lib/keys.js', './lib/is_arguments.js']);
  mockery.registerMock('electron', electronMock);
  mockery.registerMock('mkdirp', {sync() {}});
  mockery.registerMock('jsonfile', jsonfileMock);
  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false});
});

test('returns defaultWidth and defaultHeight if no state exists', t => {
  const state = require('.')({defaultWidth: 1000, defaultHeight: 2000});

  t.is(state.width, 1000);
  t.is(state.height, 2000);
});

test('tries to read state file from the default location', t => {
  const jsonfile = require('jsonfile');
  sinon.spy(jsonfile, 'readFileSync');

  require('.')({defaultWidth: 1000, defaultHeight: 2000});

  t.true(jsonfile.readFileSync.calledOnce);
  t.true(jsonfile.readFileSync.calledWith(isWin ? '\\temp\\window-state.json' : '/temp/window-state.json'));
  jsonfile.readFileSync.restore();
});

test('tries to read state file from the configured source', t => {
  const jsonfile = require('jsonfile');
  sinon.spy(jsonfile, 'readFileSync');

  require('.')({defaultWidth: 1000, defaultHeight: 2000, path: '/data', file: 'state.json'});

  t.true(jsonfile.readFileSync.calledOnce);
  t.true(jsonfile.readFileSync.calledWith(isWin ? '\\data\\state.json' : '/data/state.json'));
  jsonfile.readFileSync.restore();
});

test('considers the state invalid if without bounds', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    width: 100
  });

  const state = require('.')({
    defaultWidth: 200
  });

  t.not(state.width, 100);
  jsonfile.readFileSync.restore();
});

test('considers the state valid if without bounds but isMaximized is true', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    isMaximized: true,
    width: 100
  });

  const state = require('.')({
    defaultWidth: 200
  });

  t.true(state.isMaximized);
  t.is(state.width, 100);
  jsonfile.readFileSync.restore();
});

test('considers the state valid if without bounds but isFullScreen is true', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    isFullScreen: true,
    width: 100
  });

  const state = require('.')({
    defaultWidth: 200
  });

  t.true(state.isFullScreen);
  t.is(state.width, 100);
  jsonfile.readFileSync.restore();
});

test('returns the defaults if the state in the file is invalid', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({});

  const state = require('.')({defaultWidth: 1000, defaultHeight: 2000});

  t.is(state.width, 1000);
  t.is(state.height, 2000);
  jsonfile.readFileSync.restore();
});

test('maximize and set the window fullscreen if enabled', t => {
  const savedState = {
    isMaximized: true,
    isFullScreen: true,
    x: 0,
    y: 0,
    width: 100,
    height: 100
  };

  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns(savedState);

  const win = {
    maximize: sinon.spy(),
    setFullScreen: sinon.spy(),
    on: sinon.spy()
  };

  const state = require('.')({defaultWidth: 1000, defaultHeight: 2000});
  state.manage(win);

  t.truthy(win.maximize.calledOnce);
  t.truthy(win.setFullScreen.calledOnce);
  jsonfile.readFileSync.restore();
});

test('saves the state to the file system', t => {
  const win = {
    getBounds: sinon.stub().returns({
      x: 100,
      y: 100,
      width: 500,
      height: 500
    }),
    isMaximized: sinon.stub().returns(false),
    isMinimized: sinon.stub().returns(false),
    isFullScreen: sinon.stub().returns(false)
  };

  const screenBounds = {x: 0, y: 0, width: 100, height: 100};

  const mkdirp = require('mkdirp');
  sinon.spy(mkdirp, 'sync');

  const jsonfile = require('jsonfile');
  sinon.spy(jsonfile, 'writeFileSync');

  const {screen} = require('electron');
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: screenBounds});

  const state = require('.')({defaultWidth: 1000, defaultHeight: 2000});
  state.saveState(win);

  t.truthy(mkdirp.sync.calledOnce);
  t.truthy(jsonfile.writeFileSync.calledWith(isWin ? '\\temp\\window-state.json' : '/temp/window-state.json', {
    x: 100,
    y: 100,
    width: 500,
    height: 500,
    isMaximized: false,
    isFullScreen: false,
    displayBounds: screenBounds
  }));

  jsonfile.writeFileSync.restore();
  screen.getDisplayMatching.restore();
  mkdirp.sync.restore();
});

test('Validate state if saved display is available and primary', t => {
  const displayBounds = {x: 0, y: 0, width: 1920, height: 1080};

  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    x: 10,
    y: 20,
    width: 800,
    height: 600,
    displayBounds
  });

  const {screen} = require('electron');
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: displayBounds});
  sinon.stub(screen, 'getPrimaryDisplay').returns({bounds: displayBounds});
  sinon.stub(screen, 'getAllDisplays').returns([{bounds: displayBounds}]);

  const state = require('.')({
    defaultWidth: 500,
    defaultHeight: 300
  });

  t.is(state.x, 10);
  t.is(state.y, 20);
  t.is(state.width, 800);
  t.is(state.height, 600);
  t.is(state.displayBounds, displayBounds);

  jsonfile.readFileSync.restore();
  screen.getDisplayMatching.restore();
  screen.getPrimaryDisplay.restore();
  screen.getAllDisplays.restore();
});

test('Validate state if saved display is available and secondary on right', t => {
  const primaryDisplayBounds = {x: 0, y: 0, width: 1920, height: 1080};
  const secondaryDisplayBounds = {x: 1920, y: 0, width: 2560, height: 1440};

  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    x: 2000,
    y: 1100,
    width: 800,
    height: 300,
    displayBounds: secondaryDisplayBounds
  });

  const {screen} = require('electron');
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: secondaryDisplayBounds});
  sinon.stub(screen, 'getPrimaryDisplay').returns({bounds: primaryDisplayBounds});
  sinon.stub(screen, 'getAllDisplays').returns([
    {bounds: primaryDisplayBounds},
    {bounds: secondaryDisplayBounds}
  ]);

  const state = require('.')({
    defaultWidth: 500,
    defaultHeight: 300
  });

  t.is(state.x, 2000);
  t.is(state.y, 1100);
  t.is(state.width, 800);
  t.is(state.height, 300);
  t.is(state.displayBounds, secondaryDisplayBounds);

  jsonfile.readFileSync.restore();
  screen.getDisplayMatching.restore();
  screen.getPrimaryDisplay.restore();
  screen.getAllDisplays.restore();
});

test('Validate state if saved display is available but window outside display bounds', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    width: 1000,
    height: 326,
    x: 2577,
    y: 673,
    isMaximized: false,
    isFullScreen: false,
    displayBounds: {x: 0, y: 0, width: 1680, height: 1050}
  });

  const {screen} = require('electron');
  const screenBounds = {x: 0, y: 0, width: 1680, height: 1050};
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: screenBounds});
  sinon.stub(screen, 'getPrimaryDisplay').returns({bounds: screenBounds});
  sinon.stub(screen, 'getAllDisplays').returns([{bounds: screenBounds}]);

  const state = require('.')({
    defaultWidth: 500,
    defaultHeight: 300
  });

  t.is(state.x, 0);
  t.is(state.y, 0);
  t.is(state.width, 500);
  t.is(state.height, 300);
  t.is(state.displayBounds, screenBounds);

  jsonfile.readFileSync.restore();
  screen.getDisplayMatching.restore();
  screen.getPrimaryDisplay.restore();
  screen.getAllDisplays.restore();
});

test('Ensure window is visible at startup if saved display is unavailable and was on the right', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    x: 2000,
    y: 0,
    width: 2550,
    height: 1430,
    displayBounds: {x: 1920, y: 0, width: 2560, height: 1440}
  });

  const {screen} = require('electron');
  const screenBounds = {x: 0, y: 0, width: 1920, height: 1080};
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: screenBounds});
  sinon.stub(screen, 'getPrimaryDisplay').returns({bounds: screenBounds});
  sinon.stub(screen, 'getAllDisplays').returns([{bounds: screenBounds}]);

  const state = require('.')({
    defaultWidth: 500,
    defaultHeight: 300
  });

  t.is(state.x, 0);
  t.is(state.y, 0);
  t.is(state.width, 500);
  t.is(state.height, 300);

  jsonfile.readFileSync.restore();
  screen.getDisplayMatching.restore();
  screen.getPrimaryDisplay.restore();
  screen.getAllDisplays.restore();
});

test('Ensure window is visible at startup if saved display is unavailable and was on the left', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    x: -2000,
    y: 0,
    width: 2550,
    height: 1430,
    displayBounds: {x: -2560, y: 0, width: 2560, height: 1440}
  });

  const {screen} = require('electron');
  const screenBounds = {x: 0, y: 0, width: 1920, height: 1080};
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: screenBounds});
  sinon.stub(screen, 'getPrimaryDisplay').returns({bounds: screenBounds});
  sinon.stub(screen, 'getAllDisplays').returns([{bounds: screenBounds}]);

  const state = require('.')({
    defaultWidth: 500,
    defaultHeight: 300
  });

  t.is(state.x, 0);
  t.is(state.y, 0);
  t.is(state.width, 500);
  t.is(state.height, 300);

  jsonfile.readFileSync.restore();
  screen.getDisplayMatching.restore();
  screen.getPrimaryDisplay.restore();
  screen.getAllDisplays.restore();
});

test('Reset state to default values if saved display is unavailable', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    x: -2000,
    y: -1000,
    width: 800,
    height: 600,
    displayBounds: {x: -2560, y: -480, width: 2560, height: 1440}
  });

  const {screen} = require('electron');
  const screenBounds = {x: 0, y: 0, width: 1920, height: 1080};
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: screenBounds});
  sinon.stub(screen, 'getPrimaryDisplay').returns({bounds: screenBounds});
  sinon.stub(screen, 'getAllDisplays').returns([{bounds: screenBounds}]);

  const state = require('.')({
    defaultWidth: 500,
    defaultHeight: 300
  });

  t.is(state.x, 0);
  t.is(state.y, 0);
  t.is(state.width, 500);
  t.is(state.height, 300);
  t.is(state.displayBounds, screenBounds);

  jsonfile.readFileSync.restore();
  screen.getDisplayMatching.restore();
  screen.getPrimaryDisplay.restore();
  screen.getAllDisplays.restore();
});
