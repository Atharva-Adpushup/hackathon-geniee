import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Button } from 'react-bootstrap';
import moment from 'moment';
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
import { resetErrors } from 'actions/uiActions';
import { generateReport } from 'actions/reportingActions';
import Filters from './filters.jsx';
import PaneLoader from '../../../../../../../Components/PaneLoader.jsx';
import VariationSectionElement from './variationSectionElement';

class variationSections extends Component {
	constructor(props) {
		super(props);
		this.state = {
			startDate: moment()
				.subtract(7, 'days')
				.startOf('day'),
			endDate: moment().startOf('day'),
			focusedInput: undefined,
			loadingReport: false
		};
		this.datesUpdated = this.datesUpdated.bind(this);
		this.focusUpdated = this.focusUpdated.bind(this);
		this.generateReportWrapper = this.generateReportWrapper.bind(this);
	}

	componentWillReceiveProps() {
		this.setState({ loadingReport: false });
	}

	datesUpdated({ startDate, endDate }) {
		this.setState({
			startDate,
			endDate
		});
	}

	focusUpdated(focusedInput) {
		this.setState({ focusedInput });
	}

	generateReportWrapper() {
		if (!this.state.startDate || !this.state.endDate) {
			alert('Dates cannot be left blanked');
			return;
		}
		this.props.generateReport({
			from: this.state.startDate.format('YYYY-MM-DD'),
			to: this.state.endDate.format('YYYY-MM-DD')
		});
		this.setState({ loadingReport: true });
	}

	render() {
		const {
			variation,
			sections,
			reporting,
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
			onScrollSectionIntoView
		} = this.props;

		return (
			<div>
				<span>
					<h1 className="variation-section-heading">Variation Sections</h1>
				</span>
				{ui.variationPanel.expanded ? (
					<Filters
						onDatesChange={this.datesUpdated}
						onFocusChange={this.focusUpdated}
						focusedInput={this.state.focusedInput}
						startDate={this.state.startDate}
						endDate={this.state.endDate}
						showDefaultInputIcon
						hideKeyboardShortcutsPanel
						showClearDates
						displayFormat={'DD-MM-YYYY'}
						generateReport={this.generateReportWrapper}
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
				generateReport: generateReport
			},
			dispatch
		)
)(variationSections);
