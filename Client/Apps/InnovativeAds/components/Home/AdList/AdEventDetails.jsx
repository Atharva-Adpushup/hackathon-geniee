import React, { Component } from 'react';
import SelectBox from '../../../../../Components/Selectbox/index';
import { interactiveAdEvents } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeBox/index';
// import { CustomInput, CustomButton } from '../../shared/index.jsx';
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
			<div>
				<SelectBox value={event} label="Event" onChange={ev => this.setState({ event: ev })}>
					{interactiveAdEvents.map((item, index) => (
						<option key={index} value={item}>
							{item.toUpperCase()}
						</option>
					))}
				</SelectBox>
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
				<CustomButton label="Cancel" handler={onCancel} />
				<CustomButton label="Save" handler={this.submitHandler} />
			</div>
		);
	}
}

export default EventDetails;
