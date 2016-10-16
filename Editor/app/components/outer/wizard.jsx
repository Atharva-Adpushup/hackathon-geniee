var React = window.React,
	$ = window.jQuery,
	Fluxxor = require('libs/third-party/fluxxor'),
	Button = require('../../BootstrapComponents/Button.jsx'),
	Modal = require('../../BootstrapComponents/Modal.jsx'),
	Row = require('../../BootstrapComponents/Row.jsx'),
	Col = require('../../BootstrapComponents/Col.jsx'),
	screens = {
		CMS_CHECKER: 'cmsChecker',
		SELECT_PLATFORM: 'platformSelect',
		INSTALL_PLUGIN: 'installPlugin',
		AP_DETECTOR: 'apDetector',
		LAST_SLIDE: 'finished',
		CUSTOM_SITE: 'customSite',
		CUSTOM_SITE_NOT_SUPPORTED: 'customSitenotsupported',
		PLUGIN_NOT_INSTALLED: 'pluginNotInstalled',
		PLUGIN_INSTALLED_SITEID_NOT: 'pluginInstalledSiteNot'
	},
	FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
	mixins: [FluxMixin],

	getInitialState: function() {
		return {
			loading: true,
			slide: screens.CMS_CHECKER,
			props: null
		};
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return this.state.slide != nextState.slide;
	},
	cmsChecker: function() {
		if (this.$loadingActionCallback)
			return;

		this.$loadingActionCallback = $.Deferred().done(function(response) {
			if (response.ap) {
				this.getFlux().actions.loadCmsInfo(response.ap);
				this.switchTo(screens.LAST_SLIDE);
			} else if (response.wordpress) {
				this.setState({loading: false, slide: screens.SELECT_PLATFORM, props: {cms: 'wordpress'}});
			} else {
				this.switchTo(screens.SELECT_PLATFORM);
			}
		}.bind(this));

		$.getJSON('/proxy/detectCms?site=' + this.props.site).then(function(response) {
			this.$loadingActionCallback.resolve(response);
		}.bind(this), function() {
			console.log('Error');
		}.bind(this));

		return (
			<div className="modal-body">
				<h4>Get Started with AdPushup</h4>
				<p>
					Please wait while we inspect your website.
					<br/>
					<small>(no changes would be made to your website)</small>
				</p>
			</div>
		);
	},
	platformSelect: function() {
		return (<div className="modal-body">
			<h4 className="nextsmall">Please select platform</h4>
			<small>We have auto detected and selected this for you.</small>
			<Row className="platformrow">
				<Col xs={6}>
					<Button   className= {(this.state.props && (this.state.props.cms == 'wordpress')) ? 'btn-lightBg btn-box btn-red' : 'btn-lightBg btn-box'}  onClick={this.switchTo.bind(this, screens.INSTALL_PLUGIN, false)}>
						<i className="fa fa-wordpress"></i><b>WordPress</b>
					</Button>

				</Col>
				<Col className="col-xs-6">
					<Button className={!this.state.props ? 'btn-lightBg btn-box btn-red' : 'btn-lightBg btn-box'}  onClick={this.switchTo.bind(this, screens.LAST_SLIDE, false)}>Other</Button>
				</Col>
			</Row>

		</div>);
	},
	installPlugin: function() {
		return (<div><div className="modal-body">
			<h4>Hey there, WordPress user!</h4>
			<p>AdPushup enables you to
				<b> increase your website's ad revenues </b>
				by testing your ad layout, types, colors etc.</p>
			<p>To do this, we need you to install our JavaScript snippet via our <b>Wordpress Plugin</b>.</p>

			<Row className="platformrow ptpd-1020">
				<Col xs={12}>
					<Button className="btn-lightBg btn-fontLarge">
						<a href="http://wordpress.org/plugins/adpushup" target="_blank">
							<i className="fa fa-wordpress"></i> Install Plugin
						</a>
					</Button>
				</Col>
			</Row>

			<p>After you install plugin, please configure Site ID - <b>{window.ADP_SITE_ID}</b> - by going to <b>Wordpress &gt; Settings &gt; Adpushup Settings</b>.</p>
			</div>
			<div className="modalfooter-btn">
			<Row className="platformrow">
				<Col className="col-xs-6">
					<Button className="btn-lightBg btn-red" onClick={this.switchTo.bind(this, screens.SELECT_PLATFORM)}><i className="fa fa-chevron-left mR-5"></i>Start Over</Button>
				</Col>
				<Col className="col-xs-6">
					<Button className="btn-lightBg btn-red pull-right" onClick={this.switchTo.bind(this, screens.AP_DETECTOR)}>I have done it<i className="fa fa-chevron-right mL-10"></i></Button>
				</Col>
			</Row>
			</div>
		</div>);
	},
	apDetector: function() {
		$.getJSON('/proxy/detect_ap?url=' + this.props.site + '&siteId=' + window.ADP_SITE_ID, function(response) {
			if (response.siteVerified) {// when plugin and site id both are installed
				this.getFlux().actions.loadCmsInfo(response.ap);
				this.switchTo(screens.LAST_SLIDE, false);
			} else if (response.ap) {// when site id is not installed but plugin is
				this.switchTo(screens.PLUGIN_INSTALLED_SITEID_NOT, false);
			}
			else {
				this.switchTo(screens.PLUGIN_NOT_INSTALLED, false);
			}
		}.bind(this));

		return (<div className="modal-body"> <p>Please wait while we detect AdPushup's plugin on your WordPress site..</p></div>);
	},
	pluginNotInstalled: function() {
		return (<div><div className="modal-body">
			<h4>Bummer!</h4>
			<p>We could not find the our plugin installed. Have you:
				<ul>
					<li>- Activated the plugin?</li>
					<li>- Cleared your WP cache?</li>
					<li>- Cleared your CloudFront cache?</li>
				</ul>
			</p>
			<p>If you were not able to install plugin correctly, please contact support@adpushup.com.</p>
			</div>
				<div className="modalfooter-btn">
				<Row className="platformrow">
					<Col className="col-xs-6">
					<Button className="btn-lightBg btn-red" onClick={this.switchTo.bind(this, screens.SELECT_PLATFORM)}><i className="fa fa-chevron-left mR-5"></i>Start Over</Button>
				</Col>
					<Col className="col-xs-6">
						<Button className="btn-lightBg btn-red pull-right" onClick={this.switchTo.bind(this, screens.AP_DETECTOR, true)}>Check Again <i className="fa fa-chevron-right mL-10"></i></Button>
					</Col>

				</Row>
				</div>
		</div>);
	},

	pluginInstalledSiteNot: function() {
		return (<div><div className="modal-body">
			<h4>Bummer!</h4>

				<p>Our plugin was successfully installed but it seems the Site ID is not correctly configured.</p>
				<p>please configure Site ID - <b>{window.ADP_SITE_ID}</b> - by going to <b>Wordpress &gt; Settings &gt; Adpushup Settings</b>.</p>
				</div>
				<div className="modalfooter-btn">
				<Row className="platformrow">
				<Col className="col-xs-6">
					<Button className="btn-lightBg btn-red" onClick={this.switchTo.bind(this, screens.SELECT_PLATFORM)}><i className="fa fa-chevron-left mR-5"></i>Start Over</Button>
				</Col>
					<Col className="col-xs-6">
						<Button className="btn-lightBg btn-red pull-right" onClick={this.switchTo.bind(this, screens.AP_DETECTOR, true)}>Check Again<i className="fa fa-chevron-right mL-10"></i></Button>
					</Col>

				</Row>

			</div>
		</div>);
	},

	customSitenotsupported: function() {
		return (<div><div className="modal-body">
			<h4>Hold On!</h4>

				<p>Please Contact Support at support@adpushup.com</p>
				</div>


			</div>
		);
	},

	finished: function() {
		function done() {
			this.setState({slide: null, loading: false});

			if (this.props.slideFinishCallback)
				this.props.slideFinishCallback();
		}

		return (
			<div className="modal-body">
				<h4>Let's start!</h4>
				<p>You're just few steps away from optimizing your ads. Follow the instructions to learn AdPushup. </p>
				<p>Please contact us in case you're facing any problems in the set up.</p>
				<Row className="platformrow">
					<Col xs={12}>
						<Button className="btn-lightBg btn-fontLarge pull-right"  onClick={done.bind(this)}>Yep, let's start!</Button>
					</Col>
				</Row>
			</div>
		);
	},
	renderTpl: function(body) {
		return (<Modal closeButton={false} onRequestHide={new Function} title="Finished" className="_ap_modal_logo" keyboard={false} animation>
			<div className="spin"></div>
			 {body}
		</Modal>);
	},
	switchTo: function(slideName) {
		this.setState({slide: slideName});
	},
	render: function() {
		if (!this.props.active)
			return null;

		if (this.state.slide === null)
			return null;

		analytics.track('EDITOR_SLIDE_' + this.state.slide, {
			siteDomain: window.ADP_SITE_DOMAIN,
			siteId: window.ADP_SITE_ID,
			IS_ADMIN: window.ADP_IS_ADMIN
		}, intercomObj);

		return this.renderTpl(this[this.state.slide]()); // Execute loading action
	}
});
