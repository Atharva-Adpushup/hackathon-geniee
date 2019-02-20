import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ActionCard from '../../../Components/ActionCard/index';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';
import Card from '../../../Components/Layout/Card';

library.add(
	faCheckCircle,
	faThumbsUp,
	faChartArea,
	faCog,
	faExclamationCircle,
	faExclamationTriangle
);

class MySites extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<ActionCard title="My Sites">
				<div className="u-padding-h4 u-padding-v5 aligner aligner--row aligner--wrap">
					<Card
						rootClassName="u-margin-r5 u-margin-b5"
						type="success"
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">rentdigs.com</span>
								<OverlayTooltip
									id="tooltip-site-status-info"
									placement="top"
									tooltip="Site is live"
								>
									<FontAwesomeIcon
										icon="check-circle"
										className="aligner aligner-item aligner--hCenter card-header-icon"
									/>
								</OverlayTooltip>
							</div>
						}
						bodyClassName="card-body"
						bodyChildren={
							<Panel className="panel--transparent u-margin-b3">
								<Panel.Heading className="u-margin-0 u-padding-0">Setup status</Panel.Heading>
								<Panel.Body className="u-padding-h0 u-padding-b0 u-padding-t2">
									<div className="aligner aligner--row">
										<span className="aligner-item">
											<FontAwesomeIcon icon="check-circle" className="u-margin-r2" />
											Setup completed
										</span>
									</div>
								</Panel.Body>
							</Panel>
						}
						footerClassName="card-footer u-padding-0"
						footerChildren={
							<div className="aligner aligner--row">
								<Button className="aligner-item aligner aligner--hStart aligner--vCenter">
									<FontAwesomeIcon icon="chart-area" className="u-margin-r2" />
									View Reports
								</Button>
								<Button className="aligner-item aligner aligner--hEnd aligner--vCenter">
									<FontAwesomeIcon icon="cog" className="u-margin-r2" />
									Manage Site
								</Button>
							</div>
						}
					/>

					<Card
						rootClassName="u-margin-r5 u-margin-b5"
						type="warning"
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">rentdigs.com</span>
								<OverlayTooltip
									id="tooltip-site-status-info"
									placement="top"
									tooltip="Setup is under review"
								>
									<FontAwesomeIcon
										icon="exclamation-circle"
										className="aligner aligner-item aligner--hCenter card-header-icon"
									/>
								</OverlayTooltip>
							</div>
						}
						bodyClassName="card-body"
						bodyChildren={
							<Panel className="panel--transparent u-margin-b3">
								<Panel.Heading className="u-margin-0 u-padding-0">Setup status</Panel.Heading>
								<Panel.Body className="u-padding-h0 u-padding-b0 u-padding-t2">
									<div className="aligner aligner--row">
										<span className="aligner-item">
											<FontAwesomeIcon icon="exclamation-circle" className="u-margin-r2" />
											Setup is under review
										</span>
										<a
											className="aligner-item aligner aligner--hEnd"
											href="//localhost:8080/dashboard"
										>
											Complete Setup
										</a>
									</div>
								</Panel.Body>
							</Panel>
						}
						footerClassName="card-footer u-padding-0"
						footerChildren={
							<div className="aligner aligner--row">
								<Button className="aligner-item aligner aligner--hStart aligner--vCenter">
									<FontAwesomeIcon icon="chart-area" className="u-margin-r2" />
									View Reports
								</Button>
								<Button className="aligner-item aligner aligner--hEnd aligner--vCenter">
									<FontAwesomeIcon icon="cog" className="u-margin-r2" />
									Manage Site
								</Button>
							</div>
						}
					/>

					<Card
						rootClassName="u-margin-r5 u-margin-b5"
						type="danger"
						headerClassName="card-header"
						headerChildren={
							<div className="aligner aligner--row">
								<span className="aligner-item card-header-title">rentdigs.com</span>
								<OverlayTooltip
									id="tooltip-site-status-info"
									placement="top"
									tooltip="Setup is incomplete"
								>
									<FontAwesomeIcon
										icon="exclamation-triangle"
										className="aligner aligner-item aligner--hCenter card-header-icon"
									/>
								</OverlayTooltip>
							</div>
						}
						bodyClassName="card-body"
						bodyChildren={
							<Panel className="panel--transparent u-margin-b3">
								<Panel.Heading className="u-margin-0 u-padding-0">Setup status</Panel.Heading>
								<Panel.Body className="u-padding-h0 u-padding-b0 u-padding-t2">
									<div className="aligner aligner--row">
										<span className="aligner-item">
											<FontAwesomeIcon icon="exclamation-triangle" className="u-margin-r2" />
											Setup is incomplete
										</span>
										<a
											className="aligner-item aligner aligner--hEnd"
											href="//localhost:8080/dashboard"
										>
											Complete Setup
										</a>
									</div>
								</Panel.Body>
							</Panel>
						}
						footerClassName="card-footer u-padding-0"
						footerChildren={
							<div className="aligner aligner--row">
								<Button className="aligner-item aligner aligner--hStart aligner--vCenter">
									<FontAwesomeIcon icon="chart-area" className="u-margin-r2" />
									View Reports
								</Button>
								<Button className="aligner-item aligner aligner--hEnd aligner--vCenter">
									<FontAwesomeIcon icon="cog" className="u-margin-r2" />
									Manage Site
								</Button>
							</div>
						}
					/>
				</div>
			</ActionCard>
		);
	}
}

export default MySites;
