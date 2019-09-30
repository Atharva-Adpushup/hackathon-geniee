import React from 'react';
import { roundOffTwoDecimal, getWidgetValidDationState } from '../helpers/utils';

const DEFAULT_STATE = {
	series: []
};

class ModeReport extends React.Component {
	state = DEFAULT_STATE;

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		// const seriesData = computeDisplayData(props);
		const seriesData = [];
		return { series: seriesData };
	}

	render() {
		const { displayData } = this.state;

		return <p>Mode Report Data</p>;
	}
}

export default ModeReport;
