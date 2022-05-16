import React, { Component } from 'react';
import CustomButton from '../../../../../Components/CustomButton/index';
import { InView, Docked, Default, StickyTop, ChainedDocked } from '../Formats/index';

class FormatEdit extends Component {
	constructor(props) {
		super(props);
		this.renderButton = this.renderButton.bind(this);
		this.renderIndividualFormat = this.renderIndividualFormat.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	saveHandler(data) {
		const { ad, onSave, onCancel } = this.props;
		onSave({
			formatData: {
				...ad.formatData,
				...data.formatData
			},
			css: data.css ? data.css : ad.css,
			...data.adData
		});
		onCancel();
	}

	renderButton = (label, handler, variant = 'primary') => (
		<CustomButton variant={variant} className="u-margin-t3 u-margin-r3" onClick={handler}>
			{label}
		</CustomButton>
	);

	renderIndividualFormat() {
		const { ad, onCancel } = this.props;
		const commonProps = {
			save: {
				label: 'Save',
				renderFn: this.renderButton,
				handler: this.saveHandler
			},
			cancel: {
				label: 'Cancel',
				renderFn: this.renderButton,
				handler: e => {
					e.preventDefault();
					onCancel();
				}
			},
			fullWidth: true,
			ad
		};
		switch (ad.formatData.format) {
			case 'stickyTop':
				return <StickyTop {...commonProps} />;
			case 'inView':
				return <InView {...commonProps} />;
			case 'docked':
				return <Docked {...commonProps} />;
			case 'chainedDocked':
				return <ChainedDocked {...commonProps} />;

			default:
				return <Default {...commonProps} />;
		}
	}

	render() {
		return this.renderIndividualFormat();
	}
}

export default FormatEdit;
