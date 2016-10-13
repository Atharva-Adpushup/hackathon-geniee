var React = window.React,
	Modal = require("../../../BootstrapComponents/Modal.jsx"),
	commonConsts = require("../../../../editor/commonConsts"),
	Row = require("../../../BootstrapComponents/Row.jsx"),
	Col = require("../../../BootstrapComponents/Col.jsx"),
	Comps = commonConsts.enums.components;
	$ = window.jQuery;

module.exports = React.createClass({
	mixins: [],
	getDefaultProps: function () {
		return {};
	},
	getInitialState: function () {
		return {};
	},
	showComponent: function(comp,ev){
		ev.preventDefault();
		this.props.flux.actions.showComponent(comp);
	},
	close: function(){
		this.props.flux.actions.hideMenu();
	},
	render: function () {
		return (
			<Modal className="_ap_modal" closeButton={true}  onRequestHide={this.close} title={"Learn Using AdPushup"} keyboard={true} animation={true}>
				<div className="modal-body">
					<div className="faq">
						<Row>
							<Col xs={4}>
								<a onClick={this.showComponent.bind(null,Comps.PAGE_GROUP_GUIDER)}>
									<h5>Page Groups</h5>
									<p>Use Page Groups to setup ad layouts on multiple pages at once.</p>
								</a>
							</Col>
							<Col xs={4}>
								<a onClick={this.showComponent.bind(null,Comps.AD_INSERTION_GUIDER)}>
									<h5>Ad placements</h5>
									<p>Learn how to create ad placements on pages inside a Page Group</p>
								</a>
							</Col>
							<Col xs={4}>
								<a onClick={this.showComponent.bind(null,Comps.CONTROL_CONVERSION_GUIDER)}>
									<h5>Control Ads</h5>
									<p>Learn about Control ads. We <b>strongly</b> recommend setting them up.</p>
								</a>
							</Col>
						</Row>
						<Row>
							<Col xs={4}>
								<a onClick={this.showComponent.bind(null,Comps.OAUTH_GUIDER)}>
									<h5>AdSense Setup</h5>
									<p>Learn how to connect your AdSense account with AdPushup.</p>
								</a>
							</Col>
							<Col xs={4}>
								<a onClick={this.showComponent.bind(null,Comps.ADPUSHUP_INSTALLATION_GUIDER)}>
									<h5>AdPushup Snippet</h5>
									<p>How to setup AdPushup on your website.</p>
								</a>
							</Col>
						</Row>
					</div>
				</div>
			</Modal>
		);
	}
})