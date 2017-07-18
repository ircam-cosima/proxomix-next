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

var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground fit-container">\n    <div class="section-top"></div>\n    <div class="section-center flex-middle">\n      <% if (symbol) { %>\n      <p class="greek"><%= symbol %></p>\n      <% } %>\n\n      <div class="btn-container">\n      </div>\n    </div>\n    <div class="section-bottom"></div>\n  </div>\n';

var lowColor = '#3F3F3F';
var highColor = '#7F7F7F';

var LoopView = function (_CanvasView) {
  (0, _inherits3.default)(LoopView, _CanvasView);

  function LoopView(metricScheduler, buttonCallback, options) {
    (0, _classCallCheck3.default)(this, LoopView);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LoopView.__proto__ || (0, _getPrototypeOf2.default)(LoopView)).call(this, template, {
      symbol: options.symbol
    }, {}, {
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0,
        '.section-center': 1,
        '.section-bottom': 0
      }
    }));

    _this.metricScheduler = metricScheduler;
    _this.buttonCallback = buttonCallback;

    _this.cursorRenderer = null;
    _this.measureRenderer = null;

    _this.selectedButton = 0;
    _this.activeButton = 0;

    _this.length = options.length;
    _this.options = options;

    _this.onMeasureStart = _this.onMeasureStart.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(LoopView, [{
    key: 'init',
    value: function init() {
      this.setPreRender(function (ctx, dt, w, h) {
        return ctx.clearRect(0, 0, w, h);
      });

      var measureOptions = {
        zone: 0,
        color: highColor,
        opacity: 1
      };

      var measureRenderer = new _MeasuresRenderer2.default(this.length, measureOptions);
      this.addRenderer(measureRenderer);
      this.measureRenderer = measureRenderer;

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
      this.cursorRenderer = cursorRenderer;

      this.metricScheduler.addMetronome(this.onMeasureStart, 1, 1, 1, 0, true);
      this.makeButtons(this.options.loops.length);
    }
  }, {
    key: 'remove',
    value: function remove() {
      (0, _get3.default)(LoopView.prototype.__proto__ || (0, _getPrototypeOf2.default)(LoopView.prototype), 'remove', this).call(this);
      this.metricScheduler.removeMetronome(this.onMeasureStart);
    }
  }, {
    key: 'activateSelectedButton',
    value: function activateSelectedButton() {
      var selectedButton = this.selectedButton;

      if (selectedButton !== this.activeButton) {
        this.activeButton = selectedButton;
        this.measureRenderer.setColor(highColor);
        this.setActivatedButton(selectedButton);
      }
    }
  }, {
    key: 'selectButton',
    value: function selectButton(index) {
      if (index !== this.selectedButton) {
        this.selectedButton = index;
        this.setSelectedButton(index);
        this.measureRenderer.setColor(lowColor);
        this.buttonCallback(index);
      }
    }
  }, {
    key: 'setSelectedButton',
    value: function setSelectedButton(index) {
      for (var i = 0; i < this.buttons.length; i++) {
        var button = this.buttons[i];

        if (index === i) button.style.borderColor = highColor;else button.style.borderColor = lowColor;
      }
    }
  }, {
    key: 'setActivatedButton',
    value: function setActivatedButton(index) {
      for (var i = 0; i < this.buttons.length; i++) {
        var button = this.buttons[i];
        var dot = button.firstChild;

        if (index === i) dot.style.opacity = 1;else dot.style.opacity = 0;
      }
    }
  }, {
    key: 'makeButtons',
    value: function makeButtons(numButtons) {
      if (numButtons > 1) {
        var buttonContainer = this.$el.querySelector('.btn-container');
        var space = 100 / (numButtons + 1);
        var pos = space;

        this.buttons = [];

        for (var i = 0; i < numButtons; i++) {
          var button = document.createElement("div");

          var dot = document.createElement("div");
          dot.style.backgroundColor = highColor;
          button.appendChild(dot);

          button.classList.add('btn-circle');
          button.style.left = pos + '%';
          button.addEventListener('touchstart', this.onTouchStart(i));

          buttonContainer.appendChild(button);
          this.buttons.push(button);

          pos += space;
        }

        this.setSelectedButton(0);
        this.setActivatedButton(0);
      }
    }
  }, {
    key: 'onTouchStart',
    value: function onTouchStart(index) {
      var _this2 = this;

      return function () {
        _this2.selectButton(index);
      };
    }
  }, {
    key: 'onMeasureStart',
    value: function onMeasureStart(audioTime, measureCount) {
      this.activateSelectedButton();
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

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (LoopInstrument.__proto__ || (0, _getPrototypeOf2.default)(LoopInstrument)).call(this, environment, options));

    _this3.view = null;
    _this3.loopTrack = environment.loopPlayer.addLoopTrack(options.loops);

    _this3.onAccelerationIncludingGravity = _this3.onAccelerationIncludingGravity.bind(_this3);
    _this3.onViewButton = _this3.onViewButton.bind(_this3);
    return _this3;
  }

  (0, _createClass3.default)(LoopInstrument, [{
    key: 'setControl',
    value: function setControl(name, value) {
      switch (name) {
        case 'cutoff':
          this.loopTrack.setCutoff(value);
          break;

        case 'select':
          this.loopTrack.setLoop(value);
          break;
      }
    }
  }, {
    key: 'showScreen',
    value: function showScreen() {
      var environment = this.environment;
      var view = new LoopView(environment.metricScheduler, this.onViewButton, this.options);
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
      var environment = this.environment;

      this.view.remove();

      // this.touchSurface.removeListener(...);
      // this.touchSurface.destroy();
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
    key: 'onViewButton',
    value: function onViewButton(index) {
      this.loopTrack.setLoop(index);
      this.environment.sendControl('select', index);
    }
  }]);
  return LoopInstrument;
}(_Instrument3.default);

_instrumentFactory2.default.addCtor('loop', LoopInstrument);

exports.default = LoopInstrument;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvb3BJbnN0cnVtZW50LmpzIl0sIm5hbWVzIjpbInRlbXBsYXRlIiwibG93Q29sb3IiLCJoaWdoQ29sb3IiLCJMb29wVmlldyIsIm1ldHJpY1NjaGVkdWxlciIsImJ1dHRvbkNhbGxiYWNrIiwib3B0aW9ucyIsInN5bWJvbCIsInByZXNlcnZlUGl4ZWxSYXRpbyIsInJhdGlvcyIsImN1cnNvclJlbmRlcmVyIiwibWVhc3VyZVJlbmRlcmVyIiwic2VsZWN0ZWRCdXR0b24iLCJhY3RpdmVCdXR0b24iLCJsZW5ndGgiLCJvbk1lYXN1cmVTdGFydCIsImJpbmQiLCJzZXRQcmVSZW5kZXIiLCJjdHgiLCJkdCIsInciLCJoIiwiY2xlYXJSZWN0IiwibWVhc3VyZU9wdGlvbnMiLCJ6b25lIiwiY29sb3IiLCJvcGFjaXR5IiwiYWRkUmVuZGVyZXIiLCJjdXJzb3JPcHRpb25zIiwidHlwZSIsImZhZGVPcGFjaXR5IiwibnVtWm9uZXMiLCJhY3RpdmUiLCJhZGRNZXRyb25vbWUiLCJtYWtlQnV0dG9ucyIsImxvb3BzIiwicmVtb3ZlTWV0cm9ub21lIiwic2V0Q29sb3IiLCJzZXRBY3RpdmF0ZWRCdXR0b24iLCJpbmRleCIsInNldFNlbGVjdGVkQnV0dG9uIiwiaSIsImJ1dHRvbnMiLCJidXR0b24iLCJzdHlsZSIsImJvcmRlckNvbG9yIiwiZG90IiwiZmlyc3RDaGlsZCIsIm51bUJ1dHRvbnMiLCJidXR0b25Db250YWluZXIiLCIkZWwiLCJxdWVyeVNlbGVjdG9yIiwic3BhY2UiLCJwb3MiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJiYWNrZ3JvdW5kQ29sb3IiLCJhcHBlbmRDaGlsZCIsImNsYXNzTGlzdCIsImFkZCIsImxlZnQiLCJhZGRFdmVudExpc3RlbmVyIiwib25Ub3VjaFN0YXJ0IiwicHVzaCIsInNlbGVjdEJ1dHRvbiIsImF1ZGlvVGltZSIsIm1lYXN1cmVDb3VudCIsImFjdGl2YXRlU2VsZWN0ZWRCdXR0b24iLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwiX2JvdW5kaW5nQ2xpZW50UmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIkxvb3BJbnN0cnVtZW50IiwiZW52aXJvbm1lbnQiLCJ2aWV3IiwibG9vcFRyYWNrIiwibG9vcFBsYXllciIsImFkZExvb3BUcmFjayIsIm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSIsIm9uVmlld0J1dHRvbiIsIm5hbWUiLCJ2YWx1ZSIsInNldEN1dG9mZiIsInNldExvb3AiLCJyZW5kZXIiLCJzaG93IiwiYXBwZW5kVG8iLCJzY3JlZW5Db250YWluZXIiLCJyZW1vdmUiLCJsYXN0Q3V0b2ZmIiwiSW5maW5pdHkiLCJtb3Rpb25JbnB1dCIsImFkZExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvdXRwdXQiLCJjb25uZWN0IiwiZGlzY29ubmVjdCIsImRhdGEiLCJhY2NYIiwiYWNjWSIsImFjY1oiLCJwaXRjaCIsIk1hdGgiLCJhdGFuMiIsInNxcnQiLCJQSSIsInJvbGwiLCJjdXRvZmYiLCJtYXgiLCJtaW4iLCJhYnMiLCJzZW5kQ29udHJvbCIsImFkZEN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSx5WEFBTjs7QUFnQkEsSUFBTUMsV0FBVyxTQUFqQjtBQUNBLElBQU1DLFlBQVksU0FBbEI7O0lBRU1DLFE7OztBQUNKLG9CQUFZQyxlQUFaLEVBQTZCQyxjQUE3QixFQUE2Q0MsT0FBN0MsRUFBc0Q7QUFBQTs7QUFBQSwwSUFDOUNOLFFBRDhDLEVBQ3BDO0FBQ2RPLGNBQVFELFFBQVFDO0FBREYsS0FEb0MsRUFHakQsRUFIaUQsRUFHN0M7QUFDTEMsMEJBQW9CLElBRGY7QUFFTEMsY0FBUTtBQUNOLHdCQUFnQixDQURWO0FBRU4sMkJBQW1CLENBRmI7QUFHTiwyQkFBbUI7QUFIYjtBQUZILEtBSDZDOztBQVlwRCxVQUFLTCxlQUFMLEdBQXVCQSxlQUF2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QWI7QUFDQSxVQUFNRyxPQUFPSCxLQUFLLENBQUwsQ0FBYjs7QUFFQSxVQUFNSSxRQUFRLElBQUlDLEtBQUtDLEtBQUwsQ0FBV0osSUFBWCxFQUFpQkcsS0FBS0UsSUFBTCxDQUFVSixPQUFPQSxJQUFQLEdBQWNGLE9BQU9BLElBQS9CLENBQWpCLENBQUosR0FBNkRJLEtBQUtHLEVBQWhGO0FBQ0EsVUFBTUMsT0FBTyxDQUFDLENBQUQsR0FBS0osS0FBS0MsS0FBTCxDQUFXTCxJQUFYLEVBQWlCSSxLQUFLRSxJQUFMLENBQVVMLE9BQU9BLElBQVAsR0FBY0MsT0FBT0EsSUFBL0IsQ0FBakIsQ0FBTCxHQUE4REUsS0FBS0csRUFBaEY7QUFDQSxVQUFNRSxTQUFTLE1BQU1MLEtBQUtNLEdBQUwsQ0FBUyxDQUFDLEdBQVYsRUFBZU4sS0FBS08sR0FBTCxDQUFTLEdBQVQsRUFBZVQsT0FBTyxJQUF0QixDQUFmLElBQStDLEdBQXBFOztBQUVBLFVBQUlFLEtBQUtRLEdBQUwsQ0FBU0gsU0FBUyxLQUFLbEIsVUFBdkIsSUFBcUMsSUFBekMsRUFBK0M7QUFDN0MsYUFBS0EsVUFBTCxHQUFrQmtCLE1BQWxCOztBQUVBLGFBQUtoQyxTQUFMLENBQWVPLFNBQWYsQ0FBeUJ5QixNQUF6QjtBQUNBLGFBQUtsQyxXQUFMLENBQWlCc0MsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUNKLE1BQXZDO0FBQ0Q7QUFDRjs7O2lDQUVZckUsSyxFQUFPO0FBQ2xCLFdBQUtxQyxTQUFMLENBQWVRLE9BQWYsQ0FBdUI3QyxLQUF2QjtBQUNBLFdBQUttQyxXQUFMLENBQWlCc0MsV0FBakIsQ0FBNkIsUUFBN0IsRUFBdUN6RSxLQUF2QztBQUNEOzs7OztBQUdILDRCQUFrQjBFLE9BQWxCLENBQTBCLE1BQTFCLEVBQWtDeEMsY0FBbEM7O2tCQUVlQSxjIiwiZmlsZSI6Ikxvb3BJbnN0cnVtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluc3RydW1lbnRGYWN0b3J5IGZyb20gJy4uL2luc3RydW1lbnRGYWN0b3J5JztcbmltcG9ydCBJbnN0cnVtZW50IGZyb20gJy4vSW5zdHJ1bWVudCc7XG5pbXBvcnQgeyBjbGllbnQsIENhbnZhc1ZpZXcgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgQ3Vyc29yUmVuZGVyZXIgZnJvbSAnLi9jaXJjdWxhci1yZW5kZXJlcnMvQ3Vyc29yUmVuZGVyZXInO1xuaW1wb3J0IE1lYXN1cmVzUmVuZGVyZXIgZnJvbSAnLi9jaXJjdWxhci1yZW5kZXJlcnMvTWVhc3VyZXNSZW5kZXJlcic7XG5cbmNvbnN0IHRlbXBsYXRlID0gYFxuICA8Y2FudmFzIGNsYXNzPVwiYmFja2dyb3VuZFwiPjwvY2FudmFzPlxuICA8ZGl2IGNsYXNzPVwiZm9yZWdyb3VuZCBmaXQtY29udGFpbmVyXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtbWlkZGxlXCI+XG4gICAgICA8JSBpZiAoc3ltYm9sKSB7ICU+XG4gICAgICA8cCBjbGFzcz1cImdyZWVrXCI+PCU9IHN5bWJvbCAlPjwvcD5cbiAgICAgIDwlIH0gJT5cblxuICAgICAgPGRpdiBjbGFzcz1cImJ0bi1jb250YWluZXJcIj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICA8L2Rpdj5cbmA7XG5cbmNvbnN0IGxvd0NvbG9yID0gJyMzRjNGM0YnO1xuY29uc3QgaGlnaENvbG9yID0gJyM3RjdGN0YnO1xuXG5jbGFzcyBMb29wVmlldyBleHRlbmRzIENhbnZhc1ZpZXcge1xuICBjb25zdHJ1Y3RvcihtZXRyaWNTY2hlZHVsZXIsIGJ1dHRvbkNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgc3VwZXIodGVtcGxhdGUsIHtcbiAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wsXG4gICAgfSwge30sIHtcbiAgICAgIHByZXNlcnZlUGl4ZWxSYXRpbzogdHJ1ZSxcbiAgICAgIHJhdGlvczoge1xuICAgICAgICAnLnNlY3Rpb24tdG9wJzogMCxcbiAgICAgICAgJy5zZWN0aW9uLWNlbnRlcic6IDEsXG4gICAgICAgICcuc2VjdGlvbi1ib3R0b20nOiAwLFxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIgPSBtZXRyaWNTY2hlZHVsZXI7XG4gICAgdGhpcy5idXR0b25DYWxsYmFjayA9IGJ1dHRvbkNhbGxiYWNrO1xuXG4gICAgdGhpcy5jdXJzb3JSZW5kZXJlciA9IG51bGw7XG4gICAgdGhpcy5tZWFzdXJlUmVuZGVyZXIgPSBudWxsO1xuXG4gICAgdGhpcy5zZWxlY3RlZEJ1dHRvbiA9IDA7XG4gICAgdGhpcy5hY3RpdmVCdXR0b24gPSAwO1xuXG4gICAgdGhpcy5sZW5ndGggPSBvcHRpb25zLmxlbmd0aDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgdGhpcy5vbk1lYXN1cmVTdGFydCA9IHRoaXMub25NZWFzdXJlU3RhcnQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5zZXRQcmVSZW5kZXIoKGN0eCwgZHQsIHcsIGgpID0+IGN0eC5jbGVhclJlY3QoMCwgMCwgdywgaCkpO1xuXG4gICAgY29uc3QgbWVhc3VyZU9wdGlvbnMgPSB7XG4gICAgICB6b25lOiAwLFxuICAgICAgY29sb3I6IGhpZ2hDb2xvcixcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgfTtcblxuICAgIGNvbnN0IG1lYXN1cmVSZW5kZXJlciA9IG5ldyBNZWFzdXJlc1JlbmRlcmVyKHRoaXMubGVuZ3RoLCBtZWFzdXJlT3B0aW9ucyk7XG4gICAgdGhpcy5hZGRSZW5kZXJlcihtZWFzdXJlUmVuZGVyZXIpO1xuICAgIHRoaXMubWVhc3VyZVJlbmRlcmVyID0gbWVhc3VyZVJlbmRlcmVyO1xuXG4gICAgY29uc3QgY3Vyc29yT3B0aW9ucyA9IHtcbiAgICAgIHR5cGU6ICdjdXJzb3InLFxuICAgICAgY29sb3I6ICcjMDAwMDAwJyxcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBmYWRlT3BhY2l0eTogMC4wMixcbiAgICAgIG51bVpvbmVzOiAxLFxuICAgICAgYWN0aXZlOiBmYWxzZSwgLy8gZGVmaW5lIGlmIGNhbiB0cmlnZ2VyIGFjdGlvbnMgb3Igbm90LCBpZiB0cnVlIHNob3VsZCBkZWZpbmUgYW4gaWRcbiAgICB9O1xuXG4gICAgY29uc3QgY3Vyc29yUmVuZGVyZXIgPSBuZXcgQ3Vyc29yUmVuZGVyZXIodGhpcy5sZW5ndGgsIGN1cnNvck9wdGlvbnMsIHRoaXMubWV0cmljU2NoZWR1bGVyKTtcbiAgICB0aGlzLmFkZFJlbmRlcmVyKGN1cnNvclJlbmRlcmVyKTtcbiAgICB0aGlzLmN1cnNvclJlbmRlcmVyID0gY3Vyc29yUmVuZGVyZXI7XG5cbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5hZGRNZXRyb25vbWUodGhpcy5vbk1lYXN1cmVTdGFydCwgMSwgMSwgMSwgMCwgdHJ1ZSk7XG4gICAgdGhpcy5tYWtlQnV0dG9ucyh0aGlzLm9wdGlvbnMubG9vcHMubGVuZ3RoKTtcbiAgfVxuXG4gIHJlbW92ZSgpIHtcbiAgICBzdXBlci5yZW1vdmUoKTtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5yZW1vdmVNZXRyb25vbWUodGhpcy5vbk1lYXN1cmVTdGFydCk7XG4gIH1cblxuICBhY3RpdmF0ZVNlbGVjdGVkQnV0dG9uKCkge1xuICAgIGNvbnN0IHNlbGVjdGVkQnV0dG9uID0gdGhpcy5zZWxlY3RlZEJ1dHRvbjtcblxuICAgIGlmIChzZWxlY3RlZEJ1dHRvbiAhPT0gdGhpcy5hY3RpdmVCdXR0b24pIHtcbiAgICAgIHRoaXMuYWN0aXZlQnV0dG9uID0gc2VsZWN0ZWRCdXR0b247XG4gICAgICB0aGlzLm1lYXN1cmVSZW5kZXJlci5zZXRDb2xvcihoaWdoQ29sb3IpO1xuICAgICAgdGhpcy5zZXRBY3RpdmF0ZWRCdXR0b24oc2VsZWN0ZWRCdXR0b24pO1xuICAgIH1cbiAgfVxuXG4gIHNlbGVjdEJ1dHRvbihpbmRleCkge1xuICAgIGlmIChpbmRleCAhPT0gdGhpcy5zZWxlY3RlZEJ1dHRvbikge1xuICAgICAgdGhpcy5zZWxlY3RlZEJ1dHRvbiA9IGluZGV4O1xuICAgICAgdGhpcy5zZXRTZWxlY3RlZEJ1dHRvbihpbmRleCk7XG4gICAgICB0aGlzLm1lYXN1cmVSZW5kZXJlci5zZXRDb2xvcihsb3dDb2xvcik7XG4gICAgICB0aGlzLmJ1dHRvbkNhbGxiYWNrKGluZGV4KTtcbiAgICB9XG4gIH1cblxuICBzZXRTZWxlY3RlZEJ1dHRvbihpbmRleCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5idXR0b25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBidXR0b24gPSB0aGlzLmJ1dHRvbnNbaV07XG5cbiAgICAgIGlmIChpbmRleCA9PT0gaSlcbiAgICAgICAgYnV0dG9uLnN0eWxlLmJvcmRlckNvbG9yID0gaGlnaENvbG9yO1xuICAgICAgZWxzZVxuICAgICAgICBidXR0b24uc3R5bGUuYm9yZGVyQ29sb3IgPSBsb3dDb2xvcjtcbiAgICB9XG4gIH1cblxuICBzZXRBY3RpdmF0ZWRCdXR0b24oaW5kZXgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnV0dG9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYnV0dG9uID0gdGhpcy5idXR0b25zW2ldO1xuICAgICAgY29uc3QgZG90ID0gYnV0dG9uLmZpcnN0Q2hpbGQ7XG5cbiAgICAgIGlmIChpbmRleCA9PT0gaSlcbiAgICAgICAgZG90LnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgZWxzZVxuICAgICAgICBkb3Quc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfVxuICB9XG5cbiAgbWFrZUJ1dHRvbnMobnVtQnV0dG9ucykge1xuICAgIGlmIChudW1CdXR0b25zID4gMSkge1xuICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmJ0bi1jb250YWluZXInKTtcbiAgICAgIGNvbnN0IHNwYWNlID0gMTAwIC8gKG51bUJ1dHRvbnMgKyAxKTtcbiAgICAgIGxldCBwb3MgPSBzcGFjZTtcblxuICAgICAgdGhpcy5idXR0b25zID0gW107XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQnV0dG9uczsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICAgICAgY29uc3QgZG90ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZG90LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGhpZ2hDb2xvcjtcbiAgICAgICAgYnV0dG9uLmFwcGVuZENoaWxkKGRvdCk7XG5cbiAgICAgICAgYnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2J0bi1jaXJjbGUnKTtcbiAgICAgICAgYnV0dG9uLnN0eWxlLmxlZnQgPSBgJHtwb3N9JWA7XG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQoaSkpO1xuXG4gICAgICAgIGJ1dHRvbkNvbnRhaW5lci5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgICAgICB0aGlzLmJ1dHRvbnMucHVzaChidXR0b24pO1xuXG4gICAgICAgIHBvcyArPSBzcGFjZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTZWxlY3RlZEJ1dHRvbigwKTtcbiAgICAgIHRoaXMuc2V0QWN0aXZhdGVkQnV0dG9uKDApO1xuICAgIH1cbiAgfVxuXG4gIG9uVG91Y2hTdGFydChpbmRleCkge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB0aGlzLnNlbGVjdEJ1dHRvbihpbmRleCk7XG4gICAgfTtcbiAgfVxuXG4gIG9uTWVhc3VyZVN0YXJ0KGF1ZGlvVGltZSwgbWVhc3VyZUNvdW50KSB7XG4gICAgdGhpcy5hY3RpdmF0ZVNlbGVjdGVkQnV0dG9uKCk7XG4gIH1cblxuICBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbikge1xuICAgIHN1cGVyLm9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKTtcbiAgICB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QgPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxufVxuXG5jbGFzcyBMb29wSW5zdHJ1bWVudCBleHRlbmRzIEluc3RydW1lbnQge1xuICBjb25zdHJ1Y3RvcihlbnZpcm9ubWVudCwgb3B0aW9ucykge1xuICAgIHN1cGVyKGVudmlyb25tZW50LCBvcHRpb25zKTtcblxuICAgIHRoaXMudmlldyA9IG51bGw7XG4gICAgdGhpcy5sb29wVHJhY2sgPSBlbnZpcm9ubWVudC5sb29wUGxheWVyLmFkZExvb3BUcmFjayhvcHRpb25zLmxvb3BzKTtcblxuICAgIHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5ID0gdGhpcy5vbkFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uVmlld0J1dHRvbiA9IHRoaXMub25WaWV3QnV0dG9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBzZXRDb250cm9sKG5hbWUsIHZhbHVlKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICBjYXNlICdjdXRvZmYnOlxuICAgICAgICB0aGlzLmxvb3BUcmFjay5zZXRDdXRvZmYodmFsdWUpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgICAgdGhpcy5sb29wVHJhY2suc2V0TG9vcCh2YWx1ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHNob3dTY3JlZW4oKSB7XG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50O1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgTG9vcFZpZXcoZW52aXJvbm1lbnQubWV0cmljU2NoZWR1bGVyLCB0aGlzLm9uVmlld0J1dHRvbiwgdGhpcy5vcHRpb25zKTtcbiAgICB2aWV3LnJlbmRlcigpO1xuICAgIHZpZXcuc2hvdygpO1xuICAgIHZpZXcuYXBwZW5kVG8oZW52aXJvbm1lbnQuc2NyZWVuQ29udGFpbmVyKTtcbiAgICB0aGlzLnZpZXcgPSB2aWV3O1xuXG4gICAgLy8gY29uc3QgdG91Y2hTdXJmYWNlID0gbmV3IHNvdW5kd29ya3MuVG91Y2hTdXJmYWNlKHZpZXcuJGVsLCB7IG5vcm1hbGl6ZUNvb3JkaW5hdGVzOiBmYWxzZSB9KTtcbiAgICAvLyB0b3VjaFN1cmZhY2UuYWRkTGlzdGVuZXIoLi4uKTtcbiAgICAvLyB0aGlzLnRvdWNoU3VyZmFjZSA9IHRvdWNoU3VyZmFjZTtcbiAgfVxuXG4gIGhpZGVTY3JlZW4oKSB7XG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50O1xuXG4gICAgdGhpcy52aWV3LnJlbW92ZSgpO1xuXG4gICAgLy8gdGhpcy50b3VjaFN1cmZhY2UucmVtb3ZlTGlzdGVuZXIoLi4uKTtcbiAgICAvLyB0aGlzLnRvdWNoU3VyZmFjZS5kZXN0cm95KCk7XG4gIH1cblxuICBzdGFydFNlbnNvcnMoKSB7XG4gICAgdGhpcy5sYXN0Q3V0b2ZmID0gLUluZmluaXR5O1xuXG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50O1xuICAgIGVudmlyb25tZW50Lm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgdGhpcy5vbkFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpO1xuICB9XG5cbiAgc3RvcFNlbnNvcnMoKSB7XG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSB0aGlzLmVudmlyb25tZW50O1xuICAgIGVudmlyb25tZW50Lm1vdGlvbklucHV0LnJlbW92ZUxpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgdGhpcy5vbkFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpO1xuICB9XG5cbiAgc3RhcnRTb3VuZCgpIHtcbiAgICB0aGlzLmxvb3BUcmFjay5hY3RpdmUgPSB0cnVlO1xuICB9XG5cbiAgc3RvcFNvdW5kKCkge1xuICAgIHRoaXMubG9vcFRyYWNrLmFjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgY29ubmVjdChvdXRwdXQpIHtcbiAgICB0aGlzLmxvb3BUcmFjay5jb25uZWN0KG91dHB1dCk7XG4gIH1cblxuICBkaXNjb25uZWN0KG91dHB1dCkge1xuICAgIHRoaXMubG9vcFRyYWNrLmRpc2Nvbm5lY3Qob3V0cHV0KTtcbiAgfVxuXG4gIG9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eShkYXRhKSB7XG4gICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgY29uc3QgYWNjWSA9IGRhdGFbMV07XG4gICAgY29uc3QgYWNjWiA9IGRhdGFbMl07XG5cbiAgICBjb25zdCBwaXRjaCA9IDIgKiBNYXRoLmF0YW4yKGFjY1ksIE1hdGguc3FydChhY2NaICogYWNjWiArIGFjY1ggKiBhY2NYKSkgLyBNYXRoLlBJO1xuICAgIGNvbnN0IHJvbGwgPSAtMiAqIE1hdGguYXRhbjIoYWNjWCwgTWF0aC5zcXJ0KGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opKSAvIE1hdGguUEk7XG4gICAgY29uc3QgY3V0b2ZmID0gMC41ICsgTWF0aC5tYXgoLTAuOCwgTWF0aC5taW4oMC44LCAoYWNjWiAvIDkuODEpKSkgLyAxLjY7XG5cbiAgICBpZiAoTWF0aC5hYnMoY3V0b2ZmIC0gdGhpcy5sYXN0Q3V0b2ZmKSA+IDAuMDEpIHtcbiAgICAgIHRoaXMubGFzdEN1dG9mZiA9IGN1dG9mZjtcblxuICAgICAgdGhpcy5sb29wVHJhY2suc2V0Q3V0b2ZmKGN1dG9mZik7XG4gICAgICB0aGlzLmVudmlyb25tZW50LnNlbmRDb250cm9sKCdjdXRvZmYnLCBjdXRvZmYpO1xuICAgIH1cbiAgfVxuXG4gIG9uVmlld0J1dHRvbihpbmRleCkge1xuICAgIHRoaXMubG9vcFRyYWNrLnNldExvb3AoaW5kZXgpO1xuICAgIHRoaXMuZW52aXJvbm1lbnQuc2VuZENvbnRyb2woJ3NlbGVjdCcsIGluZGV4KTtcbiAgfVxufVxuXG5pbnN0cnVtZW50RmFjdG9yeS5hZGRDdG9yKCdsb29wJywgTG9vcEluc3RydW1lbnQpO1xuXG5leHBvcnQgZGVmYXVsdCBMb29wSW5zdHJ1bWVudDtcbiJdfQ==