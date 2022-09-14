// this is the control file, this one should run
const opencv = require("@u4/opencv4nodejs");

const {
  Rect,
  Mat,
  Size,
  imwriteAsync,
  VideoCapture,
  CV_8UC3,
  CAP_ANY,
  CAP_PROP_FPS,
  CAP_PROP_CONVERT_RGB,
  CAP_PROP_FRAME_WIDTH,
  CAP_PROP_FRAME_HEIGHT,
} = opencv;

let i = 0;
let shouldRun = false;
const size = new Size(1280, 720);

const sleep = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

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

      const buffer = new Mat(message, size.height, size.width, CV_8UC3);
      const oneThird = new Rect(0, 0, Math.floor(size.width / 3), size.height);

      // both of them fail, my suspicion is that type signatures are lost
      // when transferring a matrix over workers, even after re-building the
      // frame through the buffer
      Math.random() < 0.5
        ? buffer.getRegion(oneThird)
        : imwriteAsync(`./frames/img-${i++}.jpg`, buffer);

      console.log(buffer.mean());
    }
  }
}

console.log("PRESSS CTRL+C TO STOP THIS THANG!");

sleep(1000).then(startVideo);
