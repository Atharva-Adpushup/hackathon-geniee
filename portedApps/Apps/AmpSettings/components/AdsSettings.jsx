import React from 'react';
import RowColSpan from './helper/RowColSpan.jsx';
import commonConsts from '../lib/commonConsts';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import '../style.scss';
class AdsSettings extends React.Component {
	constructor(props) {
		super(props);
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
		if (ad.type && ad.type != 'custom') {
			let adNetwork = ad.type, adCode = commonConsts.ads.sampleAds[adNetwork];

			adCode = adCode.replace('dWidth', ad.width);
			adCode = adCode.replace('dHeight', ad.height);
			for (let field in ad.data) {
				adCode = adCode.replace(field, ad.data[field]);
			}
			return adCode;
		} else return ad.adCode;
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
		this.setState({ ads });
	};

	render = () => {
		return (
			<CollapsePanel title="Ads Settings" className="mediumFontSize" noBorder={true}>
				{this.state.ads.map((ad, index) => {
					return (
						<div key={index} className="adContainerStyle">
							<div
								className="fa fa-times-circle fa-2x deleteAdBtnStyle"
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
										let ads = this.state.ads, adCode;
										ads[index].width = e.target.value;
										adCode = this.generateAdCode(ads[index]);
										this.setAds(index, { width: e.target.value, adCode });
									}}
									type="number"
									placeholder="Width"
									name="width"
									className="form-control"
									value={ad.width}
								/>
							</RowColSpan>
							<RowColSpan label="Height">
								<input
									onChange={e => {
										let ads = this.state.ads, adCode;
										ads[index].height = e.target.value;
										adCode = this.generateAdCode(ads[index]);
										this.setAds(index, { height: e.target.value, adCode });
									}}
									type="number"
									placeholder="Height"
									name="height"
									className="form-control"
									value={ad.height}
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
											ads = this.state.ads,
											type = e.target.value,
											adFields = commonConsts.ads.type;

										partialAd.type = type;
										ads[index].type = type;
										if (ad.type === 'custom') {
											partialAd.adCode = '';
										} else {
											partialAd.adCode = this.generateAdCode(ads[index]);
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
									<option value="custom">custom</option>
								</select>
							</RowColSpan>
							{this.renderNetworkInputs(index)}
							{ad.type &&
								<RowColSpan label="AdCode">
									<textarea
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
				})}
				<RowColSpan label="">
					<button className="btn-primary addButton" type="button" onClick={this.insertNewAd}>+Add</button>
				</RowColSpan>
			</CollapsePanel>
		);
	};
}

export default AdsSettings;
