const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell
} = require('electron')
const path = require('path')
const os = require('os')
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const imageminMozjpeg = require('imagemin-mozjpeg')

// Set environment
process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

let mainWindow
let aboutWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 700 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDev) mainWindow.webContents.openDevTools()

  mainWindow.loadURL(`file://${__dirname}/app/index.html`)
}

function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About ImageShrink',
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: 'white'
  })

  aboutWindow.loadURL(`file://${__dirname}/app/about.html`)
}

app.on('ready', () => {
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  mainWindow.on('closed', () => mainWindow = null)
})

const menu = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      {
        label: 'About',
        click: createAboutWindow,
      }
    ]
  }] : []),
  {
    role: 'fileMenu'
  },
  ...(isDev ? [{
    label: 'Developer',
    submenu: [{
        role: 'reload'
      },
      {
        type: 'separator'
      },
      {
        role: 'toggledevtools'
      },

    ]
  }] : [])
]

ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink')

  shrinkImage(options)
})

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100
    
    const files = await imagemin([imgPath], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality]
        })
      ]
    })

    console.log(files)

    shell.openPath(dest)

    mainWindow.webContents.send('image:done')
  } catch (err) {
    console.log(err)
  } 
}


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
