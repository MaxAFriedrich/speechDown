// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let savePath = "";

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    // Add each spelling suggestion
    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => mainWindow.webContents.replaceMisspelling(suggestion)
      }));
    }

    // Allow users to add the misspelled word to the dictionary
    if (params.misspelledWord) {
      menu.append(
        new MenuItem({
          label: 'Add to dictionary',
          click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      );
    }

    menu.popup();
  });

  ipcMain.on('save-file', (event, arg) => {
    if (savePath == "") {
      let loc = dialog.showSaveDialogSync(null, {
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      if (loc != undefined) {
        savePath = loc;
      } else {
        return;
      }
    }
    fs.writeFileSync(savePath, arg);

  });

  ipcMain.on('open-file', (event, arg) => {
    // console.log(arg)
    let loc = dialog.showOpenDialogSync(null, {
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (loc != undefined) {
      savePath = loc[0];
      mainWindow.webContents.send("new-file", fs.readFileSync(savePath, "utf-8"));
    }
  });
  ipcMain.on("create-file", (event, arg)=>{
    savePath="";
  })

  // and load the index.html of the app.
  mainWindow.loadFile('render/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});


const menu = new Menu();
// menu.append(new MenuItem({
//   label: 'File',
//   submenu: [{
//     role: 'Save',
//     label: "Save",
//     accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
//     click: () => { console.log('Save');}
//   },
//   {
//     role: 'Open',
//     label: "Open",
//     accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
//     click: () => { console.log('Open'); }
//   }]
// }));
// menu.append(new MenuItem({
//   label: 'Voice',
//   submenu: [{
//     role: 'Dictate',
//     label: "Dictate",
//     accelerator: process.platform === 'darwin' ? 'Cmd+D' : 'Ctrl+D',
//     click: () => { console.log('Dictate'); }
//   },
//   {
//     role: 'Scan Image',
//     label: "Scan Image",
//     accelerator: process.platform === 'darwin' ? 'Cmd+I' : 'Ctrl+I',
//     click: () => { console.log('Scan Image'); }
//   },
//   {
//     role: 'Read',
//     label: "Read",
//     accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
//     click: () => { console.log('Read'); }
//   }]
// }));

Menu.setApplicationMenu(menu);;

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// const StT = require("./stt")

// StT.startMic()
// StT.stopMic()