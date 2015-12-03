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

### state object

```js
const windowState = windowStateKeeper({
  defaultWidth: 1000,
  defaultHeight: 800
});
```

`x` - *Number*

  The saved ```x``` coordinate of the loaded state. ```undefined``` if the state has not been saved yet. 

`y` - *Number*

  The saved ```y``` coordinate of the loaded state. ```undefined``` if the state has not been saved yet.
  
`width` - *Number*

  The saved ```width``` of loaded state. ```defaultWidth``` if the state has not been saved yet.
  
`height` - *Number*

  The saved ```heigth``` of loaded state. ```defaultHeight``` if the state has not been saved yet.
  
`isMaximized` - *Boolean*

  ```true``` if the window state was saved while the the window was maximized. ```undefined``` if the state has not been saved yet.
  
`saveState(window)` - *Function*

  Saves the current state of the given ```BrowserWindow```.


## License

MIT © [Marcel Wiehle](http://marcel.wiehle.me)
