import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from '@/Client/helpers/react-bootstrap-imports';

const CustomModal = ({ show, handleClose, title, children }) => (
	<Modal show={show} onHide={handleClose} className="ap-modal">
		<Modal.Header closeButton>
			<Modal.Title>{title}</Modal.Title>
		</Modal.Header>
		{children}
	</Modal>
);

CustomModal.propTypes = {
	show: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.element.isRequired
};

export default CustomModal;
