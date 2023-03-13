import React from 'react';
import { Modal } from 'react-bootstrap';
import CreateMGDeal from '../CreateMGDeal';
import EditMGDeal from '../EditMGDeal';

const MGDealModal = ({
	isCreate,
	createTitle,
	allDeals,
	onSubmitCreate,
	onCancelSubmit,
	isEdit,
	editTitle,
	selectedDeal,
	onEditSubmit,
	onEditCancel,
	onDeleteDeal
}) => {
	return (
		<div>
			<Modal show={isCreate}>
				<Modal.Header>
					<Modal.Title>{createTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<CreateMGDeal
						allDeals={allDeals}
						onSubmitCreate={onSubmitCreate}
						onCancelSubmit={onCancelSubmit}
					></CreateMGDeal>
				</Modal.Body>
			</Modal>
			<Modal show={isEdit}>
				<Modal.Header>
					<Modal.Title>{editTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<EditMGDeal
						selectedDeal={selectedDeal}
						onEditSubmit={onEditSubmit}
						onEditCancel={onEditCancel}
						onDeleteDeal={onDeleteDeal}
					></EditMGDeal>
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default MGDealModal;
