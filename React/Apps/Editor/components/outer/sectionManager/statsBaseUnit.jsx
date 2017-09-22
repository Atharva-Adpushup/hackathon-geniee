var React = window.React,
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx');

var Tree = React.createClass({
	getInitialState: function() {
		return {
			isExpanded: false
		};
	},
	getDefaultProps: function() {
		return {};
	},
	toggleExpansion: function(ev) {
		this.setState({ isExpanded: !this.state.isExpanded });
		ev.stopPropagation();
	},
	render: function() {
		return (
			<Row onClick={this.toggleExpansion} className={this.state.isExpanded ? 'expanded' : 'collapsed'}>
				<Col xs={3}>{this.props.name}</Col>
				<Col xs={1}>{this.props.data.impressions}</Col>
				<Col xs={2}>{this.props.data.clicks}</Col>
				<Col xs={1}>
					{this.props.data.clicks
						? (this.props.data.clicks / this.props.data.impressions * 100).toPrecision(4)
						: 0}
				</Col>
				<Col xs={2}>{this.props.data.xpathMiss}</Col>
				<Col xs={2}>
					{this.props.data.ActiveViews
						? (this.props.data.ActiveViews / this.props.data.impressions * 100).toPrecision(4)
						: 'N/A'}
				</Col>
				{this.state.isExpanded
					? this.props.component
					: this.props.component
						? React.addons.cloneWithProps(this.props.component, {
								style: { display: 'none' },
								isExpanded: false
							})
						: null}
			</Row>
		);
	}
});

module.exports = Tree;
