var React = window.React,
	Row = require('BootstrapComponents/Row.jsx'),
	BaseUnit = require('./statsBaseUnit.jsx'),
	SizeStats = require('./sizeStats.jsx');

module.exports = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getChildren: function() {
		return (
			<div className="level-og">
				{_(this.props.data.sizesStats).map(
					function(sizeStats, size) {
						return <SizeStats name={size} data={sizeStats} />;
					}.bind(this)
				)}
			</div>
		);
	},
	render: function() {
		return <BaseUnit name={this.props.name} data={this.props.data} component={this.getChildren()} />;
	}
});
