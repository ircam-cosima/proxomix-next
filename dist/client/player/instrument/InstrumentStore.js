'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InstrumentStore = function () {
  function InstrumentStore(commonConfig, instrumentConfig, metricScheduler) {
    (0, _classCallCheck3.default)(this, InstrumentStore);

    this.commonConfig = commonConfig;
    this.instrumentConfig = instrumentConfig;
    this.metricScheduler = metricScheduler;

    this.states = {};

    for (var id in this.instrumentConfig.segments) {
      // dummy values
      this.states[id] = {
        id: id,
        startPosition: null,
        transitionLength: null,
        currentValue: 1,
        targetValue: 0
      };
    }

    this._stateListeners = new _set2.default();

    this.onAction = this.onAction.bind(this);
  }

  (0, _createClass3.default)(InstrumentStore, [{
    key: 'onAction',
    value: function onAction(payload) {
      var currentPosition = this.metricScheduler.currentPosition;

      switch (payload.name) {
        case 'screen-interaction':
          // dummy example
          var state = this.states[payload.segmentId];
          state.startPosition = currentPosition;
          state.transitionLength = 0;
          state.currentValue = state.currentValue === 0 ? 1 : 0;
          state.targetValue = state.targetValue === 0 ? 1 : 0;

          this.propagateState(state);
          break;
      }
    }
  }, {
    key: 'addStateListener',
    value: function addStateListener(callback) {
      this._stateListeners.add(callback);
    }
  }, {
    key: 'removeStateListener',
    value: function removeStateListener(callback) {
      this._stateListeners.delete(callback);
    }
  }, {
    key: 'propagateState',
    value: function propagateState(state) {
      this._stateListeners.forEach(function (callback) {
        return callback(state);
      });
    }
  }]);
  return InstrumentStore;
}();

