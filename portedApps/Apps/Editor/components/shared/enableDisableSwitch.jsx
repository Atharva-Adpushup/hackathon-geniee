var React = window.React;

module.exports = React.createClass({
	mixins: [],
	propTypes: {
		onChange: React.PropTypes.func.isRequired
	},
	getDefaultProps: function() {
		return { on: 'Enable', off: 'Disable' };
	},
	getInitialState: function(props) {
		return {};
	},
	onChange: function() {
		this.props.onChange(!this.props.checked);
	},
	render: function() {
		return (
			<div className={this.props.size == 's' ? 'toggle toggleSizeSmall' : 'toggle'}>
				<input id={this.props.id} type="checkbox" checked={this.props.checked} onChange={this.onChange} />
				<label htmlFor={this.props.id}>
					<div className="toggleSwitch" data-on={this.props.on} data-off={this.props.off} />
				</label>
			</div>
		);
	}
});
