import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import CustomModal from '../CustomModal';
import FormInput from '../FormInput';
import CustomButton from '../CustomButton';
import dataService from '../../services/dataService';
import utils from '../../helpers/utils';
import formValidator from '../../helpers/formValidator';
import validationSchema from '../../helpers/validationSchema';

class SendCodeByEmailModal extends Component {
	state = {
		developerEmail: '',
		isSendingMail: false,
		success: '',
		error: ''
	};

	onChange = e => {
		const { name, value } = e.target;

		this.setState({ [name]: value });
	};

	onSubmit = e => {
		e.preventDefault();

		const { developerEmail } = this.state;

		const validationResult = formValidator.validate(
			{ email: developerEmail },
			validationSchema.user.validations
		);

		if (validationResult.isValid) {
			const { subject, emailBody } = this.props;
			const encodedEmailBody = utils.btoa(emailBody);

			this.setState({ isSendingMail: true, success: '', error: '' });

			dataService
				.sendCodeByEmail(developerEmail, subject, encodedEmailBody)
				.then(response =>
					this.setState({
						developerEmail: '',
						isSendingMail: false,
						error: '',
						success: response.data.success
					})
				)
				.catch(error =>
					this.setState({
						isSendingMail: false,
						success: '',
						error: error.response.data.error
					})
				);
		} else {
			this.setState({ error: validationResult.errors.email });
		}
	};

	render() {
		const { show, handleClose, title } = this.props;
		const { developerEmail, isSendingMail, success, error } = this.state;

		return (
			<CustomModal show={show} title={title} handleClose={handleClose}>
				<form onSubmit={this.onSubmit}>
					<Modal.Body>
						<FormInput
							type="email"
							name="developerEmail"
							value={developerEmail}
							onChange={this.onChange}
							icon="envelope"
							placeholder="Enter your developer's email"
						/>

						{success && <div className="u-text-success u-margin-t3">{success}</div>}
						{error && <div className="u-text-error u-margin-t3">{error}</div>}
					</Modal.Body>

					<Modal.Footer>
						<CustomButton
							variant="secondary"
							showSpinner={isSendingMail}
							type="submit"
							className="u-width-full"
						>
							Send
						</CustomButton>
					</Modal.Footer>
				</form>
			</CustomModal>
		);
	}
}

SendCodeByEmailModal.propTypes = {
	show: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	subject: PropTypes.string.isRequired,
	emailBody: PropTypes.string.isRequired
};

export default SendCodeByEmailModal;
