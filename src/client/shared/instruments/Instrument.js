import { audio, TouchSurface } from 'soundworks/client';
const audioScheduler = audio.getScheduler();
const audioContext = audio.audioContext;

class Instrument {
  constructor(environment = {}, setup = {}) {
    this.environment = environment;
    this.setup = setup;

    this._isVisible = false;
    this._isActive = false;

    this.view = null;
    this.touchSurface = null;
    this.foreground = 'white';
  }

  /**
   * Internal Instrument API
   * (used to implement instruments)
   */
  addView(view) {
    this.view = view;

    view.render();
    view.show();
    view.appendTo(this.environment.screenContainer);
  }

  removeView() {
    const touchSurface = this.touchSurface;
    if (touchSurface) {
      touchSurface.removeListener('touchstart', this.onTouchStart);
      touchSurface.destroy();
      this.touchSurface = null;
    }

    this.view.remove();
    this.view = null;
  }

  _getTouchSurface() {
    let touchSurface = this.touchSurface;

    if (this.view && !touchSurface) {
      touchSurface = new TouchSurface(this.view.$el, { normalizeCoordinates: false });
      this.touchSurface = touchSurface;
    }

    return touchSurface;
  }

  addViewListener(feature, callback) {
    const touchSurface = this._getTouchSurface();

    if (touchSurface)
      touchSurface.addListener(feature, callback);
  }

  removeViewListener(feature, callback) {
    let touchSurface = this.touchSurface;

    if (touchSurface)
      touchSurface.removeListener(feature, callback);
  }

  addMotionListener(feature, listener) {
    const motionInput = this.environment.motionInput;

    if (motionInput)
      motionInput.addListener(feature, listener);
  }

  removeMotionListener(feature, listener) {
    const motionInput = this.environment.motionInput;

    if (motionInput)
      motionInput.removeListener(feature, listener);
  }

  addMetronome(callback, numBeats = 4, metricDiv = 4, startPosition = 0) {
    this.environment.metricScheduler.addMetronome(callback, numBeats, metricDiv, 1, startPosition, true);
  }

  removeMetronome(callback) {
    this.environment.metricScheduler.removeMetronome(callback);
  }

  addLoopTrack(output, loops) {
    return this.environment.loopPlayer.addLoopTrack(output, loops);
  } 

  removeLoopTrack(track) {
    this.environment.loopPlayer.removeLoopTrack(track);
  }

  sendParam(name, value) {
    this.environment.sendParam(name, value);
  }

  get audioContext() {
    return audioContext;
  }

  get currentPosition() {
    let metricScheduler = this.environment.metricScheduler;
    return metricScheduler.currentPosition;
  }

  get currentTime() {
    return audioScheduler.currentTime;
  }

  /**
   * Instrument Interface
   * (to be implemented by the instrument)
   */
  setParam(name, value) {}
  showScreen() {}
  hideScreen() {}
  startSensors() {}
  stopSensors() {}
  startSound() {}
  stopSound() {}

  connect(output) {}
  disconnect(output) {}

  /**
   * External Instrument API
   * (used to control instruments)
   */
  setState(obj) {
    for(let key in obj)
      this.setParam(key, obj[key]);
  }

  show() {
    const environment = this.environment;

    if (environment.screenContainer && !this._isVisible) {
      this.showScreen();
      this._isVisible = true;
    }
  }

  hide() {
    const environment = this.environment;

    if (environment.screenContainer && this._isVisible) {
      this.hideScreen();
      this._isVisible = false;
    }
  }

  start() {
    const environment = this.environment;

    if (!this._isActive) {
      this.startSound();
      this._isActive = true;
    }
  }

  stop(value) {
    const environment = this.environment;

    if (this._isActive) {
      this.stopSound();
      this.resetState();
      this._isActive = false;
    }
  }
}

export default Instrument;
