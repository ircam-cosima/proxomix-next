const tempo = 126;
const beatDuration = 60 / tempo;
const measureDuration = 4 * beatDuration;

const setup = {
  common: {
    tempo: tempo,
    tempoUnit: 1/4,
    beatDuration: beatDuration,
    measureDuration: measureDuration,
  },
  instruments: {
    'Arpeggiators': {
      category: 'loop',
      type: 'multi loop',
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: [{
        length: 8,
        audioBuffer: 'Arpeggiators (#1).wav',
        startOffset: 0,
      }, {
        length: 8,
        audioBuffer: 'Arpeggiators (#2).wav',
        startOffset: 0,
      }, {
        length: 8,
        audioBuffer: 'Arpeggiators (#3).wav',
        startOffset: 0,
      }],
      preview: 1,
    },
    'Pads 1': {
      category: 'loop',
      type: 'multi loop',
      category: 'multi loop'
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: [{
        length: 8,
        audioBuffer: 'Pads 1 (#1).wav',
        startOffset: 0,
      }, {
        length: 8,
        audioBuffer: 'Pads 1 (#2).wav',
        startOffset: 0,
      }, {
        length: 8,
        audioBuffer: 'Pads 1 (#3).wav',
        startOffset: 0,
      }],
      preview: 1,
    },
    'Melo 1': {
      category: 'loop',
      type: 'single loop',
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: {
        length: 8,
        audioBuffer: 'Melo 1.wav',
        startOffset: 0,
      },
      preview: 1,
    },
    'Melo 2': {
      category: 'loop',
      type: 'single loop',
      display: {
        type: 'circular',
        length: 32,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: {
        length: 32,
        audioBuffer: 'Melo 2.wav',
        startOffset: 0,
      },
      preview: 1,
    },
    'Chord Bass': {
      category: 'loop',
      type: 'single loop',
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: {
        length: 8,
        audioBuffer: 'Chord Bass.wav',
        startOffset: 0,
      },
      preview: 1,
    },
    'Pad Bass': {
      category: 'loop',
      type: 'single loop',
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: {
        length: 8,
        audioBuffer: 'Pad Bass.wav',
        startOffset: 0,
      },
      preview: 1,
    },
    'Arpeggiator Bass': {
      category: 'loop',
      type: 'single loop',
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: {
        length: 8,
        audioBuffer: 'Arpeggiator Bass.wav',
        startOffset: 0,
      },
      preview: 1,
    },
    'FX Glitch 1 + 2': {
      category: 'loop',
      type: 'multi loop',
      display: {
        type: 'circular',
        length: 8,
        renderers: [{
          type: 'measures',
          zone: 0,
          color: '#ffffff',
          opacity: 0.2,
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false, // define if can trigger actions or not, if true should define an id
        }],
      },
      loop: [{
        length: 8,
        audioBuffer: 'FX Glitch (#1).wav',
        startOffset: 0,
      }, {
        length: 8,
        audioBuffer: 'FX Glitch (#2).wav',
        startOffset: 0,
      }],
      preview: 1,
    },
  },
};

export default setup;
