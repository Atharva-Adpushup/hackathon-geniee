import React, { Component, Fragment } from 'react';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker, isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

import { PanelGroup, Panel, Col, Badge, Row } from 'react-bootstrap';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import CommonTable from './CommonTable';
import CustomButton from '../../../../../Components/CustomButton/index';
import Loader from '../../../../../Components/Loader/index';
import axiosInstance from '../../../../../helpers/axiosInstance';
import CustomError from '../../../../../Components/CustomError/index';

class LostFoundLiveSites extends Component {
	constructor(props) {
		super(props);

		const currentFrom = moment()
			.subtract(7, 'days')
			.startOf('day');

		const CurrentTo = moment()
			.subtract(1, 'days')
			.startOf('day');

		this.state = {
			activeKey: null,
			currentStartDate: currentFrom,
			currentEndDate: CurrentTo,
			currentFocusedInput: null,
			isLoading: false,
			isError: false,
			pageviewsThreshold: 10000,
			sitesData: {
				lost: [],
				won: [],
				rentention: []
			}
		};
	}

	componentDidMount() {
		this.setState({ isLoading: true });

		const qs = this.getQueryString();
		return axiosInstance
			.get('/ops/getSiteStats', {
				params: {
					params: window.btoa(JSON.stringify(qs))
				}
			})
			.then(res => {
				this.setState({ sitesData: res.data.data, isLoading: false });
			})
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false, isError: true });
			});
	}

	getQueryString = () => {
		const { currentStartDate, currentEndDate } = this.state;
		return {
			current: {
				from: currentStartDate,
				to: currentEndDate
			}
		};
	};

	handleSelect = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	currentDatesUpdated = ({ startDate, endDate }) => {
		this.setState({ currentStartDate: startDate, currentEndDate: endDate });
	};

	currentFocusUpdated = currentFocusedInput => {
		this.setState({ currentFocusedInput });
	};

	handleChange = e => {
		this.setState({
			pageviewsThreshold: e.target.value
		});
	};

	handleGenerate = () => {
		const { showNotification } = this.props;
		const { pageviewsThreshold } = this.state;

		if (pageviewsThreshold < 10000) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Page Views should not be less than 10,000 ',
				autoDismiss: 5
			});
		}

		const qs = this.getQueryString();

		this.setState({ isLoading: true, isError: false });
		return axiosInstance
			.get('/ops/getSiteStats', {
				params: {
					params: window.btoa(JSON.stringify(qs))
				}
			})
			.then(res => {
				this.setState({ sitesData: res.data.data, isLoading: false });
			})
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false, isError: true });
			});
	};

	renderHeader() {
		const {
			currentStartDate,
			currentEndDate,
			currentFocusedInput,
			pageviewsThreshold
		} = this.state;

		return (
			<Fragment>
				<Row>
					<Col sm={7}>
						<FieldGroup
							name="pageviewsThreshold"
							value={pageviewsThreshold}
							type="number"
							label="Enter Page Views"
							onChange={this.handleChange}
							size={6}
							id="pageviewsThreshold-input"
							placeholder="Enter Page Views"
							className="u-padding-v4 u-padding-h4"
						/>
					</Col>
					<Col sm={5}>
						<Fragment>
							<p className="u-text-bold ">Select Date Range</p>

							<DateRangePicker
								startDate={currentStartDate}
								endDate={currentEndDate}
								onDatesChange={this.currentDatesUpdated}
								focusedInput={currentFocusedInput}
								onFocusChange={this.currentFocusUpdated}
								showDefaultInputIcon
								hideKeyboardShortcutsPanel
								showClearDates
								minimumNights={0}
								displayFormat="DD-MM-YYYY"
								isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
							/>
						</Fragment>
					</Col>
				</Row>
				<CustomButton
					variant="primary"
					className=" pull-right u-margin-r3"
					onClick={this.handleGenerate}
				>
					Generate
				</CustomButton>
			</Fragment>
		);
	}

	renderPanel() {
		const { activeKey, sitesData } = this.state;

		return (
			<PanelGroup accordion id="sites" activeKey={activeKey} onSelect={this.handleSelect}>
				<Panel eventKey="lost">
					<Panel.Heading>
						<Panel.Title toggle>
							Lost <Badge> {sitesData.lost.length} </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'lost' ? <CommonTable data={sitesData.lost} /> : null}
				</Panel>

				<Panel eventKey="new">
					<Panel.Heading>
						<Panel.Title toggle>
							New <Badge> {sitesData.won.length} </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'new' ? <CommonTable data={sitesData.won} /> : null}
				</Panel>

				<Panel eventKey="retention">
					<Panel.Heading>
						<Panel.Title toggle>
							Retention <Badge>{sitesData.rentention.length}</Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'retention' ? <CommonTable data={sitesData.rentention} /> : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		const { isLoading, isError } = this.state;

		if (isLoading) return <Loader height="300px" classNames="u-margin-v3" />;
		return (
			<div>
				<Col className="u-margin-b4" xs={12}>
					{this.renderHeader()}
				</Col>

				<Col xs={12}>{isError ? <CustomError /> : this.renderPanel()}</Col>
			</div>
		);
	}
}

export default LostFoundLiveSites;
