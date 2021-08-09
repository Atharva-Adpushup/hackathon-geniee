import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';

class CoreWebVitals extends React.Component {
	componentDidMount() {
		const { displayData: { fieldData, labData } = {} } = this.props;

		if (fieldData && labData) {
			const elem = document.querySelectorAll('.value');

			for (let i = 0, len = elem.length; i < len; i += 1) {
				const text = elem[i].innerHTML;
				elem[i].parentNode.style.width = text;
			}
		}
	}

	getLabDataCategory = (metric, value) => {
		let category = '';

		switch (metric) {
			case 'FCP':
				if (value > 0 && value <= 1.8) {
					category = 'FAST';
				} else if (value > 1.8 && value <= 3) {
					category = 'AVERAGE';
				} else {
					category = 'SLOW';
				}

				break;

			case 'SI':
				if (value > 0 && value <= 3.4) {
					category = 'FAST';
				} else if (value > 3.4 && value <= 5.8) {
					category = 'AVERAGE';
				} else {
					category = 'SLOW';
				}

				break;

			case 'LCP':
				if (value > 0 && value <= 2.5) {
					category = 'FAST';
				} else if (value > 2.5 && value <= 4) {
					category = 'AVERAGE';
				} else {
					category = 'SLOW';
				}

				break;

			case 'TTI':
				if (value > 0 && value <= 3.8) {
					category = 'FAST';
				} else if (value > 3.8 && value <= 7.3) {
					category = 'AVERAGE';
				} else {
					category = 'SLOW';
				}

				break;

			case 'TBT':
				if (value > 0 && value <= 200) {
					category = 'FAST';
				} else if (value < 200 && value <= 600) {
					category = 'AVERAGE';
				} else {
					category = 'SLOW';
				}

				break;

			case 'CLS':
				if (value > 0 && value <= 0.1) {
					category = 'FAST';
				} else if (value > 0.1 && value <= 0.25) {
					category = 'AVERAGE';
				} else {
					category = 'SLOW';
				}

				break;

			default:
				break;
		}

		return category;
	};

	renderData() {
		const { displayData: { fieldData, labData } = {} } = this.props;

		return fieldData && labData ? (
			<div className="coreWebVitals">
				<Row className="u-margin-v4 u-margin-h4 ">
					<div className="x-axis">
						<ul className="legend">
							<li>0-49</li>
							<li>50-89</li>
							<li>90-100</li>
						</ul>
					</div>

					<h4 className="u-margin-b4">Field Data</h4>
					<Col md={6}>
						<div className="row">
							<li className="field-data-heading">
								First Contentful Paint (FCP)
								{/* <span className="field-data-heading">First Contentful Paint (FCP)</span> */}
								<span className={`field-data-value ${fieldData.FCP.category}`}>
									{fieldData.FCP.percentile} s
								</span>
							</li>

							<div className="chart">
								<span className="block" title="Category A">
									<span className="value">{fieldData.FCP.distributions[0]}%</span>
								</span>
								<span className="block" title="Category B">
									<span className="value">{fieldData.FCP.distributions[1]}%</span>
								</span>
								<span className="block" title="Category C">
									<span className="value">{fieldData.FCP.distributions[2]}%</span>
								</span>
							</div>
						</div>

						<div className="row">
							<li className="field-data-heading">
								Largest Contentful Paint (LCP)
								<span className={`field-data-value ${fieldData.LCP.category}`}>
									{fieldData.LCP.percentile} s
								</span>
							</li>

							<div className="chart">
								<span className="block" title="Category A">
									<span className="value">{fieldData.LCP.distributions[0]}%</span>
								</span>
								<span className="block" title="Category B">
									<span className="value">{fieldData.LCP.distributions[1]}%</span>
								</span>
								<span className="block" title="Category C">
									<span className="value">{fieldData.LCP.distributions[2]}%</span>
								</span>
							</div>
						</div>
					</Col>
					<Col md={6}>
						<div className="row">
							<li className="field-data-heading">
								First Input Delay (FID)
								<span className={`field-data-value ${fieldData.FID.category}`}>
									{fieldData.FID.percentile} s
								</span>
							</li>
							<div className="chart">
								<span className="block" title="Category A">
									<span className="value">{fieldData.FID.distributions[0]}%</span>
								</span>
								<span className="block" title="Category B">
									<span className="value">{fieldData.FID.distributions[1]}%</span>
								</span>
								<span className="block" title="Category C">
									<span className="value">{fieldData.FID.distributions[2]}%</span>
								</span>
							</div>
						</div>
						<div className="row">
							<li className="field-data-heading">
								Cumulative Layout Shift (CLS)
								<span className={`field-data-value ${fieldData.CLS.category}`}>
									{fieldData.CLS.percentile}
								</span>
							</li>

							<div className="chart">
								<span className="block" title="Category A">
									<span className="value">{fieldData.CLS.distributions[0]}%</span>
								</span>
								<span className="block" title="Category B">
									<span className="value">{fieldData.CLS.distributions[1]}%</span>
								</span>
								<span className="block" title="Category C">
									<span className="value">{fieldData.CLS.distributions[2]}%</span>
								</span>
							</div>
						</div>
					</Col>
				</Row>

				<Row className="u-margin-v4 u-margin-h4">
					<h4>Lab Data</h4>
					<Col md={6}>
						<hr />
						<li className="lab-data-heading">
							First Contentful Paint
							<span
								className={`lab-data-value ${this.getLabDataCategory(
									'FCP',
									parseFloat(labData.FCP.split(' ')[0])
								)}`}
							>
								{labData.FCP}
							</span>
						</li>
						<hr />
						<li className="lab-data-heading">
							Speed Index
							<span
								className={`lab-data-value ${this.getLabDataCategory(
									'SI',
									parseFloat(labData.SI.split(' ')[0])
								)}`}
							>
								{labData.SI}
							</span>
						</li>
						<hr />
						<li className="lab-data-heading">
							Largest Contentful Paint
							<span
								className={`lab-data-value ${this.getLabDataCategory(
									'LCP',
									parseFloat(labData.LCP.split(' ')[0])
								)}`}
							>
								{labData.LCP}
							</span>
						</li>
						<hr />
					</Col>

					<Col md={6}>
						<hr />
						<li className="lab-data-heading">
							Time to Interactive
							<span
								className={`lab-data-value ${this.getLabDataCategory(
									'TTI',
									parseFloat(labData.TTI.split(' ')[0])
								)}`}
							>
								{labData.TTI}
							</span>
						</li>
						<hr />
						<li className="lab-data-heading">
							Total Blocking Time
							<span
								className={`lab-data-value ${this.getLabDataCategory(
									'TBT',
									parseFloat(labData.TBT.split(' ')[0])
								)}`}
							>
								{labData.TBT}
							</span>
						</li>
						<hr />
						<li className="lab-data-heading">
							Cumulative Layout Shift
							<span
								className={`lab-data-value ${this.getLabDataCategory(
									'CLS',
									parseFloat(labData.CLS.split(' ')[0])
								)}`}
							>
								{labData.CLS}
							</span>
						</li>
						<hr />
					</Col>
				</Row>
			</div>
		) : (
			<div className="text-center">No Record Found.</div>
		);
	}

	render() {
		return this.renderData();
	}
}

export default CoreWebVitals;
