"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _objectAssign = _interopRequireDefault(require("object-assign"));

var _defaults = require("../defaults");

var _stylesheet = _interopRequireDefault(require("../stylesheet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* React Notification Component */
var Toast =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Toast, _React$Component);

  function Toast() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, Toast);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(Toast)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "state", {
      containerStyle: _stylesheet["default"].styles.container
    });

    return _this;
  }

  _createClass(Toast, [{
    key: "getToastStyle",
    value: function getToastStyle() {
      var _this$props = this.props,
          type = _this$props.type,
          color = _this$props.color;
      var styles = _stylesheet["default"].styles;
      var contentStyle = {};
      /* If type is set, merge toast action styles with base */

      switch (type) {
        case 'success':
        case 'error':
        case 'warning':
        case 'info':
          contentStyle = (0, _objectAssign["default"])({}, styles.content, _defaults.defaults.colors[type]);
          break;

        case 'custom':
          {
            var customStyle = {
              backgroundColor: color.background,
              color: color.text
            };
            contentStyle = (0, _objectAssign["default"])({}, styles.content, customStyle);
          }
          break;

        default:
          contentStyle = (0, _objectAssign["default"])({}, styles.content);
          break;
      }

      return contentStyle;
    }
  }, {
    key: "animateState",
    value: function animateState() {
      var _this2 = this;

      var styles = _stylesheet["default"].styles; // Show

      setTimeout(function () {
        _this2.updateStyle(styles.show);
      }, 100); // wait 100ms after the component is called to animate toast.
      // Timeout -1 displays toast as a persistent notification

      if (this.props.timeout === -1) {
        return;
      } // Hide after timeout


      setTimeout(function () {
        _this2.updateStyle(styles.hide);
      }, this.props.timeout);
    } // Updates the style of the container with styles for a state (hide/show).
    // This triggers animations.

  }, {
    key: "updateStyle",
    value: function updateStyle(stateStyle) {
      var styles = _stylesheet["default"].styles;
      this.setState({
        containerStyle: (0, _objectAssign["default"])({}, styles.container, stateStyle)
      });
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.animateState();
    }
  }, {
    key: "render",
    value: function render() {
      var text = this.props.text;
      var containerStyle = this.state.containerStyle;
      return _react["default"].createElement("div", {
        className: "toast-notification",
        style: containerStyle
      }, _react["default"].createElement("span", {
        style: this.getToastStyle()
      }, text));
    }
  }]);

  return Toast;
}(_react["default"].Component);

_defineProperty(Toast, "propTypes", {
  text: _propTypes["default"].oneOfType([_propTypes["default"].string, _propTypes["default"].element]),
  timeout: _propTypes["default"].number,
  type: _propTypes["default"].string,
  color: _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].string]),
  style: _propTypes["default"].oneOfType([_propTypes["default"].object, _propTypes["default"].bool])
});

var _default = Toast;
exports["default"] = _default;