import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
// import _ from 'lodash';
import CodeBox from '../codeBox';
import { priceFloorKeys } from '../../../consts/commonConsts';
import SelectBox from '../select/select.js';
import CustomToggleSwitch from '../customToggleSwitch.jsx';
class AdpTags extends Component {
	constructor(props) {
		super(props);
		const { fpKey, priceFloor, headerBidding, code } = props;
		this.state = {
			fpKey: fpKey,
			hbAcivated: headerBidding,
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
		this.toggleAdvance = this.toggleAdvance.bind(this);
		this.advanceSubmit = this.advanceSubmit.bind(this);
		this.filterKeyValues = this.filterKeyValues.bind(this);
		this.generateCode = this.generateCode.bind(this);
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
		const { fpKey, hbAcivated, pf, keyValues } = this.state;
		this.props.submitHandler({
			headerBidding: !!hbAcivated,
			keyValues: {
				...this.filterKeyValues(keyValues),
				[fpKey]: pf
			}
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

	renderNonAdvanced() {
		const { showButtons, onCancel, buttonType } = this.props,
			code = this.generateCode();

		return (
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
				<Row>
					<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
						<CustomToggleSwitch
							labelText={this.props.geniee ? 'Dynamic Allocation' : 'Header Bidding'}
							className="mB-10"
							checked={this.state.hbAcivated}
							onChange={val => {
								this.setState({ hbAcivated: !!val });
							}}
							layout="horizontal"
							size="m"
							on="Yes"
							off="No"
							defaultLayout={this.props.fromPanel ? false : true}
							name={this.props.id ? `headerBiddingSwitch-${this.props.id}` : 'headerBiddingSwitch'}
							id={
								this.props.id ? `js-header-bidding-switch-${this.props.id}` : 'js-header-bidding-switch'
							}
							customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
						/>
					</Col>
				</Row>
				<Row>
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
