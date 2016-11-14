import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';
import CodeBox from 'shared/codeBox.jsx';

const initialState = {
	isEditingCss: false,
	isEditingCode: false
};

class adDescriptor extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
		this.toggleCssEditor = this.toggleCssEditor.bind(this);
		this.toggleCodeEditor = this.toggleCodeEditor.bind(this);
	}

	deleteSectionWithAd() {
		const { ad, sectionId, variationId, deleteAd, deleteSection } = this.props;

		// TODO: Optimise below two individual actions
		// How to: Merge below actions into one (for e.g., DELETE_AD), make it a thunk
		// and set a boolean flag in action data if that section needs to be deleted.
		// That way, only one action will be dispatched and this approach helps in
		// upcoming features (for e.g., Time travel, Redo-Undo) implementation
		deleteAd(ad.id, sectionId);
		deleteSection(sectionId, variationId);
	}

	toggleCssEditor() {
		this.setState({ isEditingCss: !this.state.isEditingCss });
	}

	toggleCodeEditor() {
		this.setState({ isEditingCode: !this.state.isEditingCode });
	}

	render() {
		const { ad, updateCss, updateAdCode } = this.props,
			adCode = ad.adCode;
		let	number = 6;
		if (adCode) {
			number = 4;
		}
		if (this.state.isEditingCss) {
			return (<CssEditor css={ad.css} onCancel={this.toggleCssEditor} onSave={updateCss.bind(null, ad.id)} />);
		}
		if (this.state.isEditingCode) {
			return (<CodeBox code={adCode} onSubmit={updateAdCode.bind(null, ad.id)} onCancel={this.toggleCodeEditor} />);
		}
		return (
			<div className="containerButtonBar">
				<Row>
					{ adCode && <Col xs={12}>{atob(adCode)}</Col> }
					{ !adCode && <Col xs={12}>{`${ad.height}X${ad.width}`}</Col> }
				</Row>
				<Row className="butttonsRow">
					<Col xs={number}>
						<Button className="btn-lightBg btn-cancel" onClick={this.toggleCssEditor}>Edit Css</Button>
					</Col>
					{	adCode && (<Col xs={number}><Button className="btn-lightBg btn-cancel" onClick={this.toggleCodeEditor}>Edit AdCode</Button></Col>)	}
					<Col xs={number}>
						<Button className="btn-lightBg btn-cancel" onClick={this.deleteSectionWithAd.bind(this)}>Delete Ad</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

adDescriptor.propTypes = {
	ad: PropTypes.object.isRequired,
	updateCss: PropTypes.func.isRequired,
	updateAdCode: PropTypes.func.isRequired,
	deleteAd: PropTypes.func.isRequired,
	deleteSection: PropTypes.func.isRequired
};

export default adDescriptor;

