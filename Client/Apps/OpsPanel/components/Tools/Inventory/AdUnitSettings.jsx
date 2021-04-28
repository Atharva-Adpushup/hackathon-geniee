import React, { Component } from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import axiosInstance from '../../../../../helpers/axiosInstance';

class AdUnitSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collapseUnfilledToggle: !!(props.adUnitData && props.adUnitData.collapseUnfilled),
			downwardSizesDisabled: !!(props.adUnitData && props.adUnitData.downwardSizesDisabled),
			enableDownwardSizeToggle: !(props.adUnitData && props.adUnitData.downwardSizesDisabled),
			isLoading: false,
			sizeFilters: {
				maxHeight:
					props.adUnitData &&
					((props.adUnitData.sizeFilters && props.adUnitData.sizeFilters.maxHeight) ||
						props.adUnitData.height),
				maxWidth:
					props.adUnitData &&
					((props.adUnitData.sizeFilters && props.adUnitData.sizeFilters.maxWidth) ||
						props.adUnitData.width),
				minHeight:
					props.adUnitData &&
					props.adUnitData.sizeFilters &&
					props.adUnitData.sizeFilters.minHeight,
				minWidth:
					props.adUnitData && props.adUnitData.sizeFilters && props.adUnitData.sizeFilters.minWidth
			},
			initialStates: {
				collapseUnfilledToggle: !!(props.adUnitData && props.adUnitData.collapseUnfilled),
				downwardSizesDisabled: !!(props.adUnitData && props.adUnitData.downwardSizesDisabled),
				sizeFilters: {
					maxHeight:
						props.adUnitData &&
						((props.adUnitData.sizeFilters && props.adUnitData.sizeFilters.maxHeight) ||
							props.adUnitData.height),
					maxWidth:
						props.adUnitData &&
						((props.adUnitData.sizeFilters && props.adUnitData.sizeFilters.maxWidth) ||
							props.adUnitData.width),
					minHeight:
						props.adUnitData &&
						props.adUnitData.sizeFilters &&
						props.adUnitData.sizeFilters.minHeight,
					minWidth:
						props.adUnitData &&
						props.adUnitData.sizeFilters &&
						props.adUnitData.sizeFilters.minWidth
				}
			}
		};
	}

	componentDidMount = () => {};

	handleToggle = (val, event) => {
		const element = event.target;
		const id = element.getAttribute('id');
		const type = id.split('-')[0];
		switch (type) {
			case 'collapseUnfilled':
				this.setState({ collapseUnfilledToggle: val });
				break;
			case 'downwardSizesDisabled':
				this.setState(state => {
					return {
						...state,
						downwardSizesDisabled: !val,
						enableDownwardSizeToggle: val
					};
				});
				break;
			default:
				break;
		}
	};

	handleSizeFilterChange = event => {
		const { adUnitData } = this.props;
		const { name, value } = event.target;
		const inputField = name.split('-')[1];

		this.setState(state => {
			const { sizeFilters } = state;
			sizeFilters[inputField] = +value;
			return { ...state, sizeFilters };
		});
	};

	closeModal = () => {
		const { modalToggle } = this.props;
		modalToggle({ show: false });
	};

	saveSettings = () => {
		const {
			docid: docId,
			adid: adId,
			modalToggle,
			showNotification,
			siteid,
			adUnitData: adUnitDimensionData,
			updateAdUnitData
		} = this.props;
		const {
			collapseUnfilledToggle,
			sizeFilters,
			downwardSizesDisabled,
			initialStates
		} = this.state;

		const successMsg = [];

		const { width, height } = adUnitDimensionData;
		if (height && (sizeFilters.minHeight > height || sizeFilters.maxHeight > height)) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Min/Max Height can not be more than ad unit height',
				autoDismiss: 5
			});
		}
		if (width && (sizeFilters.minWidth > width || sizeFilters.maxWidth > width)) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Min/Max Width can not be more than ad unit width',
				autoDismiss: 5
			});
		}

		if (initialStates.collapseUnfilledToggle !== collapseUnfilledToggle) {
			if (collapseUnfilledToggle) {
				successMsg.push('Collapse Unfilled Turned On');
			} else {
				successMsg.push('Collapse Unfilled Turned Off');
			}
		}

		if (initialStates.downwardSizesDisabled !== downwardSizesDisabled) {
			if (!downwardSizesDisabled) {
				successMsg.push('Enabled Downward Sizes');
			} else {
				successMsg.push('Disabled Downward Sizes');
			}
		}

		if (
			initialStates.sizeFilters.minHeight !== sizeFilters.minHeight ||
			initialStates.sizeFilters.maxHeight !== sizeFilters.maxHeight ||
			initialStates.sizeFilters.minWidth !== sizeFilters.minWidth ||
			initialStates.sizeFilters.maxWidth !== sizeFilters.maxWidth
		) {
			successMsg.push('Size Filters Added');
		}

		if (successMsg.length) {
			const adUnitData = {
				docId,
				adId,
				collapseUnfilled: !!collapseUnfilledToggle,
				downwardSizesDisabled: !!downwardSizesDisabled,
				sizeFilters
			};
			axiosInstance
				.post(`/ops/updateAdUnitData/${siteid}`, { adUnitData })
				.then(() => {
					updateAdUnitData(adUnitData);
					this.setState({ isLoading: false });
					modalToggle({ show: false });
					return showNotification({
						mode: 'success',
						title: 'Operation Success',
						message: successMsg.join('<br>'),
						autoDismiss: 5
					});
				})
				.catch(() => {
					return showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: 'Failed to save adunit settings',
						autoDismiss: 5
					});
				});
		} else {
			modalToggle({ show: false });
		}
	};

	render() {
		const {
			collapseUnfilledToggle,
			sizeFilters,
			isLoading,
			downwardSizesDisabled,
			enableDownwardSizeToggle
		} = this.state;
		const { adid, docid } = this.props;

		return (
			<>
				<div>
					<CustomToggleSwitch
						labelText="Collapse Unfilled Impressions"
						className="u-cursor-pointer"
						checked={!!collapseUnfilledToggle}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={adid}
						id={'collapseUnfilled-' + adid}
					/>
					<CustomToggleSwitch
						labelText="Enable Downward Sizes"
						className="u-cursor-pointer"
						checked={!downwardSizesDisabled}
						onChange={this.handleToggle}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout
						name={adid}
						disabled={docid.includes('aplt') ? 'true' : null}
						id={'downwardSizesDisabled-' + adid}
					/>
					{enableDownwardSizeToggle && !docid.includes('aplt') ? (
						<Row>
							<Col md={6}>
								<FieldGroup
									name="sizeFilters-maxHeight"
									type="number"
									label="Set max height"
									id="sizeFilters-maxHeight"
									placeholder="Max height"
									className="u-padding-h4"
									value={sizeFilters && sizeFilters.maxHeight}
									onChange={this.handleSizeFilterChange}
									required
								/>
							</Col>
							<Col md={6}>
								<FieldGroup
									name="sizeFilters-maxWidth"
									type="number"
									label="Set max width"
									id="sizeFilters-maxWidth"
									placeholder="Max width"
									className="u-padding-h4"
									value={sizeFilters && sizeFilters.maxWidth}
									onChange={this.handleSizeFilterChange}
									required
								/>
							</Col>

							<Col md={6}>
								<FieldGroup
									name="sizeFilters-minHeight"
									type="number"
									label="Set min height"
									id="sizeFilters-minHeight"
									placeholder="Min height"
									className="u-padding-h4"
									value={sizeFilters && sizeFilters.minHeight}
									onChange={this.handleSizeFilterChange}
									required
								/>
							</Col>
							<Col md={6}>
								<FieldGroup
									name="sizeFilters-minWidth"
									type="number"
									label="Set min width"
									id="sizeFilters-minWidth"
									placeholder="Min width"
									className="u-padding-h4"
									value={sizeFilters && sizeFilters.minWidth}
									onChange={this.handleSizeFilterChange}
									required
								/>
							</Col>
						</Row>
					) : null}
					<Row>
						<CustomButton
							variant="primary"
							className="pull-right u-margin-r2"
							showSpinner={isLoading}
							onClick={this.closeModal}
						>
							Cancel
						</CustomButton>
						<CustomButton
							variant="primary"
							className="pull-right u-margin-r2"
							showSpinner={isLoading}
							onClick={this.saveSettings}
						>
							Save Settings
						</CustomButton>
					</Row>
				</div>
			</>
		);
	}
}

export default AdUnitSettings;
