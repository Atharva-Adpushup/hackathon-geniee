import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getDateRange } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import data from '../configs/data.json';
import { dates, yAxisGroups } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import Loader from '../../../Components/Loader/index';

class SitewiseReport extends React.Component {
	state = {
		quickDates: dates,
		selectedDate: dates[0].value,
		series: [],
		isLoading: true
	};

	componentDidMount() {
		this.getGraphData();
	}

	getGraphData() {
		const { selectedDate } = this.state;
		const params = getDateRange(selectedDate);
		const { path, reportType, siteId } = this.props;
		if (reportType === 'site') params.siteid = siteId;
		this.setState({ isLoading: true });
		reportService.getWidgetData(path, params).then(response => {
			if (response.status === 200) {
				const result = response.data && response.data.data ? response.data.data.result : [];
				this.computeGraphData(result);
			}
		});
	}

	computeGraphData = results => {
		const series = [
			{
				name: 'Revenue',
				colorByPoint: true,
				data: []
			}
		];
		const seriesData = [];
		results.forEach(result => {
			seriesData.push({
				name: result.network,
				y: Math.round(result.revenue * 100) / 100
			});
		});
		series[0].data = seriesData;
		this.setState({ series, isLoading: false });
	};

	renderControl() {
		const { selectedDate, quickDates } = this.state;
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					{/* eslint-disable */}
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="revenue-date"
						wrapperClassName="display-inline"
						isClearable={false}
						isSearchable={false}
						selected={selectedDate}
						options={quickDates}
						onSelect={date => {
							this.setState({ selectedDate: date }, this.getGraphData);
						}}
					/>
					{/* eslint-enable */}
				</div>
			</div>
		);
	}

	renderChart() {
		const type = 'pie';
		const { series } = this.state;
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
