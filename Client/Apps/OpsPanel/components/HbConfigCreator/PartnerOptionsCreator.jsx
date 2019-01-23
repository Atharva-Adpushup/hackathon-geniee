import React from 'react';
import PropTypes from 'prop-types';
import PartnerOptions from './PartnerOptions.jsx';
import SelectBox from '../../../../Components/SelectBox/index.jsx';
import { findIndex } from 'lodash';

class PartnerOptionsCreator extends React.Component {
	constructor(props) {
		super(props);

		let selectedPartner = null,
			selectedPartnerOptions = null;

		if (props.selectedPartner) {
			selectedPartner = findIndex(props.partners, partner => partner.name === props.selectedPartner);
			selectedPartnerOptions = props.selectedPartnerOptions;
		}

		this.state = {
			selectedPartner,
			selectedPartnerOptions
		};

		this.partnerChanged = this.partnerChanged.bind(this);
		this.removePartnerOptionsCreator = this.removePartnerOptionsCreator.bind(this);
		this.getOptions = this.getOptions.bind(this);
	}

	partnerChanged(partner) {
		if (partner === null) {
			this.removePartnerOptionsCreator();
		}
		// else {
		//     this.props.resetOptionsAtIndex(this.props.index);
		// }

		this.setState({ selectedPartner: partner });
	}

	removePartnerOptionsCreator() {
		const { state, props } = this,
			partner = props.partners[state.selectedPartner],
			options = state.selectedPartnerOptions;

		props.partnerOptionsRemovedCallback(partner, options);

		const { removePartnerOptionsCreatorCallback, index } = props;
		removePartnerOptionsCreatorCallback(index);
	}

	getOptions(options) {
		const { props, state } = this;

		this.setState({ selectedPartnerOptions: options });
		this.props.partnerOptionsAddedCallback(options, props.partners[state.selectedPartner]);
	}

	render() {
		const { partners, index, setupIndex } = this.props,
			{ selectedPartner, selectedPartnerOptions } = this.state;

		return (
			<div className="hb-partner-options-creator">
				<SelectBox value={this.state.selectedPartner} label="Select Partner" onChange={this.partnerChanged}>
					{partners.map((partnerConfig, index) => (
						<option key={index} value={index}>{`${partnerConfig.name}`}</option>
					))}
				</SelectBox>
				{partners[selectedPartner] ? (
					<PartnerOptions
						optionsIndex={index}
						setupIndex={setupIndex}
						optionsCallback={this.getOptions}
						partnerConfig={partners[selectedPartner]}
						selectedPartnerOptions={selectedPartnerOptions}
					/>
				) : (
					''
				)}
				<div className="text-right">
					<button className="hb-remove" onClick={this.removePartnerOptionsCreator}>
						Remove
					</button>
				</div>
			</div>
		);
	}
}

PartnerOptionsCreator.proptypes = {
	partners: PropTypes.array.isRequired,
	index: PropTypes.string.isRequired,
	removePartnerOptionsCreatorCallback: PropTypes.func.isRequired,
	partnerOptionsAddedCallback: PropTypes.func.isRequired,
	partnerOptionsRemovedCallback: PropTypes.func.isRequired,
	setupIndex: PropTypes.string.isRequired,
	resetOptionsAtIndex: PropTypes.func.isRequired,
	selectedPartner: PropTypes.string,
	selectedPartnerOptions: PropTypes.object
};

export default PartnerOptionsCreator;
