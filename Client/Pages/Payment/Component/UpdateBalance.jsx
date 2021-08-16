import React, { Component } from 'react';
import { Modal } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../Components/CustomButton';
import CustomModal from '../../../Components/CustomModal';
import FormInput from '../../../Components/FormInput';
import axiosInstance from '../../../helpers/axiosInstance';
import HELPER_FUNCTIONS from '../Helper/helper';

const { formatDatetoStore } = HELPER_FUNCTIONS;

class UpdateBalance extends Component {
	constructor(props) {
		super(props);
		this.state = {
			amount: undefined,
			success: '',
			error: '',
			showSpinner: false
		};
	}

	onSubmit = ev => {
		ev.preventDefault();
		const { amount } = this.state;

		const today = formatDatetoStore(new Date());

		const intAmount = parseInt(amount, 10);
		if (intAmount < 1) {
			this.setState({ error: 'Amount should be greater than 0.' });
			return;
		}
		this.setState({ showSpinner: true });
		const { handleSubmit, customProps } = this.props;

		const { appName } = customProps;

		const data = { total_revenue: intAmount, created_date: today };

		const dataForAuditLogs = {
			appName,
			siteDomain: ''
		};

		const obj = {
			data,
			dataForAuditLogs
		};
		axiosInstance.post('payment/setAvailableBalance', obj).then(() => handleSubmit());
	};

	onChange = ev => {
		const { name, value } = ev.target;
		this.setState({ [name]: value });
	};

	render() {
		const { amount, success, error, showSpinner } = this.state;

		const { handleClose, show } = this.props;

		return (
			<CustomModal show={show} handleClose={handleClose} title="Update Balance">
				<form onSubmit={this.onSubmit}>
					<Modal.Body>
						<FormInput
							type="number"
							required
							placeholder="Enter Amount"
							name="amount"
							value={amount}
							icon="dollar-sign"
							onChange={this.onChange}
						/>
						{success && <div className="u-text-success u-margin-t3">{success}</div>}
						{error && <div className="u-text-error u-margin-t3">{error}</div>}
					</Modal.Body>
					<Modal.Footer>
						<CustomButton
							variant="secondary"
							type="submit"
							className="u-width-full"
							showSpinner={showSpinner}
						>
							Submit
						</CustomButton>
					</Modal.Footer>
				</form>
			</CustomModal>
		);
	}
}

export default UpdateBalance;
