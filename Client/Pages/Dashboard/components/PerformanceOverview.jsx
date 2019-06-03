import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import { dates } from '../configs/commonConsts';
import reportService from '../../../services/reportService';
import Selectbox from '../../../Components/Selectbox/index';
import Loader from '../../../Components/Loader/index';

class PerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		const { site } = this.props;
		const sites = convertObjToArr(site);
		this.state = {
			quickDates: dates,
			selectedDate: dates[0].value,
			sites,
			selectedSite: sites[0].value,
			displayData: {},
			isLoading: true
		};
	}

	componentDidMount() {
		this.getGraphData();
	}

	getGraphData() {
		const { selectedDate, selectedSite } = this.state;
		const { path } = this.props;
		const params = getDateRange(selectedDate);
		params.siteid = selectedSite;
		this.setState({ isLoading: true });
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
		<div style={{ position: 'relative', width: '100%', height: '30%' }}>
			<Loader />
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
		const { displayData, isLoading } = this.state;
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
											{Math.round(displayData[key].value * 100) / 100}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</Col>
				<Col sm={12}>
					<Link to="/reports" className="float-right">
						View Reports
					</Link>
				</Col>
			</Row>
		);
	}
}

export default PerformanceOverview;
