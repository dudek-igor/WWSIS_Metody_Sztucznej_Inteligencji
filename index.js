const video = document.getElementById("video");
const error = document.getElementById("error");

Promise.all([
  faceapi.loadSsdMobilenetv1Model("./models"),
  faceapi.loadTinyFaceDetectorModel("./models"),
  faceapi.loadFaceLandmarkModel("./models"),
  faceapi.loadFaceLandmarkTinyModel("./models"),
  faceapi.loadFaceRecognitionModel("./models"),
  faceapi.loadFaceExpressionModel("./models"),
]).then(startVideo);

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error({ err });
    error.innerText = "Please add a permission to use your camera";
  }
}
// ustawiamy nasłuchiwanie, gdy odpala się video
video.addEventListener("play", detectFace);

async function detectFace() {
  // Tworzymy canvas
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  // Dostosowanie rozmiaru canvasa do rozmiaru video
  faceapi.matchDimensions(canvas, displaySize);
  // Nowe dane co 100 ms
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(
        video,
        // Pamiętać by określić rodzaj detectora, inaczej video będzie się zacinać
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();
    // Dostosowujemy wykrycia do rozmiaru video
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    // Czyścimy canvas z poprzednich danych
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // Rysujemy nowe dane
    // draw detections into the canvas
    faceapi.draw.drawDetections(canvas, resizeDetections);
    // draw the landmarks into the canvas
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections, 0.5);
  }, 100);
}
