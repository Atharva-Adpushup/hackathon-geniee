import React from 'react';
import { convertObjToArr, getDateRange } from '../helpers/utils';
import { quickDates } from '../configs/commonConsts';
import { Row, Col, Button } from 'react-bootstrap';
import reportService from '../../../services/reportService';
import Selectbox from '../../../Components/Selectbox/index';
import { Link } from 'react-router-dom';
import Loader from '../../../Components/Loader/index';
class PerformanceOverview extends React.Component {
	constructor(props) {
		super(props);
		let { site } = this.props,
			sites = convertObjToArr(site);
		this.state = {
			quickDates: quickDates,
			selectedDate: quickDates[0].value,
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
		let { selectedDate, selectedSite } = this.state,
			params = getDateRange(selectedDate),
			{ path } = this.props;
		params.siteid = selectedSite;
		this.setState({ isLoading: true });
		reportService.getWidgetData(path, params).then(response => {
			if (response.status == 200) {
				let data = response.data && response.data.data ? response.data.data : [];
				this.setState({ isLoading: false });
				this.computeData(data);
			}
		});
	}
	computeData = data => {
		let { result, columns } = data,
			displayData = {},
			{ metrics, siteId, reportType } = this.props;
		columns.forEach(col => {
			if (metrics[col]) {
				displayData[col] = { name: metrics[col]['display_name'], value: 0 };
			}
		});
		result.forEach(row => {
			if (reportType == 'site' && row['siteid'] == siteId)
				for (let col in row) {
					if (displayData[col]) displayData[col]['value'] = row[col];
				}
			else
				for (let col in row) {
					if (displayData[col]) displayData[col]['value'] += row[col];
				}
		});
		this.setState({ displayData });
	};
	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '30%' }}>
			<Loader />
		</div>
	);
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
							{Object.keys(displayData).map((key, index) => {
								return (
									<div className="col-sm-4 u-margin-b4 text-center" key={index}>
										<div className="font-small">{displayData[key]['name']}</div>
										<div className="estimatedEarning">
											<span>
												{displayData[key]['name'].includes('Revenue') ? '$' : ''}
												{Math.round(displayData[key]['value'] * 100) / 100}
											</span>
										</div>
									</div>
								);
							})}
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
