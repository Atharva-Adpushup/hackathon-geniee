import React from 'react';
import { getDateRange } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { Row, Col } from 'react-bootstrap';
import { quickDates, yAxisGroups } from '../configs/commonConsts';
import { Link } from 'react-router-dom';
import reportService from '../../../services/reportService';
import Loader from '../../../Components/Loader/index';
class SitewiseReport extends React.Component {
	state = {
		quickDates: quickDates,
		selectedDate: quickDates[0].value,
		series: [],
		xAxis: {},
		isLoading: true
	};
	componentDidMount() {
		this.getGraphData();
	}
	getGraphData() {
		let { selectedDate } = this.state,
			params = getDateRange(selectedDate),
			{ path, reportType } = this.props;
		if (reportType == 'site') params.siteid = this.props.siteId;
		this.setState({ isLoading: true });
		reportService.getWidgetData(path, params).then(response => {
			if (response.status == 200) {
				let data = response.data && response.data.data ? response.data.data.result : [];
				this.computeGraphData(data);
			}
		});
	}
	renderControl() {
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="revenue-date"
						wrapperClassName="display-inline"
						isClearable={false}
						isSearchable={false}
						selected={this.state.selectedDate}
						options={this.state.quickDates}
						onSelect={selectedDate => {
							this.setState({ selectedDate }, this.getGraphData);
						}}
					/>
				</div>
			</div>
		);
	}
	computeGraphData = results => {
		let series = [
				{
					name: 'Revenue',
					colorByPoint: true,
					data: []
				}
			],
			data = [];
		results.forEach(result => {
			data.push({
				name: result.network,
				y: Math.round(result.revenue * 100) / 100
			});
		});
		series[0].data = data;
		this.setState({ series, isLoading: false });
	};
	renderChart() {
		let type = 'pie',
			{ series } = this.state;
		return (
			<div>
				<CustomChart type={type} xAxis={data.xAxis} series={series} yAxisGroups={yAxisGroups} />
			</div>
		);
	}
	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '30%' }}>
			<Loader />
		</div>
	);
	render() {
		const { isLoading } = this.state;
		return (
			<Row>
				<Col sm={12}>{this.renderControl()}</Col>
				<Col sm={12}>{isLoading ? this.renderLoader() : this.renderChart()}</Col>
				<Col sm={12}>
					<Link to="/reports" className="float-right">
						View Reports
					</Link>
				</Col>
			</Row>
		);
	}
}

export default SitewiseReport;
