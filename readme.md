# electron-window-state [![Build Status](https://travis-ci.org/mawie81/electron-window-state.svg)](https://travis-ci.org/mawie81/electron-window-state)

> A library to store and restore window sizes and positions for your
> [Electron](http://electron.atom.io) app

_Heavily influenced by the implementation in [electron-boilerplate](https://github.com/szwacz/electron-boilerplate)._

## Fork

This is a for of [electron-window-state](https://github.com/mawie81/electron-window-state) which adds the following:

- manage custom window properties with the `custom` property

## Install

```
$ npm install --save electron-window-state
```

## Usage

```js
const windowStateKeeper = require("electron-window-state");
let win;

app.on("ready", function() {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
  });

  // Create the window using the state information
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win);
});
```

Please do not set `useContentSize` to `true` at creating `BrowserWindow` instance
because it changes how to calculate window size.

## API

#### windowStateKeeper(opts)

Note: Don't call this function before the `ready` event is fired.

##### opts

`defaultWidth` - _Number_

The width that should be returned if no file exists yet. Defaults to `800`.

`defaultHeight` - _Number_

The height that should be returned if no file exists yet. Defaults to `600`.

`path` - _String_

The path where the state file should be written to. Defaults to
`app.getPath('userData')`

`file` - _String_

The name of file. Defaults to `window-state.json`. This is usefull if you want to support multiple windows. Simply create multiple `windowStateKeeper` instances with different filenames.

`maximize` - _Boolean_

Should we automatically maximize the window, if it was last closed
maximized. Defaults to `true`

`fullScreen` - _Boolean_

Should we automatically restore the window to full screen, if it was last
closed full screen. Defaults to `true`

### state object

```js
const windowState = windowStateKeeper({
  defaultWidth: 1000,
  defaultHeight: 800
});
```

`x` - _Number_

The saved `x` coordinate of the loaded state. `undefined` if the state has not
been saved yet.

`y` - _Number_

The saved `y` coordinate of the loaded state. `undefined` if the state has not
been saved yet.

`width` - _Number_

The saved `width` of loaded state. `defaultWidth` if the state has not been
saved yet.

`height` - _Number_

The saved `heigth` of loaded state. `defaultHeight` if the state has not been
saved yet.

`isMaximized` - _Boolean_

`true` if the window state was saved while the window was maximized.
`undefined` if the state has not been saved yet.

`isFullScreen` - _Boolean_

`true` if the window state was saved while the window was in full screen
mode. `undefined` if the state has not been saved yet.

`manage(window)` - _Function_

Register listeners on the given `BrowserWindow` for events that are
related to size or position changes (`resize`, `move`). It will also restore
the window's maximized or full screen state.
When the window is closed we automatically remove the listeners and save the
state.

`unmanage` - _Function_

Removes all listeners of the managed `BrowserWindow` in case it does not
need to be managed anymore.

`saveState(window)` - _Function_

Saves the current state of the given `BrowserWindow`. This exists mostly for
legacy purposes, and in most cases it's better to just use `manage`.

## License

MIT © [Marcel Wiehle](http://marcel.wiehle.me)
