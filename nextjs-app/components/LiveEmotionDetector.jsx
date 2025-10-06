import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useEmotion } from './context/EmotionContext';
import { useWebSocket } from './context/WebSocketContext';
import {
  loadFaceApiModels,
  detectEmotions,
  BlinkDetector,
  drawDetections,
  getEmotionColor,
} from '../utils/faceDetection';

const LiveEmotionDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotions, setCurrentEmotions] = useState(null);
  const [fps, setFps] = useState(0);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const blinkDetectorRef = useRef(new BlinkDetector());
  const detectionIntervalRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  const { recordEmotion, startSession, endSession, sessionId } = useEmotion();
  const { send } = useWebSocket();

  useEffect(() => {
    initializeModels();
    checkCameraPermission();

    return () => {
      stopDetection();
    };
  }, []);

  const initializeModels = async () => {
    try {
      setLoading(true);
      await loadFaceApiModels();
      setModelsLoaded(true);
      toast.success('Face detection models loaded!');
    } catch (error) {
      console.error('Failed to load models:', error);
      toast.error('Failed to load detection models. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      setCameraPermission(result.state);

      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.error('Camera permission check failed:', error);
    }
  };

  const startDetection = async () => {
    if (!modelsLoaded) {
      toast.error('Models not loaded yet. Please wait...');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsDetecting(true);
          blinkDetectorRef.current.reset();
          sessionStartTimeRef.current = Date.now();
          startSession();
          runDetection();
          toast.success('Detection started!');
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);

      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.');
        setCameraPermission('denied');
      } else {
        toast.error('Failed to access camera. Please check your device.');
      }
    }
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    setIsDetecting(false);
    setCurrentEmotions(null);
    endSession();
    toast.success('Detection stopped');
  };

  const runDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const result = await detectEmotions(videoRef.current);

      if (result) {
        const { emotions, landmarks } = result;

        // Update FPS
        updateFPS();

        // Blink detection
        const blinkData = blinkDetectorRef.current.detect(landmarks);
        const sessionDuration = Date.now() - sessionStartTimeRef.current;
        const blinkRate = blinkDetectorRef.current.getBlinkRate(sessionDuration);

        // Update current emotions
        setCurrentEmotions({
          ...emotions,
          blinkCount: blinkData.blinkCount,
          blinkRate: Math.round(blinkRate),
          ear: blinkData.ear.toFixed(3),
        });

        // Draw on canvas
        drawDetections(canvasRef.current, videoRef.current, result);

        // Send to backend every 3 seconds
        if (Math.floor(sessionDuration / 1000) % 3 === 0) {
          saveEmotionData(emotions, blinkData.blinkCount);
        }

        // Send via WebSocket
        send({
          type: 'emotion_update',
          emotion: {
            emotions,
            blinkCount: blinkData.blinkCount,
            sessionId,
          },
        });
      }
    }, 50); // Run every 50ms (20 FPS) for better blink detection
  };

  const updateFPS = () => {
    fpsCounterRef.current.frames++;
    const now = Date.now();
    const elapsed = now - fpsCounterRef.current.lastTime;

    if (elapsed >= 1000) {
      setFps(fpsCounterRef.current.frames);
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;
    }
  };

  const saveEmotionData = async (emotions, blinkCount) => {
    try {
      await recordEmotion({ emotions, blinkCount });
    } catch (error) {
      console.error('Failed to save emotion:', error);
    }
  };

  const getDominantEmotion = () => {
    if (!currentEmotions) return null;

    const emotions = { ...currentEmotions };
    delete emotions.blinkCount;
    delete emotions.blinkRate;
    delete emotions.ear;

    const dominant = Object.entries(emotions).reduce((a, b) =>
      emotions[a[0]] > emotions[b[0]] ? a : b
    );

    return dominant;
  };

  const dominantEmotion = getDominantEmotion();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Side - Video Container */}
      <div className="lg:col-span-2">
        <div className="card h-full flex flex-col">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex-grow">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />

            {/* FPS Counter */}
            {isDetecting && (
              <div className="absolute top-4 right-4 glass px-3 py-1 rounded-lg text-sm font-mono">
                {fps} FPS
              </div>
            )}

            {/* No Detection Overlay */}
            {!isDetecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-white text-lg">
                    {cameraPermission === 'denied'
                      ? 'Camera access denied'
                      : 'Click start to begin detection'}
                  </p>
                </div>
              </div>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="text-center">
                  <div className="shimmer w-32 h-32 mx-auto mb-4 rounded-full"></div>
                  <p className="text-white">Loading models...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-6 flex gap-4 justify-center">
            {!isDetecting ? (
              <button
                onClick={startDetection}
                disabled={loading || !modelsLoaded}
                className="btn-primary"
              >
                {loading ? 'Loading Models...' : 'Start Detection'}
              </button>
            ) : (
              <button onClick={stopDetection} className="btn bg-red-500 hover:bg-red-600 text-white">
                Stop Detection
              </button>
            )}

            {cameraPermission === 'denied' && (
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Refresh Page
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Detection Details */}
      <div className="lg:col-span-1">
        <AnimatePresence>
          {currentEmotions && dominantEmotion && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6 h-full flex flex-col"
            >
              {/* Dominant Emotion */}
              <div className="card text-center flex-shrink-0">
                <h3 className="text-lg font-semibold mb-4">Dominant Emotion</h3>
                <motion.div
                  key={dominantEmotion[0]}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-6xl mb-4"
                  style={{ color: getEmotionColor(dominantEmotion[0]) }}
                >
                  {getEmotionEmoji(dominantEmotion[0])}
                </motion.div>
                <h2
                  className="text-3xl font-bold capitalize mb-2"
                  style={{ color: getEmotionColor(dominantEmotion[0]) }}
                >
                  {dominantEmotion[0]}
                </h2>
                <div className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
                  {(dominantEmotion[1] * 100).toFixed(1)}%
                </div>
              </div>

              {/* Blink Info */}
              <div className="card flex-shrink-0">
                <h3 className="text-lg font-semibold mb-4">Blink Detection</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Blink Count:</span>
                    <span className="text-2xl font-bold">{currentEmotions.blinkCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Blink Rate:</span>
                    <span className="text-xl font-semibold">
                      {currentEmotions.blinkRate} /min
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>EAR:</span>
                    <span className="font-mono">{currentEmotions.ear}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Normal: 15-20 blinks/min
                  </div>
                </div>
              </div>

              {/* All Emotions */}
              <div className="card flex-grow overflow-auto">
                <h3 className="text-lg font-semibold mb-4">All Emotions</h3>
                <div className="space-y-3">
                  {Object.entries(currentEmotions)
                    .filter(([key]) => !['blinkCount', 'blinkRate', 'ear'].includes(key))
                    .sort((a, b) => b[1] - a[1])
                    .map(([emotion, value]) => (
                      <div key={emotion}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize font-medium">{emotion}</span>
                          <span className="font-semibold">{(value * 100).toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${value * 100}%` }}
                            transition={{ duration: 0.3 }}
                            style={{
                              background: `linear-gradient(to right, ${getEmotionColor(
                                emotion
                              )}, ${getEmotionColor(emotion)}cc)`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const getEmotionEmoji = (emotion) => {
  const emojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😲',
    fearful: '😨',
    disgusted: '🤢',
    neutral: '😐',
  };
  return emojis[emotion] || '😐';
};

export default LiveEmotionDetector;
