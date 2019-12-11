var React = window.React,
	Row = require('../../../BootstrapComponents/Row.jsx'),
	Input = require('../../../BootstrapComponents/Input.jsx'),
	Button = require('../../../BootstrapComponents/Button.jsx'),
	Col = require('../../../BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	mixins: [],
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return { wait: false };
	},
	installPluginWindow: function() {},
	componentDidMount: function() {
		var chromeButton = React.findDOMNode(this.refs.chrome);
		chromeButton.addEventListener('click', this.chromeExtension, false);
	},
	saveWpInfo: function() {
		this.setState({ wait: true });
		$.getJSON('/proxy/detectCms?site=' + ADP_SITE_DOMAIN).then(
			function(response) {
				this.setState({ wait: false });
				if (response.wordpress && response.ap) {
					this.props.flux.actions.loadCmsInfo(response.ap);
					alert('info loaded');
				} else {
					alert('Not wordpress site or no info found.');
				}
			}.bind(this),
			function() {
				console.log('Error');
			}.bind(this)
		);
	},
	chromeExtension: function() {
		function success() {
			console.log('success');
		}
		function fail() {
			console.log('fail');
		}
		chrome.webstore.install(
			'https://chrome.google.com/webstore/detail/lbfaiagkagpgeefmnpefcibmpeccpjpi',
			success,
			fail
		);
	},
	render: function() {
		return (
			<div>
				<div className="installBtnBg">
					<Row>
						<Col xs={12}>
							<Button className="btn-lightBg btn-download btn-block" onClick={this.installPluginWindow}>
								Install Wordpress Plugin
							</Button>
						</Col>
					</Row>
				</div>
				<div className="installBtnBg">
					<Row>
						<Col xs={12}>
							<Button ref="chrome" className="btn-lightBg btn-download btn-block">
								Install Chrome Extension
							</Button>
						</Col>
					</Row>
				</div>
				<div className="installBtnBg">
					<Row>
						<Col xs={12}>
							<Button onClick={this.saveWpInfo} className="btn-lightBg btn-download btn-block">
								Save Wordpress Info
							</Button>
						</Col>
						{this.state.wait ? <Col xs={12}> Please Wait </Col> : null}
					</Row>
				</div>
			</div>
		);
	}
});
