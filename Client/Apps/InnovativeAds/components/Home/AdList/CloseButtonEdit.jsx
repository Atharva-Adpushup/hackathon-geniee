/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import CodeBox from '../../../../../Components/CodeBox/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';

class CloseButtonEdit extends Component {
	constructor(props) {
		super(props);

		const { ad } = this.props;
		const hasAd = !!ad;
		const closeButtonCss = hasAd && ad.closeButtonCss;
		const closeButtonEnabled = hasAd && ad.showCloseButton;
		const closeButtonText = hasAd && ad.closeButtonText;

		this.state = {
			closeButtonCss: closeButtonCss ? window.btoa(JSON.stringify(ad.closeButtonCss)) : '',
			showCloseButton: closeButtonEnabled ? ad.showCloseButton : false,
			closeButtonText: closeButtonText ? ad.closeButtonText : ''
		};
	}

	handleChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleCssChange = closeButtonCss => {
		this.setState({ closeButtonCss: window.btoa(closeButtonCss) });
	};

	handleSave = () => {
		const { showCloseButton, closeButtonCss, closeButtonText } = this.state;
		const { onSubmit, onCancel } = this.props;

		let code = {};

		if (closeButtonCss && closeButtonCss.trim().length) {
			try {
				code = JSON.parse(window.atob(closeButtonCss));
				if (!code) {
					throw new Error('Invalid Close Button CSS');
				}
			} catch (e) {
				return window.alert('Invalid Close Button CSS');
			}
		}

		onSubmit({
			showCloseButton,
			closeButtonCss: code,
			closeButtonText
		});
		return onCancel();
	};

	render() {
		const { showCloseButton, closeButtonCss, closeButtonText } = this.state;
		const { ad, onCancel } = this.props;

		return (
			<div>
				<CustomToggleSwitch
					labelText="Show Close Button"
					className="u-margin-b4"
					checked={showCloseButton}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout={false}
					name={`showCloseButton-${ad.id}`}
					id={`js-showCloseButton-switch-${ad.id}`}
				/>

				{showCloseButton ? (
					<>
						{' '}
						<FieldGroup
							label="Close Button Text"
							name="closeButtonText"
							value={closeButtonText}
							type="text"
							onChange={this.handleChange}
							size={4}
							id="closeButtonText-input"
							className="button-text"
						/>
						<label htmlFor="closeButtonCss">Custom CSS for Close Button</label>
						<CodeBox
							name="closeButtonCss"
							showButtons={false}
							code={closeButtonCss}
							onChange={this.handleCssChange}
						/>{' '}
					</>
				) : null}

				<CustomButton className="u-margin-r3 u-margin-t4" onClick={this.handleSave}>
					Save
				</CustomButton>
				<CustomButton variant="secondary u-margin-t4" onClick={onCancel}>
					Cancel
				</CustomButton>
			</div>
		);
	}
}

export default CloseButtonEdit;
