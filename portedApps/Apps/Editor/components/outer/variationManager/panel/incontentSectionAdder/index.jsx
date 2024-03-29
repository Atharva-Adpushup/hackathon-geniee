// In-content section component

import React, { PropTypes } from 'react';
import { reduxForm, change, registerField, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import _ from 'lodash';
import validate from './inContentValidations';
import { createIncontentSection } from 'actions/sectionActions';
import { showNotification } from 'actions/uiActions';
import { getCustomSizes } from 'selectors/siteSelectors';
import { commonSupportedSizes, nonPartnerAdSizes, iabSizes } from 'consts/commonConsts.js';
import { renderInContentAdder } from './renderMethods';

const form = reduxForm({
		form: 'inContentForm',
		validate
	}),
	getNotNearData = collection => {
		const computedArr = [];

		if (!collection || !collection.length) {
			return false;
		}

		collection.forEach(obj => {
			const notNearObj = {};

			notNearObj[obj.selector] = obj.pixels;
			computedArr.push(notNearObj);
		});

		return computedArr;
	},
	getSupportedSizes = (customSizes = []) => {
		const sizes = [];
		commonSupportedSizes.forEach(size => {
			size.sizes.forEach(adSize => {
				sizes.push(`${adSize.width} x ${adSize.height}`);
			});
		});

		if (currentUser.userType !== 'partner') {
			nonPartnerAdSizes.forEach(size => {
				size.sizes.forEach(adSize => {
					sizes.push(`${adSize.width} x ${adSize.height}`);
				});
			});
			customSizes.forEach(adSize => {
				sizes.push(`${adSize.width} x ${adSize.height}`);
			});
		}

		return _.uniq(sizes);
	},
	getMultipleAdSizesOfPrimaryAdSize = (primaryAdSize, isBackCompatibleSizes) => {
		const primaryAdSizeString = primaryAdSize || '',
			multipleAdSizes =
				(primaryAdSizeString &&
					isBackCompatibleSizes &&
					iabSizes.BACKWARD_COMPATIBLE_MAPPING[primaryAdSizeString]) ||
				[];

		return multipleAdSizes;
	};

class inContentForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { networkInfo: false, selectedElement: false };
		this.setNetwork = this.setNetwork.bind(this);
		this.getAdSize = this.getAdSize.bind(this);
	}

	/**
	 * Method to return size of ad which is being created
	 */
	getAdSize() {
		const isCustomAdSize = !!(
			Number(this.props.customAdSizeWidth) && Number(this.props.customAdSizeHeight)
		);
		const adSize = this.props.adSize || getSupportedSizes()[0];
		const computedAdSize = isCustomAdSize
			? `${this.props.customAdSizeWidth} x ${this.props.customAdSizeHeight}`
			: adSize;
		const [width, height] = computedAdSize.split(/\s+x\s+/);
		return { width, height };
	}

	setNetwork(data) {
		this.setState({ networkInfo: data }, () => {
			/**
			 * Added to window because wasn't able to add network data to redux-form and no way to intercept handleSubmit call
			 * Added to window object so that can be accessed in the onSubmit handler below
			 */
			window.networkInfo = data;
			this.props.handleSubmit();
		});
	}

	setFocusElement(event) {
		let value = event.type == 'focus' ? event.target.name : false;
		this.setState({ selectedElement: value });
	}

	render() {
		const props = this.props;
		return (
			<div>
				{props.variation.contentSelector ? (
					renderInContentAdder(this, getSupportedSizes)
				) : (
					<div>
						<h1 className="variation-section-heading">Add Incontent Section</h1>
						<p className="error-message" style={{ fontSize: '1em' }}>
							Please set your <strong>Content Selector</strong> in Info settings panel first to
							create in-content sections.
						</p>
					</div>
				)}
			</div>
		);
	}
}

inContentForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	showNotification: PropTypes.func
};

const selector = formValueSelector('inContentForm');

const mapStateToProps = (state, ownProps) => ({
		...ownProps,
		customSizes: getCustomSizes(state),
		adSize: selector(state, 'adSize'), // Added to pass ad size it to NetworkOptions
		customAdSizeWidth: selector(state, 'customAdSizeWidth'), //  Added to pass ad size to NetworkOptions
		customAdSizeHeight: selector(state, 'customAdSizeHeight'), //  Added to pass ad size  to NetworkOptions
		initialValues: {
			section: 1,
			float: 'none',
			minDistanceFromPrevAd: 200,
			adSize: getSupportedSizes()[0],
			customCSS: '{"margin-top": "10px", "margin-bottom": "10px"}'
		}
	}),
	mapDispatchToProps = (dispatch, ownProps) => ({
		onSubmit: values => {
			let networkInfo = window.networkInfo;
			if (!networkInfo && !networkInfo.network) {
				dispatch(
					showNotification({
						mode: 'error',
						title: 'Network missing',
						message: 'Please select a network'
					})
				);
				return false;
			}
			const notNear = getNotNearData(values.notNear),
				isValues = !!values,
				isCustomCSS = !!(isValues && values.customCSS),
				isAdpTagsNetwork = !!(networkInfo.network && networkInfo.network === 'adpTags'),
				isCustomAdSize = !!(
					isValues &&
					Number(values.customAdSizeWidth) &&
					Number(values.customAdSizeHeight)
				),
				isAdSize = !!(isValues && values.adSize),
				computedAdSize = isCustomAdSize
					? `${values.customAdSizeWidth} x ${values.customAdSizeHeight}`
					: values.adSize,
				networkData = !!networkInfo.networkData && networkInfo.networkData,
				shouldMultipleAdSizesBeComputed = !!(
					networkData &&
					networkData.isBackwardCompatibleSizes &&
					networkData.multipleAdSizes &&
					!networkData.multipleAdSizes.length &&
					isAdpTagsNetwork &&
					(isAdSize || isCustomAdSize)
				),
				isMultipleAdSizes = !!(
					networkData &&
					networkData.multipleAdSizes &&
					networkData.multipleAdSizes.length
				),
				sectionPayload = {
					sectionNo: values.section,
					name: values.name,
					minDistanceFromPrevAd: values.minDistanceFromPrevAd,
					float: values.float,
					notNear
				},
				adPayload = {
					adCode: btoa(values.adCode),
					adSize: computedAdSize,
					network: networkInfo.network,
					networkData: {},
					fluid: networkInfo.fluid
				};

			isCustomCSS ? (adPayload.customCSS = JSON.parse(values.customCSS)) : null;

			if (shouldMultipleAdSizesBeComputed) {
				let adSize = computedAdSize.replace(' x ', ',');

				adPayload.multipleAdSizes = getMultipleAdSizesOfPrimaryAdSize(
					adSize,
					networkData.isBackwardCompatibleSizes
				);
			} else if (isMultipleAdSizes) {
				adPayload.multipleAdSizes = networkData.multipleAdSizes.concat([]);
			}

			delete networkData.multipleAdSizes;
			delete networkData.isBackwardCompatibleSizes;

			adPayload.networkData = {
				...adPayload.networkData,
				...networkData
			};
			dispatch(createIncontentSection(sectionPayload, adPayload, ownProps.variation.id));
		},
		showNotification: params => dispatch(showNotification(params))
	});

export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));
