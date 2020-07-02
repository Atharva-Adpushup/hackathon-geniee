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

/*
	Checking if for the selected page groups there exists
	a docked ad with same xpath-operation configuration
*/
const getPagegroupsWithDuplicateAds = (xpath, operation, selectedPagegroups, existingDockedAds) => {
	let duplicates = [];

	if (!!xpath && !!operation && !!existingDockedAds.length) {
		duplicates = selectedPagegroups.filter(pg =>
			existingDockedAds.some(ad => ad === `${xpath}-${operation}-${pg}`)
		);
	}

	return duplicates;
};

class Docked extends Component {
	constructor(props) {
		super(props);
		const { ad, currentDockedAds = [] } = this.props;
		const hasFormatData = ad && ad.formatData ? ad.formatData : false;
		const existingDockedAds = currentDockedAds.reduce((ads, ad) => {
			const { archivedOn, formatData, pagegroups } = ad;
			if (archivedOn) return ads;

			const pagegroupAds = pagegroups.map(
				pg => `${formatData.xpath}-${formatData.operation}-${pg}`
			);
			return ads.concat(pagegroupAds);
		}, []);
		this.state = {
			existingDockedAds,
			pagegroupsWithDuplicateAds: [],
			xpath: hasFormatData ? ad.formatData.xpath : '',
			bottomXpath: hasFormatData ? ad.formatData.bottomXpath : '',
			bottomOffset: hasFormatData ? ad.formatData.bottomOffset : '',
			css: hasFormatData && ad.formatData.css ? window.btoa(JSON.stringify(ad.formatData.css)) : '',
			operation: hasFormatData ? ad.formatData.operation : null
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleCodeChange = this.handleCodeChange.bind(this);
		this.operationChange = this.operationChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if (props.selectedPagegroups !== state.selectedPagegroups) {
			const { xpath, operation, existingDockedAds } = state;
			const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
				xpath,
				operation,
				props.selectedPagegroups,
				existingDockedAds
			);
			return {
				pagegroupsWithDuplicateAds
			};
		}
		return null;
	}

	handleChange(e) {
		const { name } = e.target;
		const { value } = e.target;
		const newState = {
			[name]: value
		};

		if (name === 'xpath') {
			const { selectedPagegroups } = this.props;
			const { operation, existingDockedAds } = this.state;
			const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
				name,
				operation,
				selectedPagegroups,
				existingDockedAds
			);

			newState.pagegroupsWithDuplicateAds = pagegroupsWithDuplicateAds;
		}
		this.setState(newState);
	}

	handleCodeChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	operationChange(value) {
		const { selectedPagegroups } = this.props;
		const { xpath, existingDockedAds } = this.state;
		const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
			xpath,
			value,
			selectedPagegroups,
			existingDockedAds
		);

		this.setState({
			operation: value,
			pagegroupsWithDuplicateAds
		});
	}

	saveHandler(e) {
		e.preventDefault();
		const { xpath, bottomXpath, bottomOffset, operation, css } = this.state;
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
				css: { ...parsedCSS },
				xpath,
				operation,
				event: EVENTS.SCRIPT_LOADED,
				eventData: {
					value: ''
				}
			},
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		const { save, cancel, fullWidth } = this.props;
		const {
			xpath,
			bottomOffset,
			bottomXpath,
			operation,
			css,
			pagegroupsWithDuplicateAds
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
							message={`A docked ad for xpath <strong>'${xpath}'</strong> and operation <strong>'${operation}'</strong> already exists for <strong>'${formattedPagegroupsWithDuplicateAds}'</strong>. Please archive the existing ad before creating a new one.`}
							className="error"
							header="Similar Docked Ad already exists"
							key={1}
						/>
					</div>
				)}
			</div>
		);
	}
}

Docked.defaultProps = {
	ad: false
};

export default Docked;
