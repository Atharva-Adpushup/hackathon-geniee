import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import NumericCollection from 'components/shared/NumericCollectionManager/collection.jsx';

class NumericCollectionManager extends React.Component {
	onSave(model) {
		this.props.onSave(model);
	}

	renderNumericCollection() {
		const props = this.props;

		return (
			<NumericCollection name="numericCollection" description={props.description}
				sumMismatchErrorMessage={props.sumMismatchErrorMessage} required={props.required}
				maxValue={props.maxValue} collection={props.collection} uiMinimal={props.uiMinimal}
				onSave={a => this.onSave(a)} />
		);
	}

	render() {
		return (
			<div className="containerButtonBar sm-pad">
				{this.renderNumericCollection()}
			</div>
		);
	}
}

NumericCollectionManager.defaultProps = {
	collection: []
};

export default NumericCollectionManager;
