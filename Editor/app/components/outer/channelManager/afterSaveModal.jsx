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

		return !!(parseInt(props.status, 10));
	}

	renderWaitMessage() {
		return (
			<div>
			<div>
				<h4>Saving Please Wait</h4>
				<p>Optimization is few seconds away.</p>
			</div>
			<div className="spin"></div>
		</div>)
	}

	renderSuccessMessage() {
		return (
			<div>
				<h4>Saved</h4>
				<p>Happy Optimization.</p>
			</div>
		)
	}

	renderErrorMessage() {
		return (
			<div>
				<h4>Save Error</h4>
				<p>There was some error while saving your changes, please try again by clicking save button again. If problem persists, please contact support by using chat widget on bottom right of your screen.</p>
			</div>
		)
	}

	render() {
		const props = this.props,
			isStatusPending = (parseInt(props.status, 10) === parseInt(status.PENDING, 10)),
			isStatusNotPending = (parseInt(props.status, 10) !== parseInt(status.PENDING, 10)),
			isStatusSuccess = (parseInt(props.status, 10) === parseInt(status.SUCCESS, 10)),
			isStatusReset = (parseInt(props.status, 10) === parseInt(status.RESET, 10)),
			renderConditionalBody = (isStatusPending ? this.renderWaitMessage() : isStatusSuccess ? this.renderSuccessMessage() : this.renderErrorMessage());

		return (<Modal show={this.isModalShown()} onHide={props.closeModal} className="_ap_modal_logo  _ap_modal_smily" keyboard={false} title='Saved' animation={true}>
				<Modal.Header closeButton={isStatusNotPending}></Modal.Header>
				<Modal.Body>
					{isStatusReset ? null : renderConditionalBody}
				</Modal.Body>
		</Modal>);
	}
}

afterSaveModal.propTypes = {
	status: PropTypes.number.isRequired,
	closeModal: PropTypes.func.isRequired
};

export default afterSaveModal;
