'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _instrumentFactory = require('../instrumentFactory');

var _instrumentFactory2 = _interopRequireDefault(_instrumentFactory);

var _Instrument2 = require('./Instrument');

var _Instrument3 = _interopRequireDefault(_Instrument2);

var _client = require('soundworks/client');

var _CursorRenderer = require('./circular-renderers/CursorRenderer');

var _CursorRenderer2 = _interopRequireDefault(_CursorRenderer);

var _MeasuresRenderer = require('./circular-renderers/MeasuresRenderer');

var _MeasuresRenderer2 = _interopRequireDefault(_MeasuresRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground fit-container">\n    <div class="section-top"></div>\n    <div class="section-center flex-middle">\n      <% if (symbol) { %>\n      <p class="greek"><%= symbol %></p>\n      <% } %>\n    </div>\n    <div class="section-bottom"></div>\n  </div>\n';

var LoopView = function (_CanvasView) {
  (0, _inherits3.default)(LoopView, _CanvasView);

  function LoopView(metricScheduler, options) {
    (0, _classCallCheck3.default)(this, LoopView);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LoopView.__proto__ || (0, _getPrototypeOf2.default)(LoopView)).call(this, template, {
      symbol: options.symbol
    }, {}, {
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0.2,
        '.section-center': 0.6,
        '.section-bottom': 0.2
      }
    }));

    _this.length = options.length;

    _this.options = options;
    _this.metricScheduler = metricScheduler;
    return _this;
  }

  (0, _createClass3.default)(LoopView, [{
    key: 'init',
    value: function init() {
      this.setPreRender(function (ctx, dt, w, h) {
        return ctx.clearRect(0, 0, w, h);
      });

      var cursorOptions = {
        type: 'cursor',
        color: '#000000',
        opacity: 1,
        fadeOpacity: 0.02,
        numZones: 1,
        active: false // define if can trigger actions or not, if true should define an id
      };

      var cursorRenderer = new _CursorRenderer2.default(this.length, cursorOptions, this.metricScheduler);
      this.addRenderer(cursorRenderer);

      var measureOptions = {
        zone: 0,
        color: '#ffffff',
        opacity: 0.2
        // active: false, // define if can trigger actions or not, if true should define an id
      };

      var measureRenderer = new _MeasuresRenderer2.default(this.length, measureOptions);
      this.addRenderer(measureRenderer);

      this.cursorRenderer = cursorRenderer;
      this.measureRenderer = measureRenderer;
    }
  }, {
    key: 'onResize',
    value: function onResize(width, height, orientation) {
      (0, _get3.default)(LoopView.prototype.__proto__ || (0, _getPrototypeOf2.default)(LoopView.prototype), 'onResize', this).call(this, width, height, orientation);
      this._boundingClientRect = this.$el.getBoundingClientRect();
    }
  }]);
  return LoopView;
}(_client.CanvasView);

