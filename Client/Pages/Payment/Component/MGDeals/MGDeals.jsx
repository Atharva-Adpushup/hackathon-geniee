import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import moment from 'moment/moment';
import { Row, Col } from 'react-bootstrap';
import CustomReactTable from '../../../../Components/CustomReactTable';
import CustomButton from '../../../../Components/CustomButton';
import MGDealModal from './MGDealModal';
import Loader from '../../../../Components/Loader';
import MGDEALS_ACTION from '../MGDealService';
import { MG_DEALS_TABLE_COLUMNS } from '../../configs/commonConsts';
import HELPER_FUNCTIONS from '../../Helper/helper';
import { DEAL_CREATION_ACTIONS } from '../../configs/commonConsts';

const { getMGDeals, setMGDeals } = MGDEALS_ACTION;
const { CREATE_MGDEAL, DELETE_MGDEAL, EDIT_MGDEAL } = DEAL_CREATION_ACTIONS;

const MGDeals = ({ sites, email, accountAccessData }) => {
	const [isCreate, setIsCreate] = useState(false);
	const [disable, setDisable] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [selectedDeal, setSelectedDeal] = useState({});
	const [allDeals, setAllDeals] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchMGDeals() {
			const { data: response } = await getMGDeals();
			if (response && response.data && response.data[0] && response.data[0].mgDeals)
				setAllDeals(response.data[0].mgDeals);
			setIsLoading(false);
		}
		fetchMGDeals();
		if (!HELPER_FUNCTIONS.isUserFromOps(sites, accountAccessData)) {
			setDisable(true);
		}
	}, []);

	useEffect(() => {
		let dealSrNo = 0;
		const deals = allDeals.map(deal => {
			const { id, startDate, endDate } = deal || {};  
			dealSrNo += 1;
			return {
				id: id,
				serialNumber: dealSrNo,
				startDate: moment(startDate).format('DD/MM/YYYY'),
				endDate: moment(endDate).format('DD/MM/YYYY'),
				view: (
					<CustomButton
						disabled={disable}
						variant="primary"
						onClick={e => handleEditClick(e, deal)}
					>
						View/Edit
					</CustomButton>
				)
			};
		});
		let sortedMgDeals = deals.sort((deal1, deal2) => {
			if (deal1.serialNumber > deal2.serialNumber) {
				return 1;
			}
			if (deal1.serialNumber < deal2.serialNumber) {
				return -1;
			}
			return 0;
		});
		setTableData(sortedMgDeals);
	}, [allDeals]);

	const handleEditClick = (e, deal) => {
		e.preventDefault();
		setSelectedDeal(deal);
		setIsEdit(true);
	};

	const onSubmitCreate = deal => {
		setMGDeals([...allDeals, deal], CREATE_MGDEAL, deal);
		setAllDeals([...allDeals, deal]);
		setIsCreate(false);
	};

	const onCancelSubmit = () => {
		setIsCreate(false);
	};

	const handleCreate = e => {
		e.preventDefault();
		setIsCreate(true);
	};

	const onEditSubmit = (selectedDeal, deal) => {
		const newDeals = allDeals.filter(deal => deal.id !== selectedDeal.id);
		setMGDeals([...newDeals, deal], EDIT_MGDEAL, deal);
		setAllDeals([...newDeals, deal]);
		setIsEdit(false);
	};

	const onEditCancel = () => {
		setIsEdit(false);
	};

	const onDeleteDeal = selectedDeal => {
		const newDeals = allDeals.filter(deal => deal.id !== selectedDeal.id);
		setAllDeals(newDeals);
		setMGDeals(newDeals, DELETE_MGDEAL, selectedDeal);
		setIsEdit(false);
	};

	const columns = React.useMemo(() => MG_DEALS_TABLE_COLUMNS, []);

	return isLoading ? (
		<Loader />
	) : (
		<div>
			<CustomReactTable
				data={tableData}
				columns={columns}
				showPaginationTop={false}
				showPaginationBottom={false}
				minRows={allDeals.length || 3}
			/>
			<Row>
				<Col sm={3}>
					<CustomButton variant="primary" disabled={disable} onClick={e => handleCreate(e)}>
						Create MG Deal
					</CustomButton>
				</Col>
			</Row>
			<MGDealModal
				isCreate={isCreate}
				sites={sites}
				email={email}
				createTitle="Create MG Deal"
				allDeals={allDeals}
				onSubmitCreate={onSubmitCreate}
				onCancelSubmit={onCancelSubmit}
				isEdit={isEdit}
				editTitle="Edit MG Deal"
				selectedDeal={selectedDeal}
				onEditSubmit={onEditSubmit}
				onEditCancel={onEditCancel}
				onDeleteDeal={onDeleteDeal}
			/>
		</div>
	);
};

export default MGDeals;
