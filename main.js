// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const Store = require('electron-store');
const openExternal = require('open-external');
const Tesseract = require('tesseract.js');
const { Writable } = require('stream');
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech').v1p1beta1;


const schema = {
  theme: {
    type: 'string',
    default: "dark"
  },
  speechSpeed: {
    type: 'number',
    maximum: 4,
    minimum: 0.25,
    default: 1
  },
  googleAuthLocation: {
    type: 'string'
  }
};

const store = new Store({ schema });


let savePath = "";
let dictationStatus = false;

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
  ipcMain.on('auto-save', (event, arg) => {
    if (savePath != "")
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
  ipcMain.on('auth-location', (event, arg) => {
    // console.log(arg)
    let loc = dialog.showOpenDialogSync(null, {
      filters: [
        { name: 'JSON', extensions: ['json'] }]
    });
    if (loc != undefined) {
      store.set("googleAuthLocation", loc[0]);
    }
    // console.log(store.get("googleAuthLocation"));
  });


  ipcMain.on('set-theme', (event, arg) => {
    store.set("theme", arg);
  });
  ipcMain.on('get-theme', (event, arg) => {
    mainWindow.webContents.send("current-theme", store.get("theme", "dark"));
  });
  ipcMain.on('set-speechSpeed', (event, arg) => {
    store.set("speechSpeed", arg);
  });
  ipcMain.on('get-speechSpeed', (event, arg) => {
    mainWindow.webContents.send("current-speechSpeed", store.get("speechSpeed", 1));
  });

  ipcMain.on('open-link', (event, arg) => {
    openExternal(arg);
  });

  ipcMain.on('start-speak', async (event, arg) => {
    try {
      // let projectId = JSON.parse(fs.readFileSync(authFile)).project_id;
      let client = new textToSpeech.TextToSpeechClient();
      // console.log(store.get("googleAuthLocation"), authFile, projID);

      // The text to synthesize
      // const text = 'hello, world!';

      // Construct the request
      const request = {
        input: { text: arg },
        // Select the language and SSML voice gender (optional)
        voice: { languageCode: 'en-GB', ssmlGender: 'MALE', name: "en-GB-Wavenet-B" },
        // select the type of audio encoding
        audioConfig: { audioEncoding: 'MP3', speakingRate: store.get("speechSpeed") },
      };

      // Performs the text-to-speech request
      const [response] = await client.synthesizeSpeech(request).catch((error) => {
        dialog.showErrorBox("Google Speech Error", error);

      });
      const out = "data:audio/mpeg;base64," + _arrayBufferToBase64(response.audioContent);
      mainWindow.webContents.send("audio-speak", out);
    } catch (error) {
      dialog.showErrorBox("Google Speech Error", error);
    }

  });

  ipcMain.on("create-file", (event, arg) => {
    savePath = "";
  });



  ipcMain.on("toggle-dictate", (event, arg) => {
    if (dictationStatus) {
      // stopMic();
      //todo add google func
      dictationStatus = !dictationStatus;

      stopStream();
    } else {
      //todo add google func
      dictationStatus = !dictationStatus;

      startStream();
    }
  });


  ipcMain.on("start-ocr", (event, arg) => {
    let loc = dialog.showOpenDialogSync(null, {
      filters: [
        { name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'bpm', 'pbm'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ["multiSelections"]
    });
    if (loc != undefined) {
      let i = 0;
      let output = "";
      function OCR() {
        Tesseract.recognize(
          loc[i],
          'eng',
          { logger: m => { } }
        ).then(({ data: { text } }) => {
          output += "\n" + text;
          // console.log(output)
          i++;
          if (i < loc.length) {
            OCR();
          } else {
            mainWindow.webContents.send("result-ocr", output);
          }
        });
      }
      OCR();
    } else {
      mainWindow.webContents.send("fail-ocr", "");
    }
  });




  const menu = new Menu();
  Menu.setApplicationMenu(menu);;

  if (store.get("googleAuthLocation") == undefined)
    dialog.showErrorBox("Google API Error", "Make sure that you have set up your credentials in the settings.");
  try {
    process.env["GOOGLE_APPLICATION_CREDENTIALS"] = store.get("googleAuthLocation");

  } catch (error) {
    dialog.showErrorBox("Google Dictation Error", error);
  }

  const sampleRateHertz = 16000;
  const streamingLimit = 290000;


  let recognizeStream = null;
  let restartCounter = 0;
  let audioInput = [];
  let lastAudioInput = [];
  let resultEndTime = 0;
  let isFinalEndTime = 0;
  let finalRequestEndTime = 0;
  let newStream = true;
  let bridgingOffset = 0;
  let lastTranscriptWasFinal = false;


  const client = new speech.SpeechClient();



  function startStream() {
    if (!dictationStatus) {
      return;
    }
    console.log("start");
    // Clear current audioInput
    audioInput = [];
    // Initiate (Reinitiate) a recognize stream

    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: sampleRateHertz,
      languageCode: 'en-GB',
      model: 'default',
      profanityFilter: false,
      enableAutomaticPunctuation: true,
      metadata: {
        microphone_distance: "NEARFIELD"
      }
    };

    const request = {
      config,
      interimResults: true,
    };

    recognizeStream = client
      .streamingRecognize(request)
      .on('error', err => {
        if (err.code === 11) {
          // restartStream();
        } else {
          console.error('API request error ' + err);
        }
      })
      .on('data', speechCallback);

    // Restart stream when streamingLimit expires
    setTimeout(restartStream, streamingLimit);
  }

  const speechCallback = stream => {

    if (stream.results[0].isFinal) {
      mainWindow.webContents.send("text-dictate", stream.results[0].alternatives[0].transcript);
      // console.log(stream.results[0].alternatives[0].transcript);
      isFinalEndTime = resultEndTime;
    }
  };

  const audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
      if (newStream && lastAudioInput.length !== 0) {
        // Approximate math to calculate time of chunks
        const chunkTime = streamingLimit / lastAudioInput.length;
        if (chunkTime !== 0) {
          if (bridgingOffset < 0) {
            bridgingOffset = 0;
          }
          if (bridgingOffset > finalRequestEndTime) {
            bridgingOffset = finalRequestEndTime;
          }
          const chunksFromMS = Math.floor(
            (finalRequestEndTime - bridgingOffset) / chunkTime
          );
          bridgingOffset = Math.floor(
            (lastAudioInput.length - chunksFromMS) * chunkTime
          );

          for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
            recognizeStream.write(lastAudioInput[i]);
          }
        }
        newStream = false;
      }

      audioInput.push(chunk);

      if (recognizeStream) {
        recognizeStream.write(chunk);
      }

      next();
    },

    final() {
      if (recognizeStream) {
        recognizeStream.end();
      }
    },
  });

  function restartStream() {
    if (!dictationStatus) {
      return;
    }
    console.log("restart");
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.removeListener('data', speechCallback);
      recognizeStream = null;
    }
    if (resultEndTime > 0) {
      finalRequestEndTime = isFinalEndTime;
    }
    resultEndTime = 0;

    lastAudioInput = [];
    lastAudioInput = audioInput;

    restartCounter++;

    if (!lastTranscriptWasFinal) {
      process.stdout.write('\n');
    }
    process.stdout.write(
      `${streamingLimit * restartCounter}: RESTARTING REQUEST\n`
    );

    newStream = true;

    startStream();
  }

  function stopStream() {
    console.log("stop");
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.removeListener('data', speechCallback);
      recognizeStream = null;
    }
    if (resultEndTime > 0) {
      finalRequestEndTime = isFinalEndTime;
    }
    resultEndTime = 0;

    lastAudioInput = [];
  }
  // Start recording and send the microphone input to the Speech API
  recorder
    .record({
      sampleRateHertz: sampleRateHertz,
      threshold: 0, // Silence threshold
      silence: 1000,
      keepSilence: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
    })
    .stream()
    .on('error', err => {
      console.error('Audio recording error ' + err);
    })
    .pipe(audioInputStreamTransform);


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