exports.default = InstrumentStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3RydW1lbnRTdG9yZS5qcyJdLCJuYW1lcyI6WyJJbnN0cnVtZW50U3RvcmUiLCJjb21tb25Db25maWciLCJpbnN0cnVtZW50Q29uZmlnIiwibWV0cmljU2NoZWR1bGVyIiwic3RhdGVzIiwiaWQiLCJzZWdtZW50cyIsInN0YXJ0UG9zaXRpb24iLCJ0cmFuc2l0aW9uTGVuZ3RoIiwiY3VycmVudFZhbHVlIiwidGFyZ2V0VmFsdWUiLCJfc3RhdGVMaXN0ZW5lcnMiLCJvbkFjdGlvbiIsImJpbmQiLCJwYXlsb2FkIiwiY3VycmVudFBvc2l0aW9uIiwibmFtZSIsInN0YXRlIiwic2VnbWVudElkIiwicHJvcGFnYXRlU3RhdGUiLCJjYWxsYmFjayIsImFkZCIsImRlbGV0ZSIsImZvckVhY2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQ01BLGU7QUFDSiwyQkFBWUMsWUFBWixFQUEwQkMsZ0JBQTFCLEVBQTRDQyxlQUE1QyxFQUE2RDtBQUFBOztBQUMzRCxTQUFLRixZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDQSxTQUFLQyxlQUFMLEdBQXVCQSxlQUF2Qjs7QUFFQSxTQUFLQyxNQUFMLEdBQWMsRUFBZDs7QUFFQSxTQUFLLElBQUlDLEVBQVQsSUFBZSxLQUFLSCxnQkFBTCxDQUFzQkksUUFBckMsRUFBK0M7QUFDN0M7QUFDQSxXQUFLRixNQUFMLENBQVlDLEVBQVosSUFBa0I7QUFDaEJBLFlBQUlBLEVBRFk7QUFFaEJFLHVCQUFlLElBRkM7QUFHaEJDLDBCQUFrQixJQUhGO0FBSWhCQyxzQkFBYyxDQUpFO0FBS2hCQyxxQkFBYTtBQUxHLE9BQWxCO0FBT0Q7O0FBRUQsU0FBS0MsZUFBTCxHQUF1QixtQkFBdkI7O0FBRUEsU0FBS0MsUUFBTCxHQUFnQixLQUFLQSxRQUFMLENBQWNDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBaEI7QUFDRDs7Ozs2QkFFUUMsTyxFQUFTO0FBQ2hCLFVBQU1DLGtCQUFrQixLQUFLWixlQUFMLENBQXFCWSxlQUE3Qzs7QUFFQSxjQUFRRCxRQUFRRSxJQUFoQjtBQUNFLGFBQUssb0JBQUw7QUFDRTtBQUNBLGNBQU1DLFFBQVEsS0FBS2IsTUFBTCxDQUFZVSxRQUFRSSxTQUFwQixDQUFkO0FBQ0FELGdCQUFNVixhQUFOLEdBQXNCUSxlQUF0QjtBQUNBRSxnQkFBTVQsZ0JBQU4sR0FBeUIsQ0FBekI7QUFDQVMsZ0JBQU1SLFlBQU4sR0FBcUJRLE1BQU1SLFlBQU4sS0FBdUIsQ0FBdkIsR0FBMkIsQ0FBM0IsR0FBK0IsQ0FBcEQ7QUFDQVEsZ0JBQU1QLFdBQU4sR0FBb0JPLE1BQU1QLFdBQU4sS0FBc0IsQ0FBdEIsR0FBMEIsQ0FBMUIsR0FBOEIsQ0FBbEQ7O0FBRUEsZUFBS1MsY0FBTCxDQUFvQkYsS0FBcEI7QUFDQTtBQVZKO0FBWUQ7OztxQ0FFZ0JHLFEsRUFBVTtBQUN6QixXQUFLVCxlQUFMLENBQXFCVSxHQUFyQixDQUF5QkQsUUFBekI7QUFDRDs7O3dDQUVtQkEsUSxFQUFVO0FBQzVCLFdBQUtULGVBQUwsQ0FBcUJXLE1BQXJCLENBQTRCRixRQUE1QjtBQUNEOzs7bUNBRWNILEssRUFBTztBQUNwQixXQUFLTixlQUFMLENBQXFCWSxPQUFyQixDQUE2QjtBQUFBLGVBQVlILFNBQVNILEtBQVQsQ0FBWjtBQUFBLE9BQTdCO0FBQ0Q7Ozs7O2tCQUdZakIsZSIsImZpbGUiOiJJbnN0cnVtZW50U3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIEluc3RydW1lbnRTdG9yZSB7XG4gIGNvbnN0cnVjdG9yKGNvbW1vbkNvbmZpZywgaW5zdHJ1bWVudENvbmZpZywgbWV0cmljU2NoZWR1bGVyKSB7XG4gICAgdGhpcy5jb21tb25Db25maWcgPSBjb21tb25Db25maWc7XG4gICAgdGhpcy5pbnN0cnVtZW50Q29uZmlnID0gaW5zdHJ1bWVudENvbmZpZztcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcblxuICAgIHRoaXMuc3RhdGVzID0ge307XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmluc3RydW1lbnRDb25maWcuc2VnbWVudHMpIHtcbiAgICAgIC8vIGR1bW15IHZhbHVlc1xuICAgICAgdGhpcy5zdGF0ZXNbaWRdID0ge1xuICAgICAgICBpZDogaWQsXG4gICAgICAgIHN0YXJ0UG9zaXRpb246IG51bGwsXG4gICAgICAgIHRyYW5zaXRpb25MZW5ndGg6IG51bGwsXG4gICAgICAgIGN1cnJlbnRWYWx1ZTogMSxcbiAgICAgICAgdGFyZ2V0VmFsdWU6IDAsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuX3N0YXRlTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgdGhpcy5vbkFjdGlvbiA9IHRoaXMub25BY3Rpb24uYmluZCh0aGlzKTtcbiAgfVxuXG4gIG9uQWN0aW9uKHBheWxvYWQpIHtcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSB0aGlzLm1ldHJpY1NjaGVkdWxlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICBzd2l0Y2ggKHBheWxvYWQubmFtZSkge1xuICAgICAgY2FzZSAnc2NyZWVuLWludGVyYWN0aW9uJzpcbiAgICAgICAgLy8gZHVtbXkgZXhhbXBsZVxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuc3RhdGVzW3BheWxvYWQuc2VnbWVudElkXTtcbiAgICAgICAgc3RhdGUuc3RhcnRQb3NpdGlvbiA9IGN1cnJlbnRQb3NpdGlvbjtcbiAgICAgICAgc3RhdGUudHJhbnNpdGlvbkxlbmd0aCA9IDA7XG4gICAgICAgIHN0YXRlLmN1cnJlbnRWYWx1ZSA9IHN0YXRlLmN1cnJlbnRWYWx1ZSA9PT0gMCA/IDEgOiAwO1xuICAgICAgICBzdGF0ZS50YXJnZXRWYWx1ZSA9IHN0YXRlLnRhcmdldFZhbHVlID09PSAwID8gMSA6IDA7XG5cbiAgICAgICAgdGhpcy5wcm9wYWdhdGVTdGF0ZShzdGF0ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGFkZFN0YXRlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9zdGF0ZUxpc3RlbmVycy5hZGQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmVtb3ZlU3RhdGVMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIHRoaXMuX3N0YXRlTGlzdGVuZXJzLmRlbGV0ZShjYWxsYmFjayk7XG4gIH1cblxuICBwcm9wYWdhdGVTdGF0ZShzdGF0ZSkge1xuICAgIHRoaXMuX3N0YXRlTGlzdGVuZXJzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soc3RhdGUpKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnN0cnVtZW50U3RvcmU7XG4iXX0=