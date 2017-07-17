'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var tempo = 121;
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
    'drums-bd-hh1': {
      category: 'loop',
      type: 'loop',
      length: 23,
      loops: [[{
        length: 4,
        buffer: 'drums-bd-hh1-break.mp3',
        offset: beatDuration + 4 * measureDuration,
        continue: true
      }, {
        repeat: 21,
        length: 4,
        buffer: 'drums-bd-hh1.mp3',
        offset: beatDuration
      }, {
        length: 4,
        buffer: 'drums-bd-hh1-break.mp3',
        offset: beatDuration
      }]]
    },
    'drums-hh2-hh3': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 4,
        buffer: 'drums-hh2-hh3.mp3',
        offset: beatDuration
      }]
    },
    'drums-sd-bell': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 4,
        buffer: 'drums-sd-bell.mp3',
        offset: beatDuration
      }]
    },
    'drums-clap': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 4,
        buffer: 'drums-clap.mp3',
        offset: beatDuration
      }]
    },
    'drums-sh1-sh2': {
      category: 'loop',
      type: 'loop',
      length: 8,
      loops: [{
        length: 1,
        buffer: 'drums-sh1-sh2.mp3',
        offset: beatDuration
      }]
    }
  }
};

exports.default = setup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldHVwLmpzIl0sIm5hbWVzIjpbInRlbXBvIiwidGVtcG9Vbml0IiwiYmVhdER1cmF0aW9uIiwiYmVhdHNJbk1lYXN1cmUiLCJtZWFzdXJlTGVuZ3RoIiwibWVhc3VyZUR1cmF0aW9uIiwic2V0dXAiLCJjb21tb24iLCJpbnN0cnVtZW50cyIsImNhdGVnb3J5IiwidHlwZSIsImxlbmd0aCIsImxvb3BzIiwiYnVmZmVyIiwib2Zmc2V0IiwiY29udGludWUiLCJyZXBlYXQiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBTUEsUUFBUSxHQUFkO0FBQ0EsSUFBTUMsWUFBWSxJQUFFLENBQXBCO0FBQ0EsSUFBTUMsZUFBZSxLQUFLRixLQUExQjtBQUNBLElBQU1HLGlCQUFpQixDQUF2QjtBQUNBLElBQU1DLGdCQUFnQkQsaUJBQWlCRixTQUF2QztBQUNBLElBQU1JLGtCQUFrQkYsaUJBQWlCRCxZQUF6Qzs7QUFFQSxJQUFNSSxRQUFRO0FBQ1pDLFVBQVE7QUFDTlAsV0FBT0EsS0FERDtBQUVOQyxlQUFXQSxTQUZMO0FBR05DLGtCQUFjQSxZQUhSO0FBSU5DLG9CQUFnQkEsY0FKVjtBQUtOQyxtQkFBZUEsYUFMVDtBQU1OQyxxQkFBaUJBO0FBTlgsR0FESTtBQVNaRyxlQUFhO0FBQ1gsb0JBQWdCO0FBQ2RDLGdCQUFVLE1BREk7QUFFZEMsWUFBTSxNQUZRO0FBR2RDLGNBQVEsRUFITTtBQUlkQyxhQUFPLENBQUMsQ0FBQztBQUNQRCxnQkFBUSxDQUREO0FBRVBFLGdCQUFRLHdCQUZEO0FBR1BDLGdCQUFRWixlQUFlLElBQUlHLGVBSHBCO0FBSVBVLGtCQUFVO0FBSkgsT0FBRCxFQUtMO0FBQ0RDLGdCQUFRLEVBRFA7QUFFREwsZ0JBQVEsQ0FGUDtBQUdERSxnQkFBUSxrQkFIUDtBQUlEQyxnQkFBUVo7QUFKUCxPQUxLLEVBVUw7QUFDRFMsZ0JBQVEsQ0FEUDtBQUVERSxnQkFBUSx3QkFGUDtBQUdEQyxnQkFBUVo7QUFIUCxPQVZLLENBQUQ7QUFKTyxLQURMO0FBcUJYLHFCQUFpQjtBQUNmTyxnQkFBVSxNQURLO0FBRWZDLFlBQU0sTUFGUztBQUdmQyxjQUFRLENBSE87QUFJZkMsYUFBTyxDQUFDO0FBQ05ELGdCQUFRLENBREY7QUFFTkUsZ0JBQVEsbUJBRkY7QUFHTkMsZ0JBQVFaO0FBSEYsT0FBRDtBQUpRLEtBckJOO0FBK0JYLHFCQUFpQjtBQUNmTyxnQkFBVSxNQURLO0FBRWZDLFlBQU0sTUFGUztBQUdmQyxjQUFRLENBSE87QUFJZkMsYUFBTyxDQUFDO0FBQ05ELGdCQUFRLENBREY7QUFFTkUsZ0JBQVEsbUJBRkY7QUFHTkMsZ0JBQVFaO0FBSEYsT0FBRDtBQUpRLEtBL0JOO0FBeUNYLGtCQUFjO0FBQ1pPLGdCQUFVLE1BREU7QUFFWkMsWUFBTSxNQUZNO0FBR1pDLGNBQVEsQ0FISTtBQUlaQyxhQUFPLENBQUM7QUFDTkQsZ0JBQVEsQ0FERjtBQUVORSxnQkFBUSxnQkFGRjtBQUdOQyxnQkFBUVo7QUFIRixPQUFEO0FBSkssS0F6Q0g7QUFtRFgscUJBQWlCO0FBQ2ZPLGdCQUFVLE1BREs7QUFFZkMsWUFBTSxNQUZTO0FBR2ZDLGNBQVEsQ0FITztBQUlmQyxhQUFPLENBQUM7QUFDTkQsZ0JBQVEsQ0FERjtBQUVORSxnQkFBUSxtQkFGRjtBQUdOQyxnQkFBUVo7QUFIRixPQUFEO0FBSlE7QUFuRE47QUFURCxDQUFkOztrQkF5RWVJLEsiLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0ZW1wbyA9IDEyMTtcbmNvbnN0IHRlbXBvVW5pdCA9IDEvNDtcbmNvbnN0IGJlYXREdXJhdGlvbiA9IDYwIC8gdGVtcG87XG5jb25zdCBiZWF0c0luTWVhc3VyZSA9IDQ7XG5jb25zdCBtZWFzdXJlTGVuZ3RoID0gYmVhdHNJbk1lYXN1cmUgKiB0ZW1wb1VuaXQ7XG5jb25zdCBtZWFzdXJlRHVyYXRpb24gPSBiZWF0c0luTWVhc3VyZSAqIGJlYXREdXJhdGlvbjtcblxuY29uc3Qgc2V0dXAgPSB7XG4gIGNvbW1vbjoge1xuICAgIHRlbXBvOiB0ZW1wbyxcbiAgICB0ZW1wb1VuaXQ6IHRlbXBvVW5pdCxcbiAgICBiZWF0RHVyYXRpb246IGJlYXREdXJhdGlvbixcbiAgICBiZWF0c0luTWVhc3VyZTogYmVhdHNJbk1lYXN1cmUsXG4gICAgbWVhc3VyZUxlbmd0aDogbWVhc3VyZUxlbmd0aCxcbiAgICBtZWFzdXJlRHVyYXRpb246IG1lYXN1cmVEdXJhdGlvbixcbiAgfSxcbiAgaW5zdHJ1bWVudHM6IHtcbiAgICAnZHJ1bXMtYmQtaGgxJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogMjMsXG4gICAgICBsb29wczogW1t7XG4gICAgICAgIGxlbmd0aDogNCxcbiAgICAgICAgYnVmZmVyOiAnZHJ1bXMtYmQtaGgxLWJyZWFrLm1wMycsXG4gICAgICAgIG9mZnNldDogYmVhdER1cmF0aW9uICsgNCAqIG1lYXN1cmVEdXJhdGlvbixcbiAgICAgICAgY29udGludWU6IHRydWUsXG4gICAgICB9LCB7XG4gICAgICAgIHJlcGVhdDogMjEsXG4gICAgICAgIGxlbmd0aDogNCxcbiAgICAgICAgYnVmZmVyOiAnZHJ1bXMtYmQtaGgxLm1wMycsXG4gICAgICAgIG9mZnNldDogYmVhdER1cmF0aW9uLFxuICAgICAgfSwge1xuICAgICAgICBsZW5ndGg6IDQsXG4gICAgICAgIGJ1ZmZlcjogJ2RydW1zLWJkLWhoMS1icmVhay5tcDMnLFxuICAgICAgICBvZmZzZXQ6IGJlYXREdXJhdGlvbixcbiAgICAgIH1dXSxcbiAgICB9LFxuICAgICdkcnVtcy1oaDItaGgzJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDQsXG4gICAgICAgIGJ1ZmZlcjogJ2RydW1zLWhoMi1oaDMubXAzJyxcbiAgICAgICAgb2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdkcnVtcy1zZC1iZWxsJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDQsXG4gICAgICAgIGJ1ZmZlcjogJ2RydW1zLXNkLWJlbGwubXAzJyxcbiAgICAgICAgb2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdkcnVtcy1jbGFwJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDQsXG4gICAgICAgIGJ1ZmZlcjogJ2RydW1zLWNsYXAubXAzJyxcbiAgICAgICAgb2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9XSxcbiAgICB9LFxuICAgICdkcnVtcy1zaDEtc2gyJzoge1xuICAgICAgY2F0ZWdvcnk6ICdsb29wJyxcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGxlbmd0aDogOCxcbiAgICAgIGxvb3BzOiBbe1xuICAgICAgICBsZW5ndGg6IDEsXG4gICAgICAgIGJ1ZmZlcjogJ2RydW1zLXNoMS1zaDIubXAzJyxcbiAgICAgICAgb2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9XSxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgc2V0dXA7XG4iXX0=