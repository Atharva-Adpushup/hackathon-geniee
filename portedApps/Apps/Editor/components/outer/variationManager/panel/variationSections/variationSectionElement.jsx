import React, { Component } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import EditOptions from './editOptions.jsx';

const errorBorder = {
	border: '1px solid #eb575c',
	boxShadow: 'inset 0px 0px 1px 1px #eb575c'
};
class variationSectionElement extends Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		const {
			section: { isIncontent, type, id, xpath },
			onSectionXPathValidate
		} = this.props;

		isIncontent || type === 3 ? null : onSectionXPathValidate(id, xpath);
	}

	render() {
		const props = this.props;
		const adsObject = props.section.ads[0];
		const isPartnerData = !!(props.section && props.section.partnerData);
		const isCustomZoneId = !!(
			isPartnerData &&
			Object.keys(props.section.partnerData).length &&
			props.section.partnerData.customZoneId &&
			adsObject.network === 'geniee'
		);
		const customZoneId = isCustomZoneId ? props.section.partnerData.customZoneId : '';
		const customZoneIdText = isCustomZoneId ? 'Zone ID' : '';
		const hasData =
			Object.keys(props.reporting).length &&
			Object.keys(props.reporting.sections).length &&
			props.reporting.sections[props.section.id];
		const sectionReport = hasData ? props.reporting.sections[props.section.id] : false;

		return (
			<li
				className="section-list-item"
				key={props.section.id}
				style={
					props.section.error
						? errorBorder
						: { ...errorBorder, border: '1px solid #d9d9d9', boxShadow: 'none' }
				}
			>
				<OverlayTrigger
					placement="bottom"
					overlay={<Tooltip id="delete-section-tooltip">Delete Section</Tooltip>}
				>
					{/* `section.ads[0].id` is temporarily added as 3rd argument to accomodate
					 * one section and one ad creation/deletion
					 * TODO: Remove `section.ads[0].id` hard-coded check and remove all ads inside
					 * a section using its `ads` array
					 */}
					<Button
						className="btn-close"
						onClick={props.onDeleteSection.bind(
							null,
							props.section.id,
							props.variation.id,
							props.section.ads[0].id
						)}
						type="submit"
					>
						x
					</Button>
				</OverlayTrigger>
				<Row>
					{props.section.isIncontent ? (
						<label className="section-label section-incontent">
							<i className="fa fa-object-group" />
							<span>In-Content</span>
						</label>
					) : (
						<label className="section-label section-structural">
							<i className="fa fa-object-ungroup" />
							<span>Structural {props.section.error}</span>
						</label>
					)}
					{isCustomZoneId ? (
						<label className="u-margin-l5px section-label section-incontent">
							<i className="fa fa-pencil" />
							<span>{customZoneIdText}</span>
						</label>
					) : null}
					{props.section.error ? (
						<label className="section-label section-error">
							<i className="fa fa-exclamation-triangle" />
							<span>Invalid XPath</span>
						</label>
					) : (
						''
					)}
					<Col className="u-padding-r10px section-id-ie" xs={12} style={{ marginBottom: '10px' }}>
						Section Id: <strong>{props.section.id}</strong>
					</Col>
					<Col className="u-padding-r10px section-name-ie" xs={12}>
						<InlineEdit
							validate
							value={props.section.name}
							submitHandler={props.onRenameSection.bind(null, props.section, props.variation.id)}
							text="Section Name"
							errorMessage="Section Name cannot be blank"
						/>
					</Col>
				</Row>
				<Row>
					{/* Read only Fields starts from here */}
					<Col xs={6}>
						<Row>
							<Col className="u-padding-r10px" xs={12}>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Size
									</Col>
									<Col xs={5}>
										<strong>
											{props.section.ads[0].width} x {props.section.ads[0].height}
										</strong>
									</Col>
								</Row>
							</Col>
						</Row>
						{props.section.isIncontent ? (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Section No.
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>{props.section.sectionNo}</strong>
									</Col>
								</Row>
							</div>
						) : props.section.type != 3 ? (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Operation
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>{props.section.operation}</strong>
									</Col>
								</Row>
							</div>
						) : null}
						{hasData ? (
							<div>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Total AdPushup Impressions
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>{sectionReport.adpushup_impressions}</strong>
									</Col>
								</Row>
								{window.isSuperUser ? (
									<Row>
										<Col className="u-padding-r10px" xs={7}>
											Total XPath Misses
										</Col>
										<Col className="u-padding-l10px" xs={5}>
											<strong>{sectionReport.adpushup_xpath_miss}</strong>
										</Col>
									</Row>
								) : null}
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Total CPM
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>
											{props.reporting.sections[props.section.id].aggregate.total_cpm}
										</strong>
									</Col>
								</Row>
								<Row>
									<Col className="u-padding-r10px" xs={7}>
										Total Net Network Revenue
									</Col>
									<Col className="u-padding-l10px" xs={5}>
										<strong>{sectionReport.network_net_revenue}</strong>
									</Col>
								</Row>
							</div>
						) : null}
						{!props.section.isIncontent ? (
							<Row>
								<Col className="u-padding-t10px">
									<label
										className="section-label section-select-ad"
										onClick={props.onScrollSectionIntoView.bind(null, props.section.ads[0].id)}
									>
										<i className="fa fa-eye" aria-hidden="true" />
										<span>Select Ad</span>
									</label>
								</Col>
							</Row>
						) : null}
					</Col>
					{/* Editable Fields starts from here */}
					<Col xs={6}>
						<EditOptions
							{...this.props}
							customZoneId={customZoneId}
							isCustomZoneId={isCustomZoneId}
						/>
					</Col>
				</Row>
			</li>
		);
	}
}

export default variationSectionElement;
