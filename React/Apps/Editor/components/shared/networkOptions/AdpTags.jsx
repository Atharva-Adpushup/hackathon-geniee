import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { priceFloorKeys } from '../../../consts/commonConsts';
import SelectBox from 'shared/select/select.js';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';

class AdpTags extends Component {
	constructor(props) {
		super(props);
		const { priceFloorFromProps, headerBiddingFlag } = props;
		this.state = { fpKey: 'FP_SA', hbAcivated: headerBiddingFlag, pf: priceFloorFromProps };
		this.save = this.save.bind(this);
		this.renderButtons = this.renderButtons.bind(this);
	}

	save() {
		const { fpKey, hbAcivated, pf } = this.state;
		this.props.submitHandler(pf, false, hbAcivated);
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

	render() {
		const { showButtons, submitHandler, onCancel, priceFloorFromProps, headerBiddingFlag } = this.props;
		return (
			<div className="mB-10 mT-10">
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
				<div>{this.renderButtons(1, showButtons, this.save, onCancel)}</div>
			</div>
		);
	}
}

export default AdpTags;
