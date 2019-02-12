import React, { Component, PropTypes } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import CodeBox from '../codeBox';
import { priceFloorKeys, iabSizes } from '../../../consts/commonConsts';
import SelectBox from '../select/index';
import CustomToggleSwitch from '../customToggleSwitch.jsx';
import { getSupportedAdSizes } from '../../../../OpsPanel/lib/helpers';
import MultipleAdSizeSelector from '../../outer/insertMenu/multipleAdSizeSelector.jsx';

class AdpTags extends Component {
	constructor(props) {
		super(props);
		const {
			fpKey,
			priceFloor,
			headerBidding,
			code,
			refreshSlot,
			overrideActive,
			overrideSizeTo,
			primaryAdSize
		} = props,
			// Geniee specific UI access feature 'dynamic allocation' property computation
			isGenieeUIAccessDA = !!(window.isGeniee && window.gcfg && window.gcfg.hasOwnProperty('uud')),
			isGenieeUIAccessDAActive = !!(isGenieeUIAccessDA && window.gcfg.uud),
			isGenieeUIAccessDAInActive = !!(isGenieeUIAccessDA && !window.gcfg.uud),
			isPrimaryAdSize = !!(primaryAdSize && primaryAdSize.width && primaryAdSize.height),
			isResponsiveAdSize = !!(isPrimaryAdSize &&
				primaryAdSize.width === 'responsive' &&
				primaryAdSize.height === 'responsive');

		this.state = {
			uiAccess: {
				da: {
					exists: isGenieeUIAccessDA,
					active: isGenieeUIAccessDAActive,
					inactive: isGenieeUIAccessDAInActive
				}
			},
			fpKey: fpKey,
			// 'isGenieeUIAccessDAInActive' is added below as a condition because
			// Dynamic Allocation/Header Bidding property should be false by default
			// if Geniee UI access 'DA' (window.gcfg.uud) property is present and set to 0
			hbAcivated: isGenieeUIAccessDAInActive ? false : headerBidding,
			showMultipleAdSizesSelector: false,
			multipleAdSizes: [],
			dfpAdunitId: '',
			refreshSlot,
			isBackwardCompatibleSizes: true,
			isResponsive: isResponsiveAdSize,
			overrideActive,
			overrideSizeTo,
			pf: priceFloor,
			advanced: false,
			keyValues: !code
				? {
						[fpKey]: priceFloor
					}
				: code
		};
		this.save = this.save.bind(this);
		this.renderButtons = this.renderButtons.bind(this);
		this.renderNonAdvanced = this.renderNonAdvanced.bind(this);
		this.renderGenieeNote = this.renderGenieeNote.bind(this);
		this.toggleAdvance = this.toggleAdvance.bind(this);
		this.advanceSubmit = this.advanceSubmit.bind(this);
		this.filterKeyValues = this.filterKeyValues.bind(this);
		this.generateCode = this.generateCode.bind(this);
		this.renderDynamicAllocation = this.renderDynamicAllocation.bind(this);
		this.renderIsBackwardCompatibleSizesToggleSwitch = this.renderIsBackwardCompatibleSizesToggleSwitch.bind(this);
		this.renderAdvancedBlock = this.renderAdvancedBlock.bind(this);
		this.renderHBOverride = this.renderHBOverride.bind(this);
		this.renderSizeOverrideSelectBox = this.renderSizeOverrideSelectBox.bind(this);
		this.renderOverrideSettings = this.renderOverrideSettings.bind(this);
		this.renderManageMultipleAdSizeBlock = this.renderManageMultipleAdSizeBlock.bind(this);
		this.toggleMultipleAdSizes = this.toggleMultipleAdSizes.bind(this);
		this.multipleAdSizesSave = this.multipleAdSizesSave.bind(this);
		this.renderDFPAdUnitIdSelectBox = this.renderDFPAdUnitIdSelectBox.bind(this);
		this.handleDFPAdUnitIdChange = this.handleDFPAdUnitIdChange.bind(this);
		this.handleIsBackCompatibleSizesChange = this.handleIsBackCompatibleSizesChange.bind(this);
	}

