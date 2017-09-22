import React, { PropTypes } from 'react';
import NumericCollection from 'components/shared/NumericCollectionManager/collection.jsx';

class NumericCollectionManager extends React.Component {
	onSave(model) {
		this.props.onSave(model);
	}

	renderNumericCollection() {
		const props = this.props;

		return (
			<NumericCollection
				name="numericCollection"
				description={props.description}
				sumMismatchErrorMessage={props.sumMismatchErrorMessage}
				required={props.required}
				maxValue={props.maxValue}
				collection={props.collection}
				uiMinimal={props.uiMinimal}
				onSave={a => this.onSave(a)}
			/>
		);
	}

	render() {
		return <div className="containerButtonBar sm-pad">{this.renderNumericCollection()}</div>;
	}
}

NumericCollectionManager.defaultProps = {
	collection: []
};

NumericCollectionManager.propTypes = {
	description: PropTypes.string,
	sumMismatchErrorMessage: PropTypes.any,
	required: PropTypes.bool,
	uiMinimal: PropTypes.bool,
	maxValue: PropTypes.number.isRequired,
	collection: PropTypes.array.isRequired,
	onSave: PropTypes.func.isRequired
};

export default NumericCollectionManager;
