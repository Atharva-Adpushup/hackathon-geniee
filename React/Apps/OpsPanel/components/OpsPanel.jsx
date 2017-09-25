import React from 'react';
import $ from 'jquery';
import ActionCard from '../../../Components/ActionCard.jsx';
import { Row, Col } from 'react-bootstrap';
import HbConfigCreator from './HbConfigCreator/index.jsx';
import {
	getSupportedAdSizes,
	getActivePartners,
	getSizeWiseSetupGroups,
	loadHbConfigToPanel,
	removeOptionsIndex
} from '../lib/helpers.js';
import '../styles.scss';

let temp = null;

class OpsPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editMode: 'create',
			loading: true,
			updateMessage: null,
			hbConfig: null
		};
		this.fetchHbConfig = this.fetchHbConfig.bind(this);
		this.saveHbConfig = this.saveHbConfig.bind(this);
		this.updateGlobalHbConfig = this.updateGlobalHbConfig.bind(this);
	}

	componentDidMount() {
		$.ajax({
			method: 'GET',
			url: `/user/site/${window.siteId}/opsPanel/hbConfig`
		})
			.done(res => {
				this.setState({ editMode: 'update', hbConfig: res.data.hbConfig.bidderAdUnits, loading: false });
			})
			.fail(res => {
				this.setState({ editMode: 'create', loading: false });
			});
	}

	fetchHbConfig(hbConfig) {
		this.setState({ hbConfig: getSizeWiseSetupGroups(hbConfig) });
	}

	updateGlobalHbConfig(hbConfig, setupCreatorToRemove) {
		const { state } = this;

		if (Object.keys(setupCreatorToRemove).length) {
			var size = Object.keys(setupCreatorToRemove)[0];
			delete state.hbConfig[size];

			temp = hbConfig;
		}
	}

	saveHbConfig() {
		const { state } = this,
			hbConfig = temp ? temp : removeOptionsIndex(state.hbConfig),
			payload = { editMode: state.editMode, hbConfig };

		this.setState({ updateMessage: 'Saving...' });

		if (state.hbConfig) {
			$.post(
				`/user/site/${window.siteId}/opsPanel/hbConfig`,
				{
					data: JSON.stringify(payload)
				},
				res => {
					this.setState({ updateMessage: res.message });
					setTimeout(() => {
						this.setState({ updateMessage: '' });
					}, 3000);
				}
			);
		}
		console.log(payload.hbConfig);
		temp = null;
	}

	render() {
		const defaultHbConfig = {
				bidderAdUnits: {}
			},
			{ state } = this;

		return (
			<ActionCard title="Ops Panel">
				<div className="settings-pane">
					<Row>
						<Col sm={12}>
							<h4>Header Bidding Config</h4>
							<Row>
								<Col sm={12}>
									<p className="hb-settings-text">
										This config will save information related to the partner parameters required in
										the header bidding setup.
									</p>
									{state.loading ? <div className="error-message">Loading...</div> : ''}
									<div className="hb-options-wrapper">
										<HbConfigCreator
											updateGlobalHbConfig={this.updateGlobalHbConfig}
											hbConfig={loadHbConfigToPanel(state.hbConfig)}
											partners={getActivePartners()}
											adSizes={getSupportedAdSizes()}
											saveHbConfigCallback={this.fetchHbConfig}
										/>
									</div>
								</Col>
								<Col sm={4}>
									<div className="error-message">{state.updateMessage}</div>
									<button className="btn btn-lightBg btn-default" onClick={this.saveHbConfig}>
										Save setup
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

export default OpsPanel;
