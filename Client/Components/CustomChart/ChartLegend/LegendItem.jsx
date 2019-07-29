import React, { Component } from 'react';
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

	numberWithCommas = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	roundOffTwoDecimal = value => {
		const roundedNum = Math.round(value * 100) / 100;
		return roundedNum.toFixed(2);
	};

	toggleSerie() {
		const { activeLegendItems, legend, series, yAxis } = this.props;
		let activeLegendItemsCopy;
		if (!legend.isDisabled) {
			const { visible } = this.state;
			this.setState({ visible: !visible });
			if (Array.isArray(activeLegendItems)) {
				activeLegendItemsCopy = [...activeLegendItems];
				if (visible) {
					const index = activeLegendItemsCopy.findIndex(
						activeLegend => activeLegend.value === legend.value
					);
					activeLegendItemsCopy.splice(index, 1);
					// serie.hide();
					// const scale = yAxis.find(y => y.value == serie.value);
					// scale.visible = false;
				} else {
					activeLegendItemsCopy.push(legend);
					// serie.show();
					// const scale = yAxis.find(y => y.value == serie.value);
					// scale.visible = false;
				}
			} else {
				activeLegendItemsCopy = { ...activeLegendItems };
				activeLegendItemsCopy = legend;
			}
			this.props.onLegendChange(activeLegendItemsCopy);
		}
	}

	render() {
		const { visible } = this.state;
		const { legend, series } = this.props;
		const serie = series.find(s => (s.userOptions ? s.userOptions.value === legend.value : false));
		let style = {};

		if (visible) {
			style = {
				borderBottom: `2px solid ${serie ? serie.color : 'blue'}`
			};
		}
		if (legend.isDisabled)
			style = {
				cursor: 'not-allowed'
			};

		return (
			<div
				className={`legend-item${visible ? ' active-legend-item' : ''}`}
				onClick={this.toggleSerie}
				style={style}
			>
				<div className="name">{legend.name}</div>
				<div className="total">
					{legend.total >= 0
						? legend.valueType === 'money'
							? `$${this.numberWithCommas(this.roundOffTwoDecimal(legend.total))}`
							: this.numberWithCommas(legend.total)
						: 'N/A'}
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
