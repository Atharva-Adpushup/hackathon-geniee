import React, { Component } from 'react';
import SelectBox from '../../../../Editor/components/shared/select/select.js';
import { interactiveAdEvents } from '../../../configs/commonConsts';
import CodeBox from '../../../../Editor/components/shared/codeBox.jsx';
import { CustomInput, CustomButton } from '../../shared/index.jsx';

class EventDetails extends Component {
	constructor(props) {
		super(props);
		const adPresent = props.ad ? true : false,
			formatDataPresent = adPresent && props.ad.formatData ? true : false;
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
		this.props.onSubmit(this.props.ad.id, {
			formatData: {
				...this.props.ad.formatData,
				event: this.state.event ? this.state.event : null,
				eventData: {
					value: this.state.value ? this.state.value : null
				}
			},
			css: this.state.css
		});
		this.props.onCancel();
	}

	render() {
		return (
			<div>
				<SelectBox value={this.state.event} label="Event" onChange={event => this.setState({ event })}>
					{interactiveAdEvents.map((item, index) => (
						<option key={index} value={item}>
							{item.toUpperCase()}
						</option>
					))}
				</SelectBox>
				<CustomInput
					name={`${this.props.ad.id}-input-box`}
					value={this.state.value}
					handler={this.inputChangeHandler}
					placeholder="Xpath (Optional)"
					classNames="mb-20 mT-20"
				/>
				<CodeBox
					customId={`${this.props.ad.id}-css-box`}
					showButtons={false}
					// textEdit
					parentExpanded={false}
					code={
						typeof this.state.css == 'object' ? btoa(JSON.stringify(this.state.css)) : btoa(this.state.css)
					}
					onChange={this.cssChangeHandler}
				/>
				<CustomButton label="Cancel" handler={this.props.onCancel} />
				<CustomButton label="Save" handler={this.submitHandler} />
			</div>
		);
	}
}

export default EventDetails;
