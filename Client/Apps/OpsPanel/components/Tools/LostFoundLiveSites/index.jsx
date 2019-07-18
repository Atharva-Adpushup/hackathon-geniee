import React, { Component, Fragment } from 'react';
import { PanelGroup, Panel, Col, Badge, Row } from 'react-bootstrap';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import LostSites from './LostSites';
import NewSites from './NewSites';
import RetentionSites from './RetentionSites';

class LostFoundLiveSites extends Component {

	constructor(props) {
		super(props);
  
		const currentFrom  = moment().subtract(7 , 'days').startOf('day'),
			  CurrentTo = moment().subtract(1 , 'days').startOf('day'),
			  LastFrom = moment().subtract(14 , 'days').startOf('day'),
			  lastTo = moment().subtract(8 , 'days').startOf('day');

		this.state = {
			activeKey: null,
			startDate: LastFrom ,
			endDate:lastTo,
			currentStartDate :currentFrom,
			currentEndDate : CurrentTo,
			focusedInput: null,
			currentFocusedInput: null
		};
	}


	componentDidMount() {}

	handleSelect = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	datesUpdated = ({ startDate, endDate }) => {
		this.setState({ startDate, endDate });
	};

	currentDatesUpdated = ({ currentStartDate, currentEndDate }) => {
		this.setState({ currentStartDate, currentEndDate });
	};

	focusUpdated = focusedInput => {
		this.setState({ focusedInput });
	};

	currentFocusUpdated = currentFocusedInput => {
		this.setState({currentFocusedInput})
	}

	renderHeader() {
		const { startDate, endDate, focusedInput ,currentStartDate ,currentEndDate ,currentFocusedInput } = this.state;
		return(

		<Row>
			<Col sm={12}>
				<Col sm={6} style= {{textAlign : 'center'}}>
					<p className="h3">Page Views</p>
					<label>10000</label>
				</Col>
				<Col sm={6}>
				
					<Fragment>
						<p className="u-text-bold">Last week</p>

						<DateRangePicker
							startDate={startDate}
							endDate={endDate}
							onDatesChange={this.datesUpdated}
							focusedInput={focusedInput}
							onFocusChange={this.focusUpdated}
							showDefaultInputIcon
							hideKeyboardShortcutsPanel
							showClearDates
							minimumNights={0}
							displayFormat="DD-MM-YYYY"
							isOutsideRange={() => {}}
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
							isOutsideRange={() => {}}
						/>
					</Fragment> 
					
				</Col>
			</Col>
		</Row>
	
		);
	}

	renderPanel() {
		const { activeKey } = this.state;

		return (
			<PanelGroup accordion id="sites" activeKey={activeKey} onSelect={this.handleSelect}>
				<Panel eventKey="lost">
					<Panel.Heading>
						<Panel.Title toggle>
							Lost <Badge> 10 </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'lost' ? <LostSites /> : null}
				</Panel>

				<Panel eventKey="new">
					<Panel.Heading>
						<Panel.Title toggle>
							New <Badge> 99 </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'new' ? <NewSites /> : null}
				</Panel>

				<Panel eventKey="retention">
					<Panel.Heading>
						<Panel.Title toggle>
							Retention <Badge> 50 </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'retention' ? <RetentionSites /> : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		return (
			<div>
				<Col className ="u-margin-b4" xs={12}>{this.renderHeader()}</Col>
                
				<Col xs={12}>{this.renderPanel()}</Col>
			</div>
		);
	}
}

export default LostFoundLiveSites;
