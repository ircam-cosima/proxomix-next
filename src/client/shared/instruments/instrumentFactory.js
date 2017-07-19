class InstrumentFactory {
  constructor(options) {
    this.ctors = new Map();
  }

  addCtor(name, ctor) {
    this.ctors.set(name, ctor);
  }

  createInstrument(environment, name, options) {
    const ctor = this.ctors.get(name);

    if (!ctor)
      throw new Error(`Cannot find instrument class '${name}'`);

    const instrument = new ctor(environment, options);
    return instrument;
  }
}

export default new InstrumentFactory();
