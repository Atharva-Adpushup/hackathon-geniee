var React = window.React,
	Button = require('../BootstrapComponents/Button.jsx'),
	Glass = require('../CustomComponents/glass.jsx'),
	DomUtils = require('../BootstrapComponents/utils/domUtils');
/**
 * Check if value one is inside or equal to the of value
 *
 * @param {string} one
 * @param {string|array} of
 * @returns {boolean}
 */
var OverlayTrigger = React.createClass({
	getInitialState: function() {
		return {
			isOverlayShown: false,
			posX: 0,
			posY: 0
		};
	},

	updateOffset: function() {
		var domEle = this.getDOMNode();

		var width = domEle.offsetWidth,
			height = domEle.offsetHeight;

		var offset = DomUtils.getOffset(this.getDOMNode());

		this.setState({
			posX: offset.left,
			posY: offset.top + height
		});
	},

	toggleOverlay: function() {
		if (!this.state.isOverlayShown) this.updateOffset();
		this.setState({ isOverlayShown: !this.state.isOverlayShown });
	},

	render: function() {
		var style = {};

		style['display'] = 'block';
		style['position'] = 'relative';
		style['zIndex'] = 10000;

		if (this.state.isOverlayShown)
			return (
				<div className="pull-left">
					<Button onClick={this.toggleOverlay}>{this.props.title}</Button>
					<div style={style}>{this.props.children}</div>
					<Glass clickHandler={this.toggleOverlay} />
				</div>
			);
		else return <Button onClick={this.toggleOverlay}>{this.props.title}</Button>;
	}
});

module.exports = OverlayTrigger;
