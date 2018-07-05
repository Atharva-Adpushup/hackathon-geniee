import React from 'react';
import $ from 'jquery';
// import ActionCard from '../../../Components/ActionCard.jsx';
import { Row, Col } from 'react-bootstrap';
import { DEFAULT_HB_CONFIG } from '../configs/commonConsts';
import HbConfigCreator from './HbConfigCreator/index.jsx';
import AdditionalOptions from './HbConfigCreator/AdditionalOptions.jsx';
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
			errorMessage: null,
			updateMessage: null,
			hbConfigString: JSON.stringify(DEFAULT_HB_CONFIG),
			validated: false,
			hbConfig: DEFAULT_HB_CONFIG,
			additionalOptions: {}
		};
		this.fetchHbConfig = this.fetchHbConfig.bind(this);
		this.saveHbConfig = this.saveHbConfig.bind(this);
		this.additionalOptionsUpdated = this.additionalOptionsUpdated.bind(this);
		this.updateGlobalHbConfig = this.updateGlobalHbConfig.bind(this);
		this.hbConfigChange = this.hbConfigChange.bind(this);
		this.vaidateHbConfig = this.vaidateHbConfig.bind(this);
	}

	componentDidMount() {
		$.ajax({
			method: 'GET',
			url: `/user/site/${window.siteId}/opsPanel/hbConfig`
		})
			.done(res => {
				this.setState({
					editMode: 'update',
					hbConfig: res.data.hbConfig.bidderAdUnits,
					hbConfigString: JSON.stringify(res.data.hbConfig.bidderAdUnits, null, 4),
					additionalOptions: res.data.hbConfig.additionalOptions,
					loading: false
				});
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

	additionalOptionsUpdated(additionalOptions) {
		this.setState({ additionalOptions });
	}

	saveHbConfig() {
		const { state } = this,
			hbConfig = temp ? temp : state.hbConfig,
			payload = { editMode: state.editMode, hbConfig, additionalOptions: state.additionalOptions };

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
						this.setState({ updateMessage: '', editMode: 'update', validated: false });
					}, 3000);
				}
			);
		}
		console.log(payload.hbConfig);
		temp = null;
	}

	hbConfigChange(e) {
		this.setState({ hbConfigString: e.target.value });
	}

	vaidateHbConfig() {
		try {
			const hbConfig = JSON.parse(this.state.hbConfigString);
			this.setState({
				errorMessage: null,
				hbConfig,
				validated: true,
				updateMessage: 'JSON validation successfull!'
			});
		} catch (e) {
			this.setState({
				errorMessage: 'Error found in entered JSON, please check.',
				validated: false,
				updateMessage: ''
			});
		}
	}

	render() {
		const defaultHbConfig = {
				bidderAdUnits: {}
			},
			{ state } = this;

		return (
			// <ActionCard title="Ops Panel">
			<div className="settings-pane">
				<Row>
					<Col sm={12}>
						{/* <h4>Header Bidding Config</h4> */}
						<Row>
							<Col sm={12}>
								<p className="hb-settings-text">
									This config will save information related to the partner parameters required in the
									header bidding setup.
								</p>
								{state.loading ? <div className="error-message">Loading...</div> : ''}
								<div className="hb-options-wrapper">
									{/* <HbConfigCreator
										updateGlobalHbConfig={this.updateGlobalHbConfig}
										hbConfig={loadHbConfigToPanel(state.hbConfig)}
										partners={getActivePartners()}
										adSizes={getSupportedAdSizes()}
										saveHbConfigCallback={this.fetchHbConfig}
									/> */}
									<Row>
										<Col sm={6}>
											<textarea
												className="hb-config-input"
												onChange={this.hbConfigChange}
												value={state.hbConfigString}
											/>
										</Col>
									</Row>
								</div>
							</Col>
							<Col sm={12}>
								<AdditionalOptions
									additionalOptions={state.additionalOptions}
									additionalOptionsCallback={this.additionalOptionsUpdated}
								/>
							</Col>
							<Col sm={12}>
								<div className="message-wrapper">
									<div className="error-message">{state.errorMessage}</div>
									<div style={{ color: '#14A314' }}>{state.updateMessage}</div>
								</div>
							</Col>
							<Col sm={4}>
								<button className="btn btn-lightBg btn-default" onClick={this.vaidateHbConfig}>
									Validate
								</button>
							</Col>
							<Col sm={4}>
								<button
									disabled={state.errorMessage || !state.validated}
									className="btn btn-lightBg btn-default"
									onClick={this.saveHbConfig}
								>
									Save setup
								</button>
							</Col>
						</Row>
					</Col>
				</Row>
			</div>
			// </ActionCard>
		);
	}
}

export default OpsPanel;
