import React from 'react';
import Datatable from 'react-bs-datatable';
import orderBy from 'lodash/orderBy';
import { numberWithCommas, roundOffTwoDecimal } from '../../../../Pages/Dashboard/helpers/utils';

class TopSitesReport extends React.Component {
	state = {
		tableHeader: [],
		tableBody: []
	};

	componentDidMount() {
		const { displayData } = this.props;
		const transformedData = this.getTransformedData(displayData);
		this.computeTableData(transformedData);
	}

	formatTableData = tableBody => {
		const { metrics } = this.props;
		tableBody.forEach((row, idx) => {
			const rowKeys = Object.keys(row);

			rowKeys.forEach(key => {
				let itemValue = row[key];

				if (metrics[key]) {
					const num = itemValue;
					itemValue =
						metrics[key].valueType === 'money'
							? `$${numberWithCommas(roundOffTwoDecimal(num))}`
							: numberWithCommas(num);

					tableBody[idx][key] = itemValue;
				}
			});
		});
	};

	getTransformedData = displayData => {
		const computedData = { ...displayData };

		computedData.result = orderBy(computedData.result, ['network_net_revenue'], ['desc']).slice(
			0,
			10
		);
		return computedData;
	};

	computeTableData = data => {
		const { result, columns } = data;
		const tableHeader = [];
		const { metrics, reportType } = this.props;

		if ((result, columns)) {
			columns.forEach(col => {
				if (metrics[col])
					tableHeader.push({
						title: metrics[col].display_name,
						prop: col,
						position: metrics[col].position + 1
					});
			});

			if (reportType === 'site') {
				tableHeader.push({
					title: 'Date',
					prop: 'date',
					position: 1
				});
			} else {
				tableHeader.push({
					title: 'Website',
					prop: 'siteName',
					position: 1
				});
			}

			tableHeader.sort((a, b) => a.position - b.position);
			result.forEach(row => {
				const { siteName, siteid } = row;
				const isValidSite = !!(siteName && siteid);
				const computedLinkTitle = `View report for ${siteName}`;

				row.siteName = isValidSite
					? React.cloneElement(
							<a
								title={computedLinkTitle}
								target="_blank"
								rel="noopener noreferrer"
								href={`/reports/${siteid}`}
							>
								{siteName}
							</a>
					  )
					: 'Not Found';
			});

			this.formatTableData(result);
		}

		this.setState({ tableHeader, tableBody: result || [] });
	};

	renderTable() {
		const { tableBody, tableHeader } = this.state;
		const isValidTableBody = !!(tableBody && tableBody.length);
		const computedDatTableProps = {
			tableHeader,
			tableBody,
			keyName: 'datatable-ops-panel-top-site-report'
		};

		return isValidTableBody ? (
			<Datatable {...computedDatTableProps} />
		) : (
			<div className="text-center">No Record Found.</div>
		);
	}

	render() {
		return this.renderTable();
	}
}

export default TopSitesReport;
