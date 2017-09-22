import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button } from 'react-bootstrap';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';

const AdpTags = props => {
	const { showButtons, submitHandler, onCancel, priceFloorFromProps, headerBiddingFlag } = props;
	let priceFloor,
		isHeaderBiddingActivated = headerBiddingFlag;

	function save() {
		submitHandler(priceFloor.value, false, isHeaderBiddingActivated);
	}

	function switchChangeHandler(value) {
		isHeaderBiddingActivated = value;
	}

	return (
		<div className="mB-10 mT-10">
			<Row>
				<Col xs={6}>
					<strong>Price Floor</strong>
				</Col>
				<Col xs={6}>
					<input
						type="text"
						placeholder="Enter Price Floor"
						className="inputBasic mB-10"
						ref={el => (priceFloor = el)}
						defaultValue={priceFloorFromProps}
					/>
				</Col>
			</Row>
			<Row>
				<Col xs={8} style={{ margin: '0 auto', width: '100%' }}>
					<CustomToggleSwitch
						labelText="Header Bidding"
						className="mB-10"
						defaultLayout
						checked={headerBiddingFlag}
						name="headerBiddingSwitch"
						onChange={switchChangeHandler}
						layout="horizontal"
						size="m"
						id="js-header-bidding-switch"
						on="Yes"
						off="No"
					/>
				</Col>
			</Row>
			{showButtons ? (
				<div className="containerButtonBar">
					<Row className="butttonsRow mT-10">
						<Col xs={6}>
							<Button className="btn-lightBg btn-save" onClick={save}>
								Save
							</Button>
						</Col>
						<Col xs={6}>
							<Button className="btn-lightBg btn-cancel" onClick={onCancel}>
								Cancel
							</Button>
						</Col>
					</Row>
				</div>
			) : (
				''
			)}
		</div>
	);
};

export default AdpTags;
