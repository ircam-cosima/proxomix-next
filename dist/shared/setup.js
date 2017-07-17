'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var tempo = 126;
var tempoUnit = 1 / 4;
var beatDuration = 60 / tempo;
var beatsInMeasure = 4;
var measureLength = beatsInMeasure * tempoUnit;
var measureDuration = beatsInMeasure * beatDuration;

var setup = {
  common: {
    tempo: tempo,
    tempoUnit: tempoUnit,
    beatDuration: beatDuration,
    beatsInMeasure: beatsInMeasure,
    measureLength: measureLength,
    measureDuration: measureDuration
  },
  instruments: {
    'harmo-arpeggiator': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'harmo-arpeggiator-1.wav',
        offset: 0
      }, {
        length: 8,
        buffer: 'harmo-arpeggiator-2.wav',
        offset: 0
      }, {
        length: 8,
        buffer: 'harmo-arpeggiator-3.wav',
        offset: 0
      }]
    },
    'pad-loop': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'pad-loop-1.wav',
        offset: 0
      }, {
        length: 8,
        buffer: 'pad-loop-2.wav',
        offset: 0
      }, {
        length: 8,
        buffer: 'pad-loop-3.wav',
        offset: 0
      }]
    },
    'melo-1': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'melo-1.wav',
        offset: 0
      }]
    },
    'melo-2': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 32,
        buffer: 'melo-2.wav',
        offset: 0
      }]
    },
    'bass-chord': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'bass-chord.wav',
        offset: 0
      }]
    },
    'bass-pad': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'bass-pad.wav',
        offset: 0
      }]
    },
    'bass-arpeggiator': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'bass-arpeggiator.wav',
        offset: 0
      }]
    },
    'fx-glitch': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'fx-glitch-1.wav',
        offset: 0
      }, {
        length: 8,
        buffer: 'fx-glitch-2.wav',
        offset: 0
      }]
    },
    'dist-loop': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 8,
        buffer: 'dist-loop.wav',
        offset: 0
      }]
    }
  }
};

