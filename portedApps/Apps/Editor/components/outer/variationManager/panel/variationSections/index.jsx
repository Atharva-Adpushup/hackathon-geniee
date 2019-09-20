import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	deleteSection,
	renameSection,
	updateXPath,
	updateOperation,
	sectionAllXPaths,
	validateXPath,
	validateSectionXPath,
	updateIncontentFloat,
	updatePartnerData,
	updateInContentMinDistanceFromPrevAd,
	updateInContentNotNear,
	scrollSectionIntoView,
	updateSection,
	updateType,
	updateFormatData,
	toggleLazyLoad
} from 'actions/sectionActions.js';
import {
	updateNetwork,
	updateAdCode,
	updateAd,
	updateCustomCss,
	updateMultipleAdSizes
} from 'actions/adActions';
import { resetErrors, showNotification } from 'actions/uiActions';
import { generateReport } from 'actions/reportingActions';
import Filters from './filters.jsx';
import PaneLoader from '../../../../../../../Components/PaneLoader.jsx';
import VariationSectionElement from './variationSectionElement';

const getDate = number => {
	const date = new Date();
	const last = new Date(date.getTime() - number * 24 * 60 * 60 * 1000);
	const day = String(last.getDate());
	const month = String(last.getMonth() + 1);
	const year = String(last.getFullYear());

	return `${year}-${month.length == 1 ? '0' : ''}${month}-${day.length == 1 ? '0' : ''}${day}`;
};

class variationSections extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate: getDate(7),
			endDate: getDate(1),
			focusedInput: undefined,
			loadingReport: false
		};
		this.datesUpdated = this.datesUpdated.bind(this);
		this.generateReportWrapper = this.generateReportWrapper.bind(this);
	}

	// componentWillReceiveProps() {
	// 	this.setState({ loadingReport: false });
	// }

	datesUpdated(e) {
		const target = e.target;
		const type = target.getAttribute('name');

		this.setState({
			[type]: target.value
		});
	}

	generateReportWrapper() {
		const { startDate, endDate } = this.state;
		const { generateReport, showNotification } = this.props;

		if (!startDate || !endDate) {
			return showNotification({
				mode: 'error',
				title: 'Operation failed',
				message: 'Dates cannot be left blank'
			});
		}
		this.setState({ loadingReport: true }, () =>
			generateReport({
				from: startDate,
				to: endDate
			}).then(() => this.setState({ loadingReport: false }))
		);
	}

	render() {
		const {
			variation,
			sections,
			reporting,
			platform,
			onDeleteSection,
			onRenameSection,
			onUpdatePartnerData,
			onUpdateXPath,
			onUpdateOperation,
			onUpdateCustomCss,
			onUpdateInContentMinDistanceFromPrevAd,
			onUpdateInContentNotNear,
			onSectionAllXPaths,
			onValidateXPath,
			onIncontentFloatUpdate,
			updateAdCode,
			updateNetwork,
			ui,
			onResetErrors,
			onSectionXPathValidate,
			onScrollSectionIntoView,
			updateAd,
			updateMultipleAdSizes,
			updateSection,
			showNotification,
			updateType,
			updateFormatData,
			toggleLazyLoad,
			networkConfig
		} = this.props;

		return (
			<div>
				<span>
					<h1 className="variation-section-heading">Variation Sections</h1>
				</span>
				{ui.variationPanel.expanded ? (
					<Filters
						generateReport={this.generateReportWrapper}
						datesUpdated={this.datesUpdated}
						startDate={this.state.startDate}
						endDate={this.state.endDate}
					/>
				) : null}
				{!sections.length ? <span>No Sections</span> : ''}
				<ul className="section-list row">
					{this.state.loadingReport ? (
						<PaneLoader
							message="Loading Data!"
							state="load"
							styles={{ height: '500px', background: '#ebebeb' }}
						/>
					) : (
						sections.map((section, key) => (
							<div key={key} className="col-sm-6">
								<VariationSectionElement
									section={section}
									key={key}
									variation={variation}
									onDeleteSection={onDeleteSection}
									onRenameSection={onRenameSection}
									updateAdCode={updateAdCode}
									updateNetwork={updateNetwork}
									onUpdatePartnerData={onUpdatePartnerData}
									onUpdateXPath={onUpdateXPath}
									onUpdateOperation={onUpdateOperation}
									onUpdateCustomCss={onUpdateCustomCss}
									onUpdateInContentMinDistanceFromPrevAd={onUpdateInContentMinDistanceFromPrevAd}
									onUpdateInContentNotNear={onUpdateInContentNotNear}
									onSectionAllXPaths={onSectionAllXPaths}
									onValidateXPath={onValidateXPath}
									onResetErrors={onResetErrors}
									onSectionXPathValidate={onSectionXPathValidate}
									onIncontentFloatUpdate={onIncontentFloatUpdate}
									onScrollSectionIntoView={onScrollSectionIntoView}
									updateSection={updateSection}
									updateAd={updateAd}
									updateMultipleAdSizes={updateMultipleAdSizes}
									ui={ui}
									reporting={reporting}
									showNotification={showNotification}
									platform={platform}
									onSetSectionType={updateType}
									onFormatDataUpdate={updateFormatData}
									onToggleLazyLoad={toggleLazyLoad}
									networkConfig={networkConfig}
								/>
							</div>
						))
					)}
				</ul>
			</div>
		);
	}
}

variationSections.propTypes = {
	variation: PropTypes.object.isRequired,
	sections: PropTypes.array.isRequired,
	onDeleteSection: PropTypes.func.isRequired,
	onRenameSection: PropTypes.func.isRequired,
	updateAdCode: PropTypes.func.isRequired,
	onUpdatePartnerData: PropTypes.func.isRequired,
	onUpdateXPath: PropTypes.func,
	onUpdateOperation: PropTypes.func,
	onUpdateCustomCss: PropTypes.func,
	onUpdateInContentMinDistanceFromPrevAd: PropTypes.func,
	onUpdateInContentNotNear: PropTypes.func,
	onSectionAllXPaths: PropTypes.func,
	onValidateXPath: PropTypes.func,
	onSectionXPathValidate: PropTypes.func,
	onSetSectionType: PropTypes.func,
	resetErrors: PropTypes.func,
	updateNetwork: PropTypes.func,
	generateReport: PropTypes.func,
	showNotification: PropTypes.func,
	updateAd: PropTypes.func,
	updateMultipleAdSizes: PropTypes.func,
	updateSection: PropTypes.func,
	ui: PropTypes.object,
	reporting: PropTypes.object
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				onDeleteSection: deleteSection,
				onRenameSection: renameSection,
				onUpdateAdCode: updateAdCode,
				onUpdateCustomCss: updateCustomCss,
				onUpdatePartnerData: updatePartnerData,
				onUpdateXPath: updateXPath,
				onUpdateOperation: updateOperation,
				onUpdateInContentMinDistanceFromPrevAd: updateInContentMinDistanceFromPrevAd,
				onUpdateInContentNotNear: updateInContentNotNear,
				onSectionAllXPaths: sectionAllXPaths,
				onValidateXPath: validateXPath,
				onResetErrors: resetErrors,
				onSectionXPathValidate: validateSectionXPath,
				onIncontentFloatUpdate: updateIncontentFloat,
				onScrollSectionIntoView: scrollSectionIntoView,
				updateAdCode,
				updateNetwork,
				generateReport,
				showNotification,
				updateSection,
				updateAd,
				updateMultipleAdSizes,
				updateType,
				updateFormatData,
				toggleLazyLoad
			},
			dispatch
		)
)(variationSections);
