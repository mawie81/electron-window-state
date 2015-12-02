# electron-window-state [![Build Status](https://travis-ci.org/mawie81/electron-window-state.svg)](https://travis-ci.org/mawie81/electron-window-state)

> A library to store and restore window sizes and positions for your [Electron](http://electron.atom.io) app

*Heavily influenced by the implementation in [electron-boilerplate](https://github.com/szwacz/electron-boilerplate).*

## Install

```
$ npm install --save electron-window-state
```

## Usage

```js
const windowStateKeeper = require('electron-window-state');

app.on('ready', function () {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800
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

## API

#### windowStateKeeper(opts)

##### opts

`defaultWidth` - *Number*

  The width that should be returned if no file exists yet. Defaults to 800.

`defaultHeight` - *Number*

  The height that should be returned if no file exists yet. Defaults to 600.

`path` - *String*

  The path where the state file should be written to. Defaults to ```app.getPath('userData')```

`file` - *String*

  The name of file. Defaults to ```window-state.json```


## License

MIT © [Marcel Wiehle](http://marcel.wiehle.me)
