'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var tempo = 126;
var beatDuration = 60 / tempo;
var measureDuration = 4 * beatDuration;

var setup = {
  common: {
    tempo: tempo,
    tempoUnit: 1 / 4,
    beatDuration: beatDuration,
    measureDuration: measureDuration
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
          opacity: 0.2
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false // define if can trigger actions or not, if true should define an id
        }]
      },
      loop: [{
        length: 4,
        audioBuffer: 'drums-bd-hh1-break.mp3',
        startOffset: beatDuration + 4 * measureDuration,
        continue: true
      }, {
        repeat: 21,
        length: 4,
        audioBuffer: 'drums-bd-hh1.mp3',
        startOffset: beatDuration
      }, {
        length: 4,
        audioBuffer: 'drums-bd-hh1-break.mp3',
        startOffset: beatDuration
      }],
      preview: 1
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
          opacity: 0.2
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false // define if can trigger actions or not, if true should define an id
        }]
      },
      loop: {
        length: 4,
        audioBuffer: 'drums-hh2-hh3.mp3',
        startOffset: beatDuration
      }
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
          opacity: 0.2
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false // define if can trigger actions or not, if true should define an id
        }]
      },
      loop: {
        length: 4,
        audioBuffer: 'drums-sd-bell.mp3',
        startOffset: beatDuration
      }
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
          opacity: 0.2
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false // define if can trigger actions or not, if true should define an id
        }]
      },
      loop: {
        length: 4,
        audioBuffer: 'drums-clap.mp3',
        startOffset: beatDuration
      }
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
          opacity: 0.2
          // active: false, // define if can trigger actions or not, if true should define an id
        }, {
          type: 'cursor',
          color: '#000000',
          opacity: 1,
          fadeOpacity: 0.02,
          numZones: 1,
          active: false // define if can trigger actions or not, if true should define an id
        }]
      },
      loop: {
        length: 1,
        audioBuffer: 'drums-sh1-sh2.mp3',
        startOffset: beatDuration
      }
    }
  }
};

