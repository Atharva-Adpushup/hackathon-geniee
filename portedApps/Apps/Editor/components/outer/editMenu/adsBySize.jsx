let React = window.React,
	_ = require('libs/third-party/underscore'),
	Menu = require('CustomComponents/menu/menu.jsx'),
	Panel = require('BootstrapComponents/Panel.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	Accordion = require('BootstrapComponents/Accordion.jsx'),
	AdsDescriptor = require('./adsDescriptor.jsx');

module.exports = React.createClass({
	getInitialState() {
		return {
			activeTab: this.props.activeTab || 1
		};
	},
	componentWillReceiveProps(nextProps) {
		this.setState({ activeTab: nextProps.activeTab || 1 });
	},
	getDefaultProps() {
		return {};
	},
	handleTabClick(key) {
		this.setState({ activeTab: key });
	},
	render() {
		let self = this,
			count = 0,
			adByNetworks = _(this.props.ads).groupBy('network');
		return (
			<div className="containerButtonBar panelBySizeContainer">
				<Accordion activeKey={this.state.activeTab} onSelect={this.handleTabClick}>
					{_(adByNetworks).map((ads, network) => {
						count++;
						return (
							<Panel header={network} eventKey={count} className="panelBySize">
								<Row>
									{_(ads).map(ad => {
										return <AdsDescriptor ad={ad} />;
									})}
								</Row>
							</Panel>
						);
					})}
				</Accordion>
				<Row className="butttonsRow">
					<Col xs={6}>
						<Button className="btn-lightBg btn-edit" onClick={this.props.cssClickHandler}>
							Edit Css
						</Button>
					</Col>
					<Col xs={6}>
						<Button className="btn-lightBg btn-del" onClick={this.props.removeAdClickHandler}>
							Delete
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
});
