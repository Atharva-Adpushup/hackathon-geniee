import React from  'react';
var $ = require('jquery');

module.exports = React.createClass({
	getDefaultProps: function() {
		return {
			clickHandler: function noop() {
			}
		};
	},
	render: function() {
		var g_style = {
			position: 'fixed',
			top: 0,
			left: 0,
			width: '100%',
			height: $(window).height(),
			zIndex: 9999
		};
		return (<div style={g_style} onClick={this.props.clickHandler}></div>);
	}
});
