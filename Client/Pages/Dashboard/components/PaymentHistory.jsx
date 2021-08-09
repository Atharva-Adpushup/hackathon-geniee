import React from 'react';
import moment from 'moment';

import { PAYMENT_HISTORY_HEADERS } from '../configs/commonConsts';
import { reactTableSortMethod } from '../../../helpers/commonFunctions';
import { numberWithCommas } from '../helpers/utils';
import CustomReactTable from '../../../Components/CustomReactTable/index';

const DEFAULT_STATE = {
	tableBody: [],
	tableHeader: []
};

class PaymentHistory extends React.Component {
	constructor(props) {
		super(props);
		this.state = DEFAULT_STATE;
	}

	componentDidMount() {
		const { displayData } = this.props;
		const tableHeader = [];

		PAYMENT_HISTORY_HEADERS.forEach(({ Header, accessor }) => {
			if (accessor === 'Date remitted') {
				tableHeader.push({
					Header,
					id: 'Date remitted',
					accessor: row => moment(row['Date remitted']).format('x'),
					Cell: row => moment(row.original['Date remitted']).format('ll')
				});
			} else {
				tableHeader.push({
					Header,
					accessor,
					sortMethod: (a, b) => reactTableSortMethod(a, b)
				});
			}
		});

		this.setState({
			tableBody:
				displayData && displayData.length
					? displayData.map(data => {
							const row = data;
							row['Amount submitted'] = `USD ${numberWithCommas(row['Amount submitted'])}`;

							return row;
					  })
					: [],
			tableHeader
		});
	}

	renderTable() {
		const { tableBody, tableHeader } = this.state;

		return tableBody && tableBody.length > 0 ? (
			<React.Fragment>
				<CustomReactTable
					columns={tableHeader}
					data={tableBody}
					showPaginationTop
					showPaginationBottom={false}
					pageSizeOptions={[10, 20, 30, 40, 50]}
					defaultPageSize={10}
					minRows={0}
					defaultSorted={[
						{
							id: 'Date remitted',
							desc: true
						}
					]}
				/>
				<div className="u-margin-t3">
					<b>*Note:</b> This table shows only last few entries (~ last 3 months) of payment history.
					To check more entries please click View Reports Button.
				</div>
			</React.Fragment>
		) : (
			<div className="text-center"> No Record Found.</div>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default PaymentHistory;
