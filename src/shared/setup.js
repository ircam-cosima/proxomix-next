const tempo = 121;
const tempoUnit = 1/4;
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
    'drums-bd-hh1': {
      category: 'loop',
      type: 'loop',
      length: 23,
      loops: [[{
        length: 4,
        buffer: 'drums-bd-hh1-break.mp3',
        offset: beatDuration + 4 * measureDuration,
        continue: true,
      }, {
        repeat: 21,
        length: 4,
        buffer: 'drums-bd-hh1.mp3',
        offset: beatDuration,
      }, {
        length: 4,
        buffer: 'drums-bd-hh1-break.mp3',
        offset: beatDuration,
      }]],
    },
    'drums-hh2-hh3': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 4,
        buffer: 'drums-hh2-hh3.mp3',
        offset: beatDuration,
      }],
    },
    'drums-sd-bell': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 4,
        buffer: 'drums-sd-bell.mp3',
        offset: beatDuration,
      }],
    },
    'drums-clap': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 4,
        buffer: 'drums-clap.mp3',
        offset: beatDuration,
      }],
    },
    'drums-sh1-sh2': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 1,
        buffer: 'drums-sh1-sh2.mp3',
        offset: beatDuration,
      }],
    },
  },
};

export default setup;
