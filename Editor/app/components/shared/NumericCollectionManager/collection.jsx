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
		this.state = {
			model: props.savedCollection || {}
		};
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
		const modelKeys = Object.keys(this.refs),
			computedModel = {},
			self = this;

		modelKeys.forEach((key) => {
			const $el = $(ReactDOM.findDOMNode(self.refs[key])).find("input[type='number']");

			computedModel[key] = $el.val();
		});

		return computedModel;
	}

	getPanelRows(rowsArr) {
		const rows = [],
			rowLength = rowsArr.length;

		let rowInputValue,
			rowInputLabelText,
			i,
			rowItem,
			rowItemKey;

		for (i = 0; i < rowLength; i++) {
			rowItem = rowsArr[i];
			rowItemKey = rowItem.id;
			rowInputValue = parseInt(rowItem.value, 10);
			rowInputLabelText = rowItem.name;

			rows.push((
				<CustomInputNumber key={rowItemKey} ref={rowItemKey} labelText={rowInputLabelText} layout="horizontal" min={0} max={100} step={1} value={rowInputValue} />
			));
		}

		return rows;
	}

	updateModel() {
		this.setState({
			model: this.getModel()
		}, () => {
			this.props.onSave($.extend(true, {}, this.state.model));
		});
	}

	renderCollectionPanels() {
		const collectionPanels = [],
			eventKey = (1).toString(),
			panelKey = `${eventKey}_${Utils.getRandomNumber()}`,
			panelHeaderText = this.props.headerText;

		collectionPanels.push((
			<Panel key={panelKey} header={panelHeaderText} eventKey={eventKey}>
				{this.getPanelRows(this.props.collection)}
			</Panel>
		));

		return collectionPanels;
	}

	renderHorizontalLayout() {
		return (
			<Accordion defaultActiveKey="1">
				{this.renderCollectionPanels()}
			</Accordion>
		);
	}

	renderBackButton() {
		if (this.props.onBack) {
			return (
				<Row className="butttonsRow">
					<Col xs={12}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onBack} >Back</Button>
					</Col>
				</Row>
			);
		}
		return null;
	}

	render() {
		const options = {
			layoutClassName: 'form-group form-group--horizontal'
		};

		return (
			<div>
				<Row key={this.props.name} className={options.layoutClassName}>
					{this.renderHorizontalLayout()}
				</Row>
				<Row>
					<Col xs={12} className="u-padding-0px">
						<Button className="btn-lightBg btn-save btn-block" onClick={a => this.onSave(a)}>Save</Button>
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
	name: PropTypes.string,
	collection: PropTypes.array,
	onChange: PropTypes.func
};

export default collection;
