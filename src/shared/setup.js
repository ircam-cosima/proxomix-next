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
      icon: 'icons/harmo-arpeggiator.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/harmo-arpeggiator-1.wav',
        offset: beatDuration,
      }, {
        length: 8,
        buffer: 'sounds/harmo-arpeggiator-2.wav',
        offset: beatDuration,
      }, {
        length: 8,
        buffer: 'sounds/harmo-arpeggiator-3.wav',
        offset: beatDuration,
      }],
    },
    'pad-loop': {
      icon: 'icons/pad-loop.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/pad-loop-1.wav',
        offset: beatDuration,
      }, {
        length: 8,
        buffer: 'sounds/pad-loop-2.wav',
        offset: beatDuration,
      }, {
        length: 8,
        buffer: 'sounds/pad-loop-3.wav',
        offset: beatDuration,
      }],
    },
    'melo-1': {
      icon: 'icons/melo-1.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/melo-1.wav',
        offset: beatDuration,
      }],
    },
    'melo-2': {
      icon: 'icons/melo-2.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 32,
        buffer: 'sounds/melo-2.wav',
        offset: beatDuration,
      }],
    },
    'bass-chord': {
      icon: 'icons/bass-chord.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/bass-chord.wav',
        offset: beatDuration,
      }],
    },
    'bass-pad': {
      icon: 'icons/bass-pad.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/bass-pad.wav',
        offset: beatDuration,
      }],
    },
    'bass-arpeggiator': {
      icon: 'icons/bass-arpeggiator.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/bass-arpeggiator.wav',
        offset: beatDuration,
      }],
    },
    'fx-glitch': {
      icon: 'icons/fx-glitch.svg',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/fx-glitch-1.wav',
        offset: beatDuration,
      }, {
        length: 8,
        buffer: 'sounds/fx-glitch-2.wav',
        offset: beatDuration,
      }, {
        length: 8,
        buffer: 'sounds/fx-glitch-3.wav',
        offset: beatDuration,
      }],
    },
    'dist-loop': {
      icon: 'icons/dist-loop.svg',
      type: 'loop',
      length: 6,
      loops: [{
        length: 6,
        buffer: 'sounds/dist-loop.wav',
        offset: beatDuration,
      }],
    },
    'perc-classic-1': {
      icon: 'icons/perc-classic-1.svg',
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: [{
        buffer: 'sounds/perc-metallic-bd.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/perc-metallic-sd.wav',
        gain: 0,
      }],
    },
    'perc-classic-2': {
      icon: 'icons/perc-classic-2.svg',
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: [{
        buffer: 'sounds/perc-classic-rimshot.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/perc-classic-clap.wav',
        gain: 0,
      }],
    },
    'perc-metallic-2': {
      icon: 'icons/perc-metallic-2.svg',
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: [{
        buffer: 'sounds/perc-metallic-rimshot.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/perc-metallic-clap.wav',
        gain: 0,
      }],
    },
    'perc-classic-3': {
      icon: 'icons/perc-classic-3.svg',
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: [{
        buffer: 'sounds/perc-classic-ch1.wav',
        gain: 0,
      }, {
        buffer: 'sounds/perc-classic-ch2.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/perc-classic-oh.wav',
        gain: 0,
      }, {
        buffer: 'sounds/perc-classic-ride.wav',
        gain: 0,
      }],
    },
    'perc-metallic-3': {
      icon: 'icons/perc-metallic-3.svg',
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: [{
        buffer: 'sounds/perc-metallic-ch1.wav',
        gain: 0,
      }, {
        buffer: 'sounds/perc-metallic-ch2.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/perc-metallic-ch3.wav',
        gain: 0,
      }, {
        buffer: 'sounds/perc-metallic-ride.wav',
        gain: 0,
      }],
    },
    'chord-sequencer-1': {
      icon: 'icons/chord-sequencer-1.svg',
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: [{
        buffer: 'sounds/chord-sequencer-1-1.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/chord-sequencer-1-2.wav',
        gain: 0,
      }, {
        buffer: 'sounds/chord-sequencer-1-3.wav',
        gain: 0,
      }],
    },
    'chord-sequencer-2': {
      icon: 'icons/chord-sequencer-2.svg',
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: [{
        buffer: 'sounds/chord-sequencer-2-1.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/chord-sequencer-2-2.wav',
        gain: 0,
      }, {
        buffer: 'sounds/chord-sequencer-2-3.wav',
        gain: 0,
      }],
    },
    'chord-sequencer-3': {
      icon: 'icons/chord-sequencer-3.svg',
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: [{
        buffer: 'sounds/chord-sequencer-3-1.wav',
        gain: 0,
      }],
      outer: [{
        buffer: 'sounds/chord-sequencer-3-2.wav',
        gain: 0,
      }, {
        buffer: 'sounds/chord-sequencer-3-3.wav',
        gain: 0,
      }],
    },
  },
};

export default setup;