var LoopInstrument = function (_Instrument) {
  (0, _inherits3.default)(LoopInstrument, _Instrument);

  function LoopInstrument(environment, options) {
    (0, _classCallCheck3.default)(this, LoopInstrument);

    var _this2 = (0, _possibleConstructorReturn3.default)(this, (LoopInstrument.__proto__ || (0, _getPrototypeOf2.default)(LoopInstrument)).call(this, environment, options));

    _this2.view = null;
    _this2.loopTrack = environment.loopPlayer.addLoopTrack(options.loops);
    _this2.onAccelerationIncludingGravity = _this2.onAccelerationIncludingGravity.bind(_this2);
    return _this2;
  }

  (0, _createClass3.default)(LoopInstrument, [{
    key: 'setControl',
    value: function setControl(name, value) {
      this.loopTrack.setCutoff(value);
    }
  }, {
    key: 'showScreen',
    value: function showScreen() {
      var environment = this.environment;
      var view = new LoopView(environment.metricScheduler, this.options);
      view.render();
      view.show();
      view.appendTo(environment.screenContainer);
      this.view = view;

      // const touchSurface = new soundworks.TouchSurface(view.$el, { normalizeCoordinates: false });
      // touchSurface.addListener(...);
      // this.touchSurface = touchSurface;
    }
  }, {
    key: 'hideScreen',
    value: function hideScreen() {
      this.view.remove();

      // this.touchSurface.removeListener(...);
      // this.touchSurface.destroy();
    }
  }, {
    key: 'onAccelerationIncludingGravity',
    value: function onAccelerationIncludingGravity(data) {
      var accX = data[0];
      var accY = data[1];
      var accZ = data[2];

      var pitch = 2 * Math.atan2(accY, Math.sqrt(accZ * accZ + accX * accX)) / Math.PI;
      var roll = -2 * Math.atan2(accX, Math.sqrt(accY * accY + accZ * accZ)) / Math.PI;
      var cutoff = 0.5 + Math.max(-0.8, Math.min(0.8, accZ / 9.81)) / 1.6;

      if (Math.abs(cutoff - this.lastCutoff) > 0.01) {
        this.lastCutoff = cutoff;

        this.loopTrack.setCutoff(cutoff);
        this.environment.sendControl('cutoff', cutoff);
      }
    }
  }, {
    key: 'startSensors',
    value: function startSensors() {
      this.lastCutoff = -Infinity;

      var environment = this.environment;
      environment.motionInput.addListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
    }
  }, {
    key: 'stopSensors',
    value: function stopSensors() {
      var environment = this.environment;
      environment.motionInput.removeListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
    }
  }, {
    key: 'startSound',
    value: function startSound() {
      this.loopTrack.active = true;
    }
  }, {
    key: 'stopSound',
    value: function stopSound() {
      this.loopTrack.active = false;
    }
  }, {
    key: 'connect',
    value: function connect(output) {
      this.loopTrack.connect(output);
    }
  }, {
    key: 'disconnect',
    value: function disconnect(output) {
      this.loopTrack.disconnect(output);
    }
  }]);
  return LoopInstrument;
}(_Instrument3.default);

_instrumentFactory2.default.addCtor('loop', LoopInstrument);

