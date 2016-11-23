import React, { PropTypes } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteSection, renameSection } from 'actions/sectionActions.js';
import InlineEdit from '../../../shared/inlineEdit/index.jsx';

const variationSections = (props) => {
	const { variation, sections, onDeleteSection, onRenameSection } = props;
	return (
		<div>
			<h1 className="variation-section-heading">Variation Sections</h1>
			{ !sections.length ? (<span>No Sections</span>) : '' }
			<ul className="section-list row">
				{ sections.map((section, key) => (
					<div key={key} className="col-sm-4">
						<li key={section.id}>
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
							</Row>
							{ section.isIncontent ? (
								<div>
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
											<Col className="u-padding-l10px" xs={8}><strong>{section.xpath}</strong></Col>
										</Row>
									</div>
									) }
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
	onRenameSection: PropTypes.func.isRequired
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	(dispatch) => bindActionCreators({
		onDeleteSection: deleteSection,
		onRenameSection: renameSection
	}, dispatch)
	)(variationSections);

