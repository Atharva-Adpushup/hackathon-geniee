import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
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
			<ul className="list-group">
				{ sections.map((section) => (
						<li className="list-group-item" key={section.id}>
							<Row>
								<Col className="u-padding-r10px" xs={12}>
									<InlineEdit value={section.name} submitHandler={onRenameSection.bind(null, section.id)} text="Section Name" errorMessage="Section Name cannot be blank" />
									
								</Col>
							</Row>
							<Row>
								<Col className="u-padding-r10px" xs={2}>No. of Ads</Col>
								<Col className="u-padding-l10px" xs={8}><strong>{section.ads.length}</strong></Col>
							</Row>
							{ section.isIncontent ? (
									<div>
										<Row>
											<Col className="u-padding-r10px" xs={2}>Section No.</Col>
											<Col className="u-padding-l10px" xs={8}><strong>{section.sectionNo}</strong></Col>
										</Row>
										<Row>
											<Col className="u-padding-r10px" xs={2}>Float</Col>
											<Col className="u-padding-l10px" xs={8}><strong>{section.float}</strong></Col>
										</Row>
										<Row>
											<Col className="u-padding-r10px" xs={2}>minDistanceFromPrevAd</Col>
											<Col className="u-padding-l10px" xs={8}><strong>{section.minDistanceFromPrevAd}</strong></Col>
										</Row>
									</div>
								) : ( <div>
										<Row>
											<Col className="u-padding-r10px" xs={2}>Operation</Col>
											<Col className="u-padding-l10px" xs={8}><strong>{section.operation}</strong></Col>
										</Row>
										<Row>
											<Col className="u-padding-r10px" xs={2}>XPath</Col>
											<Col className="u-padding-l10px" xs={8}><strong>{section.xpath}</strong></Col>
										</Row>
									</div>
								) }
							<br />
							<Row>
								<Col className="u-padding-r10px" xs={2}>
									<Button className="btn-lightBg btn-del-line btn-block" onClick={onDeleteSection.bind(null, section.id, variation.id)} type="submit">Delete Section</Button>
								</Col>
							</Row>
						</li>
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

