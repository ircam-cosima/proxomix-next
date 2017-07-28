import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;
const audioScheduler = soundworks.audio.getScheduler();

function appendSegments(segments, loopSegment, measureDuration) {
  const buffer = loopSegment.buffer;
  const bufferDuration = buffer ? buffer.duration : 0;
  const offset = loopSegment.offset || 0;
  const repeat = loopSegment.repeat || 1;

  for (let n = 0; n < repeat; n++) {
    let cont = !!loopSegment.continue;

    for (let i = 0; i < loopSegment.length; i++) {
      const offsetInBuffer = offset + i * measureDuration;

      if (offsetInBuffer < bufferDuration) {
        const segment = new Segment(buffer, offsetInBuffer, Infinity, 0, cont);
        segments.push(segment);
      }

      cont = true;
    }
  }
}

class Segment {
  constructor(buffer, offsetInBuffer = 0, durationInBuffer = Infinity, cont = false) {
    this.buffer = buffer;
    this.offsetInBuffer = offsetInBuffer;
    this.durationInBuffer = durationInBuffer; // 0: continue untill next segment starts
    this.continue = cont; // segment continues previous segment
  }
}

class SegmentTrack {
  constructor(segmentedLoops, transitionTime = 0.05) {
    this.src = audioContext.createBufferSource();

    this.segmentedLoops = segmentedLoops;
    this.transitionTime = transitionTime;

    this.loopIndex = 0;
    this.discontinue = true;

    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const cutoff = audioContext.createBiquadFilter();
    cutoff.type = 'lowpass';
    cutoff.frequency.value = this.maxCutoffFreq;
    this.cutoff = cutoff;

    this.src = null;
    this.env = null;
    this.endTime = 0;
  }

  startSegment(audioTime, segment) {
    const buffer = segment.buffer;
    const bufferDuration = buffer.duration;
    const offsetInBuffer = segment.offsetInBuffer;
    const durationInBuffer = Math.min((segment.durationInBuffer || Infinity), bufferDuration - offsetInBuffer);
    let transitionTime = this.transitionTime;

    if (audioTime < this.endTime - transitionTime) {
      const src = this.src;
      const endTime = Math.min(audioTime, this.endTime);

      if (transitionTime > 0) {
        const env = this.env;
        env.gain.setValueAtTime(1, audioTime - transitionTime);
        env.gain.linearRampToValueAtTime(0, endTime);
      }

      src.stop(endTime);
    }

    if (offsetInBuffer < bufferDuration) {
      let advance = transitionTime;

      if (offsetInBuffer < transitionTime) {
        advance += offsetInBuffer - transitionTime;
        transitionTime = offsetInBuffer;
      }

      const env = audioContext.createGain();
      env.connect(this.cutoff);

      if (transitionTime > 0) {
        env.gain.value = 0;
        env.gain.setValueAtTime(0, audioTime - advance);
        env.gain.linearRampToValueAtTime(1, audioTime - advance + transitionTime);
      }

      const src = audioContext.createBufferSource();
      src.connect(env);
      src.buffer = buffer;
      src.start(audioTime - advance, offsetInBuffer - transitionTime);

      this.src = src;
      this.env = env;
      this.endTime = audioTime + durationInBuffer;
    }
  }

  stopSegment(audioTime = audioContext.currentTime) {
    const src = this.src;

    if (src) {
      const transitionTime = this.transitionTime;
      const env = this.env;

      env.gain.setValueAtTime(1, audioTime);
      env.gain.linearRampToValueAtTime(0, audioTime + transitionTime);

      src.stop(audioTime + transitionTime);

      this.src = null;
      this.env = null;
      this.endTime = 0;
    }
  }

  startMeasure(audioTime, measureIndex, canContinue = false) {
    const segments = this.segmentedLoops[this.loopIndex];
    const measureIndexInPattern = measureIndex % segments.length;
    const segment = segments[measureIndexInPattern];

    if (segment && (this.discontinue || !(segment.continue && canContinue))) {
      this.startSegment(audioTime, segment);
      this.discontinue = false;
    }
  }

  setCutoff(value) {
    const cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * value);
    this.cutoff.frequency.value = cutoffFreq;
  }

  setLoop(value) {
    this.loopIndex = value;
    this.discontinue = true;
  }

  connect(node) {
    this.cutoff.connect(node);
  }

  disconnect(node) {
    this.cutoff.disconnect(node);
  }
}

class LoopPlayer extends audio.TimeEngine {
  constructor(metricScheduler, measureLength = 1, tempo = 120, tempoUnit = 1 / 4, transitionTime = 0.05) {
    super();

    this.metricScheduler = metricScheduler;
    this.measureLength = measureLength;
    this.tempo = tempo;
    this.tempoUnit = tempoUnit;
    this.transitionTime = transitionTime;

    this.measureDuration = 60 / (tempo * tempoUnit);
    this.measureIndex = undefined;
    this.segmentTracks = new Set();

    this.metricScheduler.add(this);
  }

  stopAllTracks() {
    for (let segmentTrack of this.segmentTracks)
      segmentTrack.stopSegment();
  }

  syncSpeed(syncTime, metricPosition, metricSpeed) {
    if (metricSpeed === 0)
      this.stopAllTracks();
  }

  syncPosition(syncTime, metricPosition, metricSpeed) {
    const audioTime = audioScheduler.currentTime;
    const floatMeasures = metricPosition / this.measureLength;
    const numMeasures = Math.ceil(floatMeasures);
    const nextMeasurePosition = numMeasures * this.measureLength;

    this.measureIndex = numMeasures - 1;
    this.nextMeasureTime = undefined;

    return nextMeasurePosition;
  }

  advancePosition(syncTime, metricPosition, metricSpeed) {
    const audioTime = audioScheduler.currentTime;

    this.measureIndex++;

    const canContinue = (this.nextMeasureTime && Math.abs(audioTime - this.nextMeasureTime) < 0.01);

    for (let segmentTrack of this.segmentTracks)
      segmentTrack.startMeasure(audioTime, this.measureIndex, canContinue);

    this.nextMeasureTime = audioTime + this.measureDuration;

    return metricPosition + this.measureLength;
  }

  addLoopTrack(loops) {
    const segmentedLoops = [];

    for (let loop of loops) {
      const segments = [];

      if (Array.isArray(loop))
        loop.forEach((seg) => appendSegments(segments, seg, this.measureDuration));
      else
        appendSegments(segments, loop, this.measureDuration);

      segmentedLoops.push(segments);
    }

    const segmentTrack = new SegmentTrack(segmentedLoops, this.transitionTime);
    this.segmentTracks.add(segmentTrack);

    return segmentTrack;
  }

  removeLoopTrack(segmentTrack) {
    segmentTrack.stopSegment();
    this.segmentTracks.delete(segmentTrack);
  }

  destroy() {
    this.stopAllTracks();
    this.metricScheduler.remove(this);
  }
}

export default LoopPlayer;
