import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { ajax } from '../../../../common/helpers';
import ActionCard from '../../../../Components/ActionCard.jsx';

class LiveSitesMapping extends Component {
	constructor(props) {
		super(props);
		let loaded = this.props.livesites && this.props.livesites.length ? true : false;
		this.state = {
			loaded: loaded,
			threshold: 0,
			tableConfig: loaded ? this.generateTableData(this.props.sites) : null,
			hasSites: loaded,
			totalSites: loaded ? this.props.sites.length : 0,
			sites: null
		};
		// this.generateStatus = this.generateStatus.bind(this);
		// this.generateClickableSpan = this.generateClickableSpan.bind(this);
		// this.clickHandler = this.clickHandler.bind(this);
		// this.modeChangeHandler = this.modeChangeHandler.bind(this);
		// this.statusChangeHandler = this.statusChangeHandler.bind(this);
	}

	componentDidMount() {
		this.state.loaded
			? null
			: this.props.fetchLiveSites({
					threshold: this.state.threshold
				});
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
