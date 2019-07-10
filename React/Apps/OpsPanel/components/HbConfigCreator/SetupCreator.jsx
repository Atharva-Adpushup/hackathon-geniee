import React from 'react';
import PropTypes from 'prop-types';
import PartnerOptionsCreator from './PartnerOptionsCreator.jsx';
import SelectBox from '../../../../Components/SelectBox/index.jsx';
import { cloneElement } from '../../lib/helpers';
import { findIndex, filter } from 'lodash';

class SetupCreator extends React.Component {
	constructor(props) {
		super(props);

		let selectedSize = null,
			setupData = {},
			partnerOptionsCreators = [<PartnerOptionsCreator />];

		if (props.selectedSize) {
			const size = {
					width: Number(props.selectedSize.split('x')[0]),
					height: Number(props.selectedSize.split('x')[1])
				},
				sizeIndex = findIndex(props.adSizes, s => s.width === size.width && s.height === size.height);

			selectedSize = sizeIndex;
		}

		let updatedSetupData = { [props.selectedSize]: [] };

		if (props.setupData) {
			setupData = props.setupData;

			partnerOptionsCreators = [];
			setupData.forEach(data => {
				const partner = Object.keys(data)[0],
					partnerOptions = data[partner];

				partnerOptionsCreators.push(
					<PartnerOptionsCreator selectedPartner={partner} selectedPartnerOptions={partnerOptions} />
				);
			});

			props.setupData.forEach(data => {
				updatedSetupData[props.selectedSize].push(data);
			});
		}

		this.state = {
			selectedSize,
			partnerOptionsCreators,
			setupData: updatedSetupData
		};

		this.adSizeChanged = this.adSizeChanged.bind(this);
		this.addAnotherPartner = this.addAnotherPartner.bind(this);
		this.removePartnerOptionsCreators = this.removePartnerOptionsCreators.bind(this);
		this.removePartnerOptionsCreatorCallback = this.removePartnerOptionsCreatorCallback.bind(this);
		this.partnerOptionsAddedCallback = this.partnerOptionsAddedCallback.bind(this);
		this.removePartnerOptionsCallback = this.removePartnerOptionsCallback.bind(this);
		this.resetOptionsAtIndex = this.resetOptionsAtIndex.bind(this);
	}

	removePartnerOptionsCreators() {
		const { removeSetupCreatorCallback, index, adSizes } = this.props,
			size = adSizes[this.state.selectedSize];
		let key = null;

		if (size) {
			key = `${size.width}x${size.height}`;
		}

		removeSetupCreatorCallback(index, key);
	}

	adSizeChanged(size) {
		// if(size === null) {
		//     this.props.removeSetupCreatorCallback(this.props.index);
		// }

		this.setState({ selectedSize: size });
	}

	addAnotherPartner() {
		this.setState({
			partnerOptionsCreators: this.state.partnerOptionsCreators.concat(cloneElement(<PartnerOptionsCreator />))
		});
	}

	removePartnerOptionsCreatorCallback(index) {
		delete this.state.partnerOptionsCreators[index];
		this.setState({ partnerOptionsCreators: this.state.partnerOptionsCreators });
	}

	partnerOptionsAddedCallback(options, partner) {
		const { props, state } = this,
			{ setupData } = state,
			size = props.adSizes[state.selectedSize],
			key = `${size.width}x${size.height}`;

		let data = {};

		if (key in setupData) {
			data = setupData;

			const inputIndex = findIndex(data[key], input => {
				return input[partner.name] ? input[partner.name].optionsIndex === options.optionsIndex : false;
			});

			if (inputIndex !== -1) {
				data[key][inputIndex] = { [partner.name]: options };
			} else {
				data[key].push({ [partner.name]: options });
			}
		} else {
			data[key] = [];
			data[key].push({ [partner.name]: options });
		}

		this.setState({ setupData: data });
		this.props.setupAddedCallback(data, key);
	}

	removePartnerOptionsCallback(partner, options) {
		if (options !== null) {
			const { state, props } = this,
				size = props.adSizes[state.selectedSize],
				key = `${size.width}x${size.height}`,
				setupData = filter(state.setupData[key], input => {
					if (input[partner.name]) {
						return input[partner.name].optionsIndex !== options.optionsIndex;
					}
					return input;
				});

			this.setState({ setupData: { [key]: setupData } });
			props.removeOptionsFromSetup(key, setupData);
		}
	}

	resetOptionsAtIndex(index) {
		const { state, props } = this,
			size = props.adSizes[state.selectedSize],
			key = `${size.width}x${size.height}`,
			setupData = Object.assign({}, state.setupData),
			updatedSetupData = { [key]: [] };

		if (setupData[key]) {
			setupData[key].forEach(option => {
				for (let partner in option) {
					if (option[partner].optionsIndex !== index) {
						updatedSetupData[key].push(option[partner]);
					}
				}
			});

			this.setState({ setupData: updatedSetupData });
		}
	}

	render() {
		const { adSizes, partners, setupIndex } = this.props,
			{ partnerOptionsCreators } = this.state;

		return (
			<div className="col-sm-4">
				<div className="hb-setup-creator">
					<button className="close hb-close-pane" onClick={this.removePartnerOptionsCreators}>
						x
					</button>
					<SelectBox value={this.state.selectedSize} label="Select Ad Size" onChange={this.adSizeChanged}>
						{adSizes.map((size, index) => (
							<option key={index} value={index}>{`${size.width}x${size.height}`}</option>
						))}
					</SelectBox>
					<div className="partner-creator">
						{this.state.selectedSize !== null ? (
							partnerOptionsCreators.map((partnerOptionsCreator, index) => {
								return cloneElement(partnerOptionsCreator, {
									key: index,
									partners,
									index,
									setupIndex,
									removePartnerOptionsCreatorCallback: this.removePartnerOptionsCreatorCallback,
									partnerOptionsAddedCallback: this.partnerOptionsAddedCallback,
									partnerOptionsRemovedCallback: this.removePartnerOptionsCallback,
									resetOptionsAtIndex: this.resetOptionsAtIndex
								});
							})
						) : (
							<div className="setup-gap">
								<span>Setup options will come here after you select an Ad size</span>
							</div>
						)}
						{this.state.selectedSize !== null ? (
							<button className="mT-10 btn btn-lightBg btn-default" onClick={this.addAnotherPartner}>
								Add partner
							</button>
						) : (
							''
						)}
					</div>
				</div>
			</div>
		);
	}
}

SetupCreator.proptypes = {
	partners: PropTypes.array.isRequired,
	adSizes: PropTypes.array.isRequired,
	index: PropTypes.string.isRequired,
	removeSetupCreatorCallback: PropTypes.func.isRequired,
	setupAddedCallback: PropTypes.func.isRequired,
	removeOptionsFromSetup: PropTypes.func.isRequired,
	setupData: PropTypes.object
};

export default SetupCreator;
