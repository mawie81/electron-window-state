import test from 'ava';
import mockery from 'mockery';
import sinon from 'sinon';

test.before(() => {
  const jsonfileMock = {
    writeFileSync: function () {},
    readFileSync: function () {}
  };
  const electronMock = {
    app: {getPath: function () {return '/temp';}},
    screen: {getDisplayMatching: function () {}}
  };
  mockery.registerAllowables(['./', 'path', 'object-assign', 'deep-equal', 'sinon', './lib/keys.js', './lib/is_arguments.js']);
  mockery.registerMock('electron', electronMock);
  mockery.registerMock('mkdirp', {sync: function () {}});
  mockery.registerMock('jsonfile', jsonfileMock);
  mockery.enable({useCleanCache: true});
});

test('returns defaultWidth and defaultHeight if no state exists', t => {
  const state = require('./')({defaultWidth: 1000, defaultHeight: 2000});

  t.is(state.width, 1000);
  t.is(state.height, 2000);
});

test('tries to read state file from the default location', t => {
  const jsonfile = require('jsonfile');
  sinon.spy(jsonfile, 'readFileSync');

  require('./')({defaultWidth: 1000, defaultHeight: 2000});

  t.true(jsonfile.readFileSync.calledOnce);
  t.true(jsonfile.readFileSync.calledWith('/temp/window-state.json'));
  jsonfile.readFileSync.restore();
});

test('tries to read state file from the configured source', t => {
  const jsonfile = require('jsonfile');
  sinon.spy(jsonfile, 'readFileSync');

  require('./')({defaultWidth: 1000, defaultHeight: 2000, path: '/data', file: 'state.json'});

  t.true(jsonfile.readFileSync.calledOnce);
  t.true(jsonfile.readFileSync.calledWith('/data/state.json'));
  jsonfile.readFileSync.restore();
});

test('considers the state invalid if without bounds', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({
    width: 100
  });

  const state = require('./')({
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

  const state = require('./')({
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

  const state = require('./')({
    defaultWidth: 200
  });

  t.true(state.isFullScreen);
  t.is(state.width, 100);
  jsonfile.readFileSync.restore();
});

test('returns the defaults if the state in the file is invalid', t => {
  const jsonfile = require('jsonfile');
  sinon.stub(jsonfile, 'readFileSync').returns({});

  const state = require('./')({defaultWidth: 1000, defaultHeight: 2000});

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

  const state = require('./')({defaultWidth: 1000, defaultHeight: 2000});
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

  const screen = require('electron').screen;
  sinon.stub(screen, 'getDisplayMatching').returns({bounds: screenBounds});

  const state = require('./')({defaultWidth: 1000, defaultHeight: 2000});
  state.saveState(win);

  t.truthy(mkdirp.sync.calledOnce);
  t.truthy(jsonfile.writeFileSync.calledWith('/temp/window-state.json', {
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
