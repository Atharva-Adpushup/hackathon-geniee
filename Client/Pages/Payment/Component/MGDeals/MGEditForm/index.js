import React from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';
import FormInput from '../../../../../Components/FormInput';
import '../Deals.css';

const MGEditForm = ({
	isChange,
	selectedDeal,
	onChangeHandle,
	selectedMonths,
	mgInput,
	handleMgInputChange
}) => {
	const getFormattedDisplayDateValue = data =>
		`${moment()
			.month(data.month - 1)
			.format('MMM')} ${data.year}`;
	return !isChange
		? selectedDeal.dealValues.map(data => (
				<>
					<Row className="mb-10">
						<Col sm={6}>
							<label>{getFormattedDisplayDateValue(data)}</label>
						</Col>
						<Col sm={6}>
							<FormInput
								icon="dollar-sign"
								className="w-25"
								defaultValue={data.mgValue}
								min="0"
								onChange={e => onChangeHandle(e, data)}
							/>
						</Col>
					</Row>
				</>
		  ))
		: selectedMonths.length &&
				selectedMonths.map(month => (
					<>
						<Row className="mb-10">
							<Col sm={6}>
								<label>{month}</label>
							</Col>
							<Col sm={6}>
								<FormInput
									icon="dollar-sign"
									type="number"
									className="w-25"
									min="0"
									name={month}
									defaultValue={mgInput.month || ''}
									onChange={handleMgInputChange}
								/>
							</Col>
						</Row>
					</>
				));
};

export default MGEditForm;
