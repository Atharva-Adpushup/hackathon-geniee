import React, { useState } from 'react';
import { Modal, Button } from '@/Client/helpers/react-bootstrap-imports';

const UserInteractionModal = ({ isModalShown, showOrHideModal, sendErrorLog }) => {
	const [userInput, setUserInput] = useState('');
	const handleChange = e => {
		const {
			target: { value = '' }
		} = e;
		setUserInput(value);
	};
	const sendErrorReport = () => {
		sendErrorLog('UserInteraction', userInput, true).finally(showOrHideModal(false));
	};
	return (
		<Modal
			size="lg"
			aria-labelledby="contained-modal-title-vcenter"
			centered
			show={isModalShown}
			onHide={showOrHideModal(false)}
			className="user-interaction-modal"
		>
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-vcenter">
					We've notified our team about the issue that you just faced.Please use the box below to
					add any other relevent details:
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<textarea
					name="user-feedback"
					value={userInput}
					onChange={handleChange}
					placeholder="(Optional) Type your feedback here"
					style={{ width: '100%' }}
					rows={10}
					className="user-error-feedback"
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={showOrHideModal(false)}>Close</Button>
				<Button variant="primary" onClick={sendErrorReport} className="error-modal-submit">
					Send Error Report
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default UserInteractionModal;
