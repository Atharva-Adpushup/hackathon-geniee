import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import indexOf from 'lodash/indexOf';

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
		const { serie, legend } = this.props;
		let style = {};

		if (visible) {
			style = {
				borderBottom: `2px solid ${serie.color}`
			};
		}

		return (
			<div
				className={`legend-item${visible ? ' active-legend-item' : ''}`}
				onClick={this.toggleSerie}
				style={style}
			>
				<OverlayTrigger
					trigger={['hover', 'focus']}
					placement="bottom"
					overlay={
						<Popover id="moreInfo" title={serie.name}>
							{legend.description}
						</Popover>
					}
				>
					<span className="legend-info" />
				</OverlayTrigger>

				<div className="name">{serie.name}</div>
				<div className="total">{legend.total}</div>
			</div>
		);
	}
}

LegendItem.propTypes = {
	serie: PropTypes.object.isRequired,
	activeLegendItems: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default LegendItem;
