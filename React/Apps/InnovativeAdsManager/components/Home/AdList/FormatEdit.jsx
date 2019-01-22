import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import { CustomButton } from '../../shared/index';
import { InView, Docked, Default } from '../Formats/index';

class FormatEdit extends Component {
	constructor(props) {
		super(props);
		this.renderButton = this.renderButton.bind(this);
		this.renderIndividualFormat = this.renderIndividualFormat.bind(this);
	}

	saveHandler(data) {
		const { ad, onCancel } = this.props;
		console.log(data);
	}

	renderButton = (label, handler) => (
		<CustomButton label={label} handler={handler} style={{ float: 'right', margin: '10px 10px 0px 0px' }} />
	);

	renderIndividualFormat() {
		const { ad, onCancel } = this.props;
		const save = {
			renderFn: this.renderButton,
			label: 'Save',
			handler: this.saveHandler
		};
		const cancel = {
			renderFn: this.renderButton,
			label: 'Cancel',
			handler: e => {
				e.preventDefault();
				onCancel();
			}
		};
		switch (ad.formatData.format) {
			// case 'stickyTop':
			// 	return <StickyTop />;
			case 'inView':
				return <InView save={save} />;
			case 'docked':
				return <Docked save={save} cancel={cancel} fullWidth />;
			default:
				return <Default save={save} />;
		}
	}

	render() {
		return this.renderIndividualFormat();
	}
}

export default FormatEdit;
