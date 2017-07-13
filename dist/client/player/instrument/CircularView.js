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

var _client = require('soundworks/client');

var _CursorRenderer = require('./circular-renderers/CursorRenderer');

var _CursorRenderer2 = _interopRequireDefault(_CursorRenderer);

var _MeasuresRenderer = require('./circular-renderers/MeasuresRenderer');

var _MeasuresRenderer2 = _interopRequireDefault(_MeasuresRenderer);

var _PatternRenderer = require('./circular-renderers/PatternRenderer');

var _PatternRenderer2 = _interopRequireDefault(_PatternRenderer);

var _SegmentRenderer = require('./circular-renderers/SegmentRenderer');

var _SegmentRenderer2 = _interopRequireDefault(_SegmentRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var template = '\n  <canvas class="background"></canvas>\n  <div class="foreground fit-container">\n    <div class="section-top"></div>\n    <div class="section-center flex-middle">\n      <% if (!hideSymbol) { %>\n      <p class="greek"><%= symbol %></p>\n      <% } %>\n    </div>\n    <div class="section-bottom"></div>\n  </div>\n';

var CircularView = function (_CanvasView) {
  (0, _inherits3.default)(CircularView, _CanvasView);

  function CircularView(commonConfig, instrumentConfig, metricScheduler) {
    (0, _classCallCheck3.default)(this, CircularView);

    var content = {
      symbol: '&#' + (instrumentConfig.playerId + 945) + ';',
      hideSymbol: instrumentConfig.hideSymbol
    };
    var options = {
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0.2,
        '.section-center': 0.6,
        '.section-bottom': 0.2
      }
    };

    var _this = (0, _possibleConstructorReturn3.default)(this, (CircularView.__proto__ || (0, _getPrototypeOf2.default)(CircularView)).call(this, template, content, {}, options));

    _this.commonConfig = commonConfig;
    _this.instrumentConfig = instrumentConfig;
    _this.metricScheduler = metricScheduler;

    // clickable renderers
    // this.activeRendererList = [];
    // this.activeRendererMap = {};

    // events
    // const events = client.platform.interaction === 'touch' ?
    //   { touchstart: this.onTouchStart.bind(this) } :
    //   { mousedown: this.onMouseDown.bind(this) };

    // this.installEvents(events);

    // this.actionListeners = new Set();
    // this.onStateChange = this.onStateChange.bind(this);
    return _this;
  }

  (0, _createClass3.default)(CircularView, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.setPreRender(function (ctx, dt, w, h) {
        return ctx.clearRect(0, 0, w, h);
      });

      var displayLength = this.instrumentConfig.length;

      this.instrumentConfig.renderers.forEach(function (config) {
        var renderer = null;

        switch (config.type) {
          case 'cursor':
            renderer = new _CursorRenderer2.default(displayLength, config, _this2.metricScheduler);
            break;
          case 'pattern':
            renderer = new _PatternRenderer2.default(displayLength, config);
            break;
          case 'measures':
            renderer = new _MeasuresRenderer2.default(displayLength, config);
            break;
          case 'segment':
            renderer = new _SegmentRenderer2.default(displayLength, config);
            break;
        }

        if (renderer !== null) {
          if (config.type === 'cursor') {
            var nextMeasurePosition = Math.ceil(_this2.metricScheduler.currentPosition);
            _this2.metricScheduler.addEvent(function () {
              return _this2.addRenderer(renderer);
            }, nextMeasurePosition);
          } else {
            _this2.addRenderer(renderer);
          }

          // if (config.active === true) {
          //   if (!config.id)
          //     throw new Error('No id defined for active renderer');

          //   const id = config.id;
          //   this.activeRendererList.push({ id, renderer }); // to kepp the right order
          //   this.activeRendererMap[id] = renderer;
          // }
        }
      });
    }
  }, {
    key: 'onResize',
    value: function onResize(width, height, orientation) {
      (0, _get3.default)(CircularView.prototype.__proto__ || (0, _getPrototypeOf2.default)(CircularView.prototype), 'onResize', this).call(this, width, height, orientation);
      this._boundingClientRect = this.$el.getBoundingClientRect();
    }

    /*
    // no interactions for now
    onTouchStart(e) {
      const touch = e.touches[0];
      this._handleEvent(touch);
    }
     onMouseDown(e) {
      this._handleEvent(e);
    }
     _handleEvent(e) {
      const { clientX, clientY } = e;
      const x = (clientX - this._boundingClientRect.left) * this.pixelRatio;
      const y = (clientY - this._boundingClientRect.top) * this.pixelRatio;
       // hit test - backward, test first elements that are on top
      for (let i = this.segmentRendererList.length - 1; i >= 0; i--) {
        const { renderer, id } = this.segmentRendererList[i];
        const imageData = renderer.cachedCtx.getImageData(x, y, 1, 1);
        const alpha = imageData.data[3];
         if (alpha !== 0) {
          this.triggerAction({
            name: 'screen-interaction',
            segmentId: id,
          });
           break; // don't search further...
        }
      }
    }
     addActionListener(callback) {
      this.actionListeners.add(callback);
    }
     removeActionListener() {
      this.actionListeners.delete(callback);
    }
     removeAllActionListener() {
      this.actionListeners.clear();
    }
     triggerAction(payload) {
      this.actionListeners.forEach(callback => callback(payload));
    }
     onStateChange(state) {
      const renderer = this.segmentRendererMap[state.id];
      renderer.updateState(state);
    }
    */

  }]);
  return CircularView;
}(_client.CanvasView);

