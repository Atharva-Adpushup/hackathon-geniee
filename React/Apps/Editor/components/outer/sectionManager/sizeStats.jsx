var React = window.React,
	Row = require('BootstrapComponents/Row.jsx'),
	Panel = require('BootstrapComponents/Panel.jsx'),
	BaseUnit = require('./statsBaseUnit.jsx'),
	Col = require('BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		return { isExpanded: true };
	},
	getDefaultProps: function() {
		return {};
	},
	toggleExpansion: function(ev) {
		this.setState({ isExpanded: !this.state.isExpanded });
		ev.stopPropagation();
	},
	getChildren: function() {
		return (
			<div className="level-og">
				{_(this.props.data.variations).map(
					function(variation) {
						return (
							<BaseUnit
								name={variation.variationName}
								data={{
									impressions: variation.impressions,
									clicks: variation.clicks,
									xpathMiss: variation.xpathMiss
								}}
							/>
						);
					}.bind(this)
				)}
			</div>
		);
	},
	render: function() {
		return <BaseUnit name={this.props.name} data={this.props.data} component={this.getChildren()} />;
	}
});