	filterKeyValues(keyValues) {
		let response = {};
		Object.keys(keyValues).forEach((key, value) => {
			if (priceFloorKeys.indexOf(key) == -1) {
				response[key] = value;
			}
		});
		return response;
	}

	save() {
		const {
			fpKey,
			hbAcivated,
			pf,
			keyValues,
			refreshSlot,
			overrideActive,
			overrideSizeTo,
			multipleAdSizes,
			dfpAdunitId,
			isBackwardCompatibleSizes,
			isResponsive
		} = this.state,
			shouldMultipleAdSizesBeComputed = !!(isBackwardCompatibleSizes &&
				multipleAdSizes &&
				!multipleAdSizes.length);
		let computedMultipleAdSizes = multipleAdSizes;

		if (shouldMultipleAdSizesBeComputed) {
			computedMultipleAdSizes = this.getMultipleAdSizesOfPrimaryAdSize(isBackwardCompatibleSizes);
		}

		this.props.submitHandler({
			headerBidding: !!hbAcivated,
			keyValues: {
				...this.filterKeyValues(keyValues),
				[fpKey]: pf
			},
			refreshSlot,
			overrideActive,
			overrideSizeTo: overrideActive ? overrideSizeTo : null,
			multipleAdSizes: computedMultipleAdSizes,
			dfpAdunitId,
			// NOTE: Below key is exported only because it is required to provide `Backward compatible size mapping`
			// functionality in features (such as InContent sections) that cannot receive primary ad size
			// value when mounted. Deletion of this property is recommended before saving
			// other properties in database primarily as ad object network information.
			isBackwardCompatibleSizes,
			isResponsive
		});
	}

	toggleAdvance() {
		this.setState({ advanced: !this.state.advanced });
	}

	advanceSubmit(keyValues) {
		keyValues = atob(keyValues);
		keyValues = typeof keyValues != 'object' ? JSON.parse(keyValues) : keyValues;
		this.setState({ keyValues: keyValues }, this.save);
	}

	renderEditMenuButtons(showButtons = true, submitHandler, cancelHandler) {
		return showButtons
			? <div className="containerButtonBar">
					<Row className="butttonsRow mT-10">
						<Col xs={6}>
							<Button className="btn-lightBg btn-save" onClick={submitHandler}>
								Save
							</Button>
						</Col>
						<Col xs={6}>
							<Button className="btn-lightBg btn-cancel" onClick={cancelHandler}>
								Cancel
							</Button>
						</Col>
					</Row>
				</div>
			: '';
	}

	renderNormalSaveButton(showButtons = true, submitHandler, cancelHandler) {
		return showButtons
			? <div>
					<Col xs={6} style={{ paddingRight: '0px' }}>
						<Button className="btn-lightBg btn-save btn-block" onClick={submitHandler}>
							Save
						</Button>
					</Col>
					<Col xs={6} style={{ paddingRight: '0px' }}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={cancelHandler}>
							Cancel
						</Button>
					</Col>
				</div>
			: '';
	}

	renderButtons(type = 1, showButtons = true, submitHandler, cancelHandler) {
		return type == 1
			? this.renderEditMenuButtons(showButtons, submitHandler, cancelHandler)
			: this.renderNormalSaveButton(showButtons, submitHandler, cancelHandler);
	}

	generateCode() {
		return JSON.stringify({
			...this.filterKeyValues(this.state.keyValues),
			[this.state.fpKey]: this.state.pf
		});
	}

	toggleMultipleAdSizes() {
		this.setState({
			showMultipleAdSizesSelector: !this.state.showMultipleAdSizesSelector
		});
	}

	renderGenieeNote() {
		let output = `<strong>NOTE:</strong><i><b>Geniee Zone Id</b> ${window.gcfg.uud ? 'and <b>Dynamic Allocation</b>' : ''} field(s) are non-editable.</i>`;
		return (
			<Row>
				<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
					<Alert bsStyle="warning">
						<p dangerouslySetInnerHTML={{ __html: output }} />
					</Alert>
				</Col>
			</Row>
		);
	}

