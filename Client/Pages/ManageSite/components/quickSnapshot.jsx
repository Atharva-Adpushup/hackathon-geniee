import React, { Fragment } from 'react';
import { sortBy } from 'lodash';
import Card from '../../../Components/Layout/Card';
import EstimatedEarnings from '../../Dashboard/components/EstimatedEarnings';
import PerformanceOverviewContainer from '../../Dashboard/containers/PerformanceOverviewContainer';
import PerformanceApOriginalContainer from '../../Dashboard/containers/PerformanceApOriginalContainer';
import Revenue from '../../Dashboard/components/Revenue';
import '../../../scss/pages/dashboard/index.scss';

class QuickSnapshot extends React.Component {
	getWidgetComponent = widgetObj => {
		const { path } = widgetObj;

		const { siteId } = this.props;
		switch (widgetObj.name) {
			case 'estimated_earnings':
				return <EstimatedEarnings path={path} siteId={siteId} reportType="site" />;
			case 'per_ap_original':
				return <PerformanceApOriginalContainer path={path} siteId={siteId} reportType="site" />;
			case 'per_overview':
				return <PerformanceOverviewContainer path={path} siteId={siteId} reportType="site" />;
			case 'rev_by_network':
				return <Revenue path={path} siteId={siteId} reportType="site" />;
			default:
				return '';
		}
	};

	renderContent = () => {
		const { widget } = this.props;

		const widgetsArray = sortBy(widget, wid => wid.position);

		const content = [];

		const { site, siteId } = this.props;
		widgetsArray.forEach(wid => {
			const widgetComponent = this.getWidgetComponent(wid);
			if (widgetComponent)
				content.push(
					<Card
						rootClassName={
							wid.name === 'estimated_earnings'
								? 'u-margin-4 u-margin-lr-auto  width-90 card-color'
								: 'u-margin-4 u-margin-lr-auto  width-90'
						}
						key={wid.name}
						type={wid.name !== 'estimated_earnings' ? 'danger' : ''}
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">{wid.display_name}</span>
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
