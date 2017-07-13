import * as soundworks from 'soundworks/client';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;
const audioScheduler = soundworks.audio.getScheduler();

class RandomPlayer extends audio.TimeEngine {
  constructor(metricScheduler, segments, options) {
    super();

    this.metricScheduler = metricScheduler;

    this.segments = segments;
    this.segmentIndex = 0;

    this.minFirstSilence = (options.minFirstSilence !== undefined) ? options.minFirstSilence : 1;
    this.maxFirstSilence = (options.maxFirstSilence !== undefined) ? options.maxFirstSilence : 16;
    this.minSilence = (options.minSilence !== undefined) ? options.minSilence : 1;
    this.maxSilence = (options.maxSilence !== undefined) ? options.maxSilence : 16;
    this.skipProbability = (options.skipProbability !== undefined) ? options.skipProbability : 0;

    this.output = audioContext.createGain();

    this.metricScheduler.add(this);
  }

  connect(node) {
    this.output.connect(node);
  }

  disconnect(node) {
    this.output.disconnect(node);
  }

  syncPosition(syncTime, metricPosition, metricSpeed) {
    const silenceLength = this.minFirstSilence + Math.random() * (this.maxFirstSilence - this.minFirstSilence);
    return metricPosition + silenceLength;
  }

  advancePosition(syncTime, metricPosition, metricSpeed) {
    const audioTime = audioScheduler.currentTime;
    const segmentIndex = this.segmentIndex;
    const segment = this.segments[this.segmentIndex];

    const src = audioContext.createBufferSource();
    src.connect(this.output);
    src.buffer = segment.audioBuffer;
    src.start(audioTime);

    const indexIncrement = (Math.random() > this.skipProbability) ? 1 : 2;
    this.segmentIndex = (segmentIndex + indexIncrement) % this.segments.length;

    const silenceLength = this.minSilence + Math.random() * (this.maxSilence - this.minSilence);
    return metricPosition + segment.length + silenceLength;
  }

  destroy() {
    this.metricScheduler.remove(this);
  }
}

export default RandomPlayer;