	multipleAdSizesSave(multipleAdSizes) {
		this.setState({
			multipleAdSizes,
			showMultipleAdSizesSelector: false
		});
	}

	renderMultipleAdSizes() {
		const { primaryAdSize } = this.props;

		return (
			<MultipleAdSizeSelector
				sizes={this.state.multipleAdSizes}
				primaryAdSize={primaryAdSize}
				onSave={this.multipleAdSizesSave}
				onCancel={this.toggleMultipleAdSizes}
			/>
		);
	}

	renderManageMultipleAdSizeBlock() {
		const isDynamicAllocation = !!this.state.hbAcivated,
			isInsertMode = this.props.isInsertMode,
			isShowBlock = !!(isDynamicAllocation && isInsertMode),
			isFromPanel = this.props.fromPanel;

		return isShowBlock
			? <Row className="mT-5 u-margin-b15px">
					<Col xs={6} className={isFromPanel ? 'u-padding-0px' : ''}>
						<strong>Multiple Ad Sizes</strong>
					</Col>
					<Col xs={6} className={isFromPanel ? 'u-padding-0px text-right' : 'text-right'}>
						<Button className="btn-lightBg" onClick={this.toggleMultipleAdSizes}>
							Manage
						</Button>
					</Col>
				</Row>
			: null;
	}

	handleDFPAdUnitIdChange(dfpAdunitId = '') {
		const stateObject = { dfpAdunitId },
			props = this.props,
			isDfpAdUnitObject = !!(props && props.dfpAdUnitObject && Object.keys(props.dfpAdUnitObject).length),
			isDfpAdUnitId = !!dfpAdunitId,
			isAdUnitInObject = !!(isDfpAdUnitId &&
				isDfpAdUnitObject &&
				props.dfpAdUnitObject.hasOwnProperty(dfpAdunitId) &&
				props.dfpAdUnitObject[dfpAdunitId] &&
				props.dfpAdUnitObject[dfpAdunitId].multipleAdSizes);

		if (isAdUnitInObject) {
			stateObject.multipleAdSizes = props.dfpAdUnitObject[dfpAdunitId].multipleAdSizes.concat([]);
		} else if (!isDfpAdUnitId) {
			stateObject.multipleAdSizes = [];
		}

		this.setState(stateObject);
	}

	renderDFPAdUnitIdSelectBox() {
		const props = this.props,
			isUniqObject = !!(props.dfpAdUnitObject && Object.keys(props.dfpAdUnitObject).length),
			isDynamicAllocation = !!this.state.hbAcivated,
			isInsertMode = props.isInsertMode,
			isShowBlock = !!(isDynamicAllocation && isInsertMode && isUniqObject);

		return isShowBlock
			? <Row className="mT-10">
					<Col xs={12} className={props.fromPanel ? 'u-padding-0px mB-10' : 'mB-10'}>
						<SelectBox
							value={this.state.dfpAdunitId}
							label="Select a DFP AdUnit Id"
							onChange={this.handleDFPAdUnitIdChange}
						>
							{Object.keys(props.dfpAdUnitObject).map((value, index) => {
								return (
									<option key={index} title={value} value={value}>
										{value}
									</option>
								);
							})}
						</SelectBox>
					</Col>
				</Row>
			: null;
	}

	renderOverrideSettings(isGenieeEditableMode) {
		return (
			<div>
				{this.state.hbAcivated ? this.renderHBOverride(isGenieeEditableMode) : null}
				{this.state.overrideActive ? this.renderSizeOverrideSelectBox() : null}
			</div>
		);
	}

	renderSizeOverrideSelectBox() {
		return (
			<Row className="mb-20">
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
					<strong>Override size to</strong>
				</Col>
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
					<SelectBox
						className="size-override-selectbox"
						value={this.state.overrideSizeTo}
						label="Select size"
						showClear={false}
						onChange={overrideSizeTo => {
							this.setState({ overrideSizeTo });
						}}
					>
						{getSupportedAdSizes().map((size, index) => (
							<option key={index} value={`${size.width}x${size.height}`}>
								{`${size.width}x${size.height}`}
							</option>
						))}
					</SelectBox>
				</Col>
			</Row>
		);
	}

