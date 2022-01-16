// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const vosk = require('vosk');
const mic = require("mic");
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();


let savePath = "";
let model;
let rec;

function _arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

  ipcMain.on('start-speak', async (event, arg) => {
    // The text to synthesize
    // const text = 'hello, world!';

    // Construct the request
    const request = {
      input: { text: arg },
      // Select the language and SSML voice gender (optional)
      voice: { languageCode: 'en-GB', ssmlGender: 'MALE', name: "en-GB-Wavenet-B" },
      // select the type of audio encoding
      audioConfig: { audioEncoding: 'MP3', speakingRate: "0.7" },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    const out = "data:audio/mpeg;base64," + _arrayBufferToBase64(response.audioContent);
    mainWindow.webContents.send("audio-speak", out);
  });

  ipcMain.on("create-file", (event, arg) => {
    savePath = "";
  });
  let dictationStatus = false;
  ipcMain.on("toggle-dictate", (event, arg) => {
    if (dictationStatus) {
      stopMic();
    } else {
      startMic();
    }
    dictationStatus = !dictationStatus;
  });




  const menu = new Menu();
  Menu.setApplicationMenu(menu);;


  MODEL_PATH = "model";
  SAMPLE_RATE = 16000;

  if (!fs.existsSync(MODEL_PATH)) {
    console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.");
    process.exit();
  }

  vosk.setLogLevel(0);
  model = new vosk.Model(MODEL_PATH);
  rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });

  var micInstance = mic({
    rate: String(SAMPLE_RATE),
    channels: '1',
    debug: false,
  });

  var micInputStream = micInstance.getAudioStream();

  micInstance.start();

  micInputStream.on('data', data => {
    if (rec.acceptWaveform(data))
      // if (rec.result().text != "" || rec.result().text != "the")
      // console.log(rec.result().text);
      mainWindow.webContents.send("text-dictate", rec.result());

    // else
    //   console.log(rec.partialResult());
  });
  micInstance.pause();

  function startMic() {
    micInstance.resume();
  }

  function stopMic() {
    micInstance.pause();
  }




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
    rec.free();
    model.free();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

process.on('SIGINT', function () {
  // console.log(rec.finalResult());
  // console.log("\nDone");
  rec.free();
  model.free();
});
