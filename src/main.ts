const { app, BrowserWindow } = require("electron");
const windowStateKeeper = require("electron-window-state");
const Store = require("electron-store");
const isDev = require("electron-is-dev");
let win;
const store = new Store();
const path = require("path");
const fs = require("fs");

function createWindow() {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 800,
  });

  // Create the window using the state information
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 16, y: 24 },
    webPreferences: {
      nodeIntegrationInSubFrames: true,
      affinity: "main-window",
      nodeIntegration: false,
      contextIsolation: false,
      enableRemoteModule: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
      javascript: true,
    },
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win);

  win.loadURL("https://music.youtube.com");

  win.webContents.on("did-finish-load", () => {
    // The path to your CSS file
    const cssPath = path.join(__dirname, "/style/mocha.css");

    // Inject the CSS file into the WebContents instance
    win.webContents.insertCSS(fs.readFileSync(cssPath, "utf8"));
    win.webContents.insertCSS(`
    
    .center-content.ytmusic-nav-bar{
      -webkit-user-select: none;
      -webkit-app-region: drag;
      margin-top: 10px;
    }
    .tp-yt-paper-icon-button, ytmusic-search-box.ytmusic-nav-bar, .left-content.ytmusic-nav-bar, .right-content.ytmusic-nav-bar, .ytmusic-pivot-bar-renderer{
      -webkit-app-region: no-drag;

    }
  `);
  });

  if (isDev) {
    win.webContents.openDevTools();
  }
  /*win.webContents.on("did-finish-load", () => {
    const loginForm = win.webContents.findForm({
      username: 'input[name="username"]',
      password: 'input[name="password"]',
    });
    if (loginForm) {
      const { username, password } = store.get("credentials") || {};
      loginForm.submit(username, password);
      loginForm.once("submit-success", () => {
        const credentials = { username, password };
        store.set("credentials", credentials);
      });
    }
  });*/
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function() {
  if (process.platform !== "darwin") app.quit();
});
