import { audio, TouchSurface } from 'soundworks/client';
const audioScheduler = audio.getScheduler();
const audioContext = audio.audioContext;

class Instrument {
  constructor(environment = {}, options = {}) {
    this.environment = environment;
    this.options = options;

    this.foreground = 'white';

    this._isVisible = false;
    this._isActive = false;

    this.view = null;
    this.touchSurface = null;
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
    let metricScheduler = this.environment.metricScheduler;
    metricScheduler.addMetronome(callback, numBeats, metricDiv, 1, startPosition, true);
  }

  removeMetronome(callback) {
    let metricScheduler = this.environment.metricScheduler;
    metricScheduler.removeMetronome(callback);
  }

  addLoopTrack(loopDescriptions) {
    const loopPlayer = this.environment.loopPlayer;
    const loopTrack = loopPlayer.addLoopTrack(loopDescriptions);
    return loopTrack;
  }

  removeLoopTrack(loopDescriptions) {
    const loopPlayer = this.environment.loopPlayer;
    loopPlayer.removeLoopTrack(loopDescriptions);
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
  setControl(name, value) {}
  updateControl() {}
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
  get visible() {
    return this._isVisible;
  }

  set visible(value) {
    const environment = this.environment;
    const makeVisible = !!value;

    if (environment.screenContainer && makeVisible !== this._isVisible) {
      if (makeVisible)
        this.showScreen();
      else
        this.hideScreen();

      this._isVisible = makeVisible;
    }
  }

  get active() {
    return this._isActive;
  }

  set active(value) {
    const environment = this.environment;
    const makeActive = !!value;

    if (makeActive !== this._isActive) {
      if (makeActive)
        this.startSound();
      else
        this.stopSound();

      this._isActive = makeActive;
    }
  }
}

export default Instrument;
