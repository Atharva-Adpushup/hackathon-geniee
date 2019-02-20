import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ActionCard from '../../../Components/ActionCard/index';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';
import Card from '../../../Components/Layout/Card';

library.add(faCheckCircle);

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
										<span className="aligner-item">Site is active</span>
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
						footerChildren={<div>Footer text</div>}
					/>
				</div>
			</ActionCard>
		);
	}
}

export default MySites;
