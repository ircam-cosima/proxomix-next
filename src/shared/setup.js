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
    'drums-bd-hh1': {
      type: 'loop',
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
        length: 4,
        audioBuffer: 'drums-bd-hh1-break.mp3',
        startOffset: beatDuration + 4 * measureDuration,
        continue: true,
      }, {
        repeat: 21,
        length: 4,
        audioBuffer: 'drums-bd-hh1.mp3',
        startOffset: beatDuration,
      }, {
        length: 4,
        audioBuffer: 'drums-bd-hh1-break.mp3',
        startOffset: beatDuration,
      }],
      preview: 1,
    },
    'drums-hh2-hh3': {
      type: 'loop',
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
        length: 4,
        audioBuffer: 'drums-hh2-hh3.mp3',
        startOffset: beatDuration,
      },
    },
    'drums-sd-bell': {
      type: 'loop',
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
        length: 4,
        audioBuffer: 'drums-sd-bell.mp3',
        startOffset: beatDuration,
      },
    },
    'drums-clap': {
      type: 'loop',
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
        length: 4,
        audioBuffer: 'drums-clap.mp3',
        startOffset: beatDuration,
      },
    },
    'drums-sh1-sh2': {
      type: 'loop',
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
        length: 1,
        audioBuffer: 'drums-sh1-sh2.mp3',
        startOffset: beatDuration,
      },
    },
  },
};

export default setup;
