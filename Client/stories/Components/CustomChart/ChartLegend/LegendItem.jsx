import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap';
import { indexOf } from 'lodash';

class LegendItem extends Component {
	constructor(props) {
		super(props);
		this.state = { visible: props.serie.visible };
		this.toggleSerie = this.toggleSerie.bind(this);
	}

	toggleSerie() {
		const { activeLegendItems, serie } = this.props;

		if (serie.visible) {
			const index = indexOf(activeLegendItems, serie.name);
			activeLegendItems.splice(index, 1);
			serie.hide();
		} else {
			activeLegendItems.push(serie.name);
			serie.show();
		}

		this.setState({ visible: serie.visible });
	}

	render() {
		const { visible } = this.state;
		const { serie } = this.props;
		let style = {};

		if (visible) {
			style = {
				borderBottom: `2px solid ${serie.color}`
			};
		}

		return (
			<Col xs={4}>
				<div
					className={`legend-item${visible ? ' active-legend-item' : ''}`}
					onClick={this.toggleSerie}
					style={style}
				>
					{serie.name}
				</div>
			</Col>
		);
	}
}

LegendItem.propTypes = {
	serie: PropTypes.object.isRequired,
	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default LegendItem;
