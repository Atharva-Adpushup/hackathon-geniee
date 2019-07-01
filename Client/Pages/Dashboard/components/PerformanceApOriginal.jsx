import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import { dates, yAxisGroups } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import Loader from '../../../Components/Loader/index';

class PerformanceApOriginal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			series: [],
			xAxis: {}
		};
	}

	componentDidMount() {
		let { displayData } = this.props;
		if (displayData && displayData.result) {
			this.computeGraphData(displayData.result);
		}
	}

	computeGraphData = results => {
		let series = [];
		const adpushupSeriesData = [];
		const baselineSeriesData = [];
		const xAxis = { categories: [] };
		if (results.length > 0) {
			results.sort((a, b) => {
				const dateA = a.report_date;
				const dateB = b.report_date;
				if (dateA < dateB) {
					return -1;
				}
				if (dateA > dateB) {
					return 1;
				}
				return 0;
			});
			results.forEach(result => {
				adpushupSeriesData.push(result.adpushup_variation_page_cpm);
				baselineSeriesData.push(result.original_variation_page_cpm);
				xAxis.categories.push(moment(result.report_date).format('ll'));
			});
			series = [
				{ data: adpushupSeriesData, name: 'AdPushup Variation Page RPM' },
				{ data: baselineSeriesData, name: 'Original Variation Page RPM' }
			];
		}
		this.setState({
			series,
			xAxis,
			isLoading: false
		});
	};

	renderChart() {
		const type = 'spline';
		const { series, xAxis } = this.state;
		const { isDataSufficient } = this.props;
		if (series && series.length > 0 && isDataSufficient)
			return (
				<div>
					<CustomChart type={type} series={series} xAxis={xAxis} yAxisGroups={yAxisGroups} />
				</div>
			);
		else return <div className="text-center">Insufficient Data.</div>;
	}

	render() {
		return this.renderChart();
	}
}

export default PerformanceApOriginal;
