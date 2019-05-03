import React, { Fragment } from 'react';
import Card from '../../../Components/Layout/Card';
import EstimatedEarnings from '../../Dashboard/components/EstimatedEarnings';
import SitewiseReportContainer from '../../Dashboard/containers/SitewiseReportContainer';
import PerformanceOverviewContainer from '../../Dashboard/containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../../Dashboard/containers/PerformanceApOriginalContainer';
import Revenue from '../../Dashboard/components/Revenue';
import _ from 'lodash';
import '../../../scss/pages/dashboard/index.scss';

class QuickSnapshot extends React.Component {
	state = {
		widgets: this.props.widget
	};
	getWidgetComponent = widget => {
		let { path } = widget,
			{ siteId } = this.props;
		switch (widget.name) {
			case 'estimated_earnings':
				return <EstimatedEarnings path={path} siteId={siteId} reportType="site" />;
			case 'per_ap_original':
				return <PerformanceApOriginalContainer path={path} siteId={siteId} reportType="site" />;
			case 'per_overview':
				return <PerformanceOverviewContainer path={path} siteId={siteId} reportType="site" />;
			case 'rev_by_network':
				return <Revenue path={path} siteId={siteId} reportType="site" />;
		}
	};
	renderContent = () => {
		let { widgets } = this.state,
			widgetsArray = _.sortBy(widgets, widget => widget.position),
			content = [],
			{ site, siteId } = this.props;
		widgetsArray.forEach((widget, index) => {
			let widgetComponent = this.getWidgetComponent(widget);
			if (widgetComponent)
				content.push(
					<Card
						rootClassName={
							widget.name == 'estimated_earnings'
								? 'u-margin-4 u-margin-lr-auto  width-90 card-color'
								: 'u-margin-4 u-margin-lr-auto  width-90'
						}
						key={index}
						type={widget.name !== 'estimated_earnings' ? 'danger' : ''}
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">{widget.display_name}</span>
								<span className="float-right">{site[siteId].siteName}</span>
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
		return (
			<Fragment>
				<div>{this.renderContent()}</div>
			</Fragment>
		);
	}
}

export default QuickSnapshot;
