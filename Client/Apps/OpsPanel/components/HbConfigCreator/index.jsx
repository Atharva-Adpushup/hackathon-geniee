import React from 'react';
import PropTypes from 'prop-types';
import SetupCreator from './SetupCreator.jsx';
import { cloneElement, cleanHbConfigData } from '../../lib/helpers';

class ConfigCreator extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			setupCreators: [],
			hbConfig: []
		};

		this.addAnotherSetup = this.addAnotherSetup.bind(this);
		this.removeSetupCreatorCallback = this.removeSetupCreatorCallback.bind(this);
		this.setupAddedCallback = this.setupAddedCallback.bind(this);
		this.removeOptionsFromSetup = this.removeOptionsFromSetup.bind(this);
		this.renderSetupCreator = this.renderSetupCreator.bind(this);
	}

	addAnotherSetup() {
		this.setState({ setupCreators: this.state.setupCreators.concat(cloneElement(<SetupCreator />)) });
	}

	removeSetupCreatorCallback(index, size) {
		if (size) {
			const hbConfig = Object.assign([], this.state.hbConfig);

			let updatedHbConfig = [],
				removal = {};

			hbConfig.forEach(setups => {
				for (let s in setups) {
					if (s !== size) {
						updatedHbConfig.push({ [s]: setups[s] });
					} else {
						removal[s] = setups[s];
					}
				}
			});

			this.setState({ hbConfig: updatedHbConfig });
			this.props.updateGlobalHbConfig(cleanHbConfigData(updatedHbConfig), removal);
			//this.props.saveHbConfigCallback(cleanHbConfigData(updatedHbConfig));
		}

		delete this.state.setupCreators[index];
		this.setState({ setupCreators: this.state.setupCreators });
	}

	setupAddedCallback(data, size) {
		const { hbConfig } = this.state,
			sizeSetup = hbConfig,
			sizeData = data[size],
			{ saveHbConfigCallback } = this.props;

		sizeSetup.push({ [size]: sizeData });
		saveHbConfigCallback(cleanHbConfigData(sizeSetup));
	}

	removeOptionsFromSetup(size, sizeData) {
		const { state } = this,
			hbConfig = Object.assign([], state.hbConfig);

		hbConfig.forEach(config => {
			for (let s in config) {
				if (s === size) {
					config[s] = sizeData;
				}
			}
		});

		this.props.saveHbConfigCallback(cleanHbConfigData(hbConfig));
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ hbConfig: nextProps.hbConfig });
		this.renderSetupCreator(nextProps.hbConfig);
	}

	renderSetupCreator(hbConfig) {
		const that = this;
		let setupCreators = [];

		hbConfig.forEach(sizeData => {
			const selectedSize = Object.keys(sizeData)[0],
				setupData = sizeData[selectedSize];

			setupCreators.push(<SetupCreator selectedSize={selectedSize} setupData={setupData} />);
		});

		this.setState({ setupCreators });
	}

	render() {
		const { state, props } = this;

		return (
			<div className="hb-config-creator">
				<div className="row">
					{state.setupCreators.map((setupCreator, index) => {
						return cloneElement(setupCreator, {
							key: index,
							index,
							partners: props.partners,
							adSizes: props.adSizes,
							removeSetupCreatorCallback: this.removeSetupCreatorCallback,
							setupAddedCallback: this.setupAddedCallback,
							removeOptionsFromSetup: this.removeOptionsFromSetup
						});
					})}
					<div className="col-sm-4">
						<button className="btn btn-lightBg btn-default btn-add-setup" onClick={this.addAnotherSetup}>
							Add partner setup
						</button>
					</div>
				</div>
			</div>
		);
	}
}

ConfigCreator.proptypes = {
	hbConfig: PropTypes.array.isRequired,
	partners: PropTypes.array.isRequired,
	adSizes: PropTypes.array.isRequired,
	saveHbConfigCallback: PropTypes.func.isRequired,
	updateGlobalHbConfig: PropTypes.func
};

export default ConfigCreator;
