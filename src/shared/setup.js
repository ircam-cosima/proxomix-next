const tempo = 126;
const tempoUnit = 1 / 4;
const beatDuration = 60 / tempo;
const beatsInMeasure = 4;
const measureLength = beatsInMeasure * tempoUnit;
const measureDuration = beatsInMeasure * beatDuration;

const setup = {
  common: {
    tempo: tempo,
    tempoUnit: tempoUnit,
    beatDuration: beatDuration,
    beatsInMeasure: beatsInMeasure,
    measureLength: measureLength,
    measureDuration: measureDuration,
  },
  instruments: {
    'harmo-arpeggiator': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'harmo-arpeggiator-1.wav',
        offset: 0,
      }, {
        length: 8,
        buffer: 'harmo-arpeggiator-2.wav',
        offset: 0,
      }, {
        length: 8,
        buffer: 'harmo-arpeggiator-3.wav',
        offset: 0,
      }],
    },
    'pad-loop': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'pad-loop-1.wav',
        offset: 0,
      }, {
        length: 8,
        buffer: 'pad-loop-2.wav',
        offset: 0,
      }, {
        length: 8,
        buffer: 'pad-loop-3.wav',
        offset: 0,
      }],
    },
    'melo-1': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'melo-1.wav',
        offset: 0,
      }],
    },
    'melo-2': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 32,
        buffer: 'melo-2.wav',
        offset: 0,
      }],
    },
    'bass-chord': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'bass-chord.wav',
        offset: 0,
      }],
    },
    'bass-pad': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'bass-pad.wav',
        offset: 0,
      }],
    },
    'bass-arpeggiator': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'bass-arpeggiator.wav',
        offset: 0,
      }],
    },
    'fx-glitch': {
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'fx-glitch-1.wav',
        offset: 0,
      }, {
        length: 8,
        buffer: 'fx-glitch-2.wav',
        offset: 0,
      }, {
        length: 8,
        buffer: 'fx-glitch-3.wav',
        offset: 0,
      }],
    },
    'dist-loop': {
      type: 'loop',
      length: 6,
      loops: [{
        length: 6,
        buffer: 'dist-loop.wav',
        offset: 0,
      }],
    },
  },
};

export default setup;
