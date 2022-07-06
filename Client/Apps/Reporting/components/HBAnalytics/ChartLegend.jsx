import React, { Component } from 'react';

export class ChartLegend extends Component {
	handleLegendClick = event => {
		const { toggleSite } = this.props;
		const { target } = event;
		toggleSite(target.getAttribute('name'));
	};

	createChartLegend = () => {
		const { data, excludedSites, colors } = this.props;
		return data.map(site => {
			const legendClass = excludedSites.includes(site.name) ? 'legend-disabled' : 'legend-name';
			const legendColor = excludedSites.includes(site.name) ? 'grey' : colors[site._colorIndex];
			return (
				<div className="legend" key={site.name}>
					<div className="legend-icon" style={{ backgroundColor: legendColor }} />
					<span className={legendClass} onClick={this.handleLegendClick} name={site.name}>
						{site.name}
					</span>
				</div>
			);
		});
	};

	render() {
		return <div id="bidder-landscape-chart-legend">{this.createChartLegend()}</div>;
	}
}

export default ChartLegend;
