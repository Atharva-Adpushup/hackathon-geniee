import React from 'react';
import $ from 'jquery';
// import ActionCard from '../../../Components/ActionCard.jsx';
import { Row, Col, ButtonGroup, ButtonToolbar, Button } from 'react-bootstrap';
import Select from 'react-select';
import { DEFAULT_HB_CONFIG, sizeConfigOptions as options } from '../configs/commonConsts';
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
import SettingsPanel from './SettingsPanel.jsx';
import SelectBox from '../../../Components/SelectBox/index.jsx';
import ModalWrapper from './ModalWrapper.jsx';

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
			additionalOptions: {},
			deviceConfig: {
				sizeConfig: []
			},
			deviceConfigString: JSON.stringify({
				sizeConfig: []
			}),
			sizesSelected: [],
			currentSize: null,
			isModalOpen: false,
			collection: [],
			modalId: -1
		};
		this.fetchHbConfig = this.fetchHbConfig.bind(this);
		this.saveConfigs = this.saveConfigs.bind(this);
		this.additionalOptionsUpdated = this.additionalOptionsUpdated.bind(this);
		this.updateGlobalHbConfig = this.updateGlobalHbConfig.bind(this);
		this.hbConfigChange = this.hbConfigChange.bind(this);
		this.validateJSONConfig = this.validateJSONConfig.bind(this);
		this.validateJSONConfigWrapper = this.validateJSONConfigWrapper.bind(this);
		this.onNewSelect = this.onNewSelect.bind(this);
		this.onValChange = this.onValChange.bind(this);
		this.addCollection = this.addCollection.bind(this);
		this.toggleModal = this.toggleModal.bind(this);
		this.openModalAndSetCollection = this.openModalAndSetCollection.bind(this);
	}

	componentDidMount() {
		$.ajax({
			method: 'GET',
			url: `/user/site/${window.siteId}/opsPanel/hbConfig`
		})
			.done(res => {
				const sizes = [];

				Object.keys(res.data.hbConfig.bidderAdUnits).forEach(key => {
					if (res.data.hbConfig.bidderAdUnits[key].length > 0) {
						sizes.push({
							label: key,
							value: key.replace('x', ' ')
						});
					}
				});

				const hbConfig = { ...DEFAULT_HB_CONFIG, ...res.data.hbConfig.bidderAdUnits };

				this.setState({
					editMode: 'update',
					hbConfig: hbConfig,
					hbConfigString: JSON.stringify(hbConfig, null, 4),
					additionalOptions: res.data.hbConfig.additionalOptions,
					loading: false,
					deviceConfig: res.data.deviceConfig || this.state.deviceConfig,
					deviceConfigString: res.data.deviceConfig
						? JSON.stringify(res.data.deviceConfig, null, 4)
						: this.state.deviceConfigString,
					sizesSelected: sizes
				});
			})
			.fail(res => {
				this.setState({ editMode: 'create', loading: false });
			});
	}

	fetchHbConfig(hbConfig) {
		this.setState({ hbConfig: getSizeWiseSetupGroups(hbConfig) });
	}

	onNewSelect(sizesSelected) {
		this.setState({ sizesSelected });
	}

	onValChange(currentSize) {
		this.setState({ currentSize });
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

	saveConfigs() {
		const { state } = this,
			hbConfig = temp ? temp : state.hbConfig,
			deviceConfig = state.deviceConfig,
			payload = {
				editMode: state.editMode,
				hbConfig,
				deviceConfig,
				additionalOptions: state.additionalOptions
			};

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

	validateJSONConfig(config, configName) {
		try {
			const parsedConfig = JSON.parse(config);
			this.setState({
				errorMessage: null,
				[configName]: parsedConfig,
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

	validateJSONConfigWrapper(configs, configName) {
		this.validateJSONConfig(configs, configName);

		if (!this.state.errorMessage) {
			const parsedConfig = JSON.parse(configs);
			this.setState({
				deviceConfig: { sizeConfig: parsedConfig.sizeConfig.filter(data => data.sizesSupported.length > 0) }
			});

			return true;
		}

		return false;
	}

	toggleModal() {
		this.setState({ isModalOpen: !this.state.isModalOpen });
	}

	addCollection(newCollection) {
		const { modalId, currentSize, sizesSelected } = this.state;

		let currentCollection = [...this.state.hbConfig[currentSize]];

		if (newCollection.length === 0) {
			if (modalId === -1) {
				return;
			} else {
				currentCollection = [...currentCollection.slice(0, modalId), ...currentCollection.slice(modalId + 1)];

				if (currentCollection.length === 0) {
					this.setState({
						sizesSelected: sizesSelected.filter(size => size.label !== currentSize)
					});
				}
			}
		} else {
			if (this.state.modalId === -1) {
				currentCollection.push(newCollection);
			} else {
				currentCollection[modalId] = newCollection;
			}
		}

		const hbConfig = {
			...this.state.hbConfig,
			[currentSize]: currentCollection
		};

		this.setState({
			hbConfig,
			hbConfigString: JSON.stringify(hbConfig, null, 4)
		});
	}

	openModalAndSetCollection(id) {
		if (id === -1) {
			this.setState({ collection: [], modalId: -1, isModalOpen: true });
		} else {
			this.setState({
				collection: this.state.hbConfig[this.state.currentSize][id],
				modalId: id,
				isModalOpen: true
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
											<Row>
												<Col sm={4} style={{ paddingRight: 0 }}>
													<div className="input-name">Choose Sizes</div>
												</Col>
												<Col sm={8}>
													<Select
														name="sizesSelected"
														onChange={this.onNewSelect}
														options={options}
														isMulti={true}
														value={state.sizesSelected}
													/>
												</Col>
											</Row>
											{state.sizesSelected.length > 0 && (
												<Row>
													<Col sm={4} style={{ paddingRight: 0 }}>
														<div className="input-name">Select Current Size</div>
													</Col>
													<Col sm={8}>
														<SelectBox
															value={state.currentSize}
															onChange={this.onValChange}
															label="Choose Current Size"
														>
															{state.sizesSelected.map(size => (
																<option key={size.value} value={size.label}>
																	{size.label}
																</option>
															))}
														</SelectBox>
													</Col>
												</Row>
											)}
											{state.currentSize && (
												<Row>
													<Col sm={4} style={{ paddingRight: 0 }}>
														<button
															className="btn btn-lightBg btn-default"
															onClick={() => this.openModalAndSetCollection(-1)}
														>
															Add SLOTS
														</button>
													</Col>
													<Col sm={7}>
														<ButtonGroup style={{ display: 'inline-flex' }}>
															{this.state.hbConfig[state.currentSize].map(
																(_sizeobj, i) => (
																	<Button
																		key={i}
																		onClick={() =>
																			this.openModalAndSetCollection(i)
																		}
																	>
																		{i + 1}
																	</Button>
																)
															)}
														</ButtonGroup>
													</Col>
												</Row>
											)}
										</Col>
										<Col sm={6}>
											<textarea
												className="hb-config-input"
												onChange={this.hbConfigChange}
												value={state.hbConfigString}
											/>
										</Col>
									</Row>
									<Row>
										<Col sm={12}>
											<h4>Size Config Panel</h4>
										</Col>
										<Col sm={6}>
											<SettingsPanel
												fetchedData={this.state.deviceConfig.sizeConfig}
												validationCheck={this.validateJSONConfigWrapper}
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
								<button
									className="btn btn-lightBg btn-default"
									onClick={() => this.validateJSONConfig(this.state.hbConfigString, 'hbConfig')}
								>
									Validate
								</button>
							</Col>
							<Col sm={4}>
								<button
									disabled={state.errorMessage || !state.validated}
									className="btn btn-lightBg btn-default"
									onClick={this.saveConfigs}
								>
									Save setup
								</button>
							</Col>
						</Row>
					</Col>
				</Row>
				<ModalWrapper
					addCollection={this.addCollection}
					isOpen={state.isModalOpen}
					toggle={this.toggleModal}
					heading={`Collection for ${state.currentSize}`}
					data={state.collection}
				/>
			</div>
			// </ActionCard>
		);
	}
}

export default OpsPanel;
