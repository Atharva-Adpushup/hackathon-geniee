import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { indexOf } from 'lodash';

class LegendItem extends Component {
	constructor(props) {
		super(props);
		this.state = { visible: false };
		this.toggleSerie = this.toggleSerie.bind(this);
	}
	componentDidMount() {
		const { activeLegendItems, legend } = this.props;
		let activeLegendItem;
		if (Array.isArray(activeLegendItems)) {
			activeLegendItem = activeLegendItems.find(item => item.value === legend.value);
		} else {
			activeLegendItem = legend.value === activeLegendItems.value;
		}
		this.setState({ visible: !!activeLegendItem });
	}
	componentDidUpdate(prevProps) {
		if (prevProps.activeLegendItems !== this.props.activeLegendItems) {
			const { activeLegendItems, legend } = this.props;
			let activeLegendItem;
			if (Array.isArray(activeLegendItems)) {
				activeLegendItem = activeLegendItems.find(item => item.value === legend.value);
			} else {
				activeLegendItem = legend.value === activeLegendItems.value;
			}
			this.setState({ visible: !!activeLegendItem });
		}
	}

	toggleSerie() {
		let { activeLegendItems, legend, series } = this.props;
		const { visible } = this.state;
		this.setState({ visible: !visible });
		if (Array.isArray(activeLegendItems)) {
			const serie = series.find(s =>
				s.userOptions ? s.userOptions.value === legend.value : false
			);
			if (visible) {
				const index = indexOf(activeLegendItems, legend.value);

				activeLegendItems.splice(index, 1);
				serie.hide();
			} else {
				activeLegendItems.push({ name: legend.name, value: legend.value });
				serie.show();
			}
		} else {
			activeLegendItems = { name: legend.name, value: legend.value };
			this.props.updateChartData(activeLegendItems);
		}
	}

	render() {
		const { visible } = this.state;
		const { legend } = this.props;
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
				<div className="total">
					{legend.type === 'money' ? '$' : ''}
					{legend.total >= 0 ? Math.round(legend.total * 100) / 100 : 'N/A'}
				</div>
			</div>
		);
	}
}

// LegendItem.propTypes = {
// 	serie: PropTypes.object.isRequired,
// 	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
// };

export default LegendItem;
