import React, { PropTypes } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteSection, renameSection, updateXPath, sectionAllXPaths, validateXPath } from 'actions/sectionActions.js';
import { updateAdCode } from 'actions/adActions';
import { resetErrors } from 'actions/uiActions';
import InlineEdit from '../../../shared/inlineEdit/index.jsx';

const variationSections = (props) => {
	const { variation, sections, onDeleteSection, onRenameSection, onUpdateAdCode, onUpdateXPath, onSectionAllXPaths, onValidateXPath, ui, onResetErrors } = props;
	return (
		<div>
			<h1 className="variation-section-heading">Variation Sections</h1>
			{ !sections.length ? (<span>No Sections</span>) : '' }
			<ul className="section-list row">
				{ sections.map((section, key) => (
					<div key={key} className="col-sm-4">
						<li className="section-list-item" key={section.id}>
							<OverlayTrigger placement="bottom" overlay={<Tooltip id="delete-section-tooltip">Delete Section</Tooltip>}>
								{/*`section.ads[0].id` is temporarily added as 3rd argument to accomodate
								  * one section and one ad creation/deletion
								  * TODO: Remove `section.ads[0].id` hard-coded check and remove all ads inside
								  * a section using its `ads` array
								*/}
								<Button className="btn-close" onClick={onDeleteSection.bind(null, section.id, variation.id, section.ads[0].id)} type="submit">x</Button>
							</OverlayTrigger>
							<Row>
								{ section.isIncontent ? (
									<label className="section-label section-incontent">
										<i className="fa fa-object-group" /><span>In-Content</span>
									</label>
									) : <label className="section-label section-structural">
										<i className="fa fa-object-ungroup" /><span>Structural</span>
									</label>
									}
								<Col className="u-padding-r10px section-name-ie" xs={12}>
									<InlineEdit value={section.name}
										submitHandler={onRenameSection.bind(null, section, variation.id)} text="Section Name" errorMessage="Section Name cannot be blank"
									/>
								</Col>
								<Col className="u-padding-r10px" xs={12}>
									<Row>
										<Col className="u-padding-r10px" xs={4}>Size</Col>
										<Col xs={8}><strong>{section.ads[0].width} x {section.ads[0].height}</strong></Col>											
									</Row>
								</Col>
							</Row>
							{ section.isIncontent ? (
								<div>
									<Row>
										<Col className="u-padding-r10px" xs={4}>Ad Code</Col>
										<Col className="u-padding-l10px" xs={8}>
											<InlineEdit compact adCode value={section.ads[0].adCode}
												submitHandler={onUpdateAdCode.bind(null, section.ads[0].id)} text="Ad Code" errorMessage="Ad Code cannot be blank"
											/>
										</Col>
									</Row>
									<Row>
										<Col className="u-padding-r10px" xs={4}>Section No.</Col>
										<Col className="u-padding-l10px" xs={8}><strong>{section.sectionNo}</strong></Col>
									</Row>
									<Row>
										<Col className="u-padding-r10px" xs={4}>Float</Col>
										<Col className="u-padding-l10px" xs={8}><strong>{section.float}</strong></Col>
									</Row>
								</div>
									) : (<div>
										<Row>
											<Col className="u-padding-r10px" xs={4}>Operation</Col>
											<Col className="u-padding-l10px" xs={8}><strong>{section.operation}</strong></Col>
										</Row>
										<Row>
											<Col className="u-padding-r10px" xs={4}>XPath</Col>
											<Col className="u-padding-l10px" xs={8}>
												<InlineEdit compact cancelEditHandler={onResetErrors} customError={ui.errors.xpath ? ui.errors.xpath.error : false} dropdownList={section.allXpaths} value={section.xpath}
													submitHandler={onUpdateXPath.bind(null, section.id)} keyUpHandler={onValidateXPath.bind(null, section.id)} editClickHandler={onSectionAllXPaths.bind(null, section.id, section.xpath)} text="XPath" errorMessage={(ui.errors.xpath && ui.errors.xpath.error) ? ui.errors.xpath.message : 'XPath cannot be blank'}
												/>
											</Col>
										</Row>
									</div>
								) 
							}
						</li>
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
		onResetErrors: resetErrors
	}, dispatch)
	)(variationSections);

