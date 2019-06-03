import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import { dates, yAxisGroups } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import Loader from '../../../Components/Loader/index';

class PerformanceApOriginal extends React.Component {
	constructor(props) {
		super(props);
		const { site } = this.props;
		const sites = convertObjToArr(site);
		this.state = {
			quickDates: dates,
			selectedDate: dates[0].value,
			sites,
			selectedSite: sites[0].value,
			series: [],
			xAxis: {},
			isLoading: true
		};
	}

	componentDidMount() {
		this.getGraphData();
	}

	getGraphData() {
		const { selectedDate, selectedSite } = this.state;
		const params = getDateRange(selectedDate);
		const { path, reportType, siteId } = this.props;
		if (reportType === 'site') params.siteid = siteId;
		else params.siteid = selectedSite;
		this.setState({ isLoading: true });
		reportService.getWidgetData({ path, params }).then(response => {
			if (response.status == 200 && response.data && response.data.result) {
				this.computeGraphData(response.data.result);
			}
		});
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
				xAxis.categories.push(result.report_date);
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

	renderControl() {
		const { reportType } = this.props;
		const { selectedDate, quickDates, selectedSite, sites } = this.state;
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					{/* eslint-disable */}
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="performance-date"
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
				{reportType !== 'site' ? (
					<div className="u-margin-r4">
						{/* eslint-disable */}
						<label className="u-text-normal u-margin-r2">Website</label>
						<Selectbox
							id="performance-site"
							isClearable={false}
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={selectedSite}
							options={sites}
							onSelect={site => {
								this.setState({ selectedSite: site }, this.getGraphData);
							}}
						/>

						{/* eslint-enable */}
					</div>
				) : (
					''
				)}
			</div>
		);
	}

	renderChart() {
		const type = 'spline';
		const { series, xAxis } = this.state;
		if (series && series.length > 0)
			return (
				<div>
					<CustomChart type={type} series={series} xAxis={xAxis} yAxisGroups={yAxisGroups} />
				</div>
			);
		else return <div className="text-center">No Record Found.</div>;
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

export default PerformanceApOriginal;
