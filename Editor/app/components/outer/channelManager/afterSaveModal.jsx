import React, { PropTypes } from 'react';
import { status } from 'consts/commonConsts';
import { Modal } from 'react-bootstrap';

class afterSaveModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	resetSaveStatus() {
		const props = this.props;

		props.flux.actions.resetSaveStatus();
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

	isModalShown() {
		const props = this.props;

		return !!(parseInt(props.status, 10));
	}

	render() {
		const props = this.props;

		return (<Modal show={this.isModalShown()} onHide={this.resetSaveStatus} className="_ap_modal_logo  _ap_modal_smily" keyboard={false} title='Saved' animation={true}>
				<Modal.Header closeButton={props.status !== status.PENDING}></Modal.Header>
				<Modal.Body>
					{props.status == status.PENDING ? this.renderWaitMessage() : (props.status == status.SUCCESS) ? this.renderSuccessMessage() : this.renderErrorMessage()}
				</Modal.Body>
		</Modal>);
	}
}

afterSaveModal.propTypes = {
	status: PropTypes.number.isRequired
};

export default afterSaveModal;
