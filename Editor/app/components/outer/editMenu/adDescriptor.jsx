import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';
import CodeBox from 'shared/codeBox.jsx';
import SectionOptions from '../insertMenu/sectionOptions.jsx';

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
		const { ad, sectionId, variationId, deleteSection } = this.props;

		deleteSection(sectionId, variationId, ad.id);
	}

	toggleCssEditor() {
		this.setState({ isEditingCss: !this.state.isEditingCss });
	}

	toggleCodeEditor() {
		this.setState({ isEditingCode: !this.state.isEditingCode });
	}

	render() {
		const { ad, updateCss, updateAdCode, partnerData, updateSettings, sectionId } = this.props,
			adCode = ad.adCode,
			number = 6;
			
		if (this.state.isEditingCss) {
			return (<CssEditor css={ad.css} onCancel={this.toggleCssEditor} onSave={updateCss.bind(null, ad.id)} />);
		}
		if (this.state.isEditingCode) {
			return (<CodeBox showButtons code={adCode} onSubmit={updateAdCode.bind(null, ad.id)} onCancel={this.toggleCodeEditor} />);
		}
		return (
			<div className="containerButtonBar">
				<Row>
					<SectionOptions updateMode sectionId={sectionId} ad={ad} partnerData={partnerData} updateSettings={updateSettings}/>
				</Row>
				<Row className="butttonsRow">
					{	adCode ? (
						<Col xs={12}>
							<Button className="btn-lightBg btn-edit btn-block" onClick={this.toggleCodeEditor}>Edit AdCode</Button>
						</Col>)	: (
							<Col xs={12}>
								<Button className="btn-lightBg btn-edit btn-block" onClick={this.toggleCodeEditor}>Ad Custom AdCode</Button>
							</Col>
						)
					}
					<Col xs={number} className="mT-10">
						<Button className="btn-lightBg btn-edit" onClick={this.toggleCssEditor}>Edit Css</Button>
					</Col>
					<Col xs={number} className="mT-10">
						<Button className="btn-lightBg btn-cancel" onClick={this.deleteSectionWithAd.bind(this)}>Delete Ad</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

adDescriptor.propTypes = {
	ad: PropTypes.object.isRequired,
	partnerData: PropTypes.object.isRequired,
	updateCss: PropTypes.func.isRequired,
	updateAdCode: PropTypes.func.isRequired,
	deleteSection: PropTypes.func.isRequired,
	updateSettings: PropTypes.func
};

export default adDescriptor;