exports.default = LoopInstrument;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvb3BJbnN0cnVtZW50LmpzIl0sIm5hbWVzIjpbInRlbXBsYXRlIiwiTG9vcFZpZXciLCJtZXRyaWNTY2hlZHVsZXIiLCJvcHRpb25zIiwic3ltYm9sIiwicHJlc2VydmVQaXhlbFJhdGlvIiwicmF0aW9zIiwibGVuZ3RoIiwic2V0UHJlUmVuZGVyIiwiY3R4IiwiZHQiLCJ3IiwiaCIsImNsZWFyUmVjdCIsImN1cnNvck9wdGlvbnMiLCJ0eXBlIiwiY29sb3IiLCJvcGFjaXR5IiwiZmFkZU9wYWNpdHkiLCJudW1ab25lcyIsImFjdGl2ZSIsImN1cnNvclJlbmRlcmVyIiwiYWRkUmVuZGVyZXIiLCJtZWFzdXJlT3B0aW9ucyIsInpvbmUiLCJtZWFzdXJlUmVuZGVyZXIiLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwiX2JvdW5kaW5nQ2xpZW50UmVjdCIsIiRlbCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIkxvb3BJbnN0cnVtZW50IiwiZW52aXJvbm1lbnQiLCJ2aWV3IiwibG9vcFRyYWNrIiwibG9vcFBsYXllciIsImFkZExvb3BUcmFjayIsImxvb3BzIiwib25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5IiwiYmluZCIsIm5hbWUiLCJ2YWx1ZSIsInNldEN1dG9mZiIsInJlbmRlciIsInNob3ciLCJhcHBlbmRUbyIsInNjcmVlbkNvbnRhaW5lciIsInJlbW92ZSIsImRhdGEiLCJhY2NYIiwiYWNjWSIsImFjY1oiLCJwaXRjaCIsIk1hdGgiLCJhdGFuMiIsInNxcnQiLCJQSSIsInJvbGwiLCJjdXRvZmYiLCJtYXgiLCJtaW4iLCJhYnMiLCJsYXN0Q3V0b2ZmIiwic2VuZENvbnRyb2wiLCJJbmZpbml0eSIsIm1vdGlvbklucHV0IiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsIm91dHB1dCIsImNvbm5lY3QiLCJkaXNjb25uZWN0IiwiYWRkQ3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Ozs7aUNBRVk7QUFDWCxXQUFLSixTQUFMLENBQWVmLE1BQWYsR0FBd0IsSUFBeEI7QUFDRDs7O2dDQUVXO0FBQ1YsV0FBS2UsU0FBTCxDQUFlZixNQUFmLEdBQXdCLEtBQXhCO0FBQ0Q7Ozs0QkFFT2lELE0sRUFBUTtBQUNkLFdBQUtsQyxTQUFMLENBQWVtQyxPQUFmLENBQXVCRCxNQUF2QjtBQUNEOzs7K0JBRVVBLE0sRUFBUTtBQUNqQixXQUFLbEMsU0FBTCxDQUFlb0MsVUFBZixDQUEwQkYsTUFBMUI7QUFDRDs7Ozs7QUFHSCw0QkFBa0JHLE9BQWxCLENBQTBCLE1BQTFCLEVBQWtDeEMsY0FBbEM7O2tCQUVlQSxjIiwiZmlsZSI6Ikxvb3BJbnN0cnVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluc3RydW1lbnRGYWN0b3J5IGZyb20gJy4uL2luc3RydW1lbnRGYWN0b3J5JztcbmltcG9ydCBJbnN0cnVtZW50IGZyb20gJy4vSW5zdHJ1bWVudCc7XG5pbXBvcnQgeyBjbGllbnQsIENhbnZhc1ZpZXcgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgQ3Vyc29yUmVuZGVyZXIgZnJvbSAnLi9jaXJjdWxhci1yZW5kZXJlcnMvQ3Vyc29yUmVuZGVyZXInO1xuaW1wb3J0IE1lYXN1cmVzUmVuZGVyZXIgZnJvbSAnLi9jaXJjdWxhci1yZW5kZXJlcnMvTWVhc3VyZXNSZW5kZXJlcic7XG5cbmNvbnN0IHRlbXBsYXRlID0gYFxuICA8Y2FudmFzIGNsYXNzPVwiYmFja2dyb3VuZFwiPjwvY2FudmFzPlxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZCBmaXQtY29udGFpbmVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8JSBpZiAoc3ltYm9sKSB7ICU+XG4gICAgICA8cCBjbGFzcz1cImdyZWVrXCI+PCU9IHN5bWJvbCAlPjwvcD5cbiAgICAgIDwlIH0gJT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b21cIj48L2Rpdj5cbiAgPC9kaXY+XG5gO1xuXG5jbGFzcyBMb29wVmlldyBleHRlbmRzIENhbnZhc1ZpZXcge1xuICBjb25zdHJ1Y3RvcihtZXRyaWNTY2hlZHVsZXIsIG9wdGlvbnMpIHtcbiAgICBzdXBlcih0ZW1wbGF0ZSwge1xuICAgICAgc3ltYm9sOiBvcHRpb25zLnN5bWJvbCxcbiAgICB9LCB7fSwge1xuICAgICAgcHJlc2VydmVQaXhlbFJhdGlvOiB0cnVlLFxuICAgICAgcmF0aW9zOiB7XG4gICAgICAgICcuc2VjdGlvbi10b3AnOiAwLjIsXG4gICAgICAgICcuc2VjdGlvbi1jZW50ZXInOiAwLjYsXG4gICAgICAgICcuc2VjdGlvbi1ib3R0b20nOiAwLjIsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmxlbmd0aCA9IG9wdGlvbnMubGVuZ3RoO1xuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5zZXRQcmVSZW5kZXIoKGN0eCwgZHQsIHcsIGgpID0+IGN0eC5jbGVhclJlY3QoMCwgMCwgdywgaCkpO1xuXG4gICAgY29uc3QgY3Vyc29yT3B0aW9ucyA9IHtcbiAgICAgIHR5cGU6ICdjdXJzb3InLFxuICAgICAgY29sb3I6ICcjMDAwMDAwJyxcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBmYWRlT3BhY2l0eTogMC4wMixcbiAgICAgIG51bVpvbmVzOiAxLFxuICAgICAgYWN0aXZlOiBmYWxzZSwgLy8gZGVmaW5lIGlmIGNhbiB0cmlnZ2VyIGFjdGlvbnMgb3Igbm90LCBpZiB0cnVlIHNob3VsZCBkZWZpbmUgYW4gaWRcbiAgICB9O1xuXG4gICAgY29uc3QgY3Vyc29yUmVuZGVyZXIgPSBuZXcgQ3Vyc29yUmVuZGVyZXIodGhpcy5sZW5ndGgsIGN1cnNvck9wdGlvbnMsIHRoaXMubWV0cmljU2NoZWR1bGVyKTtcbiAgICB0aGlzLmFkZFJlbmRlcmVyKGN1cnNvclJlbmRlcmVyKTtcblxuICAgIGNvbnN0IG1lYXN1cmVPcHRpb25zID0ge1xuICAgICAgem9uZTogMCxcbiAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICBvcGFjaXR5OiAwLjIsXG4gICAgICAvLyBhY3RpdmU6IGZhbHNlLCAvLyBkZWZpbmUgaWYgY2FuIHRyaWdnZXIgYWN0aW9ucyBvciBub3QsIGlmIHRydWUgc2hvdWxkIGRlZmluZSBhbiBpZFxuICAgIH07XG5cbiAgICBjb25zdCBtZWFzdXJlUmVuZGVyZXIgPSBuZXcgTWVhc3VyZXNSZW5kZXJlcih0aGlzLmxlbmd0aCwgbWVhc3VyZU9wdGlvbnMpO1xuICAgIHRoaXMuYWRkUmVuZGVyZXIobWVhc3VyZVJlbmRlcmVyKTtcblxuICAgIHRoaXMuY3Vyc29yUmVuZGVyZXIgPSBjdXJzb3JSZW5kZXJlcjtcbiAgICB0aGlzLm1lYXN1cmVSZW5kZXJlciA9IG1lYXN1cmVSZW5kZXJlcjtcbiAgfVxuXG4gIG9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUod2lkdGgsIGhlaWdodCwgb3JpZW50YXRpb24pO1xuICAgIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdCA9IHRoaXMuJGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9XG59XG5cbmNsYXNzIExvb3BJbnN0cnVtZW50IGV4dGVuZHMgSW5zdHJ1bWVudCB7XG4gIGNvbnN0cnVjdG9yKGVudmlyb25tZW50LCBvcHRpb25zKSB7XG4gICAgc3VwZXIoZW52aXJvbm1lbnQsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy52aWV3ID0gbnVsbDtcbiAgICB0aGlzLmxvb3BUcmFjayA9IGVudmlyb25tZW50Lmxvb3BQbGF5ZXIuYWRkTG9vcFRyYWNrKG9wdGlvbnMubG9vcHMpO1xuICAgIHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5ID0gdGhpcy5vbkFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNldENvbnRyb2wobmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLmxvb3BUcmFjay5zZXRDdXRvZmYodmFsdWUpO1xuICB9XG5cbiAgc2hvd1NjcmVlbigpIHtcbiAgICBjb25zdCBlbnZpcm9ubWVudCA9IHRoaXMuZW52aXJvbm1lbnQ7XG4gICAgY29uc3QgdmlldyA9IG5ldyBMb29wVmlldyhlbnZpcm9ubWVudC5tZXRyaWNTY2hlZHVsZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgdmlldy5yZW5kZXIoKTtcbiAgICB2aWV3LnNob3coKTtcbiAgICB2aWV3LmFwcGVuZFRvKGVudmlyb25tZW50LnNjcmVlbkNvbnRhaW5lcik7XG4gICAgdGhpcy52aWV3ID0gdmlldztcblxuICAgIC8vIGNvbnN0IHRvdWNoU3VyZmFjZSA9IG5ldyBzb3VuZHdvcmtzLlRvdWNoU3VyZmFjZSh2aWV3LiRlbCwgeyBub3JtYWxpemVDb29yZGluYXRlczogZmFsc2UgfSk7XG4gICAgLy8gdG91Y2hTdXJmYWNlLmFkZExpc3RlbmVyKC4uLik7XG4gICAgLy8gdGhpcy50b3VjaFN1cmZhY2UgPSB0b3VjaFN1cmZhY2U7XG4gIH1cblxuICBoaWRlU2NyZWVuKCkge1xuICAgIHRoaXMudmlldy5yZW1vdmUoKTtcblxuICAgIC8vIHRoaXMudG91Y2hTdXJmYWNlLnJlbW92ZUxpc3RlbmVyKC4uLik7XG4gICAgLy8gdGhpcy50b3VjaFN1cmZhY2UuZGVzdHJveSgpO1xuICB9XG5cbiAgb25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5KGRhdGEpIHtcbiAgICBjb25zdCBhY2NYID0gZGF0YVswXTtcbiAgICBjb25zdCBhY2NZID0gZGF0YVsxXTtcbiAgICBjb25zdCBhY2NaID0gZGF0YVsyXTtcblxuICAgIGNvbnN0IHBpdGNoID0gMiAqIE1hdGguYXRhbjIoYWNjWSwgTWF0aC5zcXJ0KGFjY1ogKiBhY2NaICsgYWNjWCAqIGFjY1gpKSAvIE1hdGguUEk7XG4gICAgY29uc3Qgcm9sbCA9IC0yICogTWF0aC5hdGFuMihhY2NYLCBNYXRoLnNxcnQoYWNjWSAqIGFjY1kgKyBhY2NaICogYWNjWikpIC8gTWF0aC5QSTtcbiAgICBjb25zdCBjdXRvZmYgPSAwLjUgKyBNYXRoLm1heCgtMC44LCBNYXRoLm1pbigwLjgsIChhY2NaIC8gOS44MSkpKSAvIDEuNjtcblxuICAgIGlmIChNYXRoLmFicyhjdXRvZmYgLSB0aGlzLmxhc3RDdXRvZmYpID4gMC4wMSkge1xuICAgICAgdGhpcy5sYXN0Q3V0b2ZmID0gY3V0b2ZmO1xuXG4gICAgICB0aGlzLmxvb3BUcmFjay5zZXRDdXRvZmYoY3V0b2ZmKTtcbiAgICAgIHRoaXMuZW52aXJvbm1lbnQuc2VuZENvbnRyb2woJ2N1dG9mZicsIGN1dG9mZik7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRTZW5zb3JzKCkge1xuICAgIHRoaXMubGFzdEN1dG9mZiA9IC1JbmZpbml0eTtcblxuICAgIGNvbnN0IGVudmlyb25tZW50ID0gdGhpcy5lbnZpcm9ubWVudDtcbiAgICBlbnZpcm9ubWVudC5tb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScsIHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5KTtcbiAgfVxuXG4gIHN0b3BTZW5zb3JzKCkge1xuICAgIGNvbnN0IGVudmlyb25tZW50ID0gdGhpcy5lbnZpcm9ubWVudDtcbiAgICBlbnZpcm9ubWVudC5tb3Rpb25JbnB1dC5yZW1vdmVMaXN0ZW5lcignYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eScsIHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5KTtcbiAgfVxuXG4gIHN0YXJ0U291bmQoKSB7XG4gICAgdGhpcy5sb29wVHJhY2suYWN0aXZlID0gdHJ1ZTtcbiAgfVxuXG4gIHN0b3BTb3VuZCgpIHtcbiAgICB0aGlzLmxvb3BUcmFjay5hY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIGNvbm5lY3Qob3V0cHV0KSB7XG4gICAgdGhpcy5sb29wVHJhY2suY29ubmVjdChvdXRwdXQpO1xuICB9XG5cbiAgZGlzY29ubmVjdChvdXRwdXQpIHtcbiAgICB0aGlzLmxvb3BUcmFjay5kaXNjb25uZWN0KG91dHB1dCk7XG4gIH1cbn1cblxuaW5zdHJ1bWVudEZhY3RvcnkuYWRkQ3RvcignbG9vcCcsIExvb3BJbnN0cnVtZW50KTtcblxuZXhwb3J0IGRlZmF1bHQgTG9vcEluc3RydW1lbnQ7XG4iXX0=