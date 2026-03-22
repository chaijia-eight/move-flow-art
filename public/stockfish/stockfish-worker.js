if (typeof self.SharedArrayBuffer === "undefined") {
  self.SharedArrayBuffer = ArrayBuffer;
}

self.importScripts("/stockfish/stockfish.js");