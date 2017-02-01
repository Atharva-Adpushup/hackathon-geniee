import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteSection, renameSection, updateXPath, sectionAllXPaths, validateXPath, validateSectionXPath } from 'actions/sectionActions.js';
import { updateAdCode } from 'actions/adActions';
import { resetErrors } from 'actions/uiActions';
import VariationSection from './variationSectionElement';

const variationSections = (props) => {
	const { variation, sections, onDeleteSection, onRenameSection, onUpdateAdCode, onUpdateXPath, onSectionAllXPaths, onValidateXPath, ui, onResetErrors, onSectionXPathValidate } = props;
	return (
		<div>
			<h1 className="variation-section-heading">Demo Panel Text</h1>
			{!sections.length ? (<span>No Sections</span>) : ''}
			<ul className="section-list row">
				{sections.map((section, key) => (
					<div key={key} className="col-sm-4" >
						<VariationSection
							section={section}
							key={key}
							variation={variation}
							onDeleteSection={onDeleteSection}
							onRenameSection={onRenameSection}
							onUpdateAdCode={onUpdateAdCode}
							onUpdateXPath={onUpdateXPath}
							onSectionAllXPaths={onSectionAllXPaths}
							onValidateXPath={onValidateXPath}
							onResetErrors={onResetErrors}
							onSectionXPathValidate={onSectionXPathValidate}
							ui={ui}
							/>
					</div>
				))
				}
			</ul>
		</div>
	);
};

variationSections.propTypes = {
	variation: PropTypes.object.isRequired,
	sections: PropTypes.array.isRequired,
	onDeleteSection: PropTypes.func.isRequired,
	onRenameSection: PropTypes.func.isRequired,
	onUpdateAdCode: PropTypes.func.isRequired,
	onUpdateXPath: PropTypes.func,
	onSectionAllXPaths: PropTypes.func,
	onValidateXPath: PropTypes.func,
	onSectionXPathValidate: PropTypes.func,
	ui: PropTypes.object,
	resetErrors: PropTypes.func
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	(dispatch) => bindActionCreators({
		onDeleteSection: deleteSection,
		onRenameSection: renameSection,
		onUpdateAdCode: updateAdCode,
		onUpdateXPath: updateXPath,
		onSectionAllXPaths: sectionAllXPaths,
		onValidateXPath: validateXPath,
		onResetErrors: resetErrors,
		onSectionXPathValidate: validateSectionXPath
	}, dispatch)
)(variationSections);