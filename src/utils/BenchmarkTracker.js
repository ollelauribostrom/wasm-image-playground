import round from 'lodash.round';

class BenchmarkTracker {
  constructor() {
    this.frames = 0;
    this.detections = 0;
  }

  tick(detection) {
    this.frames += 1;
    if (detection) {
      this.detections += 1;
    }
  }

  getFps(seconds) {
    return round(this.frames / seconds, 2);
  }

  getInfo(seconds) {
    const { frames, detections } = this;
    const percentage = round((detections / frames) * 100, 2);
    const fps = this.getFps(seconds);
    const framesInfo = `Received ${frames} frames`;
    const timeInfo = `in ${seconds} seconds`;
    const fpsInfo = `@ ${fps} fps`;
    const detectionInfo = `- ${detections} detections (${percentage}% of the frames)`;
    return `${framesInfo} ${timeInfo} ${fpsInfo} ${detectionInfo}`;
  }

  getResult(seconds) {
    return {
      frames: this.frames,
      detections: this.detections,
      info: this.getInfo(seconds),
      fps: this.getFps(seconds)
    }
  }

  reset() {
    this.frames = 0;
    this.detections = 0;
  }
}

export default BenchmarkTracker;
