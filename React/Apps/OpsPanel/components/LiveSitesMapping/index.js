import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { ajax } from '../../../../common/helpers';
import ActionCard from '../../../../Components/ActionCard.jsx';

class LiveSitesMapping extends Component {
	constructor(props) {
		super(props);
		// this.fetchLiveSitesWrapper = this.fetchLiveSitesWrapper.bind(this);
	}

	render() {
		return (
			<ActionCard title="Live Sites Mapping">
				<div className="settings-pane">
					<Row>
						<Col sm={12}>
							<Row>
								<Col sm={4}>
									<button
										className="btn btn-lightBg btn-default"
										onClick={() => console.log('Clicked')}
									>
										Generate Full Mapping
									</button>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
			</ActionCard>
		);
	}
}

export default LiveSitesMapping;
