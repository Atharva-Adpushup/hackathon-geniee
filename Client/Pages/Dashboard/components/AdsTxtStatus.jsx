import React from 'react';
import { ADS_TXT_HEADERS } from '../configs/commonConsts';
import CustomReactTable from '../../../Components/CustomReactTable/index';

const DEFAULT_STATE = {
	tableBody: []
};

class AdsTxtStatus extends React.Component {
	constructor(props) {
		super(props);
		this.state = DEFAULT_STATE;
	}

	componentDidMount() {
		const { displayData } = this.props;
		this.setState({ tableBody: displayData || [] });
	}

	renderTable() {
		const { tableBody } = this.state;

		return tableBody && tableBody.length > 0 ? (
			<CustomReactTable
				columns={ADS_TXT_HEADERS}
				data={tableBody}
				showPaginationTop
				showPaginationBottom={false}
				pageSizeOptions={[10, 20, 30, 40, 50]}
				defaultPageSize={10}
				minRows={0}
			/>
		) : (
			<div className="text-center"> No Record Found.</div>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default AdsTxtStatus;
