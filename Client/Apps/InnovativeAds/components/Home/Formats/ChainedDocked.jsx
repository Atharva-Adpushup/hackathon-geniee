/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomMessage from '../../../../../Components/CustomMessage';
import SelectBox from '../../../../../Components/SelectBox/index';
import { AD_OPERATIONS, TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeBox/index';
import CustomInput from '../../shared/index';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch';

/*
	Checking if for the selected page groups there exists
	a docked ad with same xpath-operation configuration
*/
const getPagegroupsWithDuplicateAds = (
	xpath,
	operation,
	selectedPagegroups,
	existingChainedDockedAds
) => {
	let duplicates = [];

	if (!!xpath && !!operation && !!existingChainedDockedAds.length) {
		duplicates = selectedPagegroups.filter(pg =>
			existingChainedDockedAds.some(ad => ad === `${xpath}-${operation}-${pg}`)
		);
	}

	return duplicates;
};

class ChainedDocked extends Component {
	constructor(props) {
		super(props);
		const { ad, currentChainedDockedAds = [] } = this.props;
		const hasFormatData = !!(ad && ad.formatData) ? ad.formatData : false;
		const existingChainedDockedAds = currentChainedDockedAds.reduce((ads, ad) => {
			const { archivedOn, formatData, pagegroups } = ad;
			if (archivedOn) return ads;

			const pagegroupAds = pagegroups.map(
				pg => `${formatData.xpath}-${formatData.operation}-${pg}`
			);
			return ads.concat(pagegroupAds);
		}, []);
		this.state = {
			existingChainedDockedAds,
			pagegroupsWithDuplicateAds: [],
			xpath: hasFormatData ? ad.formatData.xpath : '',
			bottomXpath: hasFormatData ? ad.formatData.bottomXpath : '',
			customXPathToObserve: hasFormatData ? ad.formatData.customXPathToObserve : '',
			bottomOffset: hasFormatData ? ad.formatData.bottomOffset : '',
			css: hasFormatData && ad.formatData.css ? window.btoa(JSON.stringify(ad.formatData.css)) : '',
			operation: hasFormatData ? ad.formatData.operation : null,
			maxInstances: hasFormatData ? ad.formatData.maxInstances : 0,
			spaceBufferInMultiples: hasFormatData ? ad.formatData.spaceBufferInMultiples : 0,
			adjustSpaceAvailableByPixel: hasFormatData ? ad.formatData.adjustSpaceAvailableByPixel : 0,
			adjustSpaceAvailableByPercentage: hasFormatData
				? ad.formatData.adjustSpaceAvailableByPercentage
				: 0,
			ignoreXpathElementHeight: hasFormatData ? ad.formatData.ignoreXpathElementHeight : false
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleCodeChange = this.handleCodeChange.bind(this);
		this.operationChange = this.operationChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if (props.selectedPagegroups !== state.selectedPagegroups) {
			const { xpath, operation, existingChainedDockedAds } = state;
			const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
				xpath,
				operation,
				props.selectedPagegroups,
				existingChainedDockedAds
			);
			return {
				pagegroupsWithDuplicateAds
			};
		}
		return null;
	}

	handleChange(e) {
		const { name, value } = e.target;

		const newState = {
			[name]: value
		};

		if (name === 'xpath') {
			const { selectedPagegroups } = this.props;
			const { operation, existingChainedDockedAds } = this.state;
			const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
				name,
				operation,
				selectedPagegroups,
				existingChainedDockedAds
			);

			newState.pagegroupsWithDuplicateAds = pagegroupsWithDuplicateAds;
		}
		this.setState(newState);
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');

		const name = attributeValue.split('-')[0];

		this.setState({
			[name]: value
		});
	};

	handleCodeChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	operationChange(value) {
		const { selectedPagegroups } = this.props;
		const { xpath, existingChainedDockedAds } = this.state;
		const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
			xpath,
			value,
			selectedPagegroups,
			existingChainedDockedAds
		);

		this.setState({
			operation: value,
			pagegroupsWithDuplicateAds
		});
	}

	saveHandler(e) {
		e.preventDefault();
		const {
			xpath,
			bottomXpath,
			bottomOffset,
			customXPathToObserve,
			operation,
			css,
			maxInstances,
			spaceBufferInMultiples,
			adjustSpaceAvailableByPercentage,
			adjustSpaceAvailableByPixel,
			ignoreXpathElementHeight
		} = this.state;
		const { save } = this.props;
		let parsedCSS = {};
		if (!xpath || !operation) {
			return window.alert('Xpath and Ad Operation are mandatory fields');
		}
		if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return save.handler({
			adData: {},
			formatData: {
				bottomOffset,
				bottomXpath,
				customXPathToObserve,
				css: { ...parsedCSS },
				xpath,
				operation,
				event: EVENTS.SCRIPT_LOADED,
				maxInstances: parseInt(maxInstances),
				spaceBufferInMultiples: parseInt(spaceBufferInMultiples),
				adjustSpaceAvailableByPercentage,
				adjustSpaceAvailableByPixel,
				ignoreXpathElementHeight,
				eventData: {
					value: ''
				}
			},
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		const { save, cancel, fullWidth, siteId } = this.props;
		const {
			xpath,
			bottomOffset,
			bottomXpath,
			customXPathToObserve,
			operation,
			css,
			pagegroupsWithDuplicateAds,
			maxInstances,
			spaceBufferInMultiples,
			adjustSpaceAvailableByPixel,
			adjustSpaceAvailableByPercentage,
			ignoreXpathElementHeight
		} = this.state;
		const hasPagegroupsWithDuplicateAds = !!pagegroupsWithDuplicateAds.length;
		const formattedPagegroupsWithDuplicateAds = pagegroupsWithDuplicateAds
			.map(pg => pg.replace(':', ' - '))
			.join(', ');

		const colSize = fullWidth ? 12 : 6;
		return (
			<div>
				<Row>
					<form action="#" method="POST">
						<CustomInput
							name="xpath"
							value={xpath}
							type="text"
							label="Enter Xpath"
							handler={this.handleChange}
							size={colSize}
							id="xpath-input"
						/>
						<Col md={colSize} className="u-margin-b5">
							<label htmlFor="adOperation">Ad Operation*</label>
							<SelectBox
								selected={operation}
								onSelect={this.operationChange}
								title="Ad Operation"
								id="ad-operation-selectbox"
								options={AD_OPERATIONS.map(op => ({
									name: op,
									value: op
								}))}
							/>
						</Col>
						<CustomInput
							name="bottomXpath"
							value={bottomXpath}
							type="text"
							label="Enter Bottom XPath"
							handler={this.handleChange}
							size={colSize}
							id="bottom-xpath-input"
						/>

						<CustomInput
							name="customXPathToObserve"
							value={customXPathToObserve}
							type="text"
							label="Enter Custom XPath To Observe"
							handler={this.handleChange}
							size={colSize}
							id="custom-xpath-input"
						/>
						{/* </Col> */}
						<CustomInput
							name="bottomOffset"
							value={bottomOffset}
							placeholder="20"
							type="text"
							label="Enter Bottom Offset"
							handler={this.handleChange}
							size={colSize}
							id="bottom-offset-input"
						/>
						<CustomInput
							name="maxInstances"
							value={maxInstances}
							placeholder="20"
							type="number"
							label="Enter Max Instances Value"
							handler={this.handleChange}
							size={colSize}
							id="max-instances-input"
						/>

						<CustomInput
							name="spaceBufferInMultiples"
							value={spaceBufferInMultiples}
							placeholder="20"
							type="number"
							label="Enter Space Buffer In Multiples"
							handler={this.handleChange}
							size={colSize}
							id="space-buffer-input"
						/>

						<CustomInput
							name="adjustSpaceAvailableByPixel"
							value={adjustSpaceAvailableByPixel}
							placeholder="20"
							type="number"
							label="Adjust Space Available (By Pixel)"
							handler={this.handleChange}
							size={colSize}
							id="space-available-pixel-input"
						/>

						<CustomInput
							name="adjustSpaceAvailableByPercentage"
							value={adjustSpaceAvailableByPercentage}
							placeholder="20"
							type="number"
							label="Adjust Space Available (By Percentage)"
							handler={this.handleChange}
							size={colSize}
							id="space-available-percentage-input"
						/>
						<Col md={9}>
							<CustomToggleSwitch
								labelText="Ignore Xpath Element Height"
								className="u-margin-b4 u-margin-t4 negative-toggle xpath-Toggle"
								checked={ignoreXpathElementHeight}
								onChange={this.handleToggle}
								layout="horizontal"
								size="m"
								on="Yes"
								off="No"
								defaultLayout
								name={`ignoreXpathElementHeight-${siteId}`}
								id={`js-ignoreXpathElementHeight-${siteId}`}
							/>
						</Col>

						<Col md={12}>
							<label htmlFor="css">Custom CSS</label>
							<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={css} />
						</Col>
						<Col md={12} className="button-group">
							{!hasPagegroupsWithDuplicateAds && save.renderFn(save.label, this.saveHandler)}
							{cancel ? cancel.renderFn(cancel.label, cancel.handler, 'secondary') : null}
						</Col>
					</form>
				</Row>

				{hasPagegroupsWithDuplicateAds && (
					<div className="u-margin-v5">
						<CustomMessage
							message={`A chained docked ad for xpath <strong>'${xpath}'</strong> and operation <strong>'${operation}'</strong> already exists for <strong>'${formattedPagegroupsWithDuplicateAds}'</strong>. Please archive the existing ad before creating a new one.`}
							className="error"
							header="Similar Chained Docked Ad already exists"
							key={1}
						/>
					</div>
				)}
			</div>
		);
	}
}

ChainedDocked.defaultProps = {
	ad: false
};

export default ChainedDocked;
