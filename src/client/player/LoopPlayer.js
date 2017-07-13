import * as soundworks from 'soundworks/client';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;
const audioScheduler = soundworks.audio.getScheduler();

function appendSegments(segments, loopSegment, measureDuration) {
  const audioBuffer = loopSegment.audioBuffer;
  const bufferDuration = audioBuffer ? audioBuffer.duration : 0;
  const startOffset = loopSegment.startOffset;
  const repeat = loopSegment.repeat || 1;
  const length = loopSegment.length ||  Math.floor((audioBuffer.duration / measureDuration) + 0.5);

  for (let n = 0; n < repeat; n++) {
    let cont = !!loopSegment.continue;

    for (let i = 0; i < length; i++) {
      const offset = startOffset + i * measureDuration;

      if (offset < bufferDuration) {
        const segment = new Segment(audioBuffer, offset, Infinity, 0, cont);
        segments.push(segment);
      }

      cont = true;
    }
  }
}

class Segment {
  constructor(audioBuffer, offsetInBuffer = 0, durationInBuffer = Infinity, offsetInMeasure = 0, cont = false) {
    this.audioBuffer = audioBuffer;
    this.offsetInBuffer = offsetInBuffer;
    this.durationInBuffer = durationInBuffer; // 0: continue untill next segment starts
    this.offsetInMeasure = offsetInMeasure;
    this.continue = cont; // segment continues previous segment
  }
}

class SegmentTrack {
  constructor(segments, transitionTime = 0.05) {
    this.src = audioContext.createBufferSource();

    this.segments = segments;
    this.transitionTime = transitionTime;

    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const cutoff = audioContext.createBiquadFilter();
    cutoff.type = 'lowpass';
    cutoff.frequency.value = this.maxCutoffFreq;

    this.output = cutoff;

    this.src = null;
    this.env = null;
    this.cutoff = cutoff;
    this.endTime = 0;

    this._active = false;
  }

  get active() {
    return this._active;
  }

  set active(active) {
    if (!active)
      this.stopSegment();

    this._active = active;
  }

  connect(node) {
    this.output.connect(node);
  }

  disconnect(node) {
    this.output.disconnect(node);
  }

  startSegment(audioTime, audioBuffer, offsetInBuffer, durationInBuffer = Infinity) {
    const bufferDuration = audioBuffer.duration;
    let transitionTime = this.transitionTime;

    if (audioTime < this.endTime - transitionTime) {
      const src = this.src;
      const endTime = Math.min(audioTime + transitionTime, this.endTime);

      if (transitionTime > 0) {
        const env = this.env;
        // env.gain.cancelScheduledValues(audioTime);
        env.gain.setValueAtTime(1, audioTime);
        env.gain.linearRampToValueAtTime(0, endTime);
      }

      src.stop(endTime);
    }

    if (offsetInBuffer < bufferDuration) {
      let delay = 0;

      if (offsetInBuffer < transitionTime) {
        delay = transitionTime - offsetInBuffer;
        transitionTime = offsetInBuffer;
      }

      const env = audioContext.createGain();
      env.connect(this.cutoff);

      if (transitionTime > 0) {
        env.gain.value = 0;
        env.gain.setValueAtTime(0, audioTime + delay);
        env.gain.linearRampToValueAtTime(1, audioTime + delay + transitionTime);
      }

      const src = audioContext.createBufferSource();
      src.connect(env);
      src.buffer = audioBuffer;
      src.start(audioTime + delay, offsetInBuffer - transitionTime);

      audioTime += transitionTime;

      durationInBuffer = Math.min(durationInBuffer, bufferDuration - offsetInBuffer);

      const endInBuffer = offsetInBuffer + durationInBuffer;
      let endTime = audioTime + durationInBuffer;

      this.src = src;
      this.env = env;
      this.endTime = endTime;
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
    if (this._active) {
      const measureIndexInPattern = measureIndex % this.segments.length;
      const segment = this.segments[measureIndexInPattern];

      if (segment && !(segment.continue && canContinue)) {
        const delay = segment.offsetInMeasure || 0;
        this.startSegment(audioTime + delay, segment.audioBuffer, segment.offsetInBuffer, segment.durationInBuffer);
      }
    }
  }

  setCutoff(value) {
    const cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * value);
    this.cutoff.frequency.value = cutoffFreq;
  }
}

class LoopPlayer extends audio.TimeEngine {
  constructor(metricScheduler, measureLength = 1, tempo = 60, tempoUnit = 1 / 4, transitionTime = 0.05) {
    super();

    this.metricScheduler = metricScheduler;
    this.measureLength = measureLength;
    this.tempo = tempo;
    this.tempoUnit = tempoUnit;
    this.transitionTime = transitionTime;

    this.measureDuration = 60 / (tempo * tempoUnit);
    this.measureIndex = undefined;
    this.segmentTracks = new Map();

    this.metricScheduler.add(this);
  }

  stopAllTracks() {
    for (let [id, track] of this.segmentTracks)
      track.stopSegment();
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

    const canContinue = !!(this.nextMeasureTime && Math.abs(audioTime - this.nextMeasureTime) < 0.01);

    for (let [id, track] of this.segmentTracks)
      track.startMeasure(audioTime, this.measureIndex, canContinue);

    this.nextMeasureTime = audioTime + this.measureDuration;

    return metricPosition + this.measureLength;
  }

  getLoopTrack(id) {
    return this.segmentTracks.get(id);
  }

  /** used ? */
  removeLoopTrack(id) {
    const segmentTrack = this.segmentTracks.get(id);

    if (segmentTrack) {
      segmentTrack.stopSegment();
      this.segmentTracks.remove(id);
    }
  }

  addLoopTrack(id, loop) {
    let segmentTrack = this.segmentTracks.get(id);

    if (segmentTrack)
      throw new Error(`Cannot had segmentTrack twice (id: ${id})`);

    const segments = [];

    if (Array.isArray(loop))
      loop.forEach((elem) => appendSegments(segments, elem, this.measureDuration));
    else
      appendSegments(segments, loop, this.measureDuration);

    segmentTrack = new SegmentTrack(segments, this.transitionTime);
    this.segmentTracks.set(id, segmentTrack);

    return segmentTrack;
  }

  setCutoff(id, value) {
    if (id >= 0) {
      const segmentTrack = this.segmentTracks.get(id);

      if (segmentTrack)
        segmentTrack.setCutoff(value);
    } else {
      for (let [id, segmentTrack] of this.segmentTracks)
        segmentTrack.setCutoff(value);
    }
  }

  destroy() {
    this.stopAllTracks();
    this.metricScheduler.remove(this);
  }
}

export default LoopPlayer;
