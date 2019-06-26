import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import { dates, displayMetrics } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import Selectbox from '../../../Components/Selectbox/index';
import Loader from '../../../Components/Loader/index';
import { numberWithCommas } from '../helpers/utils';

class PerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		const { site } = this.props;
		const sites = convertObjToArr(site);
		const selectedSite = sites && sites.length ? sites.find(site => site['isTopPerforming']) : {};
		this.state = {
			quickDates: dates,
			selectedDate: dates[0].value,
			sites,
			selectedSite: selectedSite.value,
			displayData: {},
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
	}

	componentDidMount() {
		this.getGraphData();
	}

	getGraphData() {
		const { selectedDate, selectedSite } = this.state;
		const { path } = this.props;
		const params = getDateRange(selectedDate);
		const dimensions = displayMetrics.map(dimension => dimension.value);
		params.siteid = selectedSite;
		params.dimension = dimensions.toString();
		this.setState({ isLoading: true, startDate: params['fromDate'], endDate: params['toDate'] });
		reportService.getWidgetData({ path, params }).then(response => {
			if (response.status == 200 && response.data) {
				this.computeData(response.data);
			}
		});
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
		this.setState({ displayData, isLoading: false });
	};

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%' }}>
			<Loader height="20vh" />
		</div>
	);

	renderControl() {
		const { reportType } = this.props;
		const { selectedDate, quickDates, selectedSite, sites } = this.state;
		return (
			<div className="aligner aligner--hEnd">
				<div className="u-margin-r4">
					{/* eslint-disable */}
					<label className="u-text-normal u-margin-r2">Quick Dates</label>
					<Selectbox
						id="performance-overview-date"
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
							id="performance-overview-website"
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

	render() {
		const { displayData, isLoading, selectedSite, startDate, endDate } = this.state;
		return (
			<Row>
				<Col sm={12}>{this.renderControl()}</Col>
				<Col sm={12}>
					{isLoading ? (
						this.renderLoader()
					) : (
						<div className="u-margin-t4 u-margin-b4">
							{Object.keys(displayData).map(key => (
								<div className="col-sm-4 u-margin-b4 text-center" key={key}>
									<div className="font-small">{displayData[key].name}</div>
									<div className="estimatedEarning">
										<span>
											{displayData[key].name.includes('Revenue') ? '$' : ''}
											{numberWithCommas(Math.round(displayData[key].value * 100) / 100)}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</Col>
				<Col sm={12}>
					<Link
						to={
							selectedSite
								? `/reports/${selectedSite}?fromDate=${startDate}&toDate=${endDate}`
								: `/reports?fromDate=${startDate}&toDate=${endDate}`
						}
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

export default PerformanceOverview;
