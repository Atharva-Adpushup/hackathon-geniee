import React, { Fragment } from 'react';
import { sortBy } from 'lodash';
import Card from '../../../Components/Layout/Card';
import EstimatedEarningsContainer from '../containers/EstimatedEarningsContainer';
import SitewiseReportContainer from '../containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../containers/PerformanceApOriginalContainer';
import RevenueContainer from '../containers/RevenueContainer';

class Dashboard extends React.Component {
	componentDidMount() {
		const { showNotification, user } = this.props;
		if (!user.isPaymentDetailsComplete && !window.location.pathname.includes('payment')) {
			showNotification({
				mode: 'error',
				title: 'Payments Error',
				message: `Please complete your Payment Profile, for timely payments.
					<a href='/payment'>Go to payments</a>`,
				autoDismiss: 0
			});
		}
	}

	getWidgetComponent = widget => {
		const { path } = widget;
		switch (widget.name) {
			case 'estimated_earnings':
				return <EstimatedEarningsContainer path={path} />;
			case 'per_ap_original':
				return <PerformanceApOriginalContainer path={path} />;
			case 'per_overview':
				return <PerformanceOverviewContainer path={path} />;
			case 'per_site_wise':
				return <SitewiseReportContainer path={path} />;
			case 'rev_by_network':
				return <RevenueContainer path={path} />;
		}
	};

	renderContent = () => {
		const { widget } = this.props;
		const widgetsArray = sortBy(widget, wid => wid.position);
		const content = [];
		widgetsArray.forEach(wid => {
			const widgetComponent = this.getWidgetComponent(wid);
			content.push(
				<Card
					rootClassName={
						wid.name === 'estimated_earnings'
							? 'u-margin-b4 width-100 card-color'
							: 'u-margin-b4 width-100'
					}
					key={wid.name}
					type={wid.name !== 'estimated_earnings' ? 'danger' : 'default'}
					headerClassName="card-header"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">{wid.display_name}</span>
						</div>
					}
					bodyClassName="card-body"
					bodyChildren={widgetComponent}
					footerChildren={null}
				/>
			);
		});

		return content;
	};

	render() {
		return <Fragment>{this.renderContent()}</Fragment>;
	}
}

export default Dashboard;
