var React = window.React;
var joinClasses = require('./utils/joinClasses');

var Grid = React.createClass({
  propTypes: {
    fluid: React.PropTypes.bool,
    componentClass: React.PropTypes.node.isRequired
  },

  getDefaultProps: function () {
    return {
      componentClass: 'div'
    };
  },

  render: function () {
    var ComponentClass = this.props.componentClass;
    var className = this.props.fluid ? 'container-fluid' : 'container';

    return (
      <ComponentClass
        {...this.props}
        className={joinClasses(this.props.className, className)}>
        {this.props.children}
      </ComponentClass>
    );
  }
});

module.exports = Grid;