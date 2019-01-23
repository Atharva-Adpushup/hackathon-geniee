import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Utils from 'libs/utils';
import CssEditor from 'shared/cssEditor/cssEditor.jsx';
import CodeBox from 'shared/codeBox.jsx';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';
import AdDetails from './AdDetails';
import { iabSizes } from 'consts/commonConsts';

const initialState = {
	isEditingCss: false,
	isEditingCode: false,
	isEditingNetwork: false,
	showButton: true
};

class adDescriptor extends React.Component {
	constructor(props) {
		super(props);
		this.state = initialState;
		this.toggleCssEditor = this.toggleCssEditor.bind(this);
		this.toggleCodeEditor = this.toggleCodeEditor.bind(this);
		this.toggleNetworkEditor = this.toggleNetworkEditor.bind(this);
		this.toggleDeleteButton = this.toggleDeleteButton.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	deleteSectionWithAd() {
		const { ad, section, variationId, deleteSection } = this.props;

		deleteSection(section.id, variationId, ad.id);
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

	toggleDeleteButton() {
		this.setState({ showButton: !this.state.showButton });
	}

	submitHandler(params) {
		const { ad } = this.props;

		Utils.updateMultipleAdSizes(ad, params, iabSizes, this);
		this.props.updateNetwork(ad.id, params);
	}

	render() {
		const {
				ad,
				updateCss,
				updateAdCode,
				section,
				updateSettings,
				showNotification,
				onUpdateXPath,
				onUpdateOperation,
				onSectionAllXPaths,
				onValidateXPath,
				onResetErrors,
				onRenameSection,
				onSetSectionType,
				onFormatDataUpdate,
				ui,
				variationId,
				updateAdSize,
				channelId,
				onToggleLazyLoad,
				networkConfig
			} = this.props,
			adCode = ad.adCode,
			number = 12;

		if (this.state.isEditingCss) {
			return <CssEditor css={ad.css} onCancel={this.toggleCssEditor} onSave={updateCss.bind(null, ad.id)} />;
		}
		if (this.state.isEditingCode) {
			return (
				<CodeBox
					showButtons
					code={adCode}
					onSubmit={updateAdCode.bind(null, ad.id)}
					onCancel={this.toggleCodeEditor}
				/>
			);
		}
		if (this.state.isEditingNetwork) {
			return (
				<NetworkOptions
					onSubmit={this.submitHandler}
					onCancel={this.toggleNetworkEditor}
					ad={ad}
					adDescriptor={true}
					showNotification={this.props.showNotification}
					networkConfig={networkConfig}
				/>
			);
		}
		return (
			<div className="containerButtonBar">
				<Row style={{ margin: '10px 0' }}>
					<AdDetails
						userType={currentUser.userType || false}
						ad={ad}
						ui={ui}
						section={section}
						variationId={variationId}
						editCss={this.toggleCssEditor}
						editNetwork={this.toggleNetworkEditor}
						onUpdateXPath={onUpdateXPath}
						onUpdateOperation={onUpdateOperation}
						onSectionAllXPaths={onSectionAllXPaths}
						onValidateXPath={onValidateXPath}
						onResetErrors={onResetErrors}
						onRenameSection={onRenameSection}
						onSetSectionType={onSetSectionType}
						onFormatDataUpdate={onFormatDataUpdate}
						toggleDeleteButton={this.toggleDeleteButton}
						showNotification={showNotification}
						updateAdSize={updateAdSize}
						channelId={channelId}
						onToggleLazyLoad={onToggleLazyLoad}
					/>
				</Row>
				{this.state.showButton ? (
					<Row className="butttonsRow">
						<Col xs={number} className="mT-10">
							<Button
								className="btn-lightBg btn-cancel"
								onClick={this.deleteSectionWithAd.bind(this)}
								style={{ width: '100%' }}
							>
								Delete Ad
							</Button>
						</Col>
					</Row>
				) : null}
			</div>
		);
	}
}

adDescriptor.propTypes = {
	ad: PropTypes.object.isRequired,
	section: PropTypes.object.isRequired,
	updateCss: PropTypes.func.isRequired,
	updateAdCode: PropTypes.func.isRequired,
	deleteSection: PropTypes.func.isRequired,
	updateSettings: PropTypes.func
};

export default adDescriptor;
