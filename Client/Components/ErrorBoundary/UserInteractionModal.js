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
					Send error log reports to adpushup
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<textarea
					name="user-feedback"
					value={userInput}
					onChange={handleChange}
					placeholder="Enter feedback for this crash"
					style={{ width: '100%' }}
					rows={10}
					className="user-error-feedback"
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={showOrHideModal(false)}>Close</Button>
				<Button variant="primary" onClick={sendErrorReport}>
					Send Error Report
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default UserInteractionModal;
