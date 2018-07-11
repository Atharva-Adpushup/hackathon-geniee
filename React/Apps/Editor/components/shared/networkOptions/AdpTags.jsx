import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
// import _ from 'lodash';
import CodeBox from '../codeBox';
import { priceFloorKeys } from '../../../consts/commonConsts';
import SelectBox from '../select/select.js';
import CustomToggleSwitch from '../customToggleSwitch.jsx';
import { getSupportedAdSizes } from '../../../../OpsPanel/lib/helpers';
class AdpTags extends Component {
	constructor(props) {
		super(props);
		const { fpKey, priceFloor, headerBidding, code, refreshSlot, overrideActive, overrideSizeTo } = props,
			// Geniee specific UI access feature 'dynamic allocation' property computation
			isGenieeUIAccessDA = !!(window.isGeniee && window.gcfg && window.gcfg.hasOwnProperty('uud')),
			isGenieeUIAccessDAActive = !!(isGenieeUIAccessDA && window.gcfg.uud),
			isGenieeUIAccessDAInActive = !!(isGenieeUIAccessDA && !window.gcfg.uud);

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
			refreshSlot,
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
		this.renderAdvancedBlock = this.renderAdvancedBlock.bind(this);
		this.renderHBOverride = this.renderHBOverride.bind(this);
		this.renderSizeOverrideSelectBox = this.renderSizeOverrideSelectBox.bind(this);
		this.renderOverrideSettings = this.renderOverrideSettings.bind(this);
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
		const { fpKey, hbAcivated, pf, keyValues, refreshSlot, overrideActive, overrideSizeTo } = this.state;
		this.props.submitHandler({
			headerBidding: !!hbAcivated,
			keyValues: {
				...this.filterKeyValues(keyValues),
				[fpKey]: pf
			},
			refreshSlot,
			overrideActive,
			overrideSizeTo: overrideActive ? overrideSizeTo : null
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
		return showButtons ? (
			<div className="containerButtonBar">
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
		) : (
			''
		);
	}

	renderNormalSaveButton(showButtons = true, submitHandler, cancelHandler) {
		return showButtons ? (
			<div>
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
		) : (
			''
		);
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

	renderGenieeNote() {
		let output = `<strong>NOTE:</strong><i><b>Geniee Zone Id</b> ${
			window.gcfg.uud ? 'and <b>Dynamic Allocation</b>' : ''
		} field(s) are non-editable.</i>`;
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

	renderDynamicAllocation() {
		let { isInsertMode } = this.props,
			isGenieeEditableMode = !!(this.props.geniee && !isInsertMode),
			isGenieeUIAccessDAActive = this.state.uiAccess.da.active,
			toShow = isGenieeUIAccessDAActive ? true : !window.isGeniee,
			label = this.props.geniee ? 'Dynamic Allocation' : 'Header Bidding';

		return toShow ? (
			<Row>
				<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
					<CustomToggleSwitch
						labelText={label}
						className="mB-10"
						checked={this.state.hbAcivated}
						disabled={isGenieeEditableMode}
						onChange={val => {
							this.setState({ hbAcivated: !!val });
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
		) : null;
	}

	renderAdvancedBlock() {
		let toShow = window.isGeniee && window.gcfg.uadkv ? true : !window.isGeniee,
			code = this.generateCode();

		return toShow ? (
			<Row>
				<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
					<pre>
						<span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{code}</span>
						<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-advance">Edit Advance</Tooltip>}>
							<span className="adDetails-icon" onClick={this.toggleAdvance}>
								<i className="btn-icn-edit" />
							</span>
						</OverlayTrigger>
					</pre>
				</Col>
			</Row>
		) : null;
	}

	renderNonAdvanced() {
		const { showButtons, onCancel, buttonType, isInsertMode } = this.props,
			code = this.generateCode(),
			isGenieeEditableMode = !!(this.props.geniee && !isInsertMode);

		return (
			<div>
				{isGenieeEditableMode ? this.renderGenieeNote() : null}
				{this.props.geniee ? null : (
					<div>
						<Row>
							<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
								<strong>Price Floor Key</strong>
							</Col>
							<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
								<SelectBox
									value={this.state.fpKey}
									label="Select Floor Price Key"
									showClear={false}
									onChange={fpKey => {
										this.setState({ fpKey });
									}}
								>
									{priceFloorKeys.map((item, index) => (
										<option key={item} value={item}>
											{item}
										</option>
									))}
								</SelectBox>
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
					</div>
				)}
				{this.renderDynamicAllocation()}
				{!this.props.geniee ? this.renderOverrideSettings(isGenieeEditableMode) : null}
				{!this.props.geniee ? (
					<Row>
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
									this.props.id ? `js-refresh-slot-switch-${this.props.id}` : 'js-refresh-slot-switch'
								}
								customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
							/>
						</Col>
					</Row>
				) : null}
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
		return (
			<div className="mB-10 mT-10">{this.state.advanced ? this.renderAdvanced() : this.renderNonAdvanced()}</div>
		);
	}
}

export default AdpTags;
