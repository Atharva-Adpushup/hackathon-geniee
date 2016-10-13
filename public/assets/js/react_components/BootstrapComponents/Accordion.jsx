var React = window.React;
var PanelGroup = require('./PanelGroup.jsx');

var Accordion = React.createClass({
  render: function () {
    return (
      <PanelGroup {...this.props} accordion={true}>
        {this.props.children}
      </PanelGroup>
    );
  }
});

module.exports = Accordion;