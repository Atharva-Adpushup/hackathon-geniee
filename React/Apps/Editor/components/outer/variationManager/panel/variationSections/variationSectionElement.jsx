import React, { Component } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import SelectBox from 'shared/select/select.js';
import LabelWithButton from 'components/shared/labelWithButton.jsx';
import { floats } from 'consts/commonConsts';
import $ from 'jquery';

const errorBorder = {
	border: '1px solid #eb575c',
	boxShadow: 'inset 0px 0px 1px 1px #eb575c'
};

class variationSectionElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			float: this.props.section.float
		};

		this.onFloatSelectChange = this.onFloatSelectChange.bind(this);
		this.onPartnerDataUpdate = this.onPartnerDataUpdate.bind(this);
		// this.scrollSectionInToView = this.scrollSectionInToView.bind(this);
	}

	componentWillMount() {
		this.props.section.isIncontent
			? null
			: this.props.onSectionXPathValidate(this.props.section.id, this.props.section.xpath);
	}

	onFloatSelectChange(float) {
		this.setState({ float });

		const sectionId = this.props.section.id,
			adId = this.props.section.ads[0].id;
		this.props.onIncontentFloatUpdate(sectionId, adId, float);
	}

	onPartnerDataUpdate(customZoneId) {
		const sectionId = this.props.section.id,
			adId = this.props.section.ads[0].id,
			partnerData = $.extend(true, {}, this.props.section.partnerData);

		partnerData.customZoneId = customZoneId;
		this.props.onUpdatePartnerData(sectionId, adId, partnerData);
	}

	render() {
		const props = this.props,
			adsObject = props.section.ads[0],
			isPartnerData = !!(props.section && props.section.partnerData),
			isCustomZoneId = !!(
				isPartnerData &&
				Object.keys(props.section.partnerData).length &&
				props.section.partnerData.customZoneId &&
				adsObject.network === 'geniee'
			),
			customZoneId = isCustomZoneId ? props.section.partnerData.customZoneId : '',
			customZoneIdText = isCustomZoneId ? 'Zone ID' : '';

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
					{/*`section.ads[0].id` is temporarily added as 3rd argument to accomodate
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
					<Col className="u-padding-r10px section-name-ie" xs={12}>
						<InlineEdit
							validate
							value={props.section.name}
							submitHandler={props.onRenameSection.bind(null, props.section, props.variation.id)}
							text="Section Name"
							errorMessage="Section Name cannot be blank"
						/>
					</Col>
					<Col className="u-padding-r10px" xs={12}>
						<Row>
							<Col className="u-padding-r10px" xs={4}>
								Size
							</Col>
							<Col xs={8}>
								<strong>
									{props.section.ads[0].width} x {props.section.ads[0].height}
								</strong>
							</Col>
						</Row>
					</Col>
					{isCustomZoneId ? (
						<Col>
							<Row>
								<Col className="u-padding-r10px" xs={4}>
									Zone Id
								</Col>
								<Col className="u-padding-l10px" xs={8}>
									<InlineEdit
										type="number"
										compact
										validate
										value={customZoneId}
										submitHandler={this.onPartnerDataUpdate}
										text="Custom Zone Id"
										errorMessage="Custom zone id cannot be blank"
									/>
								</Col>
							</Row>
						</Col>
					) : null}
				</Row>
				{props.section.isIncontent ? (
					<div>
						<Row>
							<Col className="u-padding-r10px" xs={4}>
								Ad Code
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<InlineEdit
									compact
									validate
									adCode
									value={props.section.ads[0].adCode}
									submitHandler={props.onUpdateAdCode.bind(null, props.section.ads[0].id)}
									text="Ad Code"
									errorMessage="Ad Code cannot be blank"
								/>
							</Col>
						</Row>
						<Row>
							<Col className="u-padding-r10px" xs={4}>
								Section No.
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<strong>{props.section.sectionNo}</strong>
							</Col>
						</Row>
						<Row style={{ marginTop: 5 }}>
							<Col className="u-padding-r10px" xs={4}>
								Float
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<SelectBox
									value={this.state.float}
									label="Select Float"
									onChange={this.onFloatSelectChange}
									showClear={false}
								>
									{floats.map((float, index) => (
										<option key={index} value={float}>
											{float}
										</option>
									))}
								</SelectBox>
							</Col>
						</Row>
					</div>
				) : (
					<div>
						<Row>
							<Col className="u-padding-r10px" xs={4}>
								Operation
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<strong>{props.section.operation}</strong>
							</Col>
						</Row>
						<Row>
							<Col className="u-padding-r10px" xs={4}>
								XPath
							</Col>
							<Col className="u-padding-l10px" xs={8}>
								<InlineEdit
									compact
									validate
									cancelEditHandler={props.onResetErrors.bind(null, props.section.id)}
									customError={props.ui.errors.xpath ? props.ui.errors.xpath.error : false}
									dropdownList={props.section.allXpaths}
									value={props.section.xpath}
									keyUpHandler={props.onValidateXPath.bind(null, props.section.id)}
									submitHandler={props.onUpdateXPath.bind(null, props.section.id)}
									editClickHandler={props.onSectionAllXPaths.bind(
										null,
										props.section.id,
										props.section.xpath
									)}
									text="XPath"
									errorMessage={
										props.ui.errors.xpath && props.ui.errors.xpath.error
											? props.ui.errors.xpath.message
											: 'XPath cannot be blank'
									}
								/>
								{/*
                                <span className="error-message">{props.section.error ? 'XPath invalid' : ''}</span>
                            */}
							</Col>
						</Row>
					</div>
				)}
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
			</li>
		);
	}
}

export default variationSectionElement;