exports.default = setup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldHVwLmpzIl0sIm5hbWVzIjpbInRlbXBvIiwidGVtcG9Vbml0IiwiYmVhdER1cmF0aW9uIiwiYmVhdHNJbk1lYXN1cmUiLCJtZWFzdXJlTGVuZ3RoIiwibWVhc3VyZUR1cmF0aW9uIiwic2V0dXAiLCJjb21tb24iLCJpbnN0cnVtZW50cyIsImNhdGVnb3J5IiwidHlwZSIsImxlbmd0aCIsImxvb3BzIiwiYnVmZmVyIiwib2Zmc2V0Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLElBQU1BLFFBQVEsR0FBZDtBQUNBLElBQU1DLFlBQVksSUFBSSxDQUF0QjtBQUNBLElBQU1DLGVBQWUsS0FBS0YsS0FBMUI7QUFDQSxJQUFNRyxpQkFBaUIsQ0FBdkI7QUFDQSxJQUFNQyxnQkFBZ0JELGlCQUFpQkYsU0FBdkM7QUFDQSxJQUFNSSxrQkFBa0JGLGlCQUFpQkQsWUFBekM7O0FBRUEsSUFBTUksUUFBUTtBQUNaQyxVQUFRO0FBQ05QLFdBQU9BLEtBREQ7QUFFTkMsZUFBV0EsU0FGTDtBQUdOQyxrQkFBY0EsWUFIUjtBQUlOQyxvQkFBZ0JBLGNBSlY7QUFLTkMsbUJBQWVBLGFBTFQ7QUFNTkMscUJBQWlCQTtBQU5YLEdBREk7QUFTWkcsZUFBYTtBQUNYLHlCQUFxQjtBQUNuQkMsZ0JBQVUsTUFEUztBQUVuQkMsWUFBTSxNQUZhO0FBR25CQyxjQUFRLENBSFc7QUFJbkJDLGFBQU8sQ0FBQztBQUNORCxnQkFBUSxDQURGO0FBRU5FLGdCQUFRLHlCQUZGO0FBR05DLGdCQUFRO0FBSEYsT0FBRCxFQUlKO0FBQ0RILGdCQUFRLENBRFA7QUFFREUsZ0JBQVEseUJBRlA7QUFHREMsZ0JBQVE7QUFIUCxPQUpJLEVBUUo7QUFDREgsZ0JBQVEsQ0FEUDtBQUVERSxnQkFBUSx5QkFGUDtBQUdEQyxnQkFBUTtBQUhQLE9BUkk7QUFKWSxLQURWO0FBbUJYLGdCQUFZO0FBQ1ZMLGdCQUFVLE1BREE7QUFFVkMsWUFBTSxNQUZJO0FBR1ZDLGNBQVEsQ0FIRTtBQUlWQyxhQUFPLENBQUM7QUFDTkQsZ0JBQVEsQ0FERjtBQUVORSxnQkFBUSxnQkFGRjtBQUdOQyxnQkFBUTtBQUhGLE9BQUQsRUFJSjtBQUNESCxnQkFBUSxDQURQO0FBRURFLGdCQUFRLGdCQUZQO0FBR0RDLGdCQUFRO0FBSFAsT0FKSSxFQVFKO0FBQ0RILGdCQUFRLENBRFA7QUFFREUsZ0JBQVEsZ0JBRlA7QUFHREMsZ0JBQVE7QUFIUCxPQVJJO0FBSkcsS0FuQkQ7QUFxQ1gsY0FBVTtBQUNSTCxnQkFBVSxNQURGO0FBRVJDLFlBQU0sTUFGRTtBQUdSQyxjQUFRLENBSEE7QUFJUkMsYUFBTyxDQUFDO0FBQ05ELGdCQUFRLENBREY7QUFFTkUsZ0JBQVEsWUFGRjtBQUdOQyxnQkFBUTtBQUhGLE9BQUQ7QUFKQyxLQXJDQztBQStDWCxjQUFVO0FBQ1JMLGdCQUFVLE1BREY7QUFFUkMsWUFBTSxNQUZFO0FBR1JDLGNBQVEsQ0FIQTtBQUlSQyxhQUFPLENBQUM7QUFDTkQsZ0JBQVEsRUFERjtBQUVORSxnQkFBUSxZQUZGO0FBR05DLGdCQUFRO0FBSEYsT0FBRDtBQUpDLEtBL0NDO0FBeURYLGtCQUFjO0FBQ1pMLGdCQUFVLE1BREU7QUFFWkMsWUFBTSxNQUZNO0FBR1pDLGNBQVEsQ0FISTtBQUlaQyxhQUFPLENBQUM7QUFDTkQsZ0JBQVEsQ0FERjtBQUVORSxnQkFBUSxnQkFGRjtBQUdOQyxnQkFBUTtBQUhGLE9BQUQ7QUFKSyxLQXpESDtBQW1FWCxnQkFBWTtBQUNWTCxnQkFBVSxNQURBO0FBRVZDLFlBQU0sTUFGSTtBQUdWQyxjQUFRLENBSEU7QUFJVkMsYUFBTyxDQUFDO0FBQ05ELGdCQUFRLENBREY7QUFFTkUsZ0JBQVEsY0FGRjtBQUdOQyxnQkFBUTtBQUhGLE9BQUQ7QUFKRyxLQW5FRDtBQTZFWCx3QkFBb0I7QUFDbEJMLGdCQUFVLE1BRFE7QUFFbEJDLFlBQU0sTUFGWTtBQUdsQkMsY0FBUSxDQUhVO0FBSWxCQyxhQUFPLENBQUM7QUFDTkQsZ0JBQVEsQ0FERjtBQUVORSxnQkFBUSxzQkFGRjtBQUdOQyxnQkFBUTtBQUhGLE9BQUQ7QUFKVyxLQTdFVDtBQXVGWCxpQkFBYTtBQUNYTCxnQkFBVSxNQURDO0FBRVhDLFlBQU0sTUFGSztBQUdYQyxjQUFRLENBSEc7QUFJWEMsYUFBTyxDQUFDO0FBQ05ELGdCQUFRLENBREY7QUFFTkUsZ0JBQVEsaUJBRkY7QUFHTkMsZ0JBQVE7QUFIRixPQUFELEVBSUo7QUFDREgsZ0JBQVEsQ0FEUDtBQUVERSxnQkFBUSxpQkFGUDtBQUdEQyxnQkFBUTtBQUhQLE9BSkk7QUFKSSxLQXZGRjtBQXFHWCxpQkFBYTtBQUNYTCxnQkFBVSxNQURDO0FBRVhDLFlBQU0sTUFGSztBQUdYQyxjQUFRLENBSEc7QUFJWEMsYUFBTyxDQUFDO0FBQ05ELGdCQUFRLENBREY7QUFFTkUsZ0JBQVEsZUFGRjtBQUdOQyxnQkFBUTtBQUhGLE9BQUQ7QUFKSTtBQXJHRjtBQVRELENBQWQ7O2tCQTJIZVIsSyIsImZpbGUiOiJzZXR1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHRlbXBvID0gMTI2O1xuY29uc3QgdGVtcG9Vbml0ID0gMSAvIDQ7XG5jb25zdCBiZWF0RHVyYXRpb24gPSA2MCAvIHRlbXBvO1xuY29uc3QgYmVhdHNJbk1lYXN1cmUgPSA0O1xuY29uc3QgbWVhc3VyZUxlbmd0aCA9IGJlYXRzSW5NZWFzdXJlICogdGVtcG9Vbml0O1xuY29uc3QgbWVhc3VyZUR1cmF0aW9uID0gYmVhdHNJbk1lYXN1cmUgKiBiZWF0RHVyYXRpb247XG5cbmNvbnN0IHNldHVwID0ge1xuICBjb21tb246IHtcbiAgICB0ZW1wbzogdGVtcG8sXG4gICAgdGVtcG9Vbml0OiB0ZW1wb1VuaXQsXG4gICAgYmVhdER1cmF0aW9uOiBiZWF0RHVyYXRpb24sXG4gICAgYmVhdHNJbk1lYXN1cmU6IGJlYXRzSW5NZWFzdXJlLFxuICAgIG1lYXN1cmVMZW5ndGg6IG1lYXN1cmVMZW5ndGgsXG4gICAgbWVhc3VyZUR1cmF0aW9uOiBtZWFzdXJlRHVyYXRpb24sXG4gIH0sXG4gIGluc3RydW1lbnRzOiB7XG4gICAgJ2hhcm1vLWFycGVnZ2lhdG9yJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIGJ1ZmZlcjogJ2hhcm1vLWFycGVnZ2lhdG9yLTEud2F2JyxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgfSwge1xuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIGJ1ZmZlcjogJ2hhcm1vLWFycGVnZ2lhdG9yLTIud2F2JyxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgfSwge1xuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIGJ1ZmZlcjogJ2hhcm1vLWFycGVnZ2lhdG9yLTMud2F2JyxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgfV0sXG4gICAgfSxcbiAgICAncGFkLWxvb3AnOiB7XG4gICAgICBjYXRlZ29yeTogJ2xvb3AnLFxuICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgbG9vcHM6IFt7XG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgYnVmZmVyOiAncGFkLWxvb3AtMS53YXYnLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICB9LCB7XG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgYnVmZmVyOiAncGFkLWxvb3AtMi53YXYnLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICB9LCB7XG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgYnVmZmVyOiAncGFkLWxvb3AtMy53YXYnLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdtZWxvLTEnOiB7XG4gICAgICBjYXRlZ29yeTogJ2xvb3AnLFxuICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgbG9vcHM6IFt7XG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgYnVmZmVyOiAnbWVsby0xLndhdicsXG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgIH1dLFxuICAgIH0sXG4gICAgJ21lbG8tMic6IHtcbiAgICAgIGNhdGVnb3J5OiAnbG9vcCcsXG4gICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICBsZW5ndGg6IDgsXG4gICAgICBsb29wczogW3tcbiAgICAgICAgbGVuZ3RoOiAzMixcbiAgICAgICAgYnVmZmVyOiAnbWVsby0yLndhdicsXG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgIH1dLFxuICAgIH0sXG4gICAgJ2Jhc3MtY2hvcmQnOiB7XG4gICAgICBjYXRlZ29yeTogJ2xvb3AnLFxuICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgbG9vcHM6IFt7XG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgYnVmZmVyOiAnYmFzcy1jaG9yZC53YXYnLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdiYXNzLXBhZCc6IHtcbiAgICAgIGNhdGVnb3J5OiAnbG9vcCcsXG4gICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICBsZW5ndGg6IDgsXG4gICAgICBsb29wczogW3tcbiAgICAgICAgbGVuZ3RoOiA4LFxuICAgICAgICBidWZmZXI6ICdiYXNzLXBhZC53YXYnLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdiYXNzLWFycGVnZ2lhdG9yJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIGJ1ZmZlcjogJ2Jhc3MtYXJwZWdnaWF0b3Iud2F2JyxcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgfV0sXG4gICAgfSxcbiAgICAnZngtZ2xpdGNoJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIGJ1ZmZlcjogJ2Z4LWdsaXRjaC0xLndhdicsXG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgIH0sIHtcbiAgICAgICAgbGVuZ3RoOiA4LFxuICAgICAgICBidWZmZXI6ICdmeC1nbGl0Y2gtMi53YXYnLFxuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdkaXN0LWxvb3AnOiB7XG4gICAgICBjYXRlZ29yeTogJ2xvb3AnLFxuICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgbGVuZ3RoOiA4LFxuICAgICAgbG9vcHM6IFt7XG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgYnVmZmVyOiAnZGlzdC1sb29wLndhdicsXG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgIH1dLFxuICAgIH0sXG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZXR1cDtcbiJdfQ==