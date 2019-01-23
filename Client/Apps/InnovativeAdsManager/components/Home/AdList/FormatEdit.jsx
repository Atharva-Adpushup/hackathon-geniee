import React, { Component } from 'react';
import { CustomButton } from '../../shared/index';
import { InView, Docked, Default, StickyTop } from '../Formats/index';

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

	renderButton = (label, handler) => (
		<CustomButton
			label={label}
			handler={handler}
			style={{ float: 'right', minWidth: '100px', margin: '10px 10px 0px 0px' }}
		/>
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
			default:
				return <Default {...commonProps} />;
		}
	}

	render() {
		return this.renderIndividualFormat();
	}
}

export default FormatEdit;
