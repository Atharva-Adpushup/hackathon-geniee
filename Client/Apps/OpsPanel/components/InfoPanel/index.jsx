import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Tab, Nav, NavItem, Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import {
	INFO_PANEL_IDENTIFIERS,
	QUICK_SNAPSHOTS_WIDGETS,
	WIDGETS_INFO,
	REPORTS_NAV_ITEMS_INDEXES
} from '../../configs/commonConsts';
import QuickSnapshot from './QuickSnapshotComponent/QuickSnapshot';
import ReportVitals from '../../../Reporting/containers/index';

class InfoPanel extends Component {
	constructor(props) {
		super(props);
		const {
			customProps: { activeComponentTab }
		} = props;
		const activeKey = activeComponentTab || INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT;

		this.state = {
			activeKey,
			redirectUrl: ''
		};
	}

	handleSelect = value => {
		const rootAdminPanelUrl = `/admin-panel/info-panel`;
		let redirectUrl = '';

		switch (value) {
			case INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT:
				redirectUrl = `${rootAdminPanelUrl}/quick-snapshot`;
				break;

			case INFO_PANEL_IDENTIFIERS.REPORT_VITALS:
				redirectUrl = `${rootAdminPanelUrl}/report-vitals`;
				break;

			case INFO_PANEL_IDENTIFIERS.GLOBAL_REPORT_VITALS:
				redirectUrl = `${rootAdminPanelUrl}/global-report-vitals`;
				break;

			default:
				break;
		}

		this.setState(state => {
			if (state.redirectUrl !== redirectUrl) {
				return {
					activeKey: value,
					redirectUrl
				};
			}

			return null;
		});
	};

	renderContent = () => {
		const { activeKey, redirectUrl } = this.state;
		const {
			reportType,
			match = { params: { siteId: '' } },
			location = { search: '' },
			user: {
				data: { isGlobalReportAllowed }
			}
		} = this.props;

		if (redirectUrl && redirectUrl !== location.pathname) {
			return <Redirect to={{ pathname: redirectUrl }} />;
		}

		switch (activeKey) {
			default:
			case INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT:
				return (
					<QuickSnapshot
						{...this.props}
						widgetsName={WIDGETS_INFO}
						widgetsList={QUICK_SNAPSHOTS_WIDGETS}
						isForOps
					/>
				);
			case INFO_PANEL_IDENTIFIERS.REPORT_VITALS:
				return (
					<ReportVitals
						reportType={reportType || 'account'}
						isForOps
						customProps={{ activeTab: REPORTS_NAV_ITEMS_INDEXES.REPORT }}
						isCustomizeChartLegend
						match={match}
						location={location}
					/>
				);
			case INFO_PANEL_IDENTIFIERS.GLOBAL_REPORT_VITALS:
				return (
					isGlobalReportAllowed && (
						<ReportVitals
							reportType="global"
							defaultReportType="global"
							isForOps
							customProps={{ activeTab: REPORTS_NAV_ITEMS_INDEXES.REPORT }}
							isCustomizeChartLegend
							match={match}
							location={location}
						/>
					)
				);
		}
	};

	render() {
		const { activeKey } = this.state;
		const {
			user: {
				data: { isGlobalReportAllowed }
			}
		} = this.props;

		return (
			<div className="u-padding-v4">
				<Tab.Container
					id="ops-panel-infopanel-container"
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Row className="clearfix">
						<Col sm={2}>
							<Nav bsStyle="pills" bsClass="ap-nav-pills nav" stacked>
								<NavItem eventKey={INFO_PANEL_IDENTIFIERS.QUICK_SNAPSHOT}>Quick Snapshot</NavItem>
								<NavItem eventKey={INFO_PANEL_IDENTIFIERS.REPORT_VITALS}>Report Vitals</NavItem>
								{isGlobalReportAllowed && (
									<NavItem eventKey={INFO_PANEL_IDENTIFIERS.GLOBAL_REPORT_VITALS}>
										Global Report Vitals
									</NavItem>
								)}
							</Nav>
						</Col>
						<Col sm={10}>
							<Tab.Content animation>{this.renderContent()}</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</div>
		);
	}
}

export default InfoPanel;
