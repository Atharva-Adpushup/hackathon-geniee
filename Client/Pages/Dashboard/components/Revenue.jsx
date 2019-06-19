import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import moment from 'moment';
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
		isLoading: true,
		startDate: moment()
			.startOf('day')
			.subtract(7, 'days')
			.format('YYYY-MM-DD'),
		endDate: moment()
			.startOf('day')
			.subtract(1, 'day')
			.format('YYYY-MM-DD')
	};

	componentDidMount() {
		this.getGraphData();
	}

	getGraphData() {
		const { selectedDate } = this.state;
		const params = getDateRange(selectedDate);
		const { path, reportType, siteId, site } = this.props;
		if (reportType === 'site') params.siteid = siteId;
		else {
			const siteIds = Object.keys(site);
			params.siteid = siteIds.toString();
		}
		this.setState({ isLoading: true, startDate: params['fromDate'], endDate: params['toDate'] });
		reportService.getWidgetData({ path, params }).then(response => {
			if (response.status == 200 && response.data) {
				const result = response.data.result;
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
		if (series && series.length && series[0].data && series[0].data.length)
			return (
				<div>
					<CustomChart type={type} xAxis={data.xAxis} series={series} yAxisGroups={yAxisGroups} />
				</div>
			);
		return <div className="text-center">No Record Found.</div>;
	}

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%' }}>
			<Loader height="20vh" />
		</div>
	);

	render() {
		const { isLoading, startDate, endDate } = this.state;
		return (
			<Row>
				<Col sm={12}>{this.renderControl()}</Col>
				<Col sm={12}>{isLoading ? this.renderLoader() : this.renderChart()}</Col>
				<Col sm={12}>
					<Link
						to={`/reports?dimension=network&interval=cumulative&fromDate=${startDate}&toDate=${endDate}`}
						className="u-link-reset aligner aligner-item float-right"
					>
						<Button className="aligner-item aligner aligner--vCenter">
							View Reports
							<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
						</Button>
					</Link>
				</Col>
			</Row>
		);
	}
}

export default SitewiseReport;