exports.default = CircularView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNpcmN1bGFyVmlldy5qcyJdLCJuYW1lcyI6WyJ0ZW1wbGF0ZSIsIkNpcmN1bGFyVmlldyIsImNvbW1vbkNvbmZpZyIsImluc3RydW1lbnRDb25maWciLCJtZXRyaWNTY2hlZHVsZXIiLCJjb250ZW50Iiwic3ltYm9sIiwicGxheWVySWQiLCJoaWRlU3ltYm9sIiwib3B0aW9ucyIsInByZXNlcnZlUGl4ZWxSYXRpbyIsInJhdGlvcyIsInNldFByZVJlbmRlciIsImN0eCIsImR0IiwidyIsImgiLCJjbGVhclJlY3QiLCJkaXNwbGF5TGVuZ3RoIiwibGVuZ3RoIiwicmVuZGVyZXJzIiwiZm9yRWFjaCIsImNvbmZpZyIsInJlbmRlcmVyIiwidHlwZSIsIm5leHRNZWFzdXJlUG9zaXRpb24iLCJNYXRoIiwiY2VpbCIsImN1cnJlbnRQb3NpdGlvbiIsImFkZEV2ZW50IiwiYWRkUmVuZGVyZXIiLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwiX2JvdW5kaW5nQ2xpZW50UmVjdCIsIiRlbCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLDJVQUFOOztJQWFNQyxZOzs7QUFDSix3QkFBWUMsWUFBWixFQUEwQkMsZ0JBQTFCLEVBQTRDQyxlQUE1QyxFQUE2RDtBQUFBOztBQUMzRCxRQUFNQyxVQUFVO0FBQ2RDLHNCQUFhSCxpQkFBaUJJLFFBQWpCLEdBQTRCLEdBQXpDLE9BRGM7QUFFZEMsa0JBQVlMLGlCQUFpQks7QUFGZixLQUFoQjtBQUlBLFFBQU1DLFVBQVU7QUFDZEMsMEJBQW9CLElBRE47QUFFZEMsY0FBUTtBQUNOLHdCQUFnQixHQURWO0FBRU4sMkJBQW1CLEdBRmI7QUFHTiwyQkFBbUI7QUFIYjtBQUZNLEtBQWhCOztBQUwyRCxrSkFjckRYLFFBZHFELEVBYzNDSyxPQWQyQyxFQWNsQyxFQWRrQyxFQWM5QkksT0FkOEI7O0FBZ0IzRCxVQUFLUCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFVBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDQSxVQUFLQyxlQUFMLEdBQXVCQSxlQUF2Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQWhDMkQ7QUFpQzVEOzs7OzJCQUVNO0FBQUE7O0FBQ0wsV0FBS1EsWUFBTCxDQUFrQixVQUFDQyxHQUFELEVBQU1DLEVBQU4sRUFBVUMsQ0FBVixFQUFhQyxDQUFiO0FBQUEsZUFBbUJILElBQUlJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQW9CRixDQUFwQixFQUF1QkMsQ0FBdkIsQ0FBbkI7QUFBQSxPQUFsQjs7QUFFQSxVQUFNRSxnQkFBZ0IsS0FBS2YsZ0JBQUwsQ0FBc0JnQixNQUE1Qzs7QUFFQSxXQUFLaEIsZ0JBQUwsQ0FBc0JpQixTQUF0QixDQUFnQ0MsT0FBaEMsQ0FBd0MsVUFBQ0MsTUFBRCxFQUFZO0FBQ2xELFlBQUlDLFdBQVcsSUFBZjs7QUFFQSxnQkFBUUQsT0FBT0UsSUFBZjtBQUNFLGVBQUssUUFBTDtBQUNFRCx1QkFBVyw2QkFBbUJMLGFBQW5CLEVBQWtDSSxNQUFsQyxFQUEwQyxPQUFLbEIsZUFBL0MsQ0FBWDtBQUNBO0FBQ0YsZUFBSyxTQUFMO0FBQ0VtQix1QkFBVyw4QkFBb0JMLGFBQXBCLEVBQW1DSSxNQUFuQyxDQUFYO0FBQ0E7QUFDRixlQUFLLFVBQUw7QUFDRUMsdUJBQVcsK0JBQXFCTCxhQUFyQixFQUFvQ0ksTUFBcEMsQ0FBWDtBQUNBO0FBQ0YsZUFBSyxTQUFMO0FBQ0VDLHVCQUFXLDhCQUFvQkwsYUFBcEIsRUFBbUNJLE1BQW5DLENBQVg7QUFDQTtBQVpKOztBQWVBLFlBQUlDLGFBQWEsSUFBakIsRUFBdUI7QUFDckIsY0FBSUQsT0FBT0UsSUFBUCxLQUFnQixRQUFwQixFQUE4QjtBQUM1QixnQkFBTUMsc0JBQXNCQyxLQUFLQyxJQUFMLENBQVUsT0FBS3ZCLGVBQUwsQ0FBcUJ3QixlQUEvQixDQUE1QjtBQUNBLG1CQUFLeEIsZUFBTCxDQUFxQnlCLFFBQXJCLENBQThCO0FBQUEscUJBQU0sT0FBS0MsV0FBTCxDQUFpQlAsUUFBakIsQ0FBTjtBQUFBLGFBQTlCLEVBQWdFRSxtQkFBaEU7QUFDRCxXQUhELE1BR087QUFDTCxtQkFBS0ssV0FBTCxDQUFpQlAsUUFBakI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDRDtBQUNGLE9BbkNEO0FBb0NEOzs7NkJBRVFRLEssRUFBT0MsTSxFQUFRQyxXLEVBQWE7QUFDbkMsaUpBQWVGLEtBQWYsRUFBc0JDLE1BQXRCLEVBQThCQyxXQUE5QjtBQUNBLFdBQUtDLG1CQUFMLEdBQTJCLEtBQUtDLEdBQUwsQ0FBU0MscUJBQVQsRUFBM0I7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkF3RGFuQyxZIiwiZmlsZSI6IkNpcmN1bGFyVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNsaWVudCwgQ2FudmFzVmlldyB9IGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCBDdXJzb3JSZW5kZXJlciBmcm9tICcuL2NpcmN1bGFyLXJlbmRlcmVycy9DdXJzb3JSZW5kZXJlcic7XG5pbXBvcnQgTWVhc3VyZXNSZW5kZXJlciBmcm9tICcuL2NpcmN1bGFyLXJlbmRlcmVycy9NZWFzdXJlc1JlbmRlcmVyJztcbmltcG9ydCBQYXR0ZXJuUmVuZGVyZXIgZnJvbSAnLi9jaXJjdWxhci1yZW5kZXJlcnMvUGF0dGVyblJlbmRlcmVyJztcbmltcG9ydCBTZWdtZW50UmVuZGVyZXIgZnJvbSAnLi9jaXJjdWxhci1yZW5kZXJlcnMvU2VnbWVudFJlbmRlcmVyJztcblxuY29uc3QgdGVtcGxhdGUgPSBgXG4gIDxjYW52YXMgY2xhc3M9XCJiYWNrZ3JvdW5kXCI+PC9jYW52YXM+XG4gIDxkaXYgY2xhc3M9XCJmb3JlZ3JvdW5kIGZpdC1jb250YWluZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3BcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1taWRkbGVcIj5cbiAgICAgIDwlIGlmICghaGlkZVN5bWJvbCkgeyAlPlxuICAgICAgPHAgY2xhc3M9XCJncmVla1wiPjwlPSBzeW1ib2wgJT48L3A+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG4gIDwvZGl2PlxuYDtcblxuY2xhc3MgQ2lyY3VsYXJWaWV3IGV4dGVuZHMgQ2FudmFzVmlldyB7XG4gIGNvbnN0cnVjdG9yKGNvbW1vbkNvbmZpZywgaW5zdHJ1bWVudENvbmZpZywgbWV0cmljU2NoZWR1bGVyKSB7XG4gICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgIHN5bWJvbDogYCYjJHtpbnN0cnVtZW50Q29uZmlnLnBsYXllcklkICsgOTQ1fTtgLFxuICAgICAgaGlkZVN5bWJvbDogaW5zdHJ1bWVudENvbmZpZy5oaWRlU3ltYm9sLFxuICAgIH07XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIHByZXNlcnZlUGl4ZWxSYXRpbzogdHJ1ZSxcbiAgICAgIHJhdGlvczoge1xuICAgICAgICAnLnNlY3Rpb24tdG9wJzogMC4yLFxuICAgICAgICAnLnNlY3Rpb24tY2VudGVyJzogMC42LFxuICAgICAgICAnLnNlY3Rpb24tYm90dG9tJzogMC4yLFxuICAgICAgfVxuICAgIH07XG5cbiAgICBzdXBlcih0ZW1wbGF0ZSwgY29udGVudCwge30sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5jb21tb25Db25maWcgPSBjb21tb25Db25maWc7XG4gICAgdGhpcy5pbnN0cnVtZW50Q29uZmlnID0gaW5zdHJ1bWVudENvbmZpZztcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcblxuICAgIC8vIGNsaWNrYWJsZSByZW5kZXJlcnNcbiAgICAvLyB0aGlzLmFjdGl2ZVJlbmRlcmVyTGlzdCA9IFtdO1xuICAgIC8vIHRoaXMuYWN0aXZlUmVuZGVyZXJNYXAgPSB7fTtcblxuICAgIC8vIGV2ZW50c1xuICAgIC8vIGNvbnN0IGV2ZW50cyA9IGNsaWVudC5wbGF0Zm9ybS5pbnRlcmFjdGlvbiA9PT0gJ3RvdWNoJyA/XG4gICAgLy8gICB7IHRvdWNoc3RhcnQ6IHRoaXMub25Ub3VjaFN0YXJ0LmJpbmQodGhpcykgfSA6XG4gICAgLy8gICB7IG1vdXNlZG93bjogdGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpIH07XG5cbiAgICAvLyB0aGlzLmluc3RhbGxFdmVudHMoZXZlbnRzKTtcblxuICAgIC8vIHRoaXMuYWN0aW9uTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIC8vIHRoaXMub25TdGF0ZUNoYW5nZSA9IHRoaXMub25TdGF0ZUNoYW5nZS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnNldFByZVJlbmRlcigoY3R4LCBkdCwgdywgaCkgPT4gY3R4LmNsZWFyUmVjdCgwLCAwLCB3LCBoKSk7XG5cbiAgICBjb25zdCBkaXNwbGF5TGVuZ3RoID0gdGhpcy5pbnN0cnVtZW50Q29uZmlnLmxlbmd0aDtcblxuICAgIHRoaXMuaW5zdHJ1bWVudENvbmZpZy5yZW5kZXJlcnMuZm9yRWFjaCgoY29uZmlnKSA9PiB7XG4gICAgICBsZXQgcmVuZGVyZXIgPSBudWxsO1xuXG4gICAgICBzd2l0Y2ggKGNvbmZpZy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2N1cnNvcic6XG4gICAgICAgICAgcmVuZGVyZXIgPSBuZXcgQ3Vyc29yUmVuZGVyZXIoZGlzcGxheUxlbmd0aCwgY29uZmlnLCB0aGlzLm1ldHJpY1NjaGVkdWxlcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BhdHRlcm4nOlxuICAgICAgICAgIHJlbmRlcmVyID0gbmV3IFBhdHRlcm5SZW5kZXJlcihkaXNwbGF5TGVuZ3RoLCBjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtZWFzdXJlcyc6XG4gICAgICAgICAgcmVuZGVyZXIgPSBuZXcgTWVhc3VyZXNSZW5kZXJlcihkaXNwbGF5TGVuZ3RoLCBjb25maWcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZWdtZW50JzpcbiAgICAgICAgICByZW5kZXJlciA9IG5ldyBTZWdtZW50UmVuZGVyZXIoZGlzcGxheUxlbmd0aCwgY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlbmRlcmVyICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChjb25maWcudHlwZSA9PT0gJ2N1cnNvcicpIHtcbiAgICAgICAgICBjb25zdCBuZXh0TWVhc3VyZVBvc2l0aW9uID0gTWF0aC5jZWlsKHRoaXMubWV0cmljU2NoZWR1bGVyLmN1cnJlbnRQb3NpdGlvbik7XG4gICAgICAgICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIuYWRkRXZlbnQoKCkgPT4gdGhpcy5hZGRSZW5kZXJlcihyZW5kZXJlciksIG5leHRNZWFzdXJlUG9zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkUmVuZGVyZXIocmVuZGVyZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgKGNvbmZpZy5hY3RpdmUgPT09IHRydWUpIHtcbiAgICAgICAgLy8gICBpZiAoIWNvbmZpZy5pZClcbiAgICAgICAgLy8gICAgIHRocm93IG5ldyBFcnJvcignTm8gaWQgZGVmaW5lZCBmb3IgYWN0aXZlIHJlbmRlcmVyJyk7XG5cbiAgICAgICAgLy8gICBjb25zdCBpZCA9IGNvbmZpZy5pZDtcbiAgICAgICAgLy8gICB0aGlzLmFjdGl2ZVJlbmRlcmVyTGlzdC5wdXNoKHsgaWQsIHJlbmRlcmVyIH0pOyAvLyB0byBrZXBwIHRoZSByaWdodCBvcmRlclxuICAgICAgICAvLyAgIHRoaXMuYWN0aXZlUmVuZGVyZXJNYXBbaWRdID0gcmVuZGVyZXI7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUod2lkdGgsIGhlaWdodCwgb3JpZW50YXRpb24pO1xuICAgIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdCA9IHRoaXMuJGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9XG5cbiAgLypcbiAgLy8gbm8gaW50ZXJhY3Rpb25zIGZvciBub3dcbiAgb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBjb25zdCB0b3VjaCA9IGUudG91Y2hlc1swXTtcbiAgICB0aGlzLl9oYW5kbGVFdmVudCh0b3VjaCk7XG4gIH1cblxuICBvbk1vdXNlRG93bihlKSB7XG4gICAgdGhpcy5faGFuZGxlRXZlbnQoZSk7XG4gIH1cblxuICBfaGFuZGxlRXZlbnQoZSkge1xuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZTtcbiAgICBjb25zdCB4ID0gKGNsaWVudFggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdCkgKiB0aGlzLnBpeGVsUmF0aW87XG4gICAgY29uc3QgeSA9IChjbGllbnRZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcCkgKiB0aGlzLnBpeGVsUmF0aW87XG5cbiAgICAvLyBoaXQgdGVzdCAtIGJhY2t3YXJkLCB0ZXN0IGZpcnN0IGVsZW1lbnRzIHRoYXQgYXJlIG9uIHRvcFxuICAgIGZvciAobGV0IGkgPSB0aGlzLnNlZ21lbnRSZW5kZXJlckxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHsgcmVuZGVyZXIsIGlkIH0gPSB0aGlzLnNlZ21lbnRSZW5kZXJlckxpc3RbaV07XG4gICAgICBjb25zdCBpbWFnZURhdGEgPSByZW5kZXJlci5jYWNoZWRDdHguZ2V0SW1hZ2VEYXRhKHgsIHksIDEsIDEpO1xuICAgICAgY29uc3QgYWxwaGEgPSBpbWFnZURhdGEuZGF0YVszXTtcblxuICAgICAgaWYgKGFscGhhICE9PSAwKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlckFjdGlvbih7XG4gICAgICAgICAgbmFtZTogJ3NjcmVlbi1pbnRlcmFjdGlvbicsXG4gICAgICAgICAgc2VnbWVudElkOiBpZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYnJlYWs7IC8vIGRvbid0IHNlYXJjaCBmdXJ0aGVyLi4uXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkQWN0aW9uTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLmFjdGlvbkxpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmVtb3ZlQWN0aW9uTGlzdGVuZXIoKSB7XG4gICAgdGhpcy5hY3Rpb25MaXN0ZW5lcnMuZGVsZXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJlbW92ZUFsbEFjdGlvbkxpc3RlbmVyKCkge1xuICAgIHRoaXMuYWN0aW9uTGlzdGVuZXJzLmNsZWFyKCk7XG4gIH1cblxuICB0cmlnZ2VyQWN0aW9uKHBheWxvYWQpIHtcbiAgICB0aGlzLmFjdGlvbkxpc3RlbmVycy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKHBheWxvYWQpKTtcbiAgfVxuXG4gIG9uU3RhdGVDaGFuZ2Uoc3RhdGUpIHtcbiAgICBjb25zdCByZW5kZXJlciA9IHRoaXMuc2VnbWVudFJlbmRlcmVyTWFwW3N0YXRlLmlkXTtcbiAgICByZW5kZXJlci51cGRhdGVTdGF0ZShzdGF0ZSk7XG4gIH1cbiAgKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2lyY3VsYXJWaWV3O1xuIl19