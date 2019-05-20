import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { indexOf } from 'lodash';

class LegendItem extends Component {
	constructor(props) {
		super(props);
		this.state = { visible: props.legend.value === props.activeLegendItems.value };
		this.toggleSerie = this.toggleSerie.bind(this);
	}

	toggleSerie() {
		let { activeLegendItems, legend } = this.props;
		const { visible } = this.state;
		if (!visible) {
			activeLegendItems = { name: legend.name, value: legend.value };
			this.props.updateChartData(activeLegendItems);
			this.setState({ visible: true });
		} else {
			this.setState({ visible: false });
		}

		// if (serie.visible) {
		// 	const index = indexOf(activeLegendItems, serie.name);
		// 	activeLegendItems.splice(index, 1);
		// 	serie.hide();
		// } else {
		// 	activeLegendItems.push(serie.name);
		// 	serie.show();
		// }
	}

	render() {
		const { visible } = this.state;
		const { serie, legend } = this.props;
		let style = {};

		if (visible) {
			style = {
				borderBottom: `2px solid blue`
			};
		}

		return (
			<div
				className={`legend-item${visible ? ' active-legend-item' : ''}`}
				onClick={this.toggleSerie}
				style={style}
			>
				<div className="name">{legend.name}</div>
				<div className="total">{legend.value}</div>
			</div>
		);
	}
}

// LegendItem.propTypes = {
// 	serie: PropTypes.object.isRequired,
// 	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
// };

export default LegendItem;
