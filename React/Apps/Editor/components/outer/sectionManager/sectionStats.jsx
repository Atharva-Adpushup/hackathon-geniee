var React = window.React,
	Row = require('BootstrapComponents/Row.jsx'),
	Panel = require('BootstrapComponents/Panel.jsx'),
	BaseUnit = require('./statsBaseUnit.jsx'),
	NetworkStats = require('./networkStats.jsx'),
	Col = require('BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		return {};
	},
	getDefaultProps: function() {
		return {};
	},
	handleMouseOver: function() {
		if (this.props.onMouseOver) {
			this.props.onMouseOver();
		}
	},
	getChildren: function() {
		return (
			<div className="level-og">
				{_(this.props.data.networkStats).map(
					function(networkStats, network) {
						return <NetworkStats name={network} data={networkStats} />;
					}.bind(this)
				)}
			</div>
		);
	},
	render: function() {
		return (
			<li {...this.props} onMouseOver={this.handleMouseOver} className="level-og ">
				<BaseUnit name={this.props.name} data={this.props.data} component={this.getChildren()} />
			</li>
		);
	}
});
