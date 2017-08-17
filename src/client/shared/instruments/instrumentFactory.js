import LoopInstrument from './LoopInstrument';
import StepSeqInstrument from './StepSeqInstrument';

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

    return new ctor(environment, options);
  }
}

const instrumentFactory = new InstrumentFactory();
instrumentFactory.addCtor('loop', LoopInstrument);
instrumentFactory.addCtor('stepseq', StepSeqInstrument);

export default instrumentFactory;
