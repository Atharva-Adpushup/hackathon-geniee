import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';
import CodeBox from 'shared/codeBox.jsx';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';
import SectionOptions from '../insertMenu/sectionOptions.jsx';
import AdDetails from './AdDetails';

const initialState = {
	isEditingCss: false,
	isEditingCode: false,
	isEditingNetwork: false
};

class adDescriptor extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
		this.toggleCssEditor = this.toggleCssEditor.bind(this);
		this.toggleCodeEditor = this.toggleCodeEditor.bind(this);
		this.toggleNetworkEditor = this.toggleNetworkEditor.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	deleteSectionWithAd() {
		const { ad, sectionId, variationId, deleteSection, xpath } = this.props;

		deleteSection(sectionId, variationId, ad.id);
	}

	toggleCssEditor() {
		this.setState({ isEditingCss: !this.state.isEditingCss });
	}

	toggleCodeEditor() {
		this.setState({ isEditingCode: !this.state.isEditingCode });
	}

	toggleNetworkEditor() {
		this.setState({ isEditingNetwork: !this.state.isEditingNetwork });
	}

	submitHandler(value, network, isADP) {
		isADP
		? this.props.updateNetwork(this.props.ad.id, value, network)
		: this.props.updateAdCode(this.props.ad.id, value, network)
	}

	render() {
		const { ad, updateCss, updateAdCode, partnerData, updateSettings, sectionId, xpath } = this.props,
			adCode = ad.adCode,
			number = 12;
			
		if (this.state.isEditingCss) {
			return (<CssEditor css={ad.css} onCancel={this.toggleCssEditor} onSave={updateCss.bind(null, ad.id)} />);
		}
		if (this.state.isEditingCode) {
			return (<CodeBox showButtons code={adCode} onSubmit={updateAdCode.bind(null, ad.id)} onCancel={this.toggleCodeEditor} />);
		}
		if (this.state.isEditingNetwork) {
			return (<NetworkOptions onSubmit={this.submitHandler} onCancel={this.toggleNetworkEditor} ad={ad} adDescriptor={true} />)
		}
		return (
			<div className="containerButtonBar">
				<Row>
					{
						currentUser.userType === 'partner' ? (
							<SectionOptions updateMode sectionId={sectionId} ad={ad} partnerData={partnerData} updateSettings={updateSettings}/>
						) : null
					}
				</Row>
				<Row style={{margin: "10px 0"}}>
					<AdDetails ad={ad} xpath={xpath} editCss={this.toggleCssEditor} editNetwork={this.toggleNetworkEditor} />
				</Row>
				<Row className="butttonsRow">
					<Col xs={number} className="mT-10">
						<Button className="btn-lightBg btn-cancel" onClick={this.deleteSectionWithAd.bind(this)} style={{width: "100%"}}>Delete Ad</Button>
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