import React, { Component } from 'react';
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
						type="info"
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
						bodyChildren={<div>Body text</div>}
						footerChildren={<div>Footer text</div>}
					/>
				</div>
			</ActionCard>
		);
	}
}

export default MySites;
