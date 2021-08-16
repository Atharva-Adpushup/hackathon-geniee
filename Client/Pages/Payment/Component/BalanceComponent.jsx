import React, { Component } from 'react';
import moment from 'moment';
import { Button, Glyphicon } from '@/Client/helpers/react-bootstrap-imports';
import Loader from '../../../Components/Loader';
import CustomReactTable from '../../../Components/CustomReactTable/index';
import axiosInstance from '../../../helpers/axiosInstance';
import RequestPayment from './RequestPayment';
import UpdateBalance from './UpdateBalance';
import authService from '../../../services/authService';
import HELPER_FUNCTIONS from '../Helper/helper';

const { localStrToNum } = HELPER_FUNCTIONS;

class BalanceComponent extends Component {
	columns = [
		{
			Header: 'Request Date',
			accessor: 'formatted_created_date',
			sortMethod: (a, b) => moment(a).diff(moment(b))
		},
		{
			Header: 'Amount to be Released ($)',
			accessor: 'formattedAmt',
			sortMethod: (a, b) => localStrToNum(a) - localStrToNum(b)
		},
		{
			Header: 'Status',
			accessor: 'status'
		}
	];

	constructor(props) {
		super(props);
		this.state = {
			data: [],
			isLoading: true,
			showModal: { requestPayment: false, updateBalance: false },
			availableBalance: 0,
			editColumnDisplayed: false
		};
	}

	componentDidMount() {
		this.getMiscellaneous()
			.then(this.addEditColumn)
			.then(this.getPaymetHistory);
	}

	addEditColumn = () => {
		const { editColumnDisplayed } = this.state;
		if (authService.isOps() && !editColumnDisplayed) {
			this.setState({ editColumnDisplayed: true });
			this.columns.push({
				Header: '',
				accessor: 'edit'
			});
		}
	};

	getMiscellaneous = () =>
		axiosInstance
			.get('payment/getMiscellaneous')
			.then(res => {
				const availableBalance = (res && res.data && res.data.data) || 0;
				this.setState({ availableBalance });
			})
			.catch(err => console.log(err));

	getPaymetHistory = () => {
		axiosInstance.get('payment/getPaymetHistory').then(res => {
			this.setState({ data: (res && res.data && res.data.data) || [], isLoading: false });
		});
	};

	clickedRequestPayment = () => {
		const { showModal } = this.state;
		const requestPayment = !showModal.requestPayment;
		this.setState({ showModal: { requestPayment } });
		if (!requestPayment) {
			this.setState({ isLoading: true });
			this.getMiscellaneous().then(this.getPaymetHistory);
		}
	};

	closeRequestPayment = () => {
		const { showModal } = this.state;
		const requestPayment = !showModal.requestPayment;
		this.setState({ showModal: { requestPayment } });
	};

	clickedUpdateBalance = () => {
		const { showModal } = this.state;
		const updateBalance = !showModal.updateBalance;
		this.setState({ showModal: { updateBalance } });
		if (!updateBalance) {
			this.setState({ isLoading: true });
			this.getMiscellaneous().then(this.getPaymetHistory);
		}
	};

	closeUpdateBalance = () => {
		const { showModal } = this.state;
		const updateBalance = !showModal.updateBalance;
		this.setState({ showModal: { updateBalance } });
	};

	updateStatus = (details, dataForAuditLogs) => {
		this.setState({ isLoading: true });
		const data = { details, dataForAuditLogs };
		axiosInstance.post('payment/updateStatus', data).then(res => {
			this.setState({ isLoading: false, data: res && res.data && res.data.release_amount });
		});
	};

	showStatusButtons(newEle) {
		const { customProps } = this.props;

		const { appName } = customProps;
		const dataForAuditLogs = {
			appName,
			siteDomain: ''
		};
		const { status, amtToRelease } = newEle;
		return status === 'Pending' ? (
			<div>
				<Button
					bsStyle="primary"
					onClick={() => {
						this.updateStatus(
							{
								amtToRelease,
								created_date: newEle.created_date,
								status: 'Complete',
								id: newEle.id
							},
							dataForAuditLogs
						);
					}}
					title=""
				>
					<Glyphicon glyph="glyphicon glyphicon-ok" style={{ marginRight: '10px' }} />
					Mark As Complete
				</Button>
			</div>
		) : (
			<div>
				<Button
					bsStyle="primary"
					onClick={() => {
						this.updateStatus(
							{
								amtToRelease,
								created_date: newEle.created_date,
								status: 'Pending',
								id: newEle.id
							},
							dataForAuditLogs
						);
					}}
					title=""
				>
					<Glyphicon glyph="glyphicon glyphicon-time" style={{ marginRight: '10px' }} />
					Mark As Pending <span style={{ marginRight: '9px' }} />
				</Button>
			</div>
		);
	}

	renderBody() {
		const { balancePayment } = this.props;

		const { accessRequestPayment } = balancePayment;

		const { isLoading, data, availableBalance } = this.state;

		// sorting & data modification operations can be merged

		const dateSorted = data.sort((a, b) => moment(moment(b.created_date)).diff(a.created_date));

		const modifiedData = dateSorted.map(ele => {
			const newEle = { ...ele };
			if (authService.isOps()) {
				newEle.edit = this.showStatusButtons(newEle);
			}
			newEle.formattedAmt = `$${newEle.amtToRelease && newEle.amtToRelease.toLocaleString()}` || '';
			newEle.formatted_created_date = moment(newEle.created_date).format('MMM DD, YYYY');
			return newEle;
		});

		if (isLoading) return <Loader height="150px" />;

		return (
			<div>
				<div className="pull-left">
					<h3>Available Balance : ${availableBalance.toLocaleString()}</h3>
				</div>
				<div className="pull-right">
					{!authService.isOps() || accessRequestPayment ? (
						<Button
							bsStyle="primary"
							onClick={this.clickedRequestPayment}
							title=""
							style={{ marginRight: '25px' }}
						>
							<Glyphicon glyph="glyphicon glyphicon-hand-up" style={{ marginRight: '10px' }} />
							Request Payment
						</Button>
					) : null}
					{authService.isOps() ? (
						<Button bsStyle="primary" onClick={this.clickedUpdateBalance} title="">
							<Glyphicon glyph="glyphicon glyphicon-refresh" style={{ marginRight: '10px' }} />
							Update Balance
						</Button>
					) : null}
				</div>

				<div style={{ marginTop: '20px' }}>
					<CustomReactTable
						columns={this.columns}
						data={modifiedData}
						showPaginationTop
						showPaginationBottom={false}
						defaultPageSize={50}
						pageSizeOptions={[50, 100, 150, 200, 250]}
						minRows={0}
						sortable
					/>
				</div>
			</div>
		);
	}

	render() {
		const { showModal, availableBalance } = this.state;
		const { requestPayment, updateBalance } = showModal;
		if (requestPayment) {
			return (
				<RequestPayment
					show={requestPayment}
					handleClose={this.closeRequestPayment}
					handleSubmit={this.clickedRequestPayment}
					availableBalance={availableBalance}
					{...this.props}
				/>
			);
		}
		if (updateBalance) {
			return (
				<UpdateBalance
					show={updateBalance}
					handleClose={this.closeUpdateBalance}
					handleSubmit={this.clickedUpdateBalance}
					{...this.props}
				/>
			);
		}
		return <div>{this.renderBody()}</div>;
	}
}

export default BalanceComponent;
