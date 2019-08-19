import React from 'react';
import { numberWithCommas, roundOffTwoDecimal } from '../helpers/utils';
import { displayMetrics } from '../configs/commonConsts';

function computeDisplayData(props) {
	const {
		displayData: { result, columns },
		metrics,
		siteId,
		reportType
	} = props;
	const resultData = {};

	if (columns && result) {
		columns.forEach(col => {
			if (metrics[col]) {
				resultData[col] = { name: metrics[col].display_name, value: 0 };
			}
		});
		result.forEach(row => {
			if (reportType === 'site' && row.siteid === siteId)
				Object.keys(row).map(col => {
					if (resultData[col]) resultData[col].value = row[col];
					return true;
				});
			else
				Object.keys(row).map(col => {
					if (resultData[col]) resultData[col].value += row[col];
					return true;
				});
		});
	}

	return resultData;
}

class PerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayData: {}
		};
	}

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const isValidDisplayData = !!(displayData && displayData.result && displayData.columns);

		if (!isValidDisplayData) {
			return null;
		}

		const resultData = computeDisplayData(props);
		return { displayData: resultData };
	}

	render() {
		const { displayData } = this.state;
		return (
			<div className="u-margin-t4 u-margin-b4">
				{Object.keys(displayData).length > 0 ? (
					Object.keys(displayData).map(key =>
						displayMetrics[key] ? (
							<div className="col-sm-4 u-margin-b4 text-center" key={key}>
								<div className="font-small">{displayData[key].name}</div>
								<div className="estimatedEarning">
									<span>
										{displayMetrics[key].valueType == 'money'
											? `$${numberWithCommas(roundOffTwoDecimal(displayData[key].value))}`
											: numberWithCommas(displayData[key].value)}
									</span>
								</div>
							</div>
						) : (
							''
						)
					)
				) : (
					<div className="text-center">No Record Found.</div>
				)}
			</div>
		);
	}
}

export default PerformanceOverview;
