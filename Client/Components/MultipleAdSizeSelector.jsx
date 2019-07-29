import React from 'react';
import PropTypes from 'prop-types';
import { Accordion, Row, Col, Panel, Button, Well, Label } from 'react-bootstrap';
import remove from 'lodash/remove';
import find from 'lodash/find';
import compact from 'lodash/compact';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import { commonSupportedSizes } from '../constants/visualEditor';

class MultipleAdSizeSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeTab: 0,
			selectedSizes: props.sizes || []
		};
		this.handleTabClick = this.handleTabClick.bind(this);
		this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this);
		this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const thisProps = this.props,
			isProps = !!(thisProps && nextProps),
			isSameProps = !!(isProps && thisProps.sizes == nextProps.sizes);

		if (nextProps.sizes && !isSameProps) {
			this.setState({ selectedSizes: nextProps.sizes });
		}
	}

	handleTabClick(key) {
		this.setState({ activeTab: key });
	}

	pushAdSize(object) {
		const collection = this.state.selectedSizes.concat([]);

		collection.push(object);
		this.setState({
			selectedSizes: collection
		});
	}

	removeAdSize(object) {
		const collection = this.state.selectedSizes.concat([]);

		remove(collection, object);
		this.setState({
			selectedSizes: collection
		});
	}

	toggleAdSizeData(adSize) {
		const collection = this.state.selectedSizes,
			isAdSizeInCollection = find(collection, adSize);

		if (!isAdSizeInCollection) {
			return this.pushAdSize(adSize);
		}

		this.removeAdSize(adSize);
	}

	handleCheckBoxClick(adSizeObject) {
		this.toggleAdSizeData(adSizeObject);
	}

	handleSaveButtonClick() {
		const collection = this.state.selectedSizes;

		this.props.onSave(collection);
	}

	renderSizePanels(rec, index) {
		const adSizeCollection = this.state.selectedSizes;

		return (
			<Panel key={`panel-${index}`} header={`${rec.layoutType} Ads`} eventKey={index}>
				<Row>
					{compact(
						map(rec.sizes, (adProps, innerIndex) => {
							const isAdPropsInCollection = find(adSizeCollection, adProps),
								computedRadioFieldValue = isAdPropsInCollection ? 'checked' : false,
								isAdPropsEqualToPrimaryAdSize = isEqual(this.props.primaryAdSize, adProps);

							if (isAdPropsEqualToPrimaryAdSize) {
								return false;
							}

							return (
								<Col key={`col-${innerIndex}`} xs={6} className="Col">
									<input
										id={rec.layoutType + innerIndex}
										type="radio"
										checked={computedRadioFieldValue}
										onClick={this.handleCheckBoxClick.bind(this, adProps)}
									/>
									<label htmlFor={rec.layoutType + innerIndex}>{`${adProps.width} X ${
										adProps.height
									}`}</label>
								</Col>
							);
						})
					)}
				</Row>
			</Panel>
		);
	}

	renderAdSizeAccordion() {
		return (
			<Accordion
				className="u-margin-b15px"
				activeKey={this.state.activeTab}
				onSelect={this.handleTabClick}
			>
				{compact(map(commonSupportedSizes, (rec, index) => this.renderSizePanels(rec, index)))}
			</Accordion>
		);
	}

	renderCallToActionButtons(showButtons = true, submitHandler, cancelHandler) {
		const isSelectedSizes = !!this.state.selectedSizes.length;

		return showButtons ? (
			<Row className="mT-5 u-margin-b15px">
				<Col xs={6}>
					<Button
						disabled={!isSelectedSizes}
						className="btn-lightBg btn-save btn-block"
						onClick={submitHandler}
					>
						Save
					</Button>
				</Col>
				<Col xs={6}>
					<Button className="btn-lightBg btn-cancel btn-block" onClick={cancelHandler}>
						Cancel
					</Button>
				</Col>
			</Row>
		) : (
			''
		);
	}

	getStringifiedAdSize(object) {
		const stringifiedSize = `${object.width} X ${object.height}`;

		return stringifiedSize;
	}

	renderPrimaryAdSizeBlock() {
		const adSize =
			this.props.primaryAdSize &&
			Object.keys(this.props.primaryAdSize).length &&
			this.getStringifiedAdSize(this.props.primaryAdSize);

		return adSize ? (
			<Row className="mT-5 u-margin-b15px">
				<Col xs={6}>
					<strong>Primary Ad Size</strong>
				</Col>
				<Col xs={6} className="text-right">
					<span>{adSize}</span>
				</Col>
			</Row>
		) : null;
	}

	renderSelectedSizesCountBlock() {
		const adSizeCount = this.state.selectedSizes.length;

		return (
			<Row className="mT-5 u-margin-b15px">
				<Col xs={9}>
					<strong>Selected sizes count</strong>
				</Col>
				<Col xs={3} className="text-right">
					<span>{adSizeCount}</span>
				</Col>
			</Row>
		);
	}

	renderSelectSizesText() {
		return (
			<Row className="mT-5 mB-5">
				<Col xs={12}>
					<strong>Select sizes</strong>
				</Col>
			</Row>
		);
	}

	renderSelectedSizesInWell() {
		const collection = this.state.selectedSizes;

		return (
			<Well>
				{map(collection, (object, index) => {
					const adSizeString = this.getStringifiedAdSize(object).replace(/ /g, ''),
						marginStyle = {
							margin: '.5em .1em',
							display: 'inline-block'
						};

					return (
						<Label style={marginStyle} key={index}>
							{adSizeString}
						</Label>
					);
				})}
			</Well>
		);
	}

	render() {
		const props = this.props;

		return (
			<div>
				{this.renderPrimaryAdSizeBlock()}
				{this.renderSelectedSizesInWell()}
				{this.renderSelectedSizesCountBlock()}
				{this.renderSelectSizesText()}
				{this.renderAdSizeAccordion()}
				{this.renderCallToActionButtons(true, this.handleSaveButtonClick, props.onCancel)}
			</div>
		);
	}
}

MultipleAdSizeSelector.propTypes = {
	onSave: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	primaryAdSize: PropTypes.object,
	sizes: PropTypes.array
};

MultipleAdSizeSelector.defaultProps = {};

export default MultipleAdSizeSelector;
