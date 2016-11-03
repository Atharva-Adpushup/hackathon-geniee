import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';

const initialState = {
	isEditingCss: false
};

class adDescriptor extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
		this.toggleCssEditor = this.toggleCssEditor.bind(this);
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

	render() {
		const { ad, updateCss } = this.props;
		if (this.state.isEditingCss) {
			return (<CssEditor css={ad.css} onCancel={this.toggleCssEditor} onSave={updateCss.bind(null, ad.id)} />);
		}
		return (
			<div className="containerButtonBar">
				<Row>
					<Col xs={12}>{`${ad.height}X${ad.width}`}</Col>
				</Row>
				<Row className="butttonsRow">
					<Col xs={6}>
						<Button className="btn-lightBg btn-cancel" onClick={this.toggleCssEditor}>Edit Css</Button>
					</Col>
					<Col xs={6}>
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
	deleteAd: PropTypes.func.isRequired,
	deleteSection: PropTypes.func.isRequired
};

export default adDescriptor;

