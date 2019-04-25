import React, { Fragment } from 'react';
import Card from '../../Components/Layout/Card';
import EstimatedEarnings from './components/EstimatedEarnings';
import Performance from './components/Performance';
import SitewiseReport from './components/SitewiseReport';
import Revenue from './components/Revenue';
import '../../scss/pages/dashboard/index.scss';
import {
	DASHBOARD_NAV_ITEMS,
	DASHBOARD_NAV_ITEMS_INDEXES,
	DASHBOARD_NAV_ITEMS_VALUES
} from './configs/commonConsts';

class Dashboard extends React.Component {
	renderContent = value => {
		switch (value) {
			default:
			case 1:
				return <EstimatedEarnings />;
			case 2:
				return <Performance />;
			case 3:
				return <Revenue />;
			case 4:
				return <SitewiseReport />;
		}
	};
	render() {
		return (
			<Fragment>
				<Card
					rootClassName="u-margin-b4 width-100 card-color"
					key={`card`}
					type=""
					headerClassName="card-header"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">
								{DASHBOARD_NAV_ITEMS_VALUES.ESTIMATED_EARNINGS}
							</span>
						</div>
					}
					bodyClassName="card-body"
					bodyChildren={<EstimatedEarnings />}
				/>
				<Card
					rootClassName="u-margin-b4 width-100"
					key={`card`}
					type="default"
					headerClassName="card-header"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">
								{DASHBOARD_NAV_ITEMS_VALUES.PERFORMANCE}
							</span>
						</div>
					}
					bodyClassName="card-body"
					bodyChildren={<Performance />}
				/>
				<Card
					rootClassName="u-margin-b4 width-100"
					key={`card`}
					type="default"
					headerClassName="card-header"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">
								{DASHBOARD_NAV_ITEMS_VALUES.SITEWISE_REPORTS}
							</span>
						</div>
					}
					bodyClassName="card-body"
					bodyChildren={<SitewiseReport />}
				/>
				<Card
					rootClassName="u-margin-b4 width-30 col-sm-4"
					key={`card`}
					type="default"
					headerClassName="card-header"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">
								{DASHBOARD_NAV_ITEMS_VALUES.REVENUE}
							</span>
						</div>
					}
					bodyClassName="card-body"
					bodyChildren={<Revenue />}
				/>
			</Fragment>
		);
	}
}

export default Dashboard;
