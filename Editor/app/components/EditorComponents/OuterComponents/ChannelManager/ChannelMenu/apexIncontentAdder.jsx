var React = window.React,
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	BlockListManager = require('EditorComponents/OuterComponents/OptionsMenu/blockListManager.jsx'),
	Fluxxor = require('libs/third-party/fluxxor'),
	CustomJsCodeEditorManager = require('CustomComponents/CustomJsCodeEditorManager.jsx'),
	LabelWithButton = require('CustomComponents/CustomForm/LabelWithButton.jsx'),
	SelectBox = require('CustomComponents/Select/select.js'),
	$ = require('libs/third-party/jquery'),
	FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
	mixins: [FluxMixin],

	getInitialState: function() {
		var apexIncontentSection = this.props.apexIncontentSection,
			isApexSection = (!!(apexIncontentSection) && !!(apexIncontentSection.inContentSettings)),
			defaultCss = {'margin-left': 'auto', 'margin-right': 'auto', 'margin-top': 5, 'margin-bottom': 5 };

		return {
			manageAdBox: false,
			css: (isApexSection && apexIncontentSection.inContentSettings.css) ? apexIncontentSection.inContentSettings.css : defaultCss,
			float: (isApexSection && apexIncontentSection.inContentSettings.float) ? apexIncontentSection.inContentSettings.float : 'none',
			height: (isApexSection && apexIncontentSection.inContentSettings.height) ? apexIncontentSection.inContentSettings.height : null,
			width: (isApexSection && apexIncontentSection.inContentSettings.width) ? apexIncontentSection.inContentSettings.width : null,
			section: (isApexSection && apexIncontentSection.inContentSettings.section) ? apexIncontentSection.inContentSettings.section : null,
			adCode: (isApexSection && apexIncontentSection.adCode) ? apexIncontentSection.adCode : null,
			ignoreXpaths: (isApexSection && apexIncontentSection.inContentSettings.ignoreXpaths) ? apexIncontentSection.inContentSettings.ignoreXpaths : [],
			minDistanceFromPrevAd: (isApexSection && apexIncontentSection.inContentSettings.minDistanceFromPrevAd) ? apexIncontentSection.inContentSettings.minDistanceFromPrevAd : 200,
			showCustomCssEditor: false,
			showIgnoreXpathManager: false,
			isEditMode: isApexSection
		};
	},
	setCss: function(payload) {
		var css = {float: 'none', margin: '5px' };
		if (typeof payload === 'object') {
			this.setState({css: payload});
		} else if (payload === 'left') {
			this.setState({float: payload, css: Object.assign({}, css, {float: payload})});
		} else if (payload === 'right') {
			this.setState({float: payload, css: Object.assign({}, css, {float: payload})});
		} else if (payload === 'none') {
			this.setState({float: payload, css: Object.assign({}, css, {float: payload, margin: '5px auto 5px auto'})});
		}
	},
	toggleAdCodeBox: function() {
		this.setState({manageAdBox: !this.state.manageAdBox});
	},
	getUpdatedSection: function() {
		var section = $.extend(true, {}, this.props.apexIncontentSection);

		if (section) {
			section.inContentSettings.css = $.extend(true, {}, this.state.css);
			section.inContentSettings.float = this.state.float;
			section.inContentSettings.height = this.state.height;
			section.inContentSettings.width = this.state.width;
			section.inContentSettings.section = this.state.section;
			section.adCode = this.state.adCode;
			section.inContentSettings.ignoreXpaths = this.state.ignoreXpaths;
			section.inContentSettings.minDistanceFromPrevAd = this.state.minDistanceFromPrevAd;
		}

		return section;
	},
	saveApexSettings: function() {
		var updatedSection;

		if (this.state.isEditMode) {
			updatedSection = this.getUpdatedSection();
			return this.getFlux().actions.updateSection(updatedSection);
		}

		this.getFlux().actions.createApexIncontentSection({
			isIncontent: true,
			adCode: this.state.adCode,
			inContentSettings: {
				section: this.state.section,
				height: this.state.height,
				width: this.state.width,
				css: this.state.css,
				float: this.state.float,
				minDistanceFromPrevAd: this.state.minDistanceFromPrevAd,
				ignoreXpaths: this.state.ignoreXpaths
			}});
	},
	setValue: function(target, ev) {
		var val = ev.currentTarget.value;
		switch (target) {
			case 'height':
				this.setState({'height': parseInt(val, 10)});
				break;
			case 'width':
				this.setState({'width': parseInt(val, 10)});
				break;
			case 'section':
				this.setState({'section': parseInt(val, 10)});
				break;
			case 'minDistanceFromPrevAd':
				this.setState({'minDistanceFromPrevAd': parseInt(val, 10)});
				break;
			default:
				break;
		}
	},
	setAdCode: function(adCode) {
		this.setState({
			'adCode': adCode
		});
	},
	render: function() {
		var isSettingsEntered = this.state.float && this.state.height && this.state.width && this.state.section && this.state.minDistanceFromPrevAd && this.state.adCode;

		if (this.state.manageAdBox) {
			return (<CustomJsCodeEditorManager code={this.state.adCode} onSave={this.setAdCode} onBack={this.toggleAdCodeBox} />);
		}

		return (<div className="containerButtonBar sm-pad">
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Section</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<input type="number" onChange={this.setValue.bind(null, 'section')} value={this.state.section} />
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Float</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<SelectBox label="Select Page Group" value={this.state.float} onChange={this.setCss}>
							<option value="none">None</option>
							<option value="left">Left</option>
							<option value="right">Right</option>
						</SelectBox>
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Height</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<input type="number" onChange={this.setValue.bind(null, 'height')} value={this.state.height} />
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Width</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<input type="number" onChange={this.setValue.bind(null, 'width')} value={this.state.width} />
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>minDistanceFromPrevAd</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<input type="number" onChange={this.setValue.bind(null, 'minDistanceFromPrevAd')} value={this.state.minDistanceFromPrevAd} />
					</Col>
				</Row>
				<LabelWithButton name="adCode-list" onButtonClick={this.toggleAdCodeBox} labelText="Section Ad code" layout="horizontal" buttonText="Manage" />
				<Row className="butttonsRow">
					<Col xs={12}>
						<Button disabled={!isSettingsEntered} className="btn-lightBg btn-save btn-block" onClick={this.saveApexSettings}>
							Save
						</Button>
					</Col>
				</Row>
		</div>);
	}
});
