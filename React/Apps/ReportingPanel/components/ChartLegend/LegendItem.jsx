import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import commonConsts from '../../lib/commonConsts';
import { indexOf } from 'lodash';

class LegendItem extends Component {
	constructor(props) {
		super(props);

		this.state = {
			serie: props.serie
		};

		this.toggleSerie = this.toggleSerie.bind(this);
	}

	toggleSerie() {
		const serie = this.state.serie;

		let activeLegendItems = this.props.activeLegendItems;
		if (serie.visible) {
			const index = indexOf(activeLegendItems, serie.name);
			activeLegendItems.splice(index, 1);
			serie.hide();
		} else {
			activeLegendItems.push(serie.name);
			serie.show();
		}

		window.activeLegendItemsCallback(activeLegendItems);
		this.setState(...serie, { visible: serie.visible });
	}

	componentWillReceiveProps(nextProps) {
		const { serie } = nextProps;

		this.setState({ serie });
	}

	render() {
		const { serie } = this.state,
			{ toggleSerie } = this.props,
			fontColor = '#555';

		let style = {};
		if (serie.visible) {
			style = {
				borderBottom: `2px solid ${serie.color}`,
				color: fontColor
			};
		}

		const legendToggle = (
				<div className="legend-item" onClick={this.toggleSerie} style={style}>
					{serie.name}
				</div>
			),
			legendItem = commonConsts.IS_SUPERUSER ? (
				<div className="legend-col">{legendToggle}</div>
			) : (
				<Col xs={3}>{legendToggle}</Col>
			);

		return legendItem;
	}
}

LegendItem.propTypes = {
	serie: PropTypes.object.isRequired,
	activeLegendItems: PropTypes.array.isRequired
};

export default LegendItem;
