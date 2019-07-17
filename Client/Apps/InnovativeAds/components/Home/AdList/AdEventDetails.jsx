import React, { Component } from 'react';
import SelectBox from '../../../../../Components/SelectBox/index';
import { interactiveAdEvents } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeBox/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import CustomInput from '../../../../../Components/InputBox/index';

class EventDetails extends Component {
	constructor(props) {
		super(props);
		const adPresent = !!props.ad;
		const formatDataPresent = !!(adPresent && props.ad.formatData);
		this.state = {
			event: formatDataPresent ? props.ad.formatData.event : null,
			value: formatDataPresent ? props.ad.formatData.eventData.value : null,
			css: adPresent ? props.ad.css : {}
		};
		this.inputChangeHandler = this.inputChangeHandler.bind(this);
		this.cssChangeHandler = this.cssChangeHandler.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	inputChangeHandler(ev) {
		this.setState({
			value: ev.target.value
		});
	}

	cssChangeHandler(css) {
		this.setState({ css });
	}

	submitHandler() {
		const { onSubmit, onCancel, ad } = this.props;
		const { event, value, css } = this.state;
		onSubmit(ad.id, {
			formatData: {
				...ad.formatData,
				event: event || null,
				eventData: {
					value: value || null
				}
			},
			css
		});
		onCancel();
	}

	render() {
		const { ad, onCancel } = this.props;
		const { event, value, css } = this.state;
		return (
			<React.Fragment>
				<SelectBox
					selected={event}
					onSelect={ev => this.setState({ event: ev })}
					title="Select Event"
					id="event-selection-selectbox"
					options={interactiveAdEvents.map(item => ({
						name: item.toUpperCase(),
						value: item
					}))}
				/>
				<CustomInput
					name={`${ad.id}-input-box`}
					value={value}
					type="number"
					onChange={this.inputChangeHandler}
					placeholder="Xpath (Optional)"
					classNames="u-margin-3"
				/>
				<CodeBox
					customId={`${ad.id}-css-box`}
					showButtons={false}
					parentExpanded={false}
					code={typeof css === 'object' ? window.btoa(JSON.stringify(css)) : window.btoa(css)}
					onChange={this.cssChangeHandler}
				/>
				<CustomButton variant="primary" onClick={this.submitHandler}>
					Save
				</CustomButton>
				<CustomButton variant="secondary" onClick={onCancel}>
					Cancel
				</CustomButton>
			</React.Fragment>
		);
	}
}

export default EventDetails;
