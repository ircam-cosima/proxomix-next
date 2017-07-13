import { audio } from 'soundworks/client';

const audioContext = audio.audioContext;
const maxIdleTime = 6;

class Mixer {
  constructor(metricScheduler) {
    this.metricScheduler = metricScheduler;

    this.channels = new Map();

    this.muteGain = audioContext.createGain();
    this.muteGain.connect(audioContext.destination);
    this.muteGain.gain.value = 1;

    this.master = audioContext.createGain();
    this.master.connect(this.muteGain);
    this.master.gain.value = 0;
    this.master.gain.setValueAtTime(0, audioContext.currentTime);

    this._monitorAutomations = this._monitorAutomations.bind(this);
    this._monitorAutomations();

    this.start = this.start.bind(this);
    // addEvent(fun, metricPosition, lookahead = false) {
    const nextMeasurePosition = Math.ceil(this.metricScheduler.currentPosition);
    this.metricScheduler.addEvent(this.start, nextMeasurePosition);
  }

  connect(destination) {
    this.muteGain.connect(destination);
  }

  mute(value) {
    const gain = value ? 0 : 1;
    this.muteGain.gain.value = gain;
  }

  start() {
    const now = audioContext.currentTime;

    const currentPosition = this.metricScheduler.currentPosition;
    const startFade = currentPosition + 2;
    const endFade = currentPosition + 6;
    const startFadeTime = this.metricScheduler.getAudioTimeAtMetricPosition(startFade);
    const endFadeTime = this.metricScheduler.getAudioTimeAtMetricPosition(endFade);

    this.master.gain.setValueAtTime(0, startFadeTime);
    this.master.gain.linearRampToValueAtTime(1, endFadeTime);
  }

  createChannel(channelId, track) {
    const channel = {};

    channel.input = audioContext.createGain();
    channel.input.connect(this.master);
    channel.input.gain.value = 0;

    track.connect(channel.input);

    channel.track = track;

    channel.automation = {
      activeTime: -Infinity,
      startTime: -Infinity,
      duration: 0,
      startGain: 0,
      targetGain: 0,
    };

    this.channels.set(channelId, channel);
  }

  deleteChannel(channelId) {
    const channel = this.channels.get(channelId);
    channel.input.gain.value = 0;
    channel.input.disconnect();

    this.channels.delete(channelId);
  }

  setGain(channelId, value) {
    const { input } = this.channels.get(channelId);
    input.gain.value = value;
  }

  setAutomation(channelId, targetGain, duration = 0.5) {
    const now = audioContext.currentTime;
    const channel = this.channels.get(channelId);
    const { automation, input, track } = channel;
    const currentGain = input.gain.value;

    if (targetGain !== currentGain) {
      automation.startTime = now;
      automation.duration = duration;
      automation.startGain = input.gain.value;
      automation.targetGain = targetGain;
    }

    // activate track if inactive
    if (!track.active && targetGain !== 0)
      track.active = true;

    // if active but idle for a long time
    if (track.active && targetGain === 0 && now > automation.activeTime + maxIdleTime)
      track.active = false;
  }

  _monitorAutomations() {
    const now = audioContext.currentTime;

    for (let [id, channel] of this.channels) {
      const { startTime, duration, startGain, targetGain } = channel.automation;
      let dt = Math.max(0, now - startTime);

      // as this should be called every 16ms at 60fps we probably miss the
      // target, so we add some lookhead...
      if (dt <= duration + 0.05) {
        // make sure we don't go beyond target value
        if (dt > duration)
          dt = duration;

        const gain = startGain + (targetGain - startGain) * (dt / duration);
        let clippedGain = Math.max(0, Math.min(1, gain));

        if (clippedGain < 0.001) // -60dB
          clippedGain = 0;

        channel.input.gain.value = clippedGain;

        if (clippedGain > 0)
          channel.automation.activeTime = now;
      }
    }

    requestAnimationFrame(this._monitorAutomations);
  }
}

export default Mixer;
