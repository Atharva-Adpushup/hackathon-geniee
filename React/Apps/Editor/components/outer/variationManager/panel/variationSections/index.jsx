import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
import {
	deleteSection,
	renameSection,
	updateXPath,
	sectionAllXPaths,
	validateXPath,
	validateSectionXPath,
	updateIncontentFloat,
	updatePartnerData,
	scrollSectionIntoView
} from 'actions/sectionActions.js';
import { updateNetwork, updateAdCode } from 'actions/adActions';
import { resetErrors, showNotification } from 'actions/uiActions';
import { generateReport } from 'actions/reportingActions';
import Filters from './filters.jsx';
import PaneLoader from '../../../../../../../Components/PaneLoader.jsx';
import VariationSectionElement from './variationSectionElement';

const getDate = number => {
	let days = number, // Days you want to subtract
		date = new Date(),
		last = new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
		day = last.getDate(),
		month = last.getMonth() + 1,
		year = last.getFullYear();

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
		let target = e.target,
			type = target.getAttribute('name');

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
			onSectionAllXPaths,
			onValidateXPath,
			onIncontentFloatUpdate,
			updateAdCode,
			updateNetwork,
			ui,
			onResetErrors,
			onSectionXPathValidate,
			onScrollSectionIntoView,
			showNotification
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
									onSectionAllXPaths={onSectionAllXPaths}
									onValidateXPath={onValidateXPath}
									onResetErrors={onResetErrors}
									onSectionXPathValidate={onSectionXPathValidate}
									onIncontentFloatUpdate={onIncontentFloatUpdate}
									onScrollSectionIntoView={onScrollSectionIntoView}
									ui={ui}
									reporting={reporting}
									showNotification={showNotification}
									platform={platform}
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
	onSectionAllXPaths: PropTypes.func,
	onValidateXPath: PropTypes.func,
	onSectionXPathValidate: PropTypes.func,
	resetErrors: PropTypes.func,
	updateNetwork: PropTypes.func,
	generateReport: PropTypes.func,
	showNotification: PropTypes.func,
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
				onUpdatePartnerData: updatePartnerData,
				onUpdateXPath: updateXPath,
				onSectionAllXPaths: sectionAllXPaths,
				onValidateXPath: validateXPath,
				onResetErrors: resetErrors,
				onSectionXPathValidate: validateSectionXPath,
				onIncontentFloatUpdate: updateIncontentFloat,
				onScrollSectionIntoView: scrollSectionIntoView,
				updateAdCode: updateAdCode,
				updateNetwork: updateNetwork,
				generateReport: generateReport,
				showNotification: showNotification
			},
			dispatch
		)
)(variationSections);