exports.default = setup;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNldHVwLmpzIl0sIm5hbWVzIjpbInRlbXBvIiwiYmVhdER1cmF0aW9uIiwibWVhc3VyZUR1cmF0aW9uIiwic2V0dXAiLCJjb21tb24iLCJ0ZW1wb1VuaXQiLCJpbnN0cnVtZW50cyIsInR5cGUiLCJkaXNwbGF5IiwibGVuZ3RoIiwicmVuZGVyZXJzIiwiem9uZSIsImNvbG9yIiwib3BhY2l0eSIsImZhZGVPcGFjaXR5IiwibnVtWm9uZXMiLCJhY3RpdmUiLCJsb29wIiwiYXVkaW9CdWZmZXIiLCJzdGFydE9mZnNldCIsImNvbnRpbnVlIiwicmVwZWF0IiwicHJldmlldyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxJQUFNQSxRQUFRLEdBQWQ7QUFDQSxJQUFNQyxlQUFlLEtBQUtELEtBQTFCO0FBQ0EsSUFBTUUsa0JBQWtCLElBQUlELFlBQTVCOztBQUVBLElBQU1FLFFBQVE7QUFDWkMsVUFBUTtBQUNOSixXQUFPQSxLQUREO0FBRU5LLGVBQVcsSUFBRSxDQUZQO0FBR05KLGtCQUFjQSxZQUhSO0FBSU5DLHFCQUFpQkE7QUFKWCxHQURJO0FBT1pJLGVBQWE7QUFDWCxvQkFBZ0I7QUFDZEMsWUFBTSxNQURRO0FBRWRDLGVBQVM7QUFDUEQsY0FBTSxVQURDO0FBRVBFLGdCQUFRLENBRkQ7QUFHUEMsbUJBQVcsQ0FBQztBQUNWSCxnQkFBTSxVQURJO0FBRVZJLGdCQUFNLENBRkk7QUFHVkMsaUJBQU8sU0FIRztBQUlWQyxtQkFBUztBQUNUO0FBTFUsU0FBRCxFQU1SO0FBQ0ROLGdCQUFNLFFBREw7QUFFREssaUJBQU8sU0FGTjtBQUdEQyxtQkFBUyxDQUhSO0FBSURDLHVCQUFhLElBSlo7QUFLREMsb0JBQVUsQ0FMVDtBQU1EQyxrQkFBUSxLQU5QLENBTWM7QUFOZCxTQU5RO0FBSEosT0FGSztBQW9CZEMsWUFBTSxDQUFDO0FBQ0xSLGdCQUFRLENBREg7QUFFTFMscUJBQWEsd0JBRlI7QUFHTEMscUJBQWFsQixlQUFlLElBQUlDLGVBSDNCO0FBSUxrQixrQkFBVTtBQUpMLE9BQUQsRUFLSDtBQUNEQyxnQkFBUSxFQURQO0FBRURaLGdCQUFRLENBRlA7QUFHRFMscUJBQWEsa0JBSFo7QUFJREMscUJBQWFsQjtBQUpaLE9BTEcsRUFVSDtBQUNEUSxnQkFBUSxDQURQO0FBRURTLHFCQUFhLHdCQUZaO0FBR0RDLHFCQUFhbEI7QUFIWixPQVZHLENBcEJRO0FBbUNkcUIsZUFBUztBQW5DSyxLQURMO0FBc0NYLHFCQUFpQjtBQUNmZixZQUFNLE1BRFM7QUFFZkMsZUFBUztBQUNQRCxjQUFNLFVBREM7QUFFUEUsZ0JBQVEsQ0FGRDtBQUdQQyxtQkFBVyxDQUFDO0FBQ1ZILGdCQUFNLFVBREk7QUFFVkksZ0JBQU0sQ0FGSTtBQUdWQyxpQkFBTyxTQUhHO0FBSVZDLG1CQUFTO0FBQ1Q7QUFMVSxTQUFELEVBTVI7QUFDRE4sZ0JBQU0sUUFETDtBQUVESyxpQkFBTyxTQUZOO0FBR0RDLG1CQUFTLENBSFI7QUFJREMsdUJBQWEsSUFKWjtBQUtEQyxvQkFBVSxDQUxUO0FBTURDLGtCQUFRLEtBTlAsQ0FNYztBQU5kLFNBTlE7QUFISixPQUZNO0FBb0JmQyxZQUFNO0FBQ0pSLGdCQUFRLENBREo7QUFFSlMscUJBQWEsbUJBRlQ7QUFHSkMscUJBQWFsQjtBQUhUO0FBcEJTLEtBdENOO0FBZ0VYLHFCQUFpQjtBQUNmTSxZQUFNLE1BRFM7QUFFZkMsZUFBUztBQUNQRCxjQUFNLFVBREM7QUFFUEUsZ0JBQVEsQ0FGRDtBQUdQQyxtQkFBVyxDQUFDO0FBQ1ZILGdCQUFNLFVBREk7QUFFVkksZ0JBQU0sQ0FGSTtBQUdWQyxpQkFBTyxTQUhHO0FBSVZDLG1CQUFTO0FBQ1Q7QUFMVSxTQUFELEVBTVI7QUFDRE4sZ0JBQU0sUUFETDtBQUVESyxpQkFBTyxTQUZOO0FBR0RDLG1CQUFTLENBSFI7QUFJREMsdUJBQWEsSUFKWjtBQUtEQyxvQkFBVSxDQUxUO0FBTURDLGtCQUFRLEtBTlAsQ0FNYztBQU5kLFNBTlE7QUFISixPQUZNO0FBb0JmQyxZQUFNO0FBQ0pSLGdCQUFRLENBREo7QUFFSlMscUJBQWEsbUJBRlQ7QUFHSkMscUJBQWFsQjtBQUhUO0FBcEJTLEtBaEVOO0FBMEZYLGtCQUFjO0FBQ1pNLFlBQU0sTUFETTtBQUVaQyxlQUFTO0FBQ1BELGNBQU0sVUFEQztBQUVQRSxnQkFBUSxDQUZEO0FBR1BDLG1CQUFXLENBQUM7QUFDVkgsZ0JBQU0sVUFESTtBQUVWSSxnQkFBTSxDQUZJO0FBR1ZDLGlCQUFPLFNBSEc7QUFJVkMsbUJBQVM7QUFDVDtBQUxVLFNBQUQsRUFNUjtBQUNETixnQkFBTSxRQURMO0FBRURLLGlCQUFPLFNBRk47QUFHREMsbUJBQVMsQ0FIUjtBQUlEQyx1QkFBYSxJQUpaO0FBS0RDLG9CQUFVLENBTFQ7QUFNREMsa0JBQVEsS0FOUCxDQU1jO0FBTmQsU0FOUTtBQUhKLE9BRkc7QUFvQlpDLFlBQU07QUFDSlIsZ0JBQVEsQ0FESjtBQUVKUyxxQkFBYSxnQkFGVDtBQUdKQyxxQkFBYWxCO0FBSFQ7QUFwQk0sS0ExRkg7QUFvSFgscUJBQWlCO0FBQ2ZNLFlBQU0sTUFEUztBQUVmQyxlQUFTO0FBQ1BELGNBQU0sVUFEQztBQUVQRSxnQkFBUSxDQUZEO0FBR1BDLG1CQUFXLENBQUM7QUFDVkgsZ0JBQU0sVUFESTtBQUVWSSxnQkFBTSxDQUZJO0FBR1ZDLGlCQUFPLFNBSEc7QUFJVkMsbUJBQVM7QUFDVDtBQUxVLFNBQUQsRUFNUjtBQUNETixnQkFBTSxRQURMO0FBRURLLGlCQUFPLFNBRk47QUFHREMsbUJBQVMsQ0FIUjtBQUlEQyx1QkFBYSxJQUpaO0FBS0RDLG9CQUFVLENBTFQ7QUFNREMsa0JBQVEsS0FOUCxDQU1jO0FBTmQsU0FOUTtBQUhKLE9BRk07QUFvQmZDLFlBQU07QUFDSlIsZ0JBQVEsQ0FESjtBQUVKUyxxQkFBYSxtQkFGVDtBQUdKQyxxQkFBYWxCO0FBSFQ7QUFwQlM7QUFwSE47QUFQRCxDQUFkOztrQkF3SmVFLEsiLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0ZW1wbyA9IDEyNjtcbmNvbnN0IGJlYXREdXJhdGlvbiA9IDYwIC8gdGVtcG87XG5jb25zdCBtZWFzdXJlRHVyYXRpb24gPSA0ICogYmVhdER1cmF0aW9uO1xuXG5jb25zdCBzZXR1cCA9IHtcbiAgY29tbW9uOiB7XG4gICAgdGVtcG86IHRlbXBvLFxuICAgIHRlbXBvVW5pdDogMS80LFxuICAgIGJlYXREdXJhdGlvbjogYmVhdER1cmF0aW9uLFxuICAgIG1lYXN1cmVEdXJhdGlvbjogbWVhc3VyZUR1cmF0aW9uLFxuICB9LFxuICBpbnN0cnVtZW50czoge1xuICAgICdkcnVtcy1iZC1oaDEnOiB7XG4gICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICBkaXNwbGF5OiB7XG4gICAgICAgIHR5cGU6ICdjaXJjdWxhcicsXG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgcmVuZGVyZXJzOiBbe1xuICAgICAgICAgIHR5cGU6ICdtZWFzdXJlcycsXG4gICAgICAgICAgem9uZTogMCxcbiAgICAgICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICAgIG9wYWNpdHk6IDAuMixcbiAgICAgICAgICAvLyBhY3RpdmU6IGZhbHNlLCAvLyBkZWZpbmUgaWYgY2FuIHRyaWdnZXIgYWN0aW9ucyBvciBub3QsIGlmIHRydWUgc2hvdWxkIGRlZmluZSBhbiBpZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ2N1cnNvcicsXG4gICAgICAgICAgY29sb3I6ICcjMDAwMDAwJyxcbiAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgIGZhZGVPcGFjaXR5OiAwLjAyLFxuICAgICAgICAgIG51bVpvbmVzOiAxLFxuICAgICAgICAgIGFjdGl2ZTogZmFsc2UsIC8vIGRlZmluZSBpZiBjYW4gdHJpZ2dlciBhY3Rpb25zIG9yIG5vdCwgaWYgdHJ1ZSBzaG91bGQgZGVmaW5lIGFuIGlkXG4gICAgICAgIH1dLFxuICAgICAgfSxcbiAgICAgIGxvb3A6IFt7XG4gICAgICAgIGxlbmd0aDogNCxcbiAgICAgICAgYXVkaW9CdWZmZXI6ICdkcnVtcy1iZC1oaDEtYnJlYWsubXAzJyxcbiAgICAgICAgc3RhcnRPZmZzZXQ6IGJlYXREdXJhdGlvbiArIDQgKiBtZWFzdXJlRHVyYXRpb24sXG4gICAgICAgIGNvbnRpbnVlOiB0cnVlLFxuICAgICAgfSwge1xuICAgICAgICByZXBlYXQ6IDIxLFxuICAgICAgICBsZW5ndGg6IDQsXG4gICAgICAgIGF1ZGlvQnVmZmVyOiAnZHJ1bXMtYmQtaGgxLm1wMycsXG4gICAgICAgIHN0YXJ0T2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9LCB7XG4gICAgICAgIGxlbmd0aDogNCxcbiAgICAgICAgYXVkaW9CdWZmZXI6ICdkcnVtcy1iZC1oaDEtYnJlYWsubXAzJyxcbiAgICAgICAgc3RhcnRPZmZzZXQ6IGJlYXREdXJhdGlvbixcbiAgICAgIH1dLFxuICAgICAgcHJldmlldzogMSxcbiAgICB9LFxuICAgICdkcnVtcy1oaDItaGgzJzoge1xuICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgZGlzcGxheToge1xuICAgICAgICB0eXBlOiAnY2lyY3VsYXInLFxuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIHJlbmRlcmVyczogW3tcbiAgICAgICAgICB0eXBlOiAnbWVhc3VyZXMnLFxuICAgICAgICAgIHpvbmU6IDAsXG4gICAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgICBvcGFjaXR5OiAwLjIsXG4gICAgICAgICAgLy8gYWN0aXZlOiBmYWxzZSwgLy8gZGVmaW5lIGlmIGNhbiB0cmlnZ2VyIGFjdGlvbnMgb3Igbm90LCBpZiB0cnVlIHNob3VsZCBkZWZpbmUgYW4gaWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdjdXJzb3InLFxuICAgICAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXG4gICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICBmYWRlT3BhY2l0eTogMC4wMixcbiAgICAgICAgICBudW1ab25lczogMSxcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLCAvLyBkZWZpbmUgaWYgY2FuIHRyaWdnZXIgYWN0aW9ucyBvciBub3QsIGlmIHRydWUgc2hvdWxkIGRlZmluZSBhbiBpZFxuICAgICAgICB9XSxcbiAgICAgIH0sXG4gICAgICBsb29wOiB7XG4gICAgICAgIGxlbmd0aDogNCxcbiAgICAgICAgYXVkaW9CdWZmZXI6ICdkcnVtcy1oaDItaGgzLm1wMycsXG4gICAgICAgIHN0YXJ0T2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9LFxuICAgIH0sXG4gICAgJ2RydW1zLXNkLWJlbGwnOiB7XG4gICAgICB0eXBlOiAnbG9vcCcsXG4gICAgICBkaXNwbGF5OiB7XG4gICAgICAgIHR5cGU6ICdjaXJjdWxhcicsXG4gICAgICAgIGxlbmd0aDogOCxcbiAgICAgICAgcmVuZGVyZXJzOiBbe1xuICAgICAgICAgIHR5cGU6ICdtZWFzdXJlcycsXG4gICAgICAgICAgem9uZTogMCxcbiAgICAgICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgICAgIG9wYWNpdHk6IDAuMixcbiAgICAgICAgICAvLyBhY3RpdmU6IGZhbHNlLCAvLyBkZWZpbmUgaWYgY2FuIHRyaWdnZXIgYWN0aW9ucyBvciBub3QsIGlmIHRydWUgc2hvdWxkIGRlZmluZSBhbiBpZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdHlwZTogJ2N1cnNvcicsXG4gICAgICAgICAgY29sb3I6ICcjMDAwMDAwJyxcbiAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgIGZhZGVPcGFjaXR5OiAwLjAyLFxuICAgICAgICAgIG51bVpvbmVzOiAxLFxuICAgICAgICAgIGFjdGl2ZTogZmFsc2UsIC8vIGRlZmluZSBpZiBjYW4gdHJpZ2dlciBhY3Rpb25zIG9yIG5vdCwgaWYgdHJ1ZSBzaG91bGQgZGVmaW5lIGFuIGlkXG4gICAgICAgIH1dLFxuICAgICAgfSxcbiAgICAgIGxvb3A6IHtcbiAgICAgICAgbGVuZ3RoOiA0LFxuICAgICAgICBhdWRpb0J1ZmZlcjogJ2RydW1zLXNkLWJlbGwubXAzJyxcbiAgICAgICAgc3RhcnRPZmZzZXQ6IGJlYXREdXJhdGlvbixcbiAgICAgIH0sXG4gICAgfSxcbiAgICAnZHJ1bXMtY2xhcCc6IHtcbiAgICAgIHR5cGU6ICdsb29wJyxcbiAgICAgIGRpc3BsYXk6IHtcbiAgICAgICAgdHlwZTogJ2NpcmN1bGFyJyxcbiAgICAgICAgbGVuZ3RoOiA4LFxuICAgICAgICByZW5kZXJlcnM6IFt7XG4gICAgICAgICAgdHlwZTogJ21lYXN1cmVzJyxcbiAgICAgICAgICB6b25lOiAwLFxuICAgICAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgICAgb3BhY2l0eTogMC4yLFxuICAgICAgICAgIC8vIGFjdGl2ZTogZmFsc2UsIC8vIGRlZmluZSBpZiBjYW4gdHJpZ2dlciBhY3Rpb25zIG9yIG5vdCwgaWYgdHJ1ZSBzaG91bGQgZGVmaW5lIGFuIGlkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiAnY3Vyc29yJyxcbiAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnLFxuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgZmFkZU9wYWNpdHk6IDAuMDIsXG4gICAgICAgICAgbnVtWm9uZXM6IDEsXG4gICAgICAgICAgYWN0aXZlOiBmYWxzZSwgLy8gZGVmaW5lIGlmIGNhbiB0cmlnZ2VyIGFjdGlvbnMgb3Igbm90LCBpZiB0cnVlIHNob3VsZCBkZWZpbmUgYW4gaWRcbiAgICAgICAgfV0sXG4gICAgICB9LFxuICAgICAgbG9vcDoge1xuICAgICAgICBsZW5ndGg6IDQsXG4gICAgICAgIGF1ZGlvQnVmZmVyOiAnZHJ1bXMtY2xhcC5tcDMnLFxuICAgICAgICBzdGFydE9mZnNldDogYmVhdER1cmF0aW9uLFxuICAgICAgfSxcbiAgICB9LFxuICAgICdkcnVtcy1zaDEtc2gyJzoge1xuICAgICAgdHlwZTogJ2xvb3AnLFxuICAgICAgZGlzcGxheToge1xuICAgICAgICB0eXBlOiAnY2lyY3VsYXInLFxuICAgICAgICBsZW5ndGg6IDgsXG4gICAgICAgIHJlbmRlcmVyczogW3tcbiAgICAgICAgICB0eXBlOiAnbWVhc3VyZXMnLFxuICAgICAgICAgIHpvbmU6IDAsXG4gICAgICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgICBvcGFjaXR5OiAwLjIsXG4gICAgICAgICAgLy8gYWN0aXZlOiBmYWxzZSwgLy8gZGVmaW5lIGlmIGNhbiB0cmlnZ2VyIGFjdGlvbnMgb3Igbm90LCBpZiB0cnVlIHNob3VsZCBkZWZpbmUgYW4gaWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIHR5cGU6ICdjdXJzb3InLFxuICAgICAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXG4gICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICBmYWRlT3BhY2l0eTogMC4wMixcbiAgICAgICAgICBudW1ab25lczogMSxcbiAgICAgICAgICBhY3RpdmU6IGZhbHNlLCAvLyBkZWZpbmUgaWYgY2FuIHRyaWdnZXIgYWN0aW9ucyBvciBub3QsIGlmIHRydWUgc2hvdWxkIGRlZmluZSBhbiBpZFxuICAgICAgICB9XSxcbiAgICAgIH0sXG4gICAgICBsb29wOiB7XG4gICAgICAgIGxlbmd0aDogMSxcbiAgICAgICAgYXVkaW9CdWZmZXI6ICdkcnVtcy1zaDEtc2gyLm1wMycsXG4gICAgICAgIHN0YXJ0T2Zmc2V0OiBiZWF0RHVyYXRpb24sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZXR1cDtcbiJdfQ==