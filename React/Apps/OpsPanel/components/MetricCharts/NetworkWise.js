import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import moment from 'moment';
import PaneLoader from '../../../../Components/PaneLoader.jsx';

const FooterTitle = <h4>Network Wise Performance Chart</h4>;

class NetworkWise extends Component {
	constructor(props) {
		super(props);
		let isDataLoaded =
			this.props.data &&
			Object.keys(this.props.data).length &&
			this.props.data.aggregated &&
			this.props.data.dayWise
				? true
				: false;

		this.state = {
			isDataLoaded,
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment()
				.startOf('day')
				.subtract(1, 'day')
		};
	}

	componentDidMount() {
		this.state.isDataLoaded
			? null
			: this.props.fetchData({
					transform: true,
					fromDate: this.state.startDate,
					toDate: this.state.endDate
				});
	}

	componentWillReceiveProps(nextProps) {
		let isDataLoaded =
			nextProps.data && Object.keys(nextProps.data).length && nextProps.data.aggregated && nextProps.data.dayWise
				? true
				: false;

		this.setState({ isDataLoaded });
	}

	render() {
		const props = this.props;

		return (
			<Panel className="mb-20 metricsChart" header={FooterTitle}>
				{this.state.isDataLoaded ? 'Metrics Chart will be shown here' : <PaneLoader />}
			</Panel>
		);
	}
}

export default NetworkWise;
