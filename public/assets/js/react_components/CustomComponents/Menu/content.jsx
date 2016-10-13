var React = window.React;

module.exports = React.createClass({
	mixins: [],
	propTypes: {
		activeComponent: React.PropTypes.element.isRequired,
		activeHeading: React.PropTypes.string,
		icon: React.PropTypes.string.isRequired
	},
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		var self = this;
		return (
			<div className="MenuBarContainerWrapper">
				{this.props.activeHeading ? (<h5 className="head"><a>{this.props.activeHeading}</a><i className={'pull-right fa ' + self.props.icon}></i></h5>) : null}
				<div className="MenuBarContainer">
					<div className="MenuBarInner">{this.props.activeComponent}</div>
				</div>
			</div>
		);
	}
});
