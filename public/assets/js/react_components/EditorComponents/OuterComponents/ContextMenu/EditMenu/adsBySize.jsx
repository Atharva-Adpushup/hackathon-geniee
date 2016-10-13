var React = window.React,
	_ = require('libs/third-party/underscore'),
	Menu = require('CustomComponents/Menu/menu.jsx'),
	Panel = require('BootstrapComponents/Panel.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	Accordion = require('BootstrapComponents/Accordion.jsx'),
	AdsDescriptor = require('./adsDescriptor.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			activeTab: this.props.activeTab || 1
		};
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState({ activeTab: nextProps.activeTab || 1 });
	},
	getDefaultProps: function() {
		return {};
	},
	handleTabClick: function(key) {
		this.setState({ activeTab: key });
	},
	render: function() {
		var self = this,
			count = 0,
			adByNetworks = _(this.props.ads).groupBy('network');
		return (
			<div className="containerButtonBar panelBySizeContainer">

				<Accordion activeKey={this.state.activeTab} onSelect={this.handleTabClick}>
					{_(adByNetworks).map(function(ads, network) {
						count++;
						return (
							<Panel header={network}  eventKey={count} className="panelBySize">
								<Row>
									{_(ads).map(function(ad) {
										return (<AdsDescriptor ad={ad} />);
									}) }
								</Row>
							</Panel>
						);
					}) }
				</Accordion>
				<Row className="butttonsRow">
					<Col xs={6}><Button className="btn-lightBg btn-edit" onClick={this.props.cssClickHandler}>Edit Css</Button></Col>
					<Col xs={6}><Button  className="btn-lightBg btn-del" onClick={this.props.removeAdClickHandler}>Delete</Button></Col>
				</Row>
			</div>
		);
	}
});