	renderHBOverride(isGenieeEditableMode) {
		return (
			<Row>
				<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
					<CustomToggleSwitch
						labelText="Overrride size"
						className="mB-10"
						checked={this.state.overrideActive}
						disabled={isGenieeEditableMode}
						onChange={val => {
							this.setState({ overrideActive: !!val });
						}}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout={this.props.fromPanel ? false : true}
						name={this.props.id ? `overrideSizeSwitch-${this.props.id}` : 'overrideSizeSwitch'}
						id={this.props.id ? `js-override-size-switch-${this.props.id}` : 'js-override-size-switch'}
						customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
					/>
				</Col>
			</Row>
		);
	}

	getMultipleAdSizesOfPrimaryAdSize(isBackCompatibleSizes) {
		const { primaryAdSize } = this.props,
			primaryAdSizeString = primaryAdSize ? `${primaryAdSize.width},${primaryAdSize.height}` : '',
			multipleAdSizes = (primaryAdSizeString &&
				isBackCompatibleSizes &&
				iabSizes.BACKWARD_COMPATIBLE_MAPPING[primaryAdSizeString]) || [];

		return multipleAdSizes;
	}

	handleIsBackCompatibleSizesChange(val) {
		const isValue = !!val,
			stateObject = {
				isBackwardCompatibleSizes: isValue
			},
			multipleAdSizes = this.getMultipleAdSizesOfPrimaryAdSize(isValue);

		stateObject.multipleAdSizes = multipleAdSizes;
		this.setState(stateObject);
	}

	renderIsBackwardCompatibleSizesToggleSwitch() {
		const { fromPanel, id } = this.props, { isResponsive } = this.state, isDisabled = !!isResponsive;

		return (
			<Row>
				<Col xs={12} className={fromPanel ? 'u-padding-0px' : ''}>
					<CustomToggleSwitch
						labelText={'Add downward sizes'}
						className="mB-10"
						checked={this.state.isBackwardCompatibleSizes}
						onChange={this.handleIsBackCompatibleSizesChange}
						disabled={isDisabled}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout={fromPanel ? false : true}
						name={id ? `isBackwardCompatibleSizes-${id}` : 'isBackwardCompatibleSizes'}
						id={id ? `js-is-backward-sizes-switch-${id}` : 'js-is-backward-sizes-switch'}
						customComponentClass={fromPanel ? 'u-padding-0px' : ''}
					/>
				</Col>
			</Row>
		);
	}

	renderDynamicAllocation() {
		let { isInsertMode, geniee } = this.props,
			isGenieeEditableMode = !!(this.props.geniee && !isInsertMode),
			isGenieeUIAccessDAActive = this.state.uiAccess.da.active,
			toShow = isGenieeUIAccessDAActive ? true : !window.isGeniee,
			label = geniee ? 'Dynamic Allocation' : 'Header Bidding';

		return toShow
			? <Row>
					<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
						<CustomToggleSwitch
							labelText={label}
							className="mB-10"
							checked={this.state.hbAcivated}
							disabled={isGenieeEditableMode}
							onChange={val => {
								const isGeniee = !!geniee,
									isValue = !!val,
									isResetMultipleAdSizes = !!(isGeniee && !isValue),
									stateObject = { hbAcivated: !!val };

								if (isResetMultipleAdSizes) {
									stateObject.multipleAdSizes = [];
								}

								this.setState(stateObject);
							}}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout={this.props.fromPanel ? false : true}
							name={this.props.id ? `headerBiddingSwitch-${this.props.id}` : 'headerBiddingSwitch'}
							id={this.props.id ? `js-header-bidding-switch-${this.props.id}` : 'js-header-bidding-switch'}
							customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
						/>
					</Col>
				</Row>
			: null;
	}

