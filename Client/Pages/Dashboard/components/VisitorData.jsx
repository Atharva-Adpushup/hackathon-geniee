import React from 'react';
import sortBy from 'lodash/sortBy';
import { numberWithCommas, roundOffTwoDecimal, getWidgetValidDationState } from '../helpers/utils';

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
			const column = col.startsWith('ga_') ? col : `ga_${col}`;

			if (metrics[column]) {
				resultData[column] = {
					name: metrics[column].display_name,
					value: 0,
					position: metrics[column].chart_position,
					column,
					valueType: metrics[column].valueType
				};
			}
		});
		result.forEach(row => {
			if (reportType === 'site' && row.siteid === siteId)
				Object.keys(row).map(col => {
					const column = col.startsWith('ga_') ? col : `ga_${col}`;

					if (resultData[column]) resultData[column].value = row[col];
				});
			else
				Object.keys(row).map(col => {
					const column = col.startsWith('ga_') ? col : `ga_${col}`;

					if (resultData[column]) resultData[column].value += row[col];
				});
		});
	}

	return sortBy(resultData, o => o.position);
}

const DEFAULT_STATE = {
	displayData: {}
};

class VisitorData extends React.Component {
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

		return (
			<div className="u-margin-t4 u-margin-b4">
				{displayData.length ? (
					displayData.map(({ name, value, column, valueType }) => (
						<div className="col-sm-4 u-margin-b4 text-center" key={column}>
							<div className="font-small">{name}</div>
							<div className="estimatedEarning">
								<span>
									{valueType === 'money'
										? `$${numberWithCommas(roundOffTwoDecimal(value))}`
										: numberWithCommas(Number.isInteger(value) ? value : value.toFixed(2))}
								</span>
							</div>
						</div>
					))
				) : (
					<div className="text-center">No Record Found.</div>
				)}
			</div>
		);
	}
}

export default VisitorData;
