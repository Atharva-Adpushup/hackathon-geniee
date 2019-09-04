import React, { PropTypes } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ReactDOM from 'react-dom';
import Utils from 'libs/utils';
import $ from 'jquery';
import Panel from 'react-bootstrap/lib/Panel';
import Accordion from 'react-bootstrap/lib/Accordion';
import CustomInputNumber from 'components/shared/customInputNumber.jsx';

class collection extends React.Component {
	constructor(props) {
		super(props);
		const { collection, maxValue } = this.props;
		const sum = collection.reduce((acc, ele) => acc + ele.value, 0);
		const isValid = sum === maxValue;

		this.state = {
			model: props.savedCollection || {},
			hasSumExtended: !isValid
		};
		this.handleInputChange = this.handleInputChange.bind(this);
		this.renderSum = this.renderSum.bind(this);
	}

	// Explicitly added to avoid re-rendering
	// which resets input number values
	// TODO: Remove this explicit declaration and make component incorporate
	// generated model so that updated input values are set on next re-render
	shouldComponentUpdate() {
		return false;
	}

	onSave() {
		this.updateModel();
	}

	getModel() {
		const modelKeys = Object.keys(this.refs);
		const computedModel = {};
		const self = this;

		modelKeys.forEach(key => {
			const $el = $(ReactDOM.findDOMNode(self.refs[key])).find("input[type='number']");

			computedModel[key] = $el.val();
		});

		return computedModel;
	}

	getPanelRows(rowsArr) {
		const rows = [],
			rowLength = rowsArr.length;

		let rowInputValue, rowInputLabelText, i, rowItem, rowItemKey;

		for (i = 0; i < rowLength; i++) {
			rowItem = rowsArr[i];
			rowItemKey = rowItem.id;
			rowInputValue = parseInt(rowItem.value, 10);
			rowInputLabelText = rowItem.name;

			rows.push(
				<CustomInputNumber
					key={rowItemKey}
					ref={rowItemKey}
					labelText={rowInputLabelText}
					layout="horizontal"
					min={0}
					max={100}
					onChange={this.handleInputChange}
					step={1}
					value={rowInputValue}
				/>
			);
		}

		return rows;
	}

	getCollectionSum(model) {
		const validModel = [];

		Object.keys(model).forEach(key => {
			const value = model[key];

			if (value && Number(value) > -1) {
				validModel.push(Number(value));
			}
		});

		return validModel.reduce((a, b) => a + b, 0);
	}

	toggleSumExtensionErrorMessage(isSumNotEqual) {
		const $errorMessage = $(ReactDOM.findDOMNode(this.refs['td-error-message']));
		const $saveBtn = $(ReactDOM.findDOMNode(this.refs['td-save-btn']));

		if (isSumNotEqual) {
			$saveBtn.attr({ disabled: true }).addClass('disabled');
			$errorMessage.removeClass('hide');
		} else {
			$saveBtn.attr({ disabled: false }).removeClass('disabled');
			$errorMessage.addClass('hide');
		}
	}

	handleInputChange() {
		const collectionSum = this.getCollectionSum(this.getModel());
		const hasSumExtended = collectionSum > this.props.maxValue;
		const hasSumDecremented = collectionSum < this.props.maxValue;
		const isSumNotEqual = hasSumExtended || hasSumDecremented;

		if (this.props && this.props.maxValue && this.props.required) {
			this.toggleSumExtensionErrorMessage(isSumNotEqual);
		}
		this.updateSum(collectionSum);
	}

	updateModel() {
		this.setState(
			{
				model: this.getModel()
			},
			() => {
				this.props.onSave($.extend(true, {}, this.state.model));
			}
		);
	}

	updateSum(sum) {
		const { maxValue } = this.props;
		const $collectionSum = $(ReactDOM.findDOMNode(this.refs['collection-sum']));
		const $remainingSum = $(ReactDOM.findDOMNode(this.refs['remaining-sum']));

		let remaining = maxValue - sum;
		remaining = remaining < 0 ? 'N/A' : remaining;

		$collectionSum.text(sum);
		$remainingSum.text(remaining);
	}

	renderSum() {
		const { maxValue, collection } = this.props;
		let model = this.getModel();

		if (!model || !Object.keys(model).length) {
			model = {};
			collection.forEach((ele, index) => (model[index] = ele.value));
		}

		const sum = this.getCollectionSum(model);
		let remaining = maxValue - sum;
		remaining = remaining < 0 ? 'N/A' : remaining;

		return (
			<strong>
				<p key="numeric-collection-desc" className="form-group-desc">
					Allocated Traffic: <span ref="collection-sum">{sum}</span>
				</p>
				<p>
					Remaining Traffic: <span ref="remaining-sum">{remaining}</span>
				</p>
			</strong>
		);
	}

	renderCollectionPanels() {
		const collectionPanels = [];
		const eventKey = (1).toString();
		const panelKey = `${eventKey}_${Utils.getRandomNumber()}`;

		collectionPanels.push(
			<Panel key={panelKey} eventKey={eventKey}>
				{this.getPanelRows(this.props.collection)}
			</Panel>
		);

		return collectionPanels;
	}

	renderHorizontalLayout() {
		return (
			<Accordion defaultActiveKey="1" className="u-margin-b15px">
				{this.renderCollectionPanels()}
			</Accordion>
		);
	}

	renderDescription() {
		const isDescription = !!this.props.description;

		if (isDescription) {
			return (
				<p key="numeric-collection-desc" className="form-group-desc">
					{this.props.description}
				</p>
			);
		}

		return null;
	}

	renderSumExtendedErrorMessage() {
		const props = this.props;
		const maxValue = props.maxValue ? props.maxValue : 100;
		const defaultMessage = `Sum must equal ${maxValue}`;
		const sumMismatchErrorMessage = props.sumMismatchErrorMessage ? props.sumMismatchErrorMessage : defaultMessage;

		return (
			<div ref="td-error-message" className="error-message hide">
				{sumMismatchErrorMessage}
			</div>
		);
	}

	renderBackButton() {
		if (this.props.onBack) {
			return (
				<Row className="butttonsRow">
					<Col xs={12}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onBack}>
							Back
						</Button>
					</Col>
				</Row>
			);
		}
		return null;
	}

	render() {
		const props = this.props;
		const options = {
			layoutClassName: 'form-group form-group--horizontal form-group--numeric-range'
		};

		if (props.uiMinimal) {
			options.layoutClassName = `${options.layoutClassName} is-ui-minimal`;
		}

		return (
			<div className="form-group-wrapper form-group-wrapper--numeric-range">
				{this.renderDescription()}
				<Row key={props.name} className={options.layoutClassName}>
					{this.renderHorizontalLayout()}
					{this.renderSum()}
					{this.renderSumExtendedErrorMessage()}
				</Row>
				<Row>
					<Col xs={12} className="u-padding-0px">
						<Button
							disabled={this.state.hasSumExtended}
							ref="td-save-btn"
							className="btn-lightBg btn-save btn-block"
							onClick={a => this.onSave(a)}
						>
							Save
						</Button>
					</Col>
				</Row>
				{this.renderBackButton()}
			</div>
		);
	}
}

collection.defaultProps = {
	name: 'numericCollection',
	collection: []
};

collection.propTypes = {
	name: PropTypes.string.isRequired,
	maxValue: PropTypes.number.isRequired,
	collection: PropTypes.array.isRequired,
	onSave: PropTypes.func.isRequired,
	description: PropTypes.string,
	sumMismatchErrorMessage: PropTypes.any,
	required: PropTypes.bool,
	uiMinimal: PropTypes.bool
};

export default collection;
