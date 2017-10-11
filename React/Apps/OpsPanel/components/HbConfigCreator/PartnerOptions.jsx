import React from 'react';
import PropTypes from 'prop-types';
import { generateOptionInputs } from '../../lib/helpers';
import SelectBox from '../../../../Components/SelectBox/index.jsx';

const generatePartnerOptions = (partnerConfig, onChangeHandler, selectedPartnerOptions) => {
	const { global, local } = partnerConfig;

	return React.createElement('div', {
		children: [
			generateOptionInputs(global, onChangeHandler, selectedPartnerOptions),
			generateOptionInputs(local, onChangeHandler, selectedPartnerOptions)
		]
	});
};

class PartnerOptions extends React.Component {
	constructor(props) {
		super(props);

		let partnerOptions = {};

		if (props.selectedPartnerOptions) {
			partnerOptions = props.selectedPartnerOptions;
		}

		this.state = {
			partnerOptions,
			typingTimeOut: 0
		};

		this.onChangeHandler = this.onChangeHandler.bind(this);
	}

	onChangeHandler(e) {
		const { state, props } = this,
			{ target } = e,
			that = this,
			{ partnerOptions } = state,
			options = Object.assign(partnerOptions, { [target.name]: target.value, optionsIndex: props.optionsIndex });

		if (state.typingTimeout) {
			clearTimeout(state.typingTimeout);
		}

		this.setState({
			partnerOptions: options,
			typingTimeout: setTimeout(() => {
				this.props.optionsCallback(partnerOptions);
			}, 500)
		});
	}

	render() {
		const { partnerConfig, optionsIndex, selectedPartnerOptions } = this.props;

		return <div>{generatePartnerOptions(partnerConfig, this.onChangeHandler, selectedPartnerOptions)}</div>;
	}
}

PartnerOptions.proptypes = {
	partnerConfig: PropTypes.object.isRequired,
	optionsCallback: PropTypes.func.isRequired,
	optionsIndex: PropTypes.string.isRequired,
	selectedPartnerOptions: PropTypes.object
};

export default PartnerOptions;
