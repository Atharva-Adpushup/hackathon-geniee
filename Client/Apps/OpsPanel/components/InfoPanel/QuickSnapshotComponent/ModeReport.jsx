import React from 'react';
import Highcharts from 'highcharts';

import { getWidgetValidDationState } from '../../../../../Pages/Dashboard/helpers/utils';
import { ERROR_REPORT_PROPS } from '../../../configs/commonConsts';

const colors = Highcharts.getOptions().colors;

function computeGraphData(displayData) {
	const {
		data: { result = [] },
		modeData
	} = displayData;
	const seriesData = [];
	const categories = modeData.map(mode => mode.value);
	const totalAdpushupCount = result.map(val => val.adpushup_count).reduce((a, b) => a + b, 0);

	for (let i = 0; i < categories.length; i++) {
		seriesData.push({
			y: parseFloat(
				(
					(result
						.filter(obj => obj.mode === categories[i])
						.map(val => val.adpushup_count)
						.reduce((a, b) => a + b, 0) /
						totalAdpushupCount) *
					100
				).toFixed(2)
			),
			colors: colors[i],
			drilldown: {
				name: categories[i],
				categories: result.filter(obj => obj.mode === categories[i]).map(val => val.error_code),
				data: result
					.filter(obj => obj.mode === categories[i])
					.map(val => parseFloat(((val.adpushup_count / totalAdpushupCount) * 100).toFixed(2)))
			}
		});
	}

	return { categories, seriesData };
}

class ModeReport extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			series: {}
		};
	}

	static getDerivedStateFromProps(props) {
		const { displayData } = props;
		const { isValid, isValidAndEmpty } = getWidgetValidDationState(displayData);

		if (!isValid) {
			return null;
		}

		if (isValidAndEmpty) {
			return DEFAULT_STATE;
		}

		const seriesData = computeGraphData(displayData);
		return { series: seriesData };
	}

	formatChartData() {
		const {
			series: { categories, seriesData }
		} = this.state;

		const modesData = [];

		const errorCodesData = [];

		let drillDataLen;

		let brightness;

		const dataLen = seriesData.length;

		// Build the data arrays
		for (let i = 0; i < dataLen; i += 1) {
			// add modes data
			modesData.push({
				name: categories[i],
				y: seriesData[i].y,
				color: seriesData[i].colors
			});

			// add error codes data
			drillDataLen = seriesData[i].drilldown.data.length;
			for (let j = 0; j < drillDataLen; j += 1) {
				brightness = 0.2 - j / drillDataLen / 5;
				errorCodesData.push({
					name: seriesData[i].drilldown.categories[j],
					y: seriesData[i].drilldown.data[j],
					color: Highcharts.Color(seriesData[i].colors)
						.brighten(brightness)
						.get()
				});
			}
		}
		return {
			modesData,
			errorCodesData
		};
	}

	highChartsRender() {
		const formattedData = this.formatChartData();
		const { modesData, errorCodesData } = formattedData;

		Highcharts.chart({
			...ERROR_REPORT_PROPS,
			series: [
				{
					name: 'Mode',
					data: modesData,
					size: '60%',
					dataLabels: {
						formatter() {
							return this.y > 0 ? this.point.name : null;
						},
						color: '#ffffff',
						distance: -30
					}
				},
				{
					name: 'Error Code',
					data: errorCodesData,
					size: '80%',
					innerSize: '60%',
					dataLabels: {
						formatter() {
							// display only if larger than or equal to 0
							return this.y > 0 ? `<b>${this.point.name}:</b> ${this.y}%` : null;
						}
					},
					id: 'errorCodes'
				}
			],
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer'
				}
			},
			responsive: {
				rules: [
					{
						condition: {
							maxWidth: 400
						},
						chartOptions: {
							series: [
								{},
								{
									id: 'errorCodes',
									dataLabels: {
										enabled: false
									}
								}
							]
						}
					}
				]
			}
		});
	}

	componentDidMount() {
		const { displayData } = this.props;

		const {
			data: { result = [] }
		} = displayData;

		if (result.length) {
			this.highChartsRender();
		}
	}

	render() {
		const { displayData } = this.props;

		const {
			data: { result = [] }
		} = displayData;
		return (
			<React.Fragment>
				{result.length ? (
					<div id="error-code" />
				) : (
					<div className="text-center">No Record Found.</div>
				)}
			</React.Fragment>
		);
	}
}

export default ModeReport;
