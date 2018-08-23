import Electron from 'electron'

export type Options = Partial<{
    defaultWidth: number

    // The width that should be returned if no file exists yet. Defaults to 800.

    defaultHeight: number

    // The height that should be returned if no file exists yet. Defaults to 600.

    path: string

    // The path where the state file should be written to. Defaults to app.getPath('userData')

    file: string

    // The name of file. Defaults to window-state.json

    maximize: boolean

    // Should we automatically maximize the window, if it was last closed maximized. Defaults to true

    fullScreen: boolean
}>

export type State = {
    x: number

    // The saved x coordinate of the loaded state. undefined if the state has not been saved yet.

    y: number

    // The saved y coordinate of the loaded state. undefined if the state has not been saved yet.

    width: number

    // The saved width of loaded state. defaultWidth if the state has not been saved yet.

    height: number

    // The saved heigth of loaded state. defaultHeight if the state has not been saved yet.

    isMaximized: boolean

    // true if the window state was saved while the window was maximized. undefined if the state has not been saved yet.

    isFullScreen: boolean

    // true if the window state was saved while the window was in full screen mode. undefined if the state has not been saved yet.

    manage: (window: Electron.BrowserWindow) => void

    // Register listeners on the given BrowserWindow for events that are related to size or position changes (resize, move). It will also restore the window's maximized or full screen state. When the window is closed we automatically remove the listeners and save the state.

    unmanage: () => void

    // Removes all listeners of the managed BrowserWindow in case it does not need to be managed anymore.

    saveState: (window: Electron.BrowserWindow) => void

    // Saves the current state of the given BrowserWindow. This exists mostly for legacy purposes, and in most cases it's better to just use manage.
}

declare function module(opts: Options): State

export default module
