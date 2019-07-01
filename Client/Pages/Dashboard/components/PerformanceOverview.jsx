import React from 'react';
import { numberWithCommas } from '../helpers/utils';
import { displayMetrics } from '../configs/commonConsts';

class PerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayData: {}
		};
	}

	componentDidMount() {
		let { displayData } = this.props;
		this.computeData(displayData);
	}

	computeData = data => {
		const { result, columns } = data;
		const displayData = {};
		const { metrics, siteId, reportType } = this.props;
		columns.forEach(col => {
			if (metrics[col]) {
				displayData[col] = { name: metrics[col].display_name, value: 0 };
			}
		});
		result.forEach(row => {
			if (reportType === 'site' && row.siteid === siteId)
				Object.keys(row).map(col => {
					if (displayData[col]) displayData[col].value = row[col];
					return true;
				});
			else
				Object.keys(row).map(col => {
					if (displayData[col]) displayData[col].value += row[col];
					return true;
				});
		});
		this.setState({ displayData });
	};

	render() {
		const { displayData } = this.state;
		return (
			<div className="u-margin-t4 u-margin-b4">
				{Object.keys(displayData).map(key => {
					console.log(displayMetrics);
					return displayMetrics[key] ? (
						<div className="col-sm-4 u-margin-b4 text-center" key={key}>
							<div className="font-small">{displayData[key].name}</div>
							<div className="estimatedEarning">
								<span>
									{displayMetrics[key]['valueType'] == 'money' ? '$' : ''}
									{numberWithCommas(Math.round(displayData[key].value * 100) / 100)}
								</span>
							</div>
						</div>
					) : (
						''
					);
				})}
			</div>
		);
	}
}

export default PerformanceOverview;
