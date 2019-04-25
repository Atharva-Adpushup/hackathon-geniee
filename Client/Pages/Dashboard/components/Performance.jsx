import React from 'react';
import { convertObjToArr } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { Row, Col } from 'react-bootstrap';
import { quickDates, sites } from '../configs/commonConsts';
let dates = Object.assign({}, quickDates);
console.log(dates);
class Performance extends React.Component {
	state = {
		quickDates: quickDates,
		selectedDate: quickDates[0].value,
		sites,
		selectedSite: sites[0].value
	};
	renderControl() {
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="performance-date"
						wrapperClassName="display-inline"
						isClearable={false}
						isSearchable={false}
						selected={this.state.selectedDate || ''}
						options={this.state.quickDates}
						onSelect={selectedDate => {
							this.setState({ selectedDate });
						}}
					/>
				</div>
				<div className="u-margin-r4">
					<label className="u-text-normal u-margin-r2">Website</label>
					<Selectbox
						isClearable={false}
						isSearchable={false}
						wrapperClassName="display-inline"
						selected={this.state.selectedSite || ''}
						options={this.state.sites}
						onSelect={selectedSite => {
							this.setState({ selectedSite });
						}}
					/>
				</div>
			</div>
		);
	}
	renderChart() {
		const yAxisGroups = [
			{
				seriesNames: ['Page RPM (Original)', 'Page RPM (AdPushup)'],
				yAxisConfig: {
					labels: {
						format: '${value}'
					}
				}
			}
		];

		const type = 'spline';
		const series = data.series;
		const xAxis = data.xAxis;
		return (
			<div>
				<CustomChart type={type} series={series} xAxis={xAxis} yAxisGroups={yAxisGroups} />
			</div>
		);
	}
	render() {
		return (
			<Row>
				<Col sm={12}>{this.renderControl()}</Col>
				<Col sm={12}>{this.renderChart()}</Col>
			</Row>
		);
	}
}

export default Performance;
