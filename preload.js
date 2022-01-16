const {
  contextBridge,
  ipcRenderer
} = require("electron");


// window.api.receive("fromMain", (data) => {
//   console.log(`Received ${data} from main process`);
// });
// window.api.send("toMain", "some data");


// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ["save-file", "open-file", "create-file", "toggle-dictate", "start-speak", "set-theme", "get-theme","get-speechSpeed","set-speechSpeed","open-link"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["new-file", "text-dictate", "audio-speak", "current-theme","current-speechSpeed"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
}
);