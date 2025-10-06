import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = '/models';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log('Face API models loaded');
  } catch (error) {
    console.error('Failed to load Face API models:', error);
    throw error;
  }
};

export const detectEmotions = async (video) => {
  try {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detections) return null;

    return {
      emotions: detections.expressions,
      landmarks: detections.landmarks,
      detection: detections.detection,
    };
  } catch (error) {
    console.error('Emotion detection error:', error);
    return null;
  }
};

// Eye Aspect Ratio (EAR) calculation for blink detection
export const calculateEAR = (landmarks) => {
  if (!landmarks || !landmarks.positions) return 0;

  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  if (!leftEye || !rightEye) return 0;

  const leftEAR = getEyeAspectRatio(leftEye);
  const rightEAR = getEyeAspectRatio(rightEye);

  return (leftEAR + rightEAR) / 2;
};

const getEyeAspectRatio = (eye) => {
  if (eye.length < 6) return 0;

  // Calculate vertical distances
  const v1 = distance(eye[1], eye[5]);
  const v2 = distance(eye[2], eye[4]);

  // Calculate horizontal distance
  const h = distance(eye[0], eye[3]);

  // EAR formula
  const ear = (v1 + v2) / (2.0 * h);
  return ear;
};

const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export class BlinkDetector {
  constructor(earThreshold = 0.23, consecutiveFrames = 1) {
    this.earThreshold = earThreshold;
    this.consecutiveFrames = consecutiveFrames;
    this.counter = 0;
    this.blinkCount = 0;
    this.lastBlinkTime = 0;
    this.isCurrentlyBlinking = false;
  }

  detect(landmarks) {
    const ear = calculateEAR(landmarks);

    // Eye is closing or closed
    if (ear < this.earThreshold) {
      this.counter++;
      this.isCurrentlyBlinking = true;
    } else {
      // Eye just opened after a blink
      if (this.isCurrentlyBlinking && this.counter >= this.consecutiveFrames) {
        const now = Date.now();
        // Prevent double counting (minimum 150ms between blinks)
        if (now - this.lastBlinkTime > 150) {
          this.blinkCount++;
          this.lastBlinkTime = now;
        }
      }
      this.counter = 0;
      this.isCurrentlyBlinking = false;
    }

    return {
      blinkCount: this.blinkCount,
      ear,
      isBlinking: this.isCurrentlyBlinking,
    };
  }

  reset() {
    this.counter = 0;
    this.blinkCount = 0;
    this.lastBlinkTime = 0;
    this.isCurrentlyBlinking = false;
  }

  getBlinkRate(durationMs) {
    // Calculate blinks per minute
    return (this.blinkCount / durationMs) * 60000;
  }
}

export const drawDetections = (canvas, video, detections) => {
  if (!canvas || !detections) return;

  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);

  const resizedDetections = faceapi.resizeResults(detections, displaySize);

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw face detection box
  faceapi.draw.drawDetections(canvas, resizedDetections);

  // Draw facial landmarks
  faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

  // Draw emotion expressions
  if (resizedDetections.expressions) {
    const minConfidence = 0.05;
    new faceapi.draw.DrawTextField(
      Object.entries(resizedDetections.expressions)
        .filter(([, value]) => value > minConfidence)
        .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`),
      resizedDetections.detection.box.bottomLeft
    ).draw(canvas);
  }
};

export const getEmotionColor = (emotion) => {
  const colors = {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    surprised: '#A78BFA',
    fearful: '#FB923C',
    disgusted: '#4ADE80',
    neutral: '#9CA3AF',
  };
  return colors[emotion] || colors.neutral;
};
