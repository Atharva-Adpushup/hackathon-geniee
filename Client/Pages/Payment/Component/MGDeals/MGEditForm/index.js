import React from 'react';
import FormInput from '../../../../../Components/FormInput';
import { Row, Col } from 'react-bootstrap';
import HELPER_FUNCTIONS from '../../../Helper/helper';

const { findQuarterByValue } = HELPER_FUNCTIONS;

const MGEditForm = ({
	isChange,
	selectedDeal,
	onChangeHandle,
	onChangeHandler,
	selectedQuarters
}) => {
	return !isChange
		? selectedDeal.quarterWiseData.map(data => (
				<Row>
					<Col sm={6}>
						<label>
							{findQuarterByValue(data, selectedQuarters) &&
								findQuarterByValue(data, selectedQuarters).name}
						</label>
					</Col>
					<Col sm={6}>
						<FormInput
							icon="dollar-sign"
							className="w-25"
							defaultValue={data.value}
							min="0"
							onChange={e => onChangeHandle(e, data)}
						/>
					</Col>
				</Row>
		  ))
		: selectedQuarters.length &&
				selectedQuarters.map(quarter => (
					<Row>
						<Col sm={6}>
							<label>{quarter.name}</label>
						</Col>
						<Col sm={6}>
							<FormInput
								icon="dollar-sign"
								type="number"
								className="w-25"
								min="0"
								onChange={e => onChangeHandler(e, quarter)}
							/>
						</Col>
					</Row>
				));
};

export default MGEditForm;
