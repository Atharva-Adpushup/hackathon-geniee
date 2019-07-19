import React, { Component, Fragment } from 'react';
import { PanelGroup, Panel, Col, Badge, Row } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import { isInclusivelyBeforeDay } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import LostSites from './LostSites';
import NewSites from './NewSites';
import RetentionSites from './RetentionSites';
import CustomButton from '../../../../../Components/CustomButton/index';
import Loader from '../../../../../Components/Loader/index';
import axiosInstance from '../../../../../helpers/axiosInstance';

class LostFoundLiveSites extends Component {
	constructor(props) {
		super(props);

		const currentFrom = moment()
				.subtract(7, 'days')
				.startOf('day'),
			CurrentTo = moment()
				.subtract(1, 'days')
				.startOf('day'),
			LastFrom = moment()
				.subtract(14, 'days')
				.startOf('day'),
			lastTo = moment()
				.subtract(8, 'days')
				.startOf('day');

		this.state = {
			activeKey: null,
			lastStartDate: LastFrom,
			lastEndDate: lastTo,
			currentStartDate: currentFrom,
			currentEndDate: CurrentTo,
			focusedInput: null,
			currentFocusedInput: null,
			isLoading: false,
			pageviewsThreshold: 10000,
			sitesData: {
				lost: [],
				won: [],
				rentention: []
			}
		};
	}

	componentDidMount() {}

	handleSelect = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	datesUpdated = ({ startDate, endDate }) => {
		this.setState({ lastStartDate : startDate, lastEndDate : endDate });
	};

	currentDatesUpdated = ({ startDate, endDate }) => {
		this.setState({ currentStartDate: startDate, currentEndDate: endDate });
	};

	focusUpdated = focusedInput => {
		this.setState({ focusedInput });
	};

	currentFocusUpdated = currentFocusedInput => {
		this.setState({ currentFocusedInput });
	};

	handleGenerate = () => {
		const {
			lastStartDate,
			lastEndDate,
			currentStartDate,
			currentEndDate,
			pageviewsThreshold,
			sitesData
		} = this.state;

		if(pageviewsThreshold < 10000) {
			console.log('Minimum pageviews should be 10,000')
		}

		else {

		const qs = {
			pageviewsThreshold,
			last: {
				from: lastStartDate,
				to: lastEndDate
			},
			current: {
				from: currentStartDate,
				to: currentEndDate
			}
		};


		this.setState({ isLoading: true });
		axiosInstance
			.get('/ops/getSiteStats', {
				params: {
					params: window.btoa(JSON.stringify(qs))
				}
			})
			.then(res => {
				this.setState({ sitesData: res.data.data, isLoading: false });
			})
			.catch(err => {
				this.setState({ isLoading: false });
				console.log(err);
			});
		}
	};

	renderHeader() {
		const {
			lastStartDate,
			lastEndDate,
			focusedInput,
			currentStartDate,
			currentEndDate,
			currentFocusedInput,
			pageviewsThreshold,
			sitesData
		} = this.state;

		return (
			<Row>
				<Col sm={12}>
					<Col sm={6} style={{ textAlign: 'center' }}>
						<p className="h3">Page Views</p>
						<label>{pageviewsThreshold}</label>
					</Col>
					<Col sm={6}>
						<Fragment>
							<p className="u-text-bold">Last week</p>

							<DateRangePicker
								startDate={lastStartDate}
								endDate={lastEndDate}
								onDatesChange={this.datesUpdated}
								focusedInput={focusedInput}
								onFocusChange={this.focusUpdated}
								showDefaultInputIcon
								hideKeyboardShortcutsPanel
								showClearDates
								minimumNights={0}
								displayFormat="DD-MM-YYYY"
								isOutsideRange={day => !isInclusivelyBeforeDay(day,  lastEndDate)}
							/>
						</Fragment>

						<Fragment>
							<p className="u-text-bold u-margin-t4">Current week</p>

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
								isOutsideRange={day => !isInclusivelyBeforeDay(day,  currentEndDate)}
							/>
						</Fragment>

						<CustomButton
							variant="primary"
							className="pull-right u-margin-r3"
							onClick={this.handleGenerate}
						>
							Generate
						</CustomButton>
					</Col>
				</Col>
			</Row>
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
					{activeKey === 'lost' ? <LostSites data={sitesData.lost} /> : null}
				</Panel>

				<Panel eventKey="new">
					<Panel.Heading>
						<Panel.Title toggle>
							New <Badge> {sitesData.won.length} </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'new' ? <NewSites data={sitesData.won} /> : null}
				</Panel>

				<Panel eventKey="retention">
					<Panel.Heading>
						<Panel.Title toggle>
							Retention <Badge>{sitesData.rentention.length}</Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'retention' ? <RetentionSites data={sitesData.rentention} /> : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		const { isLoading } = this.state;

		if (isLoading) return <Loader height="100px" classNames="u-margin-v3" />;
		return (
			<div>
				<Col className="u-margin-b4" xs={12}>
					{this.renderHeader()}
				</Col>

				<Col xs={12}>{this.renderPanel()}</Col>
			</div>
		);
	}
}

export default LostFoundLiveSites;
