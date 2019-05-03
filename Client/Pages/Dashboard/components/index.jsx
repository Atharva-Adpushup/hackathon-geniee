import React, { Fragment } from 'react';
import Card from '../../../Components/Layout/Card';
import EstimatedEarnings from './EstimatedEarnings';
import SitewiseReportContainer from '../containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../containers/PerformanceApOriginalContainer';
import Revenue from './Revenue';
import _ from 'lodash';
import NotificationContainer from '../../../Containers/NotificationContainer';
class Dashboard extends React.Component {
	state = {
		widgets: this.props.widget
	};
	componentDidMount() {
		const { showNotification, user } = this.props;
		if (!user.isPaymentDetailsComplete && !window.location.pathname.includes('payment'))
			showNotification({
				mode: 'error',
				title: 'Payments Error',
				message: `Please complete your Payment Profile, for timely payments.
				<a href='/payment'>Go to payments</a>`,
				autoDismiss: 0
			});
	}
	getWidgetComponent = widget => {
		let { path } = widget;
		switch (widget.name) {
			default:
			case 'estimated_earnings':
				return <EstimatedEarnings path={path} />;
			case 'per_ap_original':
				return <PerformanceApOriginalContainer path={path} />;
			case 'per_overview':
				return <PerformanceOverviewContainer path={path} />;
			case 'per_site_wise':
				return <SitewiseReportContainer path={path} />;
			case 'rev_by_network':
				return <Revenue path={path} />;
		}
	};
	renderContent = () => {
		let { widgets } = this.state,
			widgetsArray = _.sortBy(widgets, widget => widget.position),
			content = [];
		widgetsArray.forEach((widget, index) => {
			let widgetComponent = this.getWidgetComponent(widget);
			content.push(
				<Card
					rootClassName={
						widget.name == 'estimated_earnings'
							? 'u-margin-b4 width-100 card-color'
							: 'u-margin-b4 width-100'
					}
					key={index}
					type={widget.name !== 'estimated_earnings' ? 'danger' : ''}
					headerClassName="card-header"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">{widget.display_name}</span>
						</div>
					}
					bodyClassName="card-body"
					bodyChildren={widgetComponent}
					footerChildren={''}
				/>
			);
		});

		return content;
	};
	render() {
		return (
			<Fragment>
				{this.renderContent()}
				<NotificationContainer />
			</Fragment>
		);
	}
}

export default Dashboard;
