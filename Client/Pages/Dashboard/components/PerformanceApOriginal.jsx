import React from 'react';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import Selectbox from '../../../Components/Selectbox/index';
import CustomChart from '../../../Components/CustomChart';
import { Row, Col } from 'react-bootstrap';
import { quickDates, yAxisGroups } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import { Link } from 'react-router-dom';
import Loader from '../../../Components/Loader/index';

class PerformanceApOriginal extends React.Component {
	constructor(props) {
		super(props);
		let { site } = this.props,
			sites = convertObjToArr(site);
		this.state = {
			quickDates: quickDates,
			selectedDate: quickDates[0].value,
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
		let { selectedDate, selectedSite } = this.state,
			params = getDateRange(selectedDate),
			{ path, reportType } = this.props;
		if (reportType == 'site') params.siteid = this.props.siteId;
		else params.siteid = selectedSite;
		this.setState({ isLoading: true });
		reportService.getWidgetData(path, params).then(response => {
			if (response.status == 200) {
				let data = response.data && response.data.data ? response.data.data.result : [];
				this.setState({ isLoading: false });
				this.computeGraphData(data);
			}
		});
	}
	computeGraphData = results => {
		let series = [],
			adpushupSeriesData = [],
			baselineSeriesData = [],
			xAxis = { categories: [] };
		results.sort(function(a, b) {
			var dateA = a.report_date;
			var dateB = b.report_date;
			if (dateA < dateB) {
				return -1;
			}
			if (dateA > dateB) {
				return 1;
			}
			return 0;
		});
		results.forEach(result => {
			adpushupSeriesData.push(result['adpushup_variation_page_cpm']);
			baselineSeriesData.push(result['original_variation_page_cpm']);
			xAxis.categories.push(result['report_date']);
		});
		series = [
			{ data: adpushupSeriesData, name: 'AdPushup Variation Page RPM' },
			{ data: baselineSeriesData, name: 'Original Variation Page RPM' }
		];
		this.setState({
			series,
			xAxis
		});
	};
	renderControl() {
		let { reportType } = this.props;
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="performance-date"
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
				{reportType != 'site' ? (
					<div className="u-margin-r4">
						<label className="u-text-normal u-margin-r2">Website</label>
						<Selectbox
							isClearable={false}
							isSearchable={false}
							wrapperClassName="display-inline"
							selected={this.state.selectedSite}
							options={this.state.sites}
							onSelect={selectedSite => {
								this.setState({ selectedSite }, this.getGraphData);
							}}
						/>
					</div>
				) : (
					''
				)}
			</div>
		);
	}
	renderChart() {
		let type = 'spline',
			{ series, xAxis } = this.state;
		return (
			<div>
				<CustomChart type={type} series={series} xAxis={xAxis} yAxisGroups={yAxisGroups} />
			</div>
		);
	}
	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '30%' }}>
			<Loader />
		</div>
	);
	render() {
		let { isLoading } = this.state;
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
