import React, { PropTypes } from 'react';
import { status } from 'consts/commonConsts';
import { Modal } from 'react-bootstrap';

class afterSaveModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	isModalShown() {
		const props = this.props;

		return !!parseInt(props.status, 10);
	}

	renderWaitMessage() {
		return (
			<div>
				<div>
					<h4>Saving Please Wait</h4>
					<p>Optimization is few seconds away.</p>
				</div>
				<div className="spin" />
			</div>
		);
	}

	renderSuccessMessage() {
		return (
			<div>
				<h4>Saved</h4>
				<p>Happy Optimization.</p>
			</div>
		);
	}

	renderErrorMessage(
		msg = `There was some error while saving your changes, please try again by clicking save button again. 
	If problem persists, please contact support by using chat widget on bottom right of your screen.`
	) {
		return (
			<div>
				<h4>Save Error</h4>
				<p>{msg}</p>
			</div>
		);
	}

	render() {
		const props = this.props,
			isStatusPending = props.status === status.PENDING,
			isStatusNotPending = props.status !== status.PENDING,
			isStatusSuccess = props.status === status.SUCCESS,
			isStatusReset = props.status === status.RESET,
			renderConditionalBody = isStatusPending
				? this.renderWaitMessage()
				: isStatusSuccess ? this.renderSuccessMessage() : this.renderErrorMessage(props.msg);

		return (
			<Modal
				show={this.isModalShown()}
				onHide={props.closeModal}
				className="_ap_modal_logo  _ap_modal_smily"
				keyboard={false}
				title="Saved"
				animation
			>
				<Modal.Header closeButton={isStatusNotPending} />
				<Modal.Body>{isStatusReset ? null : renderConditionalBody}</Modal.Body>
			</Modal>
		);
	}
}

afterSaveModal.propTypes = {
	status: PropTypes.number.isRequired,
	closeModal: PropTypes.func.isRequired
};

export default afterSaveModal;
