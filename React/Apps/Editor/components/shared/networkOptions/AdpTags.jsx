import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button } from 'react-bootstrap';
import _ from 'lodash';
import CodeBox from 'shared/codeBox';
import { priceFloorKeys } from '../../../consts/commonConsts';
import SelectBox from 'shared/select/select.js';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';

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
	}

	filterKeyValues(keyValues) {
		let response = {};
		_.forEach(keyValues, (value, key) => {
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

	renderNormalSaveButton(showButtons = true, submitHandler) {
		return showButtons ? (
			<Col xs={8} xsPush={4} style={{ paddingRight: '0px' }}>
				<Button className="btn-lightBg btn-save btn-block" onClick={submitHandler} type="submit">
					Save
				</Button>
			</Col>
		) : (
			''
		);
	}

	renderButtons(type = 1, showButtons = true, submitHandler, cancelHandler) {
		return type == 1
			? this.renderEditMenuButtons(showButtons, submitHandler, cancelHandler)
			: this.renderNormalSaveButton(showButtons, submitHandler, cancelHandler);
	}

	renderNonAdvanced() {
		const { showButtons, onCancel } = this.props;

		return (
			<div>
				<Row>
					<Col xs={6}>
						<strong>Price Floor Key</strong>
					</Col>
					<Col xs={6}>
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
				<Row>
					<Col xs={6}>
						<strong>Price Floor</strong>
					</Col>
					<Col xs={6}>
						<input
							type="number"
							placeholder="Enter Price Floor"
							className="inputBasic mB-10"
							value={this.state.pf}
							onChange={ev => {
								this.setState({ pf: parseFloat(ev.target.value) });
							}}
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={8} style={{ margin: '0 auto', width: '100%' }}>
						<CustomToggleSwitch
							labelText="Header Bidding"
							className="mB-10"
							defaultLayout
							checked={this.state.hbAcivated}
							name="headerBiddingSwitch"
							onChange={val => {
								this.setState({ hbAcivated: !!val });
							}}
							layout="horizontal"
							size="m"
							id="js-header-bidding-switch"
							on="Yes"
							off="No"
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={6} xsPush={6}>
						<Button className="btn-lightBg btn-edit btn-block" onClick={this.toggleAdvance}>
							Advanced
						</Button>
					</Col>
				</Row>
				<div>{this.renderButtons(1, showButtons, this.save, onCancel)}</div>
			</div>
		);
	}

	renderAdvanced() {
		let code = btoa(
			JSON.stringify({
				...this.filterKeyValues(this.state.keyValues),
				[this.state.fpKey]: this.state.pf
			})
		);
		return (
			<CodeBox
				showButtons={true}
				onSubmit={this.advanceSubmit}
				onCancel={this.toggleAdvance}
				size="small"
				cancelText="Back"
				code={code}
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
