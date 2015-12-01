# electron-window-state [![Build Status](https://travis-ci.org/mawie81/electron-window-state.svg)](https://travis-ci.org/mawie81/electron-window-state)

> A library to store and restore window sizes and positions for your [Electron](http://electron.atom.io) app

Supports handling of multiple windows.

*Heavily influenced by the implementation in [electron-boilerplate](https://github.com/szwacz/electron-boilerplate).*

## Install

```
$ npm install --save electron-window-state
```

## Usage

```js
const windowStateKeeper = require('electron-window-state');

app.on('ready', function () {
  let mainWindowState = windowStateKeeper('main', {
    width: 1000,
    height: 800
  });

  const win = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height
  });

  if (mainWindowState.isMaximized) {
    win.maximize();
  }

  win.on('close', (e) => mainWindowState.saveState(win));
});
```

## License

MIT © [Marcel Wiehle](http://marcel.wiehle.me)
