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
  colors: [{
    background: '#48BAB5',
    foreground: 'black',
  }, {
    background: '#8ABE23',
    foreground: 'black',
  }, {
    background: '#E2E1E0',
    foreground: 'black',
  }, {
    background: '#EF7D9E',
    foreground: 'black',
  }, {
    background: '#FCBF28',
    foreground: 'black',
  }, {
    background: '#D31616',
    foreground: 'white',
  }, {
    background: '#2F4194',
    foreground: 'white',
  }, {
    background: '#078336',
    foreground: 'white',
  }, {
    background: '#878787',
    foreground: 'white',
  }, {
    background: '#861F82',
    foreground: 'white',
  }, {
    background: '#F07E1B',
    foreground: 'white',
  }, {
    background: '#7B1D23',
    foreground: 'white',
  }],
  instruments: {
    'harmo-arpeggiator': {
      icon: {
        chooser: {
          white: 'icons/harmo-arpeggiator-white.png',
          black: 'icons/harmo-arpeggiator-black.png',
        },
        instrument: {
          white: 'icons/harmo-arpeggiator-no-circle-white.png',
          black: 'icons/harmo-arpeggiator-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/pad-loop-white.png',
          black: 'icons/pad-loop-black.png',
        },
        instrument: {
          white: 'icons/pad-loop-no-circle-white.png',
          black: 'icons/pad-loop-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/melo-1-white.png',
          black: 'icons/melo-1-black.png',
        },
        instrument: {
          white: 'icons/melo-1-no-circle-white.png',
          black: 'icons/melo-1-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/melo-2-white.png',
          black: 'icons/melo-2-black.png',
        },
        instrument: {
          white: 'icons/melo-2-no-circle-white.png',
          black: 'icons/melo-2-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/bass-chord-white.png',
          black: 'icons/bass-chord-black.png',
        },
        instrument: {
          white: 'icons/bass-chord-no-circle-white.png',
          black: 'icons/bass-chord-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/bass-pad-white.png',
          black: 'icons/bass-pad-black.png',
        },
        instrument: {
          white: 'icons/bass-pad-no-circle-white.png',
          black: 'icons/bass-pad-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/bass-arpeggiator-white.png',
          black: 'icons/bass-arpeggiator-black.png',
        },
        instrument: {
          white: 'icons/bass-arpeggiator-no-circle-white.png',
          black: 'icons/bass-arpeggiator-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/fx-glitch-white.png',
          black: 'icons/fx-glitch-black.png',
        },
        instrument: {
          white: 'icons/fx-glitch-no-circle-white.png',
          black: 'icons/fx-glitch-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/dist-loop-white.png',
          black: 'icons/dist-loop-black.png',
        },
        instrument: {
          white: 'icons/dist-loop-no-circle-white.png',
          black: 'icons/dist-loop-no-circle-black.png',
        },
      },
      type: 'loop',
      length: 6,
      loops: [{
        length: 6,
        buffer: 'sounds/dist-loop.wav',
        offset: beatDuration,
      }],
    },
    'guitar-shaker': {
      icon: {
        chooser: {
          white: 'icons/guitar-shaker-white.png',
          black: 'icons/guitar-shaker-black.png',
        },
        instrument: {
          white: 'icons/guitar-shaker-white-no-circle.png',
          black: 'icons/guitar-shaker-black-no-circle.png',
        },
      },
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'sounds/guitar-shaker-loop.wav',
        offset: beatDuration,
      }],
    },
    'perc-shaker': {
      icon: {
        chooser: {
          white: 'icons/perc-shaker-white.png',
          black: 'icons/perc-shaker-black.png',
        },
        instrument: {
          white: 'icons/perc-shaker-white-no-circle.png',
          black: 'icons/perc-shaker-black-no-circle.png',
        },
      },
      type: 'loop',
      length: 4,
      loops: [{
        length: 4,
        buffer: 'sounds/perc-shaker-loop.wav',
        offset: beatDuration,
      }],
    },
    'metallic-shaker': {
      icon: {
        chooser: {
          white: 'icons/metallic-shaker-white.png',
          black: 'icons/metallic-shaker-black.png',
        },
        instrument: {
          white: 'icons/metallic-shaker-white-no-circle.png',
          black: 'icons/metallic-shaker-black-no-circle.png',
        },
      },
      type: 'loop',
      length: 4,
      loops: [{
        length: 4,
        buffer: 'sounds/metallic-shaker-loop.wav',
        offset: beatDuration,
      }],
    },
    'fx-pad': {
      icon: {
        chooser: {
          white: 'icons/fx-pad-white.png',
          black: 'icons/fx-pad-black.png',
        },
        instrument: {
          white: 'icons/fx-pad-white.png',
          black: 'icons/fx-pad-black.png',
        },
      },
      type: 'pad',
      sounds: [{
        length: 6,
        buffer: 'sounds/fx-pad-noise.wav',
        offset: beatDuration,
      }, {
        length: 6,
        buffer: 'sounds/fx-pad-metal.wav',
        offset: beatDuration,
      }],
    },
    'pad': {
      icon: {
        chooser: {
          white: 'icons/pad-white.png',
          black: 'icons/pad-black.png',
        },
        instrument: {
          white: 'icons/pad-white.png',
          black: 'icons/pad-black.png',
        },
      },
      type: 'pad',
      sounds: [{
        length: 6,
        buffer: 'sounds/pad-1.wav',
        offset: beatDuration,
      }, {
        length: 6,
        buffer: 'sounds/pad-2.wav',
        offset: beatDuration,
      }, {
        length: 6,
        buffer: 'sounds/pad-3.wav',
        offset: beatDuration,
      }, {
        length: 6,
        buffer: 'sounds/pad-4.wav',
        offset: beatDuration,
      }],
    },
    'perc-classic-1': {
      icon: {
        chooser: {
          white: 'icons/perc-classic-1-white.png',
          black: 'icons/perc-classic-1-black.png',
        },
        instrument: {
          white: 'icons/perc-classic-1-no-circle-white.png',
          black: 'icons/perc-classic-1-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/perc-classic-2-white.png',
          black: 'icons/perc-classic-2-black.png',
        },
        instrument: {
          white: 'icons/perc-classic-2-no-circle-white.png',
          black: 'icons/perc-classic-2-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/perc-classic-3-white.png',
          black: 'icons/perc-classic-3-black.png',
        },
        instrument: {
          white: 'icons/perc-classic-3-no-circle-white.png',
          black: 'icons/perc-classic-3-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/perc-metallic-1-white.png',
          black: 'icons/perc-metallic-1-black.png',
        },
        instrument: {
          white: 'icons/perc-metallic-1-no-circle-white.png',
          black: 'icons/perc-metallic-1-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/perc-metallic-2-white.png',
          black: 'icons/perc-metallic-2-black.png',
        },
        instrument: {
          white: 'icons/perc-metallic-2-no-circle-white.png',
          black: 'icons/perc-metallic-2-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/perc-metallic-3-white.png',
          black: 'icons/perc-metallic-3-black.png',
        },
        instrument: {
          white: 'icons/perc-metallic-3-no-circle-white.png',
          black: 'icons/perc-metallic-3-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/chord-sequencer-1-white.png',
          black: 'icons/chord-sequencer-1-black.png',
        },
        instrument: {
          white: 'icons/chord-sequencer-1-no-circle-white.png',
          black: 'icons/chord-sequencer-1-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/chord-sequencer-2-white.png',
          black: 'icons/chord-sequencer-2-black.png',
        },
        instrument: {
          white: 'icons/chord-sequencer-2-no-circle-white.png',
          black: 'icons/chord-sequencer-2-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/chord-sequencer-3-white.png',
          black: 'icons/chord-sequencer-3-black.png',
        },
        instrument: {
          white: 'icons/chord-sequencer-3-no-circle-white.png',
          black: 'icons/chord-sequencer-3-no-circle-black.png',
        },
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
        chooser: {
          white: 'icons/fx-water-white.png',
          black: 'icons/fx-water-black.png',
        },
        instrument: {
          white: 'icons/fx-water-no-circle-white.png',
          black: 'icons/fx-water-no-circle-black.png',
        },
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
