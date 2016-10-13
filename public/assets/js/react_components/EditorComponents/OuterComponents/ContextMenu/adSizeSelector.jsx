var React = window.React,
	CommonConsts = require('editor/commonConsts'),
	_ = require('libs/third-party/underscore'),
	Menu = require('CustomComponents/Menu/menu.jsx'),
	Panel = require('BootstrapComponents/Panel.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	CustomSizeForm = require('./customSizeForm.jsx'),
	Accordion = require('BootstrapComponents/Accordion.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			activeTab: this.props.activeTab || 0
		};
	},
	componentWillReceiveProps: function(nextProps) {
		if (nextProps.activeTab)
			this.setState({activeTab: nextProps.activeTab});
	},
	getDefaultProps: function() {
		return {};
	},
	handleTabClick: function(key) {
		this.setState({activeTab: key}, function() {
			this.props.onUpdate();
		});
	},
	isDisabled: function(height, width) {
		if (!this.props.blockedSizes) return false;
		return _(this.props.blockedSizes).find({height: height, width: width});
	},
	allDisabled: function(sizes) {
		if (!this.props.blockedSizes) return false;
		var done = 0, final = _(sizes).filter(function(size) {
				if (_(this.props.blockedSizes).findWhere({height: size.height, width: size.width}))
				done++;
			}.bind(this));

		return done == sizes.length;
	},
	render: function() {
		var self = this;
		return (
			// TODO: Add 'onEntered' event handler with <menu> onUpdate()
			// method (For e.g., this.props.onUpdate())
			// NOTE: This can only be done once codebase's React Bootstrap is upgraded
			// to latest version
			<Accordion activeKey={this.state.activeTab} onSelect={this.handleTabClick}>
					{_(this.props.adSizes).map(function(rec, index) {
						if (rec.layoutType !== 'CUSTOM' && self.allDisabled(rec.sizes)) {
							return null;
						}
						return (
								<Panel header={rec.layoutType + ' Ads'}  eventKey={index}>
								<Row>
									{_(rec.sizes).map(function(adProps, index) {
										if (self.isDisabled(adProps.height, adProps.width)) {
										   	return null;
										}
										return (
											<Col xs={6} className="Col">
												<input id={rec.layoutType + index}
													type="radio"
													checked={(self.props.checked == adProps) ? 'checked' : null}
													onClick={self.props.onCheckedItem.bind(null, adProps, self.state.activeTab)}
												/>
												<label htmlFor={rec.layoutType + index}>{adProps.width + ' X ' + adProps.height}</label>
											</Col>
										);
									})}
								</Row>
								{rec.layoutType == 'CUSTOM' ? (<CustomSizeForm updateMenu={self.props.onUpdate} flux={self.props.flux}/>) : null}
							</Panel>);
					})}

		</Accordion>
		);
	}
});
