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
      icon: {
        chooser: 'icons/harmo-arpeggiator.svg',
        instrument: 'icons/harmo-arpeggiator-no-circle.svg',
      },
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
      icon: {
        chooser: 'icons/pad-loop.svg',
        instrument: 'icons/pad-loop-no-circle.svg',
      },
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
      icon: {
        chooser: 'icons/melo-1.svg',
        instrument: 'icons/melo-1-no-circle.svg',
      },
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/melo-1.wav',
        offset: beatDuration,
      }],
    },
    'melo-2': {
      icon: {
        chooser: 'icons/melo-2.svg',
        instrument: 'icons/melo-2-no-circle.svg',
      },
      type: 'loop',
      length: 8,
      loops: [{
        length: 32,
        buffer: 'sounds/melo-2.wav',
        offset: beatDuration,
      }],
    },
    'bass-chord': {
      icon: {
        chooser: 'icons/bass-chord.svg',
        instrument: 'icons/bass-chord-no-circle.svg',
      },
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/bass-chord.wav',
        offset: beatDuration,
      }],
    },
    'bass-pad': {
      icon: {
        chooser: 'icons/bass-pad.svg',
        instrument: 'icons/bass-pad-no-circle.svg',
      },
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/bass-pad.wav',
        offset: beatDuration,
      }],
    },
    'bass-arpeggiator': {
      icon: {
        chooser: 'icons/bass-arpeggiator.svg',
        instrument: 'icons/bass-arpeggiator-no-circle.svg',
      },
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/bass-arpeggiator.wav',
        offset: beatDuration,
      }],
    },
    'fx-glitch': {
      icon: {
        chooser: 'icons/fx-glitch.svg',
        instrument: 'icons/fx-glitch-no-circle.svg',
      },
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
      icon: {
        chooser: 'icons/dist-loop.svg',
        instrument: 'icons/dist-loop-no-circle.svg',
      },
      type: 'loop',
      length: 6,
      loops: [{
        length: 6,
        buffer: 'sounds/dist-loop.wav',
        offset: beatDuration,
      }],
    },
    'perc-classic-1': {
      icon: {
        chooser: 'icons/perc-classic-1.svg',
        instrument: 'icons/perc-classic-1-no-circle.svg',
      },
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/perc-classic-bd.wav',
          gain: 0,
        }],
        preset: [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 4,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/perc-classic-sd.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        random: 4,
      },
    },
    'perc-classic-2': {
      icon: {
        chooser: 'icons/perc-classic-2.svg',
        instrument: 'icons/perc-classic-2-no-circle.svg',
      },
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/perc-classic-rimshot.wav',
          gain: 0,
        }],
        preset: [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 6,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/perc-classic-clap.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        random: 6,
      },
    },
    'perc-classic-3': {
      icon: {
        chooser: 'icons/perc-classic-3.svg',
        instrument: 'icons/perc-classic-3-no-circle.svg',
      },
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/perc-classic-ch1.wav',
          gain: 0,
        }, {
          buffer: 'sounds/perc-classic-ch2.wav',
          gain: 0,
        }],
        preset: [1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
        random: 5,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/perc-classic-oh.wav',
          gain: 0,
        }, {
          buffer: 'sounds/perc-classic-ride.wav',
          gain: 0,
        }],
        preset: [1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        random: 5,
      },
    },
    'perc-metallic-1': {
      icon: {
        chooser: 'icons/perc-metallic-1.svg',
        instrument: 'icons/perc-metallic-1-no-circle.svg',
      },
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/perc-metallic-bd.wav',
          gain: 0,
        }],
        preset: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 4,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/perc-metallic-sd.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        random: 4,
      },
    },
    'perc-metallic-2': {
      icon: {
        chooser: 'icons/perc-metallic-2.svg',
        instrument: 'icons/perc-metallic-2-no-circle.svg',
      },
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/perc-metallic-rimshot.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
        random: 6,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/perc-metallic-clap.wav',
          gain: 0,
        }],
        preset: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
        random: 6,
      },
    },
    'perc-metallic-3': {
      icon: {
        chooser: 'icons/perc-metallic-3.svg',
        instrument: 'icons/perc-metallic-3-no-circle.svg',
      },
      type: 'stepseq',
      length: 1,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/perc-metallic-ch1.wav',
          gain: 0,
        }, {
          buffer: 'sounds/perc-metallic-ch2.wav',
          gain: 0,
        }],
        preset: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1],
        random: 5,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/perc-metallic-ch3.wav',
          gain: 0,
        }, {
          buffer: 'sounds/perc-metallic-ride.wav',
          gain: 0,
        }],
        preset: [2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        random: 5,
      },
    },
    'chord-sequencer-1': {
      icon: {
        chooser: 'icons/chord-sequencer-1.svg',
        instrument: 'icons/chord-sequencer-1-no-circle.svg',
      },
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/chord-sequencer-1-1.wav',
          gain: 0,
        }],
        preset: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 3,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/chord-sequencer-1-2.wav',
          gain: 0,
        }, {
          buffer: 'sounds/chord-sequencer-1-3.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2],
        random: 2,
      },
    },
    'chord-sequencer-2': {
      icon: {
        chooser: 'icons/chord-sequencer-2.svg',
        instrument: 'icons/chord-sequencer-2-no-circle.svg',
      },
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/chord-sequencer-2-1.wav',
          gain: 0,
        }],
        preset: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 3,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/chord-sequencer-2-2.wav',
          gain: 0,
        }, {
          buffer: 'sounds/chord-sequencer-2-3.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        random: 2,
      },
    },
    'chord-sequencer-3': {
      icon: {
        chooser: 'icons/chord-sequencer-3.svg',
        instrument: 'icons/chord-sequencer-3-no-circle.svg',
      },
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/chord-sequencer-3-1.wav',
          gain: 0,
        }],
        preset: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 3,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/chord-sequencer-3-2.wav',
          gain: 0,
        }, {
          buffer: 'sounds/chord-sequencer-3-3.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0],
        random: 2,
      },
    },
    'fx-water': {
      icon: {
        chooser: 'icons/fx-water.svg',
        instrument: 'icons/fx-water-no-circle.svg',
      },
      type: 'stepseq',
      length: 2,
      steps: 16,
      inner: {
        sounds: [{
          buffer: 'sounds/fx-water-1.wav',
          gain: 0,
        }],
        preset: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        random: 3,
      },
      outer: {
        sounds: [{
          buffer: 'sounds/fx-water-2.wav',
          gain: 0,
        }, {
          buffer: 'sounds/fx-water-3.wav',
          gain: 0,
        }],
        preset: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0],
        random: 2,
      },
    },
  },
};

export default setup;