	renderAdvancedBlock() {
		let toShow = window.isGeniee && window.gcfg.uadkv ? true : !window.isGeniee, code = this.generateCode();

		return toShow
			? <Row>
					<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
						<pre>
							<span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{code}</span>
							<OverlayTrigger
								placement="bottom"
								overlay={<Tooltip id="edit-advance">Edit Advance</Tooltip>}
							>
								<span className="adDetails-icon" onClick={this.toggleAdvance}>
									<i className="btn-icn-edit" />
								</span>
							</OverlayTrigger>
						</pre>
					</Col>
				</Row>
			: null;
	}

	renderNonAdvanced() {
		const { showButtons, onCancel, buttonType, isInsertMode } = this.props,
			code = this.generateCode(),
			isGenieeEditableMode = !!(this.props.geniee && !isInsertMode);

		return (
			<div>
				{isGenieeEditableMode ? this.renderGenieeNote() : null}
				{this.props.geniee
					? null
					: <div>
							<Row>
								<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
									<strong>Price Floor Key</strong>
								</Col>
								<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
									<SelectBox
										id="price-floor-key-selection"
										title="Select Floor Price Key"
										onSelect={fpKey => {
											this.setState({ fpKey });
										}}
										selected={this.state.fpKey}
										options={priceFloorKeys.map((item, index) => {
											return {
												name: item,
												value: item
											}
										}
										)}
									/>
								</Col>
							</Row>
							<Row className="mT-10">
								<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
									<strong>Price Floor</strong>
								</Col>
								<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
									<input
										type="text"
										placeholder="Enter Price Floor"
										className="inputBasic mB-10"
										value={this.state.pf}
										onChange={ev => {
											this.setState({ pf: ev.target.value });
										}}
									/>
								</Col>
							</Row>
						</div>}
				{this.renderDynamicAllocation()}
				{this.props.geniee ? null : this.renderIsBackwardCompatibleSizesToggleSwitch()}
				{this.props.geniee ? this.renderDFPAdUnitIdSelectBox() : null}
				{this.props.geniee ? this.renderManageMultipleAdSizeBlock() : null}
				{!this.props.geniee ? this.renderOverrideSettings(isGenieeEditableMode) : null}
				{!this.props.geniee && this.props.networkConfig && this.props.networkConfig.enableRefreshSlot
					? <Row>
							<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
								<CustomToggleSwitch
									labelText="Refresh Slot"
									className="mB-10"
									checked={this.state.refreshSlot}
									onChange={val => {
										this.setState({ refreshSlot: !!val });
									}}
									layout="horizontal"
									size="m"
									on="Yes"
									off="No"
									defaultLayout={this.props.fromPanel ? false : true}
									name={this.props.id ? `refreshSlotSwitch-${this.props.id}` : 'refreshSlotSwitch'}
									id={
										this.props.id
											? `js-refresh-slot-switch-${this.props.id}`
											: 'js-refresh-slot-switch'
									}
									customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
								/>
							</Col>
						</Row>
					: null}
				{this.renderAdvancedBlock()}
				<div>{this.renderButtons(buttonType, showButtons, this.save, onCancel)}</div>
			</div>
		);
	}

	renderAdvanced() {
		return (
			<CodeBox
				showButtons={true}
				onSubmit={this.advanceSubmit}
				onCancel={this.toggleAdvance}
				size="small"
				cancelText="Back"
				code={btoa(this.generateCode())}
			/>
		);
	}

	render() {
		const renderBlocks = [], isShowMultipleAdSize = !!(this.props.geniee && this.state.showMultipleAdSizesSelector);

		if (this.state.advanced) {
			renderBlocks.push(<div key={1}>{this.renderAdvanced()}</div>);
		} else if (isShowMultipleAdSize) {
			renderBlocks.push(<div key={1}>{this.renderMultipleAdSizes()}</div>);
		} else {
			renderBlocks.push(<div key={1}>{this.renderNonAdvanced()}</div>);
		}

		return <div className="mB-10 mT-10">{renderBlocks}</div>;
	}
}

export default AdpTags;
