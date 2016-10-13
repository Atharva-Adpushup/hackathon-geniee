var React = window.React;
var joinClasses = require('./utils/joinClasses');

var PageHeader = React.createClass({

  render: function () {
    return (
      <div {...this.props} className={joinClasses(this.props.className, 'page-header')}>
        <h1>{this.props.children}</h1>
      </div>
    );
  }
});

module.exports = PageHeader;