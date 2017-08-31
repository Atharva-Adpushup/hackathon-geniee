import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Button } from 'react-bootstrap';

const AdpTags = (props) => {
	const { showButtons, submitHandler, onCancel, value } = props;
	let priceFloor;  

	function save() {
		submitHandler(priceFloor.value, false);
	}

	return (
		<div className="mB-10 mT-10">
			<input type="text" placeholder="Enter Price Floor" className="inputBasic mB-10" ref={ el => priceFloor = el } defaultValue={value} />
			{
				showButtons ? (
					<div className="containerButtonBar">
						<Row className="butttonsRow mT-10">
							<Col xs={6}>
								<Button className="btn-lightBg btn-save" onClick={save}>Save</Button>
							</Col>
							<Col xs={6}>
								<Button className="btn-lightBg btn-cancel" onClick={onCancel}>Cancel</Button>
							</Col>
						</Row> 
					</div>
				) : ''
			}
		</div>
	);
}

export default AdpTags;