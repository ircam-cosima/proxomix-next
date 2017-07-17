class Instrument {
  constructor(environment = {}, options = {}) {
    this.environment = environment;
    this.options = options;
    this._isVisible = false;
    this._isActive = false;
  }

  setControl(name, value) {

  }

  showScreen() {

  }

  hideScreen() {

  }

  startSensors() {

  }

  stopSensors() {

  }

  startSound() {

  }

  stopSound() {

  }

  connect(output) {

  }

  disconnect(output) {

  }

  get visible() {
    return this._isVisible;
  }

  set visible(value) {
    const makeVisible = !!value;

    if (this.environment.screenContainer && makeVisible !== this._isVisible) {
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
    const makeActive = !!value;

    if (makeActive !== this._isActive) {
      if (makeActive) {
        this.startSound();

        if (this.environment.motionInput)
          this.startSensors();

      } else {
        if (this.environment.motionInput)
          this.stopSensors();

        this.stopSound();
      }

      this._isActive = makeActive;
    }
  }
}

export default Instrument;
