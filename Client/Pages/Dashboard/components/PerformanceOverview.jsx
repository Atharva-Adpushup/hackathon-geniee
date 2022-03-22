import React from 'react';
import sortBy from 'lodash/sortBy';
import cloneDeep from 'lodash/cloneDeep';
import { numberWithCommas, roundOffTwoDecimal, getWidgetValidDationState } from '../helpers/utils';
import {
	displayMetrics,
	displayUniqueMetrics,
	opsDisplayMetricsKeys
} from '../configs/commonConsts';

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
				resultData[col] = {
					name: metrics[col].display_name,
					value: 0,
					position: metrics[col].chart_position,
					col
				};
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

	// correct calculation of Unique Ad eCPM
	resultData.unique_ad_ecpm.value =
		(resultData.network_net_revenue.value / resultData.unique_impressions.value) * 1000;
	// correct calculation of Ad eCPM
	resultData.network_ad_ecpm.value =
		(resultData.network_net_revenue.value / resultData.network_impressions.value) * 1000;
	// correct calculation of AP Page RPM
	resultData.adpushup_page_cpm.value =
		(resultData.network_net_revenue.value / resultData.adpushup_page_views.value) * 1000;
	return sortBy(resultData, o => o.position);
}

const DEFAULT_STATE = {
	displayData: {}
};

class PerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		this.state = DEFAULT_STATE;
	}

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		const resultData = computeDisplayData(props);
		return { displayData: resultData };
	}

	render() {
		const { displayData } = this.state;
		const { isForOps, isUniqueImpEnabled, allowGrossRevenue } = this.props;
		const computedDisplayMetrics = cloneDeep(
			isUniqueImpEnabled ? displayUniqueMetrics : displayMetrics
		);
		if (!isForOps || !allowGrossRevenue) {
			Object.keys(computedDisplayMetrics).forEach(displayMetricKey => {
				const isOpsKey = opsDisplayMetricsKeys.indexOf(displayMetricKey) !== -1;
				if (isOpsKey) delete computedDisplayMetrics[displayMetricKey];
			});
		}

		return (
			<div className="u-margin-t4 u-margin-b4">
				{displayData.length > 0 ? (
					displayData.map(({ name, value, col }) =>
						computedDisplayMetrics[col] ? (
							<div className="col-sm-4 u-margin-b4 text-center" key={col}>
								<div className="font-small">{name}</div>
								<div className="estimatedEarning">
									<span>
										{computedDisplayMetrics[col].valueType == 'money'
											? `$${numberWithCommas(roundOffTwoDecimal(value))}`
											: numberWithCommas(value)}
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
