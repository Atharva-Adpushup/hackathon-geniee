var React = window.React,
	Glass = require('./glass.jsx');

module.exports = React.createClass({
	mixins: [],
	getDefaultProps: function() {
		//trigger="click" triggerComponent={(<Button>Create Tpl</Button>)}
		return { trigger: 'click' };
	},
	getInitialState: function() {
		return { showPopup: false };
	},
	togglePopup: function() {
		this.setState({ showPopup: !this.state.showPopup });
	},
	render: function() {
		var trigger = null;

		if (this.props.trigger == 'hover')
			trigger = (
				<a onMouseEnter={this.togglePopup} onMouseEnter={this.togglePopup} className="toolTipName">
					{this.props.triggerComponent}
				</a>
			);
		else {
			trigger = (
				<a onClick={this.togglePopup} className="toolTipName">
					{this.props.triggerComponent}
				</a>
			);
		}
		if (this.state.showPopup) {
			return (
				<div>
					<span className="toolTipWrapper">
						{trigger}
						<div className="toolTipContent">
							<div className="tooltipHeading">
								<button onClick={this.togglePopup} type="button" className="close">
									×
								</button>
								<h4 className="modal-title">{this.props.title}</h4>
							</div>
							<div className="tooltipMain">{this.props.children}</div>
						</div>
					</span>
				</div>
			);
		} else {
			return (
				<div>
					<span className="toolTipWrapper">{trigger}</span>
				</div>
			);
		}
	}
});
