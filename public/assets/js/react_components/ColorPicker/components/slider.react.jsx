'use strict';

var React = window.React;
var PureRenderMixin = React.addons.PureRenderMixin;

var clamp = require('../util/clamp');
var DraggableMixin = require('../mixin/draggable.react.jsx');
var OnChangeMixin = require('../mixin/onchange.react.jsx');

var Slider = React.createClass({

  mixins: [
    DraggableMixin,
    OnChangeMixin,
    PureRenderMixin,
  ],

  propTypes: {
    vertical: React.PropTypes.bool.isRequired,
    value: React.PropTypes.number.isRequired
  },

  updatePosition: function (clientX, clientY) {
    var el = this.getDOMNode();
    var rect = el.getBoundingClientRect();

    var value;
    if (this.props.vertical) {
      value = (rect.bottom - clientY) / rect.height;
    } else {
      value = (clientX - rect.left) / rect.width;
    }

    value = this.getScaledValue(value);
    this.props.onChange(value);
  },

  render: function () {
    var classes = React.addons.classSet({
      slider: true,
      vertical: this.props.vertical,
      horizontal: ! this.props.vertical
    });

    var styles = {};
    var attr = this.props.vertical ? 'bottom' : 'left';
    styles[attr] = this.getPercentageValue(this.props.value);

    return (
      /* jshint ignore: start */
      <div
        className={classes}
        onMouseDown={this.startUpdates}
        onTouchStart={this.startUpdates}
      >
        <div className="track" />
        <div className="pointer" style={styles} >
          <div className="pointer-larr"></div>
          <div className="pointer-rarr"></div>
        </div>
      </div>
      /* jshint ignore: end */
    );
  }

});

module.exports = Slider;
