import React, { Component } from 'react';
import { Modal } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../Components/CustomButton';
import CustomModal from '../../../Components/CustomModal';
import FormInput from '../../../Components/FormInput';
import axiosInstance from '../../../helpers/axiosInstance';
import HELPER_FUNCTIONS from '../Helper/helper';

const { formatDatetoStore } = HELPER_FUNCTIONS;

class RequestPayment extends Component {
	constructor(props) {
		super(props);
		this.state = {
			amount: undefined,
			success: '',
			error: '',
			showSpinner: false
		};
	}

	componentDidMount() {}

	onSubmit = ev => {
		ev.preventDefault();
		const { amount } = this.state;
		const today = formatDatetoStore(new Date());
		const intAmount = parseInt(amount, 10);
		const { handleSubmit, customProps, availableBalance } = this.props;

		const { appName } = customProps;
		if (!intAmount || intAmount < 1) {
			this.setState({ error: 'Amount should be greater than 0.' });
			return;
		}
		if (intAmount > availableBalance) {
			this.setState({ error: `Available balance is $${availableBalance}.` });
			return;
		}

		this.setState({ showSpinner: true });
		const data = {
			amtToRelease: intAmount,
			created_date: today,
			status: 'Pending',
			id: Date.now()
		};

		const dataForAuditLogs = {
			appName,
			siteDomain: ''
		};

		const obj = {
			data,
			dataForAuditLogs
		};
		axiosInstance.post('payment/requestPayment', obj).then(() => {
			handleSubmit();
		});
	};

	onChange = ev => {
		const { name, value } = ev.target;
		this.setState({ [name]: value });
	};

	render() {
		const { amount, success, error, showSpinner } = this.state;

		const { show, handleClose } = this.props;

		return (
			<CustomModal show={show} handleClose={handleClose} title="Request Payment">
				<form onSubmit={this.onSubmit}>
					<Modal.Body>
						<FormInput
							type="number"
							min="0"
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

export default RequestPayment;
