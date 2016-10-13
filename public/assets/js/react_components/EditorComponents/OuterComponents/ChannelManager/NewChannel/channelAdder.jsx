var React = window.React,
	_ = require('libs/third-party/underscore'),
	utils = require('libs/custom/utils'),
	Input = require('BootstrapComponents/Input.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	Autocomplete = require('CustomComponents/ComboBox/main.js'),
	SelectBox = require('CustomComponents/Select/select.js'),
	CustomToggleSwitch = require('CustomComponents/CustomForm/CustomToggleSwitch.jsx'),
	Combobox = Autocomplete.Combobox,
	ComboboxOption = Autocomplete.Option,
	RadioGroup = require('CustomComponents/RadioButtonGroup/radioButtonGroup.jsx'),
	adRecoverPageGroupName = '_ADRECOVER',
	apexPageGroupName = '_APEX';

module.exports = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function() {
		return {
			platform: null,
			pageGroup: null,
			sampleUrl: null,
			pageGroupList: _(this.props.cmsInfo.pageGroups).pluck('pageGroup'),
			pageGroupSelected: false,
			isAdRecover: false,
			alreadyUsedPlatforms: []
		};
	},
	onPageGroupFocus: function() {
		this.setState({ pageGroupSelected: false, platform: null });
	},
	getApexVariationCount: function(pageGroup, platform) {
		return _.filter(this.props.channels, function(channel) {
			return channel.platform === platform.toUpperCase() &&
				channel.pageGroup.indexOf(pageGroup.toUpperCase() + apexPageGroupName) > -1;
		}).length;
	},
	getAlreadyUsedPlatform: function(pageGroup) {
		return _(_(this.props.channels).filter({ pageGroup: pageGroup.toUpperCase() })).pluck('platform');
	},
	isAdRecoverPlatformAlreadyUsed: function(pageGroup, platform) {
		var adRecoverPageGroup = (pageGroup + adRecoverPageGroupName),
			alreadyUsedPlatforms = this.getAlreadyUsedPlatform(adRecoverPageGroup);

		return (alreadyUsedPlatforms.indexOf(platform) !== -1);
	},
	onPageGroupBlur: function() {
		var inputValue = React.findDOMNode(this).querySelector('.rf-combobox-input').value;
		if (!inputValue) {
			this.setState({ pageGroup: null });
		} else if (this.state.pageGroup) {
			this.setState({ alreadyUsedPlatforms: this.getAlreadyUsedPlatform(inputValue) });
		}
	},
	handlePlatformChange: function(platform) {
		this.setState({ platform: platform });
	},
	save: function() {
		var variationCount = 0,
			pageGroupBase = utils.trimString(this.state.pageGroup).toUpperCase(),
			pageGroup = this.state.isAdRecover ? (pageGroupBase + adRecoverPageGroupName) : pageGroupBase,
			channelName = (pageGroup + '_' + utils.trimString(this.state.platform)).toUpperCase();

		if (this.props.apex) {
			variationCount =  this.getApexVariationCount(this.state.pageGroup, this.state.platform);
			pageGroup = pageGroupBase + apexPageGroupName + '_' + (++variationCount);
			channelName =  (pageGroup + '_' + utils.trimString(this.state.platform)).toUpperCase();
		}

		this.props.onSave({
			channelName: channelName,
			platform: utils.trimString(this.state.platform).toUpperCase(),
			pageGroup: pageGroup,
			sampleUrl: utils.trimString(this.state.sampleUrl),
			isAdRecover: this.state.isAdRecover
		});
	},
	handlePageGroupInput: function(userInput) {
		this.setState({ pageGroup: userInput }, function() {
			if (userInput === '') {
				return this.setState({ pageGroupList: this.getInitialState().pageGroupList });
			}
			this.setState({ alreadyUsedPlatforms: this.getAlreadyUsedPlatform(userInput) });

			var filter = new RegExp('^' + userInput, 'i');
			setTimeout(function() {
				this.setState({
					pageGroupList: this.getInitialState().pageGroupList.filter(function(pageGroup) {
						return filter.test(pageGroup) || filter.test(pageGroup);
					})
				});
			}.bind(this), 200);
		}.bind(this));
	},
	handlePageGroupSelect: function(pageGroup) {
		var pg = _(this.props.cmsInfo.pageGroups).findWhere({ pageGroup: pageGroup.toUpperCase() });
		this.setState({
			pageGroup: pageGroup,
			sampleUrl: pg ? pg.sampleUrl : null,
			alreadyUsedPlatforms: this.getAlreadyUsedPlatform(pageGroup)
		});
	},
	handleSampleUrlBlur: function() {
		if (this.state.sampleUrl &&
			utils.ValidUrl(utils.trimString(this.state.sampleUrl)) &&
			(utils.parseUrl(this.state.sampleUrl).hostname === utils.parseUrl(window.ADP_SITE_DOMAIN).hostname)) {
			this.setState({ sampleUrl: utils.parseUrl(this.refs.sampleUrl.getValue()).href });
		}
	},
	handleSampleUrlChange: function() {
		this.setState({ sampleUrl: utils.trimString(this.refs.sampleUrl.getValue()) });
	},
	toggleStateValues: function(target) {
		switch (target) {
			case 'isAdRecover':
				this.setState({ isAdRecover: !this.state.isAdRecover });
				break;
			default:
				break;
		}
	},
	renderIsAdRecoverToggleSwitch: function() {
		return (
			<CustomToggleSwitch className="u-margin-t10px" labelText="Is AR" defaultLayout checked={this.state.isAdRecover} name="isAdRecover" onChange={this.toggleStateValues.bind(null, 'isAdRecover') } layout="horizontal" size="m" id="js-manage-adrecover" on="On" off="Off" />
		);
	},
	renderPlatformRow: function() {
		var self = this,
			isRadioGroupDesktopEnable = (this.state.isAdRecover) ? (!(self.state.pageGroup) || this.isAdRecoverPlatformAlreadyUsed(self.state.pageGroup, 'DESKTOP')) : (!(self.state.pageGroup) || (this.state.alreadyUsedPlatforms.indexOf('DESKTOP') !== -1)),
			isRadioGroupMobileEnable = (this.state.isAdRecover) ? (!(self.state.pageGroup) || this.isAdRecoverPlatformAlreadyUsed(self.state.pageGroup, 'MOBILE')) : (!(self.state.pageGroup) || (this.state.alreadyUsedPlatforms.indexOf('MOBILE') !== -1)),
			isRadioGroupTabletEnable = (this.state.isAdRecover) ? (!(self.state.pageGroup) || this.isAdRecoverPlatformAlreadyUsed(self.state.pageGroup, 'TABLET')) : (!(self.state.pageGroup) || (this.state.alreadyUsedPlatforms.indexOf('TABLET') !== -1));

		return (
			<Row className="platformRow">
				<Col xs={12} >
					<label>Device</label>
				</Col>
				<RadioGroup name="platform" value={self.state.platform} onChange={self.handlePlatformChange}>
					<Col xs={4}>
						<input disabled={this.props.apex ? false : isRadioGroupDesktopEnable} type="radio" id="desktop" value="desktop"/>
						<label htmlFor="desktop">
							<i className="fa fa-desktop"></i>
							Desktop</label>
					</Col>
					<Col xs={4}>
						<input disabled={this.props.apex ? false : isRadioGroupMobileEnable} type="radio"  id="mobile" value="mobile"/>
						<label htmlFor="mobile">
							<i className="fa fa-mobile"></i>
							Mobile</label>
					</Col>
					<Col xs={4}>
						<input disabled={this.props.apex ? false : isRadioGroupTabletEnable} type="radio" id="tablet" value="tablet" />
						<label htmlFor="tablet">
							<i className="fa fa-tablet"></i>
							Tablet</label>
					</Col>
				</RadioGroup>
			</Row>
		);
	},
	renderSelectBox: function() {
		return (
			<Row>
				<Col xs={12}><label>Page Group </label>				</Col>
				<Col xs={12}>{
					this.props.cmsInfo && this.props.cmsInfo.cmsName.toLowerCase() === 'wordpress' ?
						<SelectBox label="Select Page Group" value={this.state.pageGroup} onFocus={this.onPageGroupFocus} onChange={this.handlePageGroupSelect}>
							{this.state.pageGroupList.map(function(pageGroup) {
								return (<option value={pageGroup}>{pageGroup}</option>);
							}) }
						</SelectBox> :
						<Combobox onSelect={this.handlePageGroupSelect} onInput={this.handlePageGroupInput} onInputFocus={this.onPageGroupFocus} onBlur={this.onPageGroupBlur} value={this.state.pageGroup}>
							{
								this.state.pageGroupList.map(function(pageGroup) {
									return (
										<ComboboxOption key={pageGroup} value={pageGroup}>{pageGroup}</ComboboxOption>
									);
								})
							}
						</Combobox>
				}
				</Col>
			</Row>
		);
	},
	render: function() {
		var self = this,
			urlHost = utils.parseUrl(this.state.sampleUrl).hostname.replace('www.', ''),
			siteHost = utils.parseUrl(window.ADP_SITE_DOMAIN).hostname.replace('www.', ''),
			otherThingsValid = this.state.pageGroup && (utils.trimString(this.state.pageGroup) !== '') && this.state.sampleUrl && this.state.platform && utils.ValidUrl(utils.trimString(this.state.sampleUrl)),
			hostValid = (urlHost === siteHost),
			allDone = (otherThingsValid && hostValid),
			variationCount = allDone ? this.getApexVariationCount(this.state.pageGroup, this.state.platform) : null,
			variationText = variationCount ? 'Create Variation ' + (variationCount + 1) : 'Create Variation 1';

		return (
			<div className="containerButtonBar">

				{this.renderSelectBox() }

				{this.props.adRecover ? this.renderIsAdRecoverToggleSwitch() : null}

				{this.renderPlatformRow() }

				<Row>
					<Col xs={12}>
						<label>Sample URL</label>
					</Col>
					<Col xs={12}>
						<Input className="sampleUrl" type="text" ref="sampleUrl" onBlur={this.handleSampleUrlBlur} name="sampleUrl" placeholder="http://" value={this.state.sampleUrl} onChange={this.handleSampleUrlChange} />
					</Col>
					{otherThingsValid && !hostValid ?
						<Col xs={12}>
							<span style={{ color: 'red' }}>Url should be from your website only</span>
						</Col>
						:
						null
					}

				</Row>
				<Row className="butttonsRow">
					<Col xs={12}>
						<Button disabled={!allDone} className="btn-lightBg btn-save btn-block" onClick={this.save}>
							{!this.props.apex ? 'Create Page Group' : variationText }
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
});
