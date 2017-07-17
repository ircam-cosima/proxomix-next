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
        opacity: 0.33
      };

      var measureRenderer = new _MeasuresRenderer2.default(this.length, measureOptions);
      this.addRenderer(measureRenderer);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvb3BJbnN0cnVtZW50LmpzIl0sIm5hbWVzIjpbInRlbXBsYXRlIiwiTG9vcFZpZXciLCJtZXRyaWNTY2hlZHVsZXIiLCJvcHRpb25zIiwic3ltYm9sIiwicHJlc2VydmVQaXhlbFJhdGlvIiwicmF0aW9zIiwibGVuZ3RoIiwic2V0UHJlUmVuZGVyIiwiY3R4IiwiZHQiLCJ3IiwiaCIsImNsZWFyUmVjdCIsImN1cnNvck9wdGlvbnMiLCJ0eXBlIiwiY29sb3IiLCJvcGFjaXR5IiwiZmFkZU9wYWNpdHkiLCJudW1ab25lcyIsImFjdGl2ZSIsImN1cnNvclJlbmRlcmVyIiwiYWRkUmVuZGVyZXIiLCJtZWFzdXJlT3B0aW9ucyIsInpvbmUiLCJtZWFzdXJlUmVuZGVyZXIiLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwiX2JvdW5kaW5nQ2xpZW50UmVjdCIsIiRlbCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIkxvb3BJbnN0cnVtZW50IiwiZW52aXJvbm1lbnQiLCJ2aWV3IiwibG9vcFRyYWNrIiwibG9vcFBsYXllciIsImFkZExvb3BUcmFjayIsImxvb3BzIiwib25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5IiwiYmluZCIsIm5hbWUiLCJ2YWx1ZSIsInNldEN1dG9mZiIsInJlbmRlciIsInNob3ciLCJhcHBlbmRUbyIsInNjcmVlbkNvbnRhaW5lciIsInJlbW92ZSIsImRhdGEiLCJhY2NYIiwiYWNjWSIsImFjY1oiLCJwaXRjaCIsIk1hdGgiLCJhdGFuMiIsInNxcnQiLCJQSSIsInJvbGwiLCJjdXRvZmYiLCJtYXgiLCJtaW4iLCJhYnMiLCJsYXN0Q3V0b2ZmIiwic2VuZENvbnRyb2wiLCJJbmZpbml0eSIsIm1vdGlvbklucHV0IiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsIm91dHB1dCIsImNvbm5lY3QiLCJkaXNjb25uZWN0IiwiYWRkQ3RvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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LFdBQUtlLFNBQUwsQ0FBZWYsTUFBZixHQUF3QixLQUF4QjtBQUNEOzs7NEJBRU9pRCxNLEVBQVE7QUFDZCxXQUFLbEMsU0FBTCxDQUFlbUMsT0FBZixDQUF1QkQsTUFBdkI7QUFDRDs7OytCQUVVQSxNLEVBQVE7QUFDakIsV0FBS2xDLFNBQUwsQ0FBZW9DLFVBQWYsQ0FBMEJGLE1BQTFCO0FBQ0Q7Ozs7O0FBR0gsNEJBQWtCRyxPQUFsQixDQUEwQixNQUExQixFQUFrQ3hDLGNBQWxDOztrQkFFZUEsYyIsImZpbGUiOiJMb29wSW5zdHJ1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbnN0cnVtZW50RmFjdG9yeSBmcm9tICcuLi9pbnN0cnVtZW50RmFjdG9yeSc7XG5pbXBvcnQgSW5zdHJ1bWVudCBmcm9tICcuL0luc3RydW1lbnQnO1xuaW1wb3J0IHsgY2xpZW50LCBDYW52YXNWaWV3IH0gZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IEN1cnNvclJlbmRlcmVyIGZyb20gJy4vY2lyY3VsYXItcmVuZGVyZXJzL0N1cnNvclJlbmRlcmVyJztcbmltcG9ydCBNZWFzdXJlc1JlbmRlcmVyIGZyb20gJy4vY2lyY3VsYXItcmVuZGVyZXJzL01lYXN1cmVzUmVuZGVyZXInO1xuXG5jb25zdCB0ZW1wbGF0ZSA9IGBcbiAgPGNhbnZhcyBjbGFzcz1cImJhY2tncm91bmRcIj48L2NhbnZhcz5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmQgZml0LWNvbnRhaW5lclwiPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcFwiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LW1pZGRsZVwiPlxuICAgICAgPCUgaWYgKHN5bWJvbCkgeyAlPlxuICAgICAgPHAgY2xhc3M9XCJncmVla1wiPjwlPSBzeW1ib2wgJT48L3A+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuY2xhc3MgTG9vcFZpZXcgZXh0ZW5kcyBDYW52YXNWaWV3IHtcbiAgY29uc3RydWN0b3IobWV0cmljU2NoZWR1bGVyLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIHtcbiAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wsXG4gICAgfSwge30sIHtcbiAgICAgIHByZXNlcnZlUGl4ZWxSYXRpbzogdHJ1ZSxcbiAgICAgIHJhdGlvczoge1xuICAgICAgICAnLnNlY3Rpb24tdG9wJzogMC4yLFxuICAgICAgICAnLnNlY3Rpb24tY2VudGVyJzogMC42LFxuICAgICAgICAnLnNlY3Rpb24tYm90dG9tJzogMC4yLFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5sZW5ndGggPSBvcHRpb25zLmxlbmd0aDtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIgPSBtZXRyaWNTY2hlZHVsZXI7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuc2V0UHJlUmVuZGVyKChjdHgsIGR0LCB3LCBoKSA9PiBjdHguY2xlYXJSZWN0KDAsIDAsIHcsIGgpKTtcblxuICAgIGNvbnN0IGN1cnNvck9wdGlvbnMgPSB7XG4gICAgICB0eXBlOiAnY3Vyc29yJyxcbiAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgZmFkZU9wYWNpdHk6IDAuMDIsXG4gICAgICBudW1ab25lczogMSxcbiAgICAgIGFjdGl2ZTogZmFsc2UsIC8vIGRlZmluZSBpZiBjYW4gdHJpZ2dlciBhY3Rpb25zIG9yIG5vdCwgaWYgdHJ1ZSBzaG91bGQgZGVmaW5lIGFuIGlkXG4gICAgfTtcblxuICAgIGNvbnN0IGN1cnNvclJlbmRlcmVyID0gbmV3IEN1cnNvclJlbmRlcmVyKHRoaXMubGVuZ3RoLCBjdXJzb3JPcHRpb25zLCB0aGlzLm1ldHJpY1NjaGVkdWxlcik7XG4gICAgdGhpcy5hZGRSZW5kZXJlcihjdXJzb3JSZW5kZXJlcik7XG5cbiAgICBjb25zdCBtZWFzdXJlT3B0aW9ucyA9IHtcbiAgICAgIHpvbmU6IDAsXG4gICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgb3BhY2l0eTogMC4zMyxcbiAgICB9O1xuXG4gICAgY29uc3QgbWVhc3VyZVJlbmRlcmVyID0gbmV3IE1lYXN1cmVzUmVuZGVyZXIodGhpcy5sZW5ndGgsIG1lYXN1cmVPcHRpb25zKTtcbiAgICB0aGlzLmFkZFJlbmRlcmVyKG1lYXN1cmVSZW5kZXJlcik7XG4gIH1cblxuICBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbikge1xuICAgIHN1cGVyLm9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKTtcbiAgICB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QgPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxufVxuXG5jbGFzcyBMb29wSW5zdHJ1bWVudCBleHRlbmRzIEluc3RydW1lbnQge1xuICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudCwgb3B0aW9ucykge1xuICAgIHN1cGVyKGVudmlyb25tZW50LCBvcHRpb25zKTtcblxuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy5sb29wVHJhY2sgPSBlbnZpcm9ubWVudC5sb29wUGxheWVyLmFkZExvb3BUcmFjayhvcHRpb25zLmxvb3BzKTtcbiAgICB0aGlzLm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSA9IHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LmJpbmQodGhpcyk7XG4gIH1cblxuICBzZXRDb250cm9sKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5sb29wVHJhY2suc2V0Q3V0b2ZmKHZhbHVlKTtcbiAgfVxuXG4gIHNob3dTY3JlZW4oKSB7XG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50O1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgTG9vcFZpZXcoZW52aXJvbm1lbnQubWV0cmljU2NoZWR1bGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIHZpZXcucmVuZGVyKCk7XG4gICAgdmlldy5zaG93KCk7XG4gICAgdmlldy5hcHBlbmRUbyhlbnZpcm9ubWVudC5zY3JlZW5Db250YWluZXIpO1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG5cbiAgICAvLyBjb25zdCB0b3VjaFN1cmZhY2UgPSBuZXcgc291bmR3b3Jrcy5Ub3VjaFN1cmZhY2Uodmlldy4kZWwsIHsgbm9ybWFsaXplQ29vcmRpbmF0ZXM6IGZhbHNlIH0pO1xuICAgIC8vIHRvdWNoU3VyZmFjZS5hZGRMaXN0ZW5lciguLi4pO1xuICAgIC8vIHRoaXMudG91Y2hTdXJmYWNlID0gdG91Y2hTdXJmYWNlO1xuICB9XG5cbiAgaGlkZVNjcmVlbigpIHtcbiAgICB0aGlzLnZpZXcucmVtb3ZlKCk7XG5cbiAgICAvLyB0aGlzLnRvdWNoU3VyZmFjZS5yZW1vdmVMaXN0ZW5lciguLi4pO1xuICAgIC8vIHRoaXMudG91Y2hTdXJmYWNlLmRlc3Ryb3koKTtcbiAgfVxuXG4gIG9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eShkYXRhKSB7XG4gICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgY29uc3QgYWNjWSA9IGRhdGFbMV07XG4gICAgY29uc3QgYWNjWiA9IGRhdGFbMl07XG5cbiAgICBjb25zdCBwaXRjaCA9IDIgKiBNYXRoLmF0YW4yKGFjY1ksIE1hdGguc3FydChhY2NaICogYWNjWiArIGFjY1ggKiBhY2NYKSkgLyBNYXRoLlBJO1xuICAgIGNvbnN0IHJvbGwgPSAtMiAqIE1hdGguYXRhbjIoYWNjWCwgTWF0aC5zcXJ0KGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opKSAvIE1hdGguUEk7XG4gICAgY29uc3QgY3V0b2ZmID0gMC41ICsgTWF0aC5tYXgoLTAuOCwgTWF0aC5taW4oMC44LCAoYWNjWiAvIDkuODEpKSkgLyAxLjY7XG5cbiAgICBpZiAoTWF0aC5hYnMoY3V0b2ZmIC0gdGhpcy5sYXN0Q3V0b2ZmKSA+IDAuMDEpIHtcbiAgICAgIHRoaXMubGFzdEN1dG9mZiA9IGN1dG9mZjtcblxuICAgICAgdGhpcy5sb29wVHJhY2suc2V0Q3V0b2ZmKGN1dG9mZik7XG4gICAgICB0aGlzLmVudmlyb25tZW50LnNlbmRDb250cm9sKCdjdXRvZmYnLCBjdXRvZmYpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0U2Vuc29ycygpIHtcbiAgICB0aGlzLmxhc3RDdXRvZmYgPSAtSW5maW5pdHk7XG5cbiAgICBjb25zdCBlbnZpcm9ubWVudCA9IHRoaXMuZW52aXJvbm1lbnQ7XG4gICAgZW52aXJvbm1lbnQubW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknLCB0aGlzLm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSk7XG4gIH1cblxuICBzdG9wU2Vuc29ycygpIHtcbiAgICBjb25zdCBlbnZpcm9ubWVudCA9IHRoaXMuZW52aXJvbm1lbnQ7XG4gICAgZW52aXJvbm1lbnQubW90aW9uSW5wdXQucmVtb3ZlTGlzdGVuZXIoJ2FjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHknLCB0aGlzLm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSk7XG4gIH1cblxuICBzdGFydFNvdW5kKCkge1xuICAgIHRoaXMubG9vcFRyYWNrLmFjdGl2ZSA9IHRydWU7XG4gIH1cblxuICBzdG9wU291bmQoKSB7XG4gICAgdGhpcy5sb29wVHJhY2suYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBjb25uZWN0KG91dHB1dCkge1xuICAgIHRoaXMubG9vcFRyYWNrLmNvbm5lY3Qob3V0cHV0KTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3Qob3V0cHV0KSB7XG4gICAgdGhpcy5sb29wVHJhY2suZGlzY29ubmVjdChvdXRwdXQpO1xuICB9XG59XG5cbmluc3RydW1lbnRGYWN0b3J5LmFkZEN0b3IoJ2xvb3AnLCBMb29wSW5zdHJ1bWVudCk7XG5cbmV4cG9ydCBkZWZhdWx0IExvb3BJbnN0cnVtZW50O1xuIl19