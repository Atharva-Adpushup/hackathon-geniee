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

	toggleCssEditor() {
		this.setState({ isEditingCss: !this.state.isEditingCss });
	}

	render() {
		const { ad, sectionId, updateCss, deleteAd } = this.props;
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
						<Button className="btn-lightBg btn-cancel" onClick={deleteAd.bind(null, ad.id, sectionId)}>Delete Ad</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

adDescriptor.propTypes = {
	ad: PropTypes.object.isRequired,
	updateCss: PropTypes.func.isRequired,
	deleteAd: PropTypes.func.isRequired
};

export default adDescriptor;

