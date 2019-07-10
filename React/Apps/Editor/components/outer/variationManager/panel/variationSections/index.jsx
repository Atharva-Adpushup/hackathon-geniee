import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
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
	scrollSectionIntoView,
	updateSection,
	updateType,
	updateFormatData,
	toggleLazyLoad
} from 'actions/sectionActions.js';
import { updateNetwork, updateAdCode, updateAd, updateCustomCss } from 'actions/adActions';
import { resetErrors, showNotification } from 'actions/uiActions';
import { generateReport } from 'actions/reportingActions';
import Filters from './filters.jsx';
import PaneLoader from '../../../../../../../Components/PaneLoader.jsx';
import VariationSectionElement from './variationSectionElement';

const getDate = number => {
	let days = number, // Days you want to subtract
		date = new Date(),
		last = new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
		day = String(last.getDate()),
		month = String(last.getMonth() + 1),
		year = String(last.getFullYear());

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

	componentWillReceiveProps() {
		this.setState({ loadingReport: false });
	}

	datesUpdated(e) {
		let target = e.target, type = target.getAttribute('name');

		this.setState({
			[type]: target.value
		});
	}

	generateReportWrapper() {
		if (!this.state.startDate || !this.state.endDate) {
			this.props.showNotification({
				mode: 'error',
				title: 'Operation failed',
				message: 'Dates cannot be left blank'
			});
			return;
		}
		this.props.generateReport({
			from: this.state.startDate,
			to: this.state.endDate
		});
		this.setState({ loadingReport: true });
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
				{ui.variationPanel.expanded
					? <Filters
							generateReport={this.generateReportWrapper}
							datesUpdated={this.datesUpdated}
							startDate={this.state.startDate}
							endDate={this.state.endDate}
						/>
					: null}
				{!sections.length ? <span>No Sections</span> : ''}
				<ul className="section-list row">
					{this.state.loadingReport
						? <PaneLoader
								message="Loading Data!"
								state="load"
								styles={{ height: '500px', background: '#ebebeb' }}
							/>
						: sections.map((section, key) => (
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
										onSectionAllXPaths={onSectionAllXPaths}
										onValidateXPath={onValidateXPath}
										onResetErrors={onResetErrors}
										onSectionXPathValidate={onSectionXPathValidate}
										onIncontentFloatUpdate={onIncontentFloatUpdate}
										onScrollSectionIntoView={onScrollSectionIntoView}
										updateSection={updateSection}
										updateAd={updateAd}
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
							))}
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
	onSectionAllXPaths: PropTypes.func,
	onValidateXPath: PropTypes.func,
	onSectionXPathValidate: PropTypes.func,
	onSetSectionType: PropTypes.func,
	resetErrors: PropTypes.func,
	updateNetwork: PropTypes.func,
	generateReport: PropTypes.func,
	showNotification: PropTypes.func,
	updateAd: PropTypes.func,
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
				onSectionAllXPaths: sectionAllXPaths,
				onValidateXPath: validateXPath,
				onResetErrors: resetErrors,
				onSectionXPathValidate: validateSectionXPath,
				onIncontentFloatUpdate: updateIncontentFloat,
				onScrollSectionIntoView: scrollSectionIntoView,
				updateAdCode: updateAdCode,
				updateNetwork: updateNetwork,
				generateReport: generateReport,
				showNotification: showNotification,
				updateSection: updateSection,
				updateAd: updateAd,
				updateType: updateType,
				updateFormatData: updateFormatData,
				toggleLazyLoad: toggleLazyLoad
			},
			dispatch
		)
)(variationSections);
