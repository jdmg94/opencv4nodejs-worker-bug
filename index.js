const opencv = require("@u4/opencv4nodejs");
const workerThreads = require("worker_threads");

const { Worker } = workerThreads;
const { Size, Rect, Mat, CV_8UC3, imwriteAsync } = opencv;

let i = 1;
const size = new Size(1280, 720);
const worker = new Worker("./worker.js");

worker.on("message", (message) => {
  const frame = new Mat(message, size.height, size.width, CV_8UC3);
  const oneThird = new Rect(0, 0, Math.floor(size.width / 3), size.height);

  // both of them fail, my suspicion is that type signatures are lost
  // when transferring a matrix over workers, even after re-building the
  // frame through the buffer
  Math.random() < 0.5
    ? frame.getRegion(oneThird)
    : imwriteAsync(`./frames/img-${i++}.jpg`, frame);
});

worker.postMessage("start");
console.log("started cv worker!");

setTimeout(() => {
  worker.postMessage("stop");
  console.log("stopped cv worker!");
}, 3000);
