import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import commonConsts from '../lib/commonConsts';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';

class AdsSettings extends React.Component {
	constructor(props) {
		super(props);
		console.log(props);
		this.state = {
			ads: props.ads
		};
	}

	renderNetworkInputs = index => {
		let selectedAd = this.state.ads[index],
			selectedNetwork = selectedAd.type,
			adsTypeFieldConf = commonConsts.ads.type[selectedNetwork];
		return selectedNetwork && adsTypeFieldConf
			? Object.keys(adsTypeFieldConf).map((field, fieldIndex) => (
					<RowColSpan label={field} key={fieldIndex}>
						<input
							type="text"
							placeholder={field}
							name={field}
							className="form-control"
							value={selectedAd.data[field] || ''}
							onChange={e => {
								let data = { ...selectedAd.data, [field]: e.target.value };
								//data[field] = e.target.value;
								let adCode = this.generateAdCode({ ...selectedAd, data });
								this.setAds(index, {
									data,
									adCode
								});
								//this.setState({ ads });
							}}
						/>
					</RowColSpan>
				))
			: null;
	};
	generateAdCode = ad => {
		let adNetwork = ad.type, adCode = commonConsts.ads.sampleAds[adNetwork];

		adCode = adCode.replace('dWidth', ad.width);
		adCode = adCode.replace('dHeight', ad.height);
		for (let field in ad.data) {
			adCode = adCode.replace(field, ad.data[field]);
		}
		return adCode;
	};
	deleteAd = adIndex => {
		let ads = this.state.ads;
		ads.splice(adIndex, 1);
		this.setState({ ads });
	};

	insertNewAd = adIndex => {
		let ads = this.state.ads;
		ads.push({ width: 100, height: 100, operation: 'INSERTBEFORE' });
		this.setState({ ads });
	};

	setAds = (index, partialAd) => {
		let ads = this.state.ads;
		ads[index] = Object.assign(ads[index], partialAd);
		let adCode = this.generateAdCode(ads[index]);
		ads[index].adCode = adCode;
		if (ads[index] && ads[index].type != 'custom') {
			let adCode = this.generateAdCode(ads[index]);
			ads[index].adCode = adCode;
		}
		this.setState({ ads });
	};

	render = () => {
		const deleteAdBtnStyle = {
			position: 'absolute',
			right: '-8px',
			top: '-8px',
			cursor: 'pointer'
		},
			adContainerStyle = {
				background: '#f9f9f9',
				padding: '20px 10px 10px',
				margin: 10,
				borderRadius: 4,
				border: '1px solid #e9e9e9',
				position: 'relative'
			};
		return (
			<div>
				<Row>
					<Col sm={10}>
						<h4 style={{ marginBottom: '10px' }}>Ad Settings</h4>
					</Col>
					<Col sm={2}>
						<button className="fa fa-plus" type="button" onClick={this.insertNewAd} />
					</Col>
				</Row>
				{this.state.ads.length > 0
					? this.state.ads.map((ad, index) => {
							return (
								<div key={index} style={adContainerStyle}>
									<div
										style={deleteAdBtnStyle}
										className="fa fa-times-circle fa-2x"
										onClick={() => this.deleteAd(index)}
										title="Delete This Ad"
									/>
									<RowColSpan label="Selector">
										<input
											onChange={e => {
												this.setAds(index, { selector: e.target.value });
											}}
											type="text"
											placeholder="Selector"
											name="selector"
											className="form-control"
											value={ad.selector || ''}
										/>
									</RowColSpan>
									<RowColSpan label="Width">
										<input
											onChange={e => {
												this.setAds(index, { width: e.target.value });
											}}
											type="number"
											placeholder="Width"
											name="width"
											className="form-control"
											value={ad.width || 100}
										/>
									</RowColSpan>
									<RowColSpan label="Height">
										<input
											onChange={e => {
												this.setAds(index, { height: e.target.value });
											}}
											type="number"
											placeholder="Height"
											name="height"
											className="form-control"
											value={ad.height || 100}
										/>
									</RowColSpan>
									<RowColSpan label="Operation">
										<select
											className="form-control"
											name="operation"
											value={ad.operation || 'INSERTAFTER'}
											onChange={e => {
												this.setAds(index, { operation: e.target.value });
											}}
										>
											<option value="">Select Operation</option>
											{commonConsts.ads.operations.map((operation, index) => (
												<option value={operation} key={index}>
													{operation}
												</option>
											))}
										</select>
									</RowColSpan>
									<RowColSpan label="Type">
										<select
											className="form-control"
											name="type"
											value={ad.type || ''}
											onChange={e => {
												let partialAd = {},
													type = e.target.value,
													adFields = commonConsts.ads.type;

												partialAd.type = type;
												if (ad.type === 'custom') {
													partialAd.adCode = '';
												}
												if (adFields[type]) {
													partialAd.data = {};
												}
												this.setAds(index, partialAd);
											}}
										>
											<option value="">Select Type</option>
											{Object.keys(commonConsts.ads.type).map((type, index) => (
												<option value={type} key={index}>
													{type}
												</option>
											))}
											<option value="custom">Custom</option>
										</select>
									</RowColSpan>
									{this.renderNetworkInputs(index)}
									{ad.type &&
										<RowColSpan label="AdCode">
											<textarea
												style={{ resize: 'both', overflow: 'auto' }}
												onChange={e => {
													this.setAds(index, { adCode: e.target.value });
												}}
												placeholder="AdCode"
												name="adCode"
												className="form-control"
												value={ad.adCode}
												disabled={ad.type != 'custom'}
											/>
										</RowColSpan>}
								</div>
							);
						})
					: <div style={{ textAlign: 'center' }}>No Ad Found</div>}
			</div>
		);
	};
}

export default AdsSettings;
