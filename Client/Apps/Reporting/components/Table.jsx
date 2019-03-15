import React from 'react';
import apLineChartConfig from '../configs/line-ap-data.json';
import Datatable from 'react-bs-datatable';

export default () => {
	console.log(apLineChartConfig);
	return (
		<Datatable
			tableHeader={apLineChartConfig.tableHeader}
			tableBody={apLineChartConfig.tableBody}
			keyName="reportTable"
			rowsPerPage={10}
			rowsPerPageOption={[20, 30, 40, 50]}
		/>
	);
};
