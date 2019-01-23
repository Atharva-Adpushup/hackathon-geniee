var React = window.React,
	Row = require('../../../BootstrapComponents/Row.jsx'),
	Input = require('../../../BootstrapComponents/Input.jsx'),
	Button = require('../../../BootstrapComponents/Button.jsx'),
	Col = require('../../../BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {
			adCode: null,
			errorMessage: null,
			transForm: false
		};
	},
	base64_encode: function(data) {
		try {
			if (window.btoa) {
				return window.btoa(data);
			}

			var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			var o1,
				o2,
				o3,
				h1,
				h2,
				h3,
				h4,
				bits,
				i = 0,
				ac = 0,
				enc = '',
				tmp_arr = [];

			if (!data) {
				return data;
			}

			do {
				o1 = data.charCodeAt(i++);
				o2 = data.charCodeAt(i++);
				o3 = data.charCodeAt(i++);

				bits = (o1 << 16) | (o2 << 8) | o3;

				h1 = (bits >> 18) & 0x3f;
				h2 = (bits >> 12) & 0x3f;
				h3 = (bits >> 6) & 0x3f;
				h4 = bits & 0x3f;

				tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
			} while (i < data.length);

			enc = tmp_arr.join('');

			var r = data.length % 3;

			return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
		} catch (err) {
			alert('Unable to transform, Please contact our support team.');
			return false;
		}
	},
	getAdcode: function() {
		var encodedAd = this.base64_encode(this.state.adCode);

		if (!encodedAd) {
			return '';
		}

		var newAdCode = [
			'<ins class="adPushupAds" data-ver="2" data-siteId="' +
				ADP_SITE_ID +
				'" data-ac="' +
				encodedAd +
				'"></ins>' +
				'<script data-cfasync="false" type="text/javascript">(function (w, d) { for (var i = 0, j = d.getElementsByTagName("ins"), k = j[i]; i < j.length; k = j[++i]){ if(k.className == "adPushupAds" && k.getAttribute("data-push") != "1") { ((w.adpushup = w.adpushup || {}).control = (w.adpushup.control || [])).push(k); k.setAttribute("data-push", "1"); (((w.adpushup = w.adpushup || {}).timeline = (w.adpushup.timeline || {})).tl_cntPsh = (w.adpushup.timeline.tl_cntPsh || [])).push(+new Date); } } var s = document.createElement("script"); s.type = "text/javascript"; s.async = true; s.src = "//static.adpushup.com/js/adpushupadsv2.js"; (d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]).appendChild(s); })(window, document);</script>'
		];
		return newAdCode.join('\n');
	},
	isNonEmpty: function(val) {
		if (!val || typeof val == 'undefined' || val == null || (val.trim && val.trim() == '')) return false;
		return true;
	},
	runCode: function() {
		this.dom = $('<div>' + this.state.adCode + '</div>');
	},
	isCodeAdsense: function() {
		return this.dom.html().indexOf('pagead2.googlesyndication.com') != -1;
	},
	isSyncAdsense: function() {
		var script = this.dom.find('script[src]'),
			scriptTag = this.dom.find('script:not([src])');
		if (script.length == 1 && scriptTag.length == 1) {
			script = script.get(0);
			scriptTag = scriptTag.html();
			return (
				script.src.trim().indexOf('pagead2.googlesyndication.com/pagead/show_ads.js') > -1 &&
				scriptTag.indexOf('google_ad_client') > -1 &&
				scriptTag.indexOf('google_ad_slot') > -1
			);
		}
		return false;
	},
	isOldAdsenseCode: function() {
		var script = this.dom.find('script:not([src])');
		if (script.length == 1) {
			script = script.html();
			return (
				script.indexOf('google_color_border') > -1 &&
				script.indexOf('google_color_bg') > -1 &&
				script.indexOf('google_color_link') > -1
			);
		}
		return false;
	},
	isAsyncCode: function() {
		var scriptsWithoutSrc = this.dom.find('script:not([src])'),
			scriptsWithSrc = this.dom.find('script[src]'),
			ins = this.dom.find('ins.adsbygoogle');
		if (((scriptsWithoutSrc.length == scriptsWithSrc.length) == ins.length) == 1) {
			scriptsWithSrc = scriptsWithSrc.get(0);
			return (
				scriptsWithSrc.src.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') > -1 &&
				this.isNonEmpty(ins.attr('data-ad-client')) &&
				this.isNonEmpty(ins.attr('data-ad-slot'))
			);
		}
		return false;
	},
	getAdsenseAsyncCode: function(adConfig) {
		var adCode = [];
		adCode.push('<scr' + 'ipt async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></scr' + 'ipt>');
		adCode.push(
			'<ins class="adsbygoogle" style="display:inline-block;width:' +
				adConfig.width +
				'px;height:' +
				adConfig.height +
				'px" data-ad-client="' +
				adConfig.pubid +
				'" data-ad-slot="' +
				adConfig.adslot +
				'"></ins>'
		);
		adCode.push('<scr' + 'ipt> (adsbygoogle = window.adsbygoogle || []).push({}); </scr' + 'ipt>');
		return adCode.join('\n');
	},
	changeSyncToAsync: function() {
		var scriptsWithoutSrc = this.dom.find('script:not([src])');
		if (scriptsWithoutSrc.length == 1) {
			$.globalEval(scriptsWithoutSrc.get(0).textContent);
			if (google_ad_width && google_ad_height && google_ad_slot && google_ad_client)
				return this.getAdsenseAsyncCode({
					width: google_ad_width,
					height: google_ad_height,
					pubid: google_ad_client,
					adslot: google_ad_slot
				});
		}
		return false;
	},
	toogleTransform: function() {
		this.runCode();
		if (!this.isCodeAdsense()) {
			this.setState({ errorMessage: 'We only support Adsense code as control.' });
		} else if (this.isAsyncCode()) {
			this.setState({ errorMessage: null, transForm: !this.state.transForm });
		} else if (this.isOldAdsenseCode()) {
			this.setState({ errorMessage: "We don't support Old Adsense code, please use async adsense code." });
		} else if (this.isSyncAdsense()) {
			var adCode = this.changeSyncToAsync();
			!adCode
				? this.setState({ errorMessage: 'There was some issue in control conversion plz contact support' })
				: this.setState({ errorMessage: null, adCode: adCode, transForm: !this.state.transForm });
		} else {
			this.setState({ errorMessage: 'There was some issue in control conversion plz contact support' });
		}
	},
	transformAnother: function() {
		this.setState({ adCode: null });
		this.toogleTransform();
	},
	selectAll: function(ev) {
		$(React.findDOMNode(this.refs.code))
			.find('textarea')
			.select();
	},
	render: function() {
		return (
			<div className="containerButtonBar">
				{!this.state.transForm ? (
					<div>
						{this.state.errorMessage ? (
							<Row>
								<Col md={12} style={{ color: 'red' }} className="error">
									<b>{this.state.errorMessage}</b>
								</Col>
							</Row>
						) : null}
						<Row>
							<Col md={12}>
								<b>Paste Your Ad Code Here</b>
							</Col>
						</Row>
						<Row>
							<Col md={12}>
								<Input
									className="txtareaFixedwidth"
									key="new"
									type="textarea"
									valueLink={this.linkState('adCode')}
									placeholder="Paste your Adcode Here."
								/>
							</Col>
						</Row>
						<Row className="butttonsRow">
							<Col xs={12}>
								<Button className="btn-lightBg btn-transform btn-block" onClick={this.toogleTransform}>
									Transform
								</Button>
							</Col>
						</Row>
					</div>
				) : (
					<div>
						<Row>
							<Col md={12}>
								<b>Transformed Code</b>
							</Col>
						</Row>
						<Row>
							<Col md={12}>
								<Input
									className="txtareaFixedwidth"
									key="code"
									ref="code"
									type="textarea"
									onClick={this.selectAll}
									value={this.getAdcode()}
								/>
							</Col>
						</Row>
						<Row className="butttonsRow">
							<Col xs={12}>
								<Button className="btn-lightBg btn-save btn-block" onClick={this.transformAnother}>
									Transform Another
								</Button>
							</Col>
						</Row>
					</div>
				)}
			</div>
		);
	}
});
