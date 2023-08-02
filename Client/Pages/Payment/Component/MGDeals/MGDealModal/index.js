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
	onDeleteDeal,
	sites,
	email
}) => (
	<div>
		<Modal show={isCreate}>
			<Modal.Header>
				<Modal.Title>{createTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<CreateMGDeal
					allDeals={allDeals}
					sites={sites}
					onSubmitCreate={onSubmitCreate}
					onCancelSubmit={onCancelSubmit}
				/>
			</Modal.Body>
		</Modal>
		<Modal show={isEdit}>
			<Modal.Header>
				<Modal.Title>{editTitle}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<EditMGDeal
					sites={sites}
					email={email}
					selectedDeal={selectedDeal}
					onEditSubmit={onEditSubmit}
					onEditCancel={onEditCancel}
					onDeleteDeal={onDeleteDeal}
				/>
			</Modal.Body>
		</Modal>
	</div>
);

export default MGDealModal;
