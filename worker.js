const opencv = require("@u4/opencv4nodejs");
const workerThreads = require("worker_threads");

const { parentPort } = workerThreads;
const {
  Size,
  VideoCapture,
  CAP_ANY,
  CAP_PROP_FPS,
  CAP_PROP_CONVERT_RGB,
  CAP_PROP_FRAME_WIDTH,
  CAP_PROP_FRAME_HEIGHT,
} = opencv;

let shouldRun = false;
const size = new Size(1280, 720);

const sleep = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

function stopVideo() {
  shouldRun = false;
}
async function startVideo() {
  shouldRun = true;
  const capture = new VideoCapture(CAP_ANY);

  await sleep(500);

  capture.set(CAP_PROP_FPS, 30);
  capture.set(CAP_PROP_CONVERT_RGB, 1);
  capture.set(CAP_PROP_FRAME_WIDTH, size.width);
  capture.set(CAP_PROP_FRAME_HEIGHT, size.height);

  while (shouldRun) {
    const frame = capture.read();
    if (!frame?.empty) {
      const data = frame.getData();
      const message = new Int16Array(data);

      parentPort.postMessage(message, [message.buffer]);
    }
  }
}

parentPort.once("message", (message) => {
  if (message === "start") {
    startVideo();
  }

  if (message === "stop") {
    stopVideo();
  }
});
