// In-content section component

import React, { PropTypes } from 'react';
import { reduxForm, change, registerField } from 'redux-form';
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
							Please set your <strong>Content Selector</strong> in Info settings panel first to create
							in-content sections.
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

const mapStateToProps = (state, ownProps) => ({
		...ownProps,
		customSizes: getCustomSizes(state),
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
				isAdSize = !!(isValues && values.adSize),
				networkData = !!networkInfo.networkData && networkInfo.networkData,
				shouldMultipleAdSizesBeComputed = !!(
					networkData &&
					networkData.isBackwardCompatibleSizes &&
					networkData.multipleAdSizes &&
					!networkData.multipleAdSizes.length &&
					isAdpTagsNetwork &&
					isAdSize
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
					adSize: values.adSize,
					network: networkInfo.network,
					networkData: {}
				};

			isCustomCSS ? (adPayload.customCSS = JSON.parse(values.customCSS)) : null;

			if (shouldMultipleAdSizesBeComputed) {
				let adSize = values.adSize.replace(' x ', ',');

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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(form(inContentForm));
