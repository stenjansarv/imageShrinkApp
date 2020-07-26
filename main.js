const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut
} = require('electron')

// Set environment
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
  })

  mainWindow.loadURL(`file://${__dirname}/app/index.html`)
}

app.on('ready', () => {
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  globalShortcut.register('Cmd+R', () => mainWindow.reload())
  globalShortcut.register('Cmd+Option+I', () => mainWindow.toggleDevTools())

  mainWindow.on('closed', () => mainWindow = null)
})

const menu = [
  ...(isMac ? [{
    role: 'appMenu'
  }] : []),
  {
    label: 'File',
    submenu: [{
      label: 'Quit',
      accelerator: 'Command+W',
      click: () => app.quit()
    }]
  }
]




// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (!isMac) app.quit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})
