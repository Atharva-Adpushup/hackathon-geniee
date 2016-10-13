var React = window.React,
	$ = window.jQuery,
	_ = require('libs/third-party/underscore'),
	Utils = require('libs/custom/utils'),
	CustomForm = require('CustomComponents/CustomForm/CustomForm.jsx'),
	CustomToggleSwitch = require('CustomComponents/CustomForm/CustomToggleSwitch.jsx'),
	CustomInputText = require('CustomComponents/CustomForm/CustomInputText.jsx'),
	CustomInputNumber = require('CustomComponents/CustomForm/CustomInputNumber.jsx'),
	CustomCheckboxGroup = require('CustomComponents/CustomForm/CustomCheckboxGroup.jsx'),
	CustomJsCodeEditorManager = require('CustomComponents/CustomJsCodeEditorManager.jsx'),
	CustomCssEditorManager = require('CustomComponents/CustomCssEditorManager.jsx'),
	NumericBlockListManager = require('CustomComponents/NumericBlockListManager.jsx'),
	BlockListManager = require('EditorComponents/OuterComponents/OptionsMenu/blockListManager.jsx'),
	LabelWithButton = require('CustomComponents/CustomForm/LabelWithButton.jsx');


module.exports = React.createClass({

	getInitialState: function(props) {
		var props = props || this.props;
		var sizes = props.inContentAction ? _(props.inContentAction.value).map(function(props) {
			return this.getStringFromSize(props.data);
		}.bind(this)) : [];

		return {
			adAwareness: props.settings.adAwareness,
			equidistantPointers: props.settings.equidistantPointers,
			imageCheck: props.settings.imageCheck,
			maxOffset: props.settings.maxOffset,
			maxPlacements: props.settings.maxPlacements,
			minPlacements: props.settings.minPlacements,
			minDistance: props.settings.minDistance,
			blackListFloat: props.settings.blackListFloat,
			ignoreRanges: props.settings.ignoreRanges,
			ignoreXpath: props.settings.ignoreXpath,
			pointerSelectors: props.settings.pointerSelectors,
			contentSelector: Utils.trimString(props.settings.contentSelector),
			sizes: sizes ? sizes : props.settings.sizes,
			margins: props.settings.margins,
			customJs: props.settings.customJs,
			/** ***Toggle state managers for above states*****/
			manageCustomJs: false,
			manageMargins: false,
			manageAdvanceSettings: false,
			manageChangeInXpath: false,
			manageIgnoreRanges: false,
			manageIgnoreXpath: false,
			managePointerSelectors: false
		};
	},

	getSizeFromString: function(size) {
		size = size.split('x');
		return {width: parseInt(size[0]), height: parseInt(size[1])};
	},

	getStringFromSize: function(size) {
		return size.width + 'x' + size.height;
	},

	getAdSizes: function(initial, current) {
		var sizesAdded = _(_.difference(current, initial)).map(function(size) {
				return this.getSizeFromString(size);
			}.bind(this)),

			sizesRemoved = _(_.difference(initial, current)).map(function(size) {
				return this.getSizeFromString(size);
			}.bind(this));

		return {sizesAdded: sizesAdded, sizesRemoved: sizesRemoved};
	},

	toggleAdvanceSettings: function() {
		this.setState({manageAdvanceSettings: !this.state.manageAdvanceSettings},

		function() {
			this.props.onUpdate();
		});
	},

	toggleBlockList: function(name) {
		switch (name) {
			case 'customJs':
				this.setState({manageCustomJs: !this.state.manageCustomJs});
				break;

			case 'margins':
				this.setState({manageMargins: !this.state.manageMargins});
				break;

			case 'ignoreRanges':
				this.setState({manageIgnoreRanges: !this.state.manageIgnoreRanges});
				break;

			case 'ignoreXpath':
				this.setState({manageIgnoreXpath: !this.state.manageIgnoreXpath});
				break;

			case 'pointerSelectors':
				this.setState({managePointerSelectors: !this.state.managePointerSelectors});
				break;
		}
	},

	saveBlockList: function(name, blocklist) {
		switch (name) {
			case 'customJs':
				this.setState({customJs: blocklist});
				break;

			case 'margins':
				this.setState({margins: blocklist});
				break;

			case 'ignoreRanges':
				this.setState({ignoreRanges: blocklist});
				break;

			case 'ignoreXpath':
				this.setState({ignoreXpath: blocklist});
				break;

			case 'pointerSelectors':
				this.setState({pointerSelectors: blocklist});
				break;
		}
	},

	setValue: function(target, arg) {
		var val = null, numericValue = null;

		if (arg && arg.currentTarget) {
			val = arg.currentTarget.value;
			numericValue = parseInt(val, 10);
		}
		else if (arg.constructor === Array) {
			val = arg;
		}

		switch (target) {
			case 'maxPlacements':
				// If current value is less than minPlacements, set value to minPlacements
				if (val < this.state.minPlacements) {
					this.setState({'maxPlacements': this.state.minPlacements});
				}
				// Else update the value
				else {
					this.setState({'maxPlacements': numericValue});
				}

				break;
			case 'minPlacements':
				// If current value is greater than maxPlacements, set value to maxPlacements
				if (val > this.state.maxPlacements) {
					this.setState({'minPlacements': this.state.maxPlacements});
				}
				// Else update the value
				else {
					this.setState({'minPlacements': numericValue});
				}
				break;

			case 'equidistantPointers':
				this.setState({'equidistantPointers': !this.state.equidistantPointers});
				break;

			case 'adAwareness':
				this.setState({'adAwareness': !this.state.adAwareness});
				break;

			case 'imageCheck':
				this.setState({'imageCheck': !this.state.imageCheck});
				break;

			case 'maxOffset':
				this.setState({'maxOffset': numericValue});
				break;

			case 'minDistance':
				this.setState({'minDistance': numericValue});
				break;

			case 'contentSelector':
				this.setState({'contentSelector': Utils.trimString(val)});
				break;

			case 'blackListFloat':
				this.setState({'blackListFloat': val});
				break;

			case 'sizes':
				this.setState({'sizes': val});
				break;
		}
	},

	/**
	 * Save in-content js settings and send updated model to parent prop
	 * @param model
	 */
	saveSettings: function(model) {
		var finalModel = $.extend(true, this.state, model);
		var extraKeys = ['manageIgnoreRanges', 'manageIgnoreXpath', 'managePointerSelectors',
			'manageChangeInXpath', 'manageAdvanceSettings', 'manageMargins', 'manageCustomJs'];

		// Remove unnecessary properties from finalModel
		extraKeys.map(function(val) {
			delete finalModel[val];
		});
		$.extend(true, finalModel, this.getAdSizes(this.props.settings['sizes'], this.state['sizes']));

		this.props.onSave(finalModel);
	},

	/**
	 * Render Min and Maximum Placement component
	 * @returns {XML}
	 */
	renderMinMaxPlacements: function() {
		return (
			<div>
				<CustomInputNumber respectNextPropsValue labelText="Maximum Placements" name="maxPlacements" layout="horizontal" min={0} max={20} step={1} onChange={this.setValue.bind(null, 'maxPlacements')} value={this.state.maxPlacements} required validations="isNumber" validationError="Enter placements between 0 and 20" />
				<CustomInputNumber respectNextPropsValue labelText="Minimum Placements" name="minPlacements" layout="horizontal" min={0} max={20} step={1} onChange={this.setValue.bind(null, 'minPlacements')} value={this.state.minPlacements} required validations="isNumber" validationError="Enter placements between 0 and 20" />
			</div>
		);
	},

	renderAdvanceSettings: function(style) {
		return (
			<div style={style} className="clearfix">
				<CustomCheckboxGroup respectNextPropsValue labelText="Blacklist Float" name="blackListFloat" value={this.state.blackListFloat} onChange={this.setValue.bind(null, 'blackListFloat')} layout="vertical">
					<Col className="u-padding-0px" xs={6}>
						<input type="checkbox" className="maincheckbox" id="js-blacklist-left" value="left" />
						<label htmlFor="js-blacklist-left">left</label>
					</Col>
					<Col className="u-padding-l10px" xs={6}>
						<input type="checkbox" className="maincheckbox" id="js-blacklist-right" value="right" />
						<label htmlFor="js-blacklist-right">right</label>
					</Col>
					<Col className="u-padding-0px" xs={6}>
						<input type="checkbox" className="maincheckbox" id="js-blacklist-none" value="none" />
						<label htmlFor="js-blacklist-none">none</label>
					</Col>
				</CustomCheckboxGroup>
				<CustomToggleSwitch labelText="Ad Awareness" checked={this.state.adAwareness} name="adAwareness" onChange={this.setValue.bind(null, 'adAwareness')} layout="horizontal" size="s" id="js-ad-awareness" on="Yes" off="No" />
				<CustomToggleSwitch labelText="Equidistant Pointers" checked={this.state.equidistantPointers} name="equidistantPointers" onChange={this.setValue.bind(null, 'equidistantPointers')} layout="horizontal" size="s" id="js-eqd-pointers" on="Yes" off="No" />
				<CustomToggleSwitch labelText="Image Check" name="imageCheck" checked={this.state.imageCheck} onChange={this.setValue.bind(null, 'imageCheck')} layout="horizontal" size="s" id="js-img-check" on="Yes" off="No" />
				<CustomInputNumber respectNextPropsValue labelText="Maximum Offset" name="maxOffset" layout="horizontal" min={0} max={50000} step={1} onChange={this.setValue.bind(null, 'maxOffset')} value={this.state.maxOffset} required validations="isNumber" validationError="Enter offset between 0 and 50000" />
				{!(this.state.equidistantPointers) ? this.renderMinMaxPlacements() : null}
				<CustomInputNumber respectNextPropsValue labelText="Minimum Distance" name="minDistance" layout="horizontal" min={200} max={1000} step={1} onChange={this.setValue.bind(null, 'minDistance')} value={this.state.minDistance} required validations="isNumber" validationError="Enter minimum distance between 200 and 1000" />
				<LabelWithButton name="ignoreRanges-list" onButtonClick={this.toggleBlockList.bind(null, 'ignoreRanges')} labelText="Ignore Ranges" layout="horizontal" buttonText="Manage" />
				<LabelWithButton name="ignoreXpath-list" onButtonClick={this.toggleBlockList.bind(null, 'ignoreXpath')} labelText="Ignore Selectors" layout="horizontal" buttonText="Manage" />
				<LabelWithButton name="pointerSelectors-list" onButtonClick={this.toggleBlockList.bind(null, 'pointerSelectors')} labelText="Specify Selectors" layout="horizontal" buttonText="Manage" />
				<LabelWithButton name="margins-list" onButtonClick={this.toggleBlockList.bind(null, 'margins')} labelText="Specify Margins" layout="horizontal" buttonText="Manage" />
				<LabelWithButton name="customJs-list" onButtonClick={this.toggleBlockList.bind(null, 'customJs')} labelText="In Content JS" layout="horizontal" buttonText="Manage" />
			</div>
		);
	},

	render: function() {
		if (this.state.manageCustomJs) {
			return (<CustomJsCodeEditorManager code={this.state.customJs} onSave={this.saveBlockList.bind(null, 'customJs')} onBack={this.toggleBlockList.bind(null, 'customJs')} />);
		}

		if (this.state.manageMargins) {
			return (<CustomCssEditorManager blockList={this.state.margins} onSave={this.saveBlockList.bind(null, 'margins')} onBack={this.toggleBlockList.bind(null, 'margins')} />);
		}

		if (this.state.manageIgnoreRanges) {
			return (<NumericBlockListManager blockList={this.state.ignoreRanges} onSave={this.saveBlockList.bind(null, 'ignoreRanges')} onBack={this.toggleBlockList.bind(null, 'ignoreRanges')} />);
		}

		if (this.state.manageIgnoreXpath) {
			return (<BlockListManager blockList={this.state.ignoreXpath} onSave={this.saveBlockList.bind(null, 'ignoreXpath')} onBack={this.toggleBlockList.bind(null, 'ignoreXpath')} />);
		}

		if (this.state.managePointerSelectors) {
			return (<BlockListManager blockList={this.state.pointerSelectors} onSave={this.saveBlockList.bind(null, 'pointerSelectors')} onBack={this.toggleBlockList.bind(null, 'pointerSelectors')} />);
		}

		return (
			<CustomForm onSubmit={this.saveSettings} className="containerButtonBar" showBlockBtn>
				<CustomInputText respectNextPropsValue required labelText="Content Area Css Path" name="contentSelector" onChange={this.setValue.bind(null, 'contentSelector')} layout="vertical" value={this.state.contentSelector} validations="isLength:1:500" validationError="Enter a valid css path" />
				<CustomCheckboxGroup respectNextPropsValue labelText="Select Sizes To Try" name="sizes" value={this.state.sizes} onChange={this.setValue.bind(null, 'sizes')} layout="vertical">
					<Col className="u-padding-0px" xs={6}>
						<input type="checkbox" className="maincheckbox" id="trySizes-one" value={this.props.channel.platform == 'MOBILE' ? '300x250' : '336x280'}/>
						<label htmlFor="trySizes-one">{this.props.channel.platform == 'MOBILE' ? '300x250' : '336x280'}</label>
					</Col>
					<Col className="u-padding-0px" xs={6}>
						<input type="checkbox" className="maincheckbox"  id="trySizes-two" value={this.props.channel.platform == 'MOBILE' ? '320x100' : '728x90'}/>
						<label htmlFor="trySizes-two">{this.props.channel.platform == 'MOBILE' ? '320x100' : '728x90'}</label>
					</Col>
					{_(this.props.customSizes).map(function(size) {
						var t = size.width + 'x' + size.height;

						return (
							<Col className="u-padding-0px" xs={6}>
								<input type="checkbox" className="maincheckbox" id={t} value={t}/>
								<label htmlFor={t}>{t}</label>
							</Col>
						);
					}.bind(this))}
				</CustomCheckboxGroup>
				{this.state.manageAdvanceSettings ? this.renderAdvanceSettings({display: 'block'}) : this.renderAdvanceSettings({display: 'none'})}

				<Row className="form-group row">
					<Col xs={12} md={12} className="u-padding-0px">
						<Button className={this.state.manageAdvanceSettings ? 'btn-lightBg btn-chevron-up btn-block' : 'btn-lightBg btn-chevron-down btn-block'} onClick={this.toggleAdvanceSettings}>{this.state.manageAdvanceSettings ? 'Show Less' : 'Show More'}</Button>
					</Col>
				</Row>
			</CustomForm>
		);
	}
});
