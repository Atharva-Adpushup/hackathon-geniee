import React, { Component } from 'react';
import Select from 'react-select';

import {
	Row,
	Col,
	Panel,
	PanelGroup,
	FormControl,
	ControlLabel
} from '@/Client/helpers/react-bootstrap-imports';
import CustomReactTable from '../../../Components/CustomReactTable';
import CustomButton from '../../../Components/CustomButton';

class SizeMapping extends Component {
	state = {
		activeKey: '',
		inventories: [],
		inventoryMap: {},
		inventoryOptions: [],
		selectedAdUnit: {
			adUnitId: '',
			sizeMapping: []
		},
		errors: {
			maxWidth: {},
			maxHeight: {},
			viewportWidth: {}
		}
	};

	static getDerivedStateFromProps(props, state) {
		if (props.inventories !== state.inventories) {
			const inventoryMap = {};

			const inventoryOptions = {
				apLite: {
					label: 'Ap Lite',
					options: [],
					type: 'apLite'
				},
				layout: {
					label: 'Layout',
					options: [],
					type: 'layout'
				},
				apTag: {
					label: 'Manual',
					options: [],
					type: 'apTag'
				},
				innovative: {
					label: 'Innovative',
					options: [],
					type: 'innovative'
				}
			};

			props.inventories.forEach(inventory => {
				const { adUnit, adUnitId, type } = inventory;

				const option = {};

				switch (type) {
					case 'apLite':
						option.label = adUnit;
						option.value = adUnit;
						break;

					case 'apTag':
					case 'layout':
					case 'innovative':
					default:
						option.label = adUnit;
						option.value = adUnitId;
						break;
				}

				inventoryMap[option.value] = inventory;
				inventoryOptions[type].options.push(option);
			});

			return {
				inventoryMap,
				inventoryOptions: Object.values(inventoryOptions),
				inventories: props.inventories
			};
		}

		return null;
	}

	tableColumns = [
		{ Header: 'Name', accessor: 'name' },
		{ Header: 'Screen Width (px)', accessor: 'viewportWidth' },
		{ Header: 'Max Creative Width (px)', accessor: 'maxWidth' },
		{ Header: 'Max Creative Height (px)', accessor: 'maxHeight' },
		{ Header: 'Actions', accessor: 'actions' }
	];

	componentDidMount() {
		this.fetchSiteInventories();
	}

	componentWillUnmount() {
		// remove the site inventories from global.sites[siteId] since inventories are large in size and not really used anywhere else
		const { resetSiteInventories, site } = this.props;
		const { siteId } = site;
		resetSiteInventories(siteId);
	}

	fetchSiteInventories = () => {
		const { fetchSiteInventories, site } = this.props;
		const { siteId } = site;
		fetchSiteInventories(siteId);
	};

	getViewportRuleTemplate = viewportWidth => ({
		viewportWidth,
		name: `Screen Width <= ${viewportWidth}px`,
		maxWidth: 0,
		maxHeight: 0
	});

	handlePanelSelect = activeKey => this.setState({ activeKey });

	handleAdUnitSelect = data => {
		const { value: adUnitId } = data;
		const { inventoryMap } = this.state;
		const { sizeMapping = [], type } = inventoryMap[adUnitId];

		const updateState = () => ({
			selectedAdUnit: {
				adUnitId,
				sizeMapping,
				appType: type
			},
			errors: {
				maxWidth: {},
				maxHeight: {},
				viewportWidth: {}
			}
		});

		this.setState(updateState);
	};

	sanitizePropertyValue = value => {
		let sanitizedValue = value;

		const parsedValue = parseInt(sanitizedValue, 10);

		if (Number.isNaN(parsedValue)) {
			sanitizedValue = 0;
		} else {
			sanitizedValue = parsedValue;
		}

		if (sanitizedValue < 0) {
			sanitizedValue = 0;
		}

		return sanitizedValue;
	};

	validateViewportWidth = () => {
		/*
			-	check if the entered viewportWidth already exists in the sizeMapping array
			-	currentIndex indicates the index of the item that is being updated
			-	this index is used to set validation errors and comparison
		*/
		const { selectedAdUnit } = this.state;
		const { sizeMapping } = selectedAdUnit;
		const existingViewportWidthMap = {};

		// eslint-disable-next-line no-plusplus
		for (let index = 0; index < sizeMapping.length; index++) {
			const { viewportWidth: vw } = sizeMapping[index];
			existingViewportWidthMap[vw] = existingViewportWidthMap[vw] || [];
			existingViewportWidthMap[vw].push(index);
		}

		const updateState = state => {
			const viewportWidthErrors = {};

			sizeMapping.forEach(({ viewportWidth }, sizeMappingIndex) => {
				const viewportIndexes = existingViewportWidthMap[viewportWidth];
				if (viewportIndexes && viewportIndexes.length > 1) {
					// show error for rows/index other than the first one
					if (viewportIndexes.indexOf(sizeMappingIndex) > 0) {
						viewportWidthErrors[
							sizeMappingIndex
						] = `Rule for Width ${viewportWidth}px already exists`;
					}
				}
			});

			return {
				errors: {
					...state.errors,
					viewportWidth: viewportWidthErrors
				}
			};
		};

		this.setState(updateState);
	};

	validateMaxHeight = (index, size) => {
		const { selectedAdUnit } = this.state;
		const { appType, sizeMapping } = selectedAdUnit;
		const { maxHeight: currentValue } = sizeMapping[index];

		if (appType === 'apLite') {
			return;
		}

		let [, adUnitHeight] = size.split('x');
		adUnitHeight = parseInt(adUnitHeight, 10);

		const updateState = state => {
			const maxHeightErrors = {
				...state.errors.maxHeight
			};
			if (currentValue > adUnitHeight) {
				maxHeightErrors[index] = `Max Height allowed: ${adUnitHeight}px`;
			} else {
				delete maxHeightErrors[index];
			}

			return {
				errors: {
					...state.errors,
					maxHeight: maxHeightErrors
				}
			};
		};

		this.setState(updateState);
	};

	validateMaxWidth = (index, size) => {
		const { selectedAdUnit } = this.state;
		const { appType, sizeMapping } = selectedAdUnit;
		const { maxWidth: currentValue } = sizeMapping[index];

		if (appType === 'apLite') {
			return;
		}

		let [adUnitWidth] = size.split('x');
		adUnitWidth = parseInt(adUnitWidth, 10);

		const updateState = state => {
			const maxWidthErrors = {
				...state.errors.maxWidth
			};
			if (currentValue > adUnitWidth) {
				maxWidthErrors[index] = `Max Width allowed: ${adUnitWidth}px`;
			} else {
				delete maxWidthErrors[index];
			}

			return {
				errors: {
					...state.errors,
					maxWidth: maxWidthErrors
				}
			};
		};

		this.setState(updateState);
	};

	validateValues = (type, index, adUnitSize) => {
		switch (type) {
			case 'viewportWidth':
				this.validateViewportWidth();
				break;
			case 'maxHeight':
				this.validateMaxHeight(index, adUnitSize);
				break;
			case 'maxWidth':
				this.validateMaxWidth(index, adUnitSize);
				break;

			default:
				break;
		}
	};

	handlePropertyUpdate = (propertyType, index, e, adUnitSize) => {
		e.persist();
		const propertyValue = this.sanitizePropertyValue(e.target.value);

		const updateState = state => {
			const {
				selectedAdUnit: { sizeMapping }
			} = state;

			const newSizeMapping = [...sizeMapping];
			const mappingData = {
				...newSizeMapping[index],
				[propertyType]: propertyValue
			};

			if (propertyType === 'viewportWidth') {
				mappingData.name = `Screen Width <= ${propertyValue}px`;
			}

			newSizeMapping[index] = mappingData;

			return {
				selectedAdUnit: {
					...state.selectedAdUnit,
					sizeMapping: newSizeMapping
				}
			};
		};

		this.setState(updateState, () => this.validateValues(propertyType, index, adUnitSize));
	};

	// eslint-disable-next-line consistent-return
	addNewViewportRule = () => {
		const {
			selectedAdUnit: { sizeMapping }
		} = this.state;

		const newViewportRule = this.getViewportRuleTemplate(0);
		const newSizeMapping = [...sizeMapping, newViewportRule];

		this.setState(
			state => ({
				selectedAdUnit: {
					...state.selectedAdUnit,
					sizeMapping: newSizeMapping
				}
			}),
			() => {
				// const { selectedAdUnit } = this.state;
				this.validateViewportWidth();
			}
		);
	};

	// eslint-disable-next-line consistent-return
	removeViewportRule = (mappingIndex, viewportWidth) => {
		// eslint-disable-next-line no-restricted-globals
		const isUserSure = confirm(
			`Are you sure you want to remove rule for Screen Width <= ${viewportWidth} ?`
		);

		if (!isUserSure) {
			return false;
		}

		const { selectedAdUnit } = this.state;
		const { sizeMapping } = selectedAdUnit;

		const newSizeMapping = [
			...sizeMapping.slice(0, mappingIndex),
			...sizeMapping.slice(mappingIndex + 1)
		];

		this.setState(state => ({
			selectedAdUnit: {
				...state.selectedAdUnit,
				sizeMapping: newSizeMapping
			}
		}));
	};

	hasValidationErrors = () => {
		const { errors } = this.state;
		const { maxHeight, maxWidth, viewportWidth } = errors;

		return (
			!!Object.keys(maxWidth).length ||
			!!Object.keys(maxHeight).length ||
			!!Object.keys(viewportWidth).length
		);
	};

	// eslint-disable-next-line consistent-return
	saveSizeMapping = () => {
		const { updateSizeMapping, site, showNotification } = this.props;
		const { siteId } = site;
		const {
			selectedAdUnit: { adUnitId, sizeMapping },
			inventoryMap: { [adUnitId]: inventoryData }
		} = this.state;

		if (this.hasValidationErrors()) {
			const notificationData = {
				mode: 'error',
				title: 'Invalid Size Mapping Configuration',
				autoDismiss: 5,
				message: 'Please resolve the validation errors before proceeding'
			};
			return showNotification(notificationData);
		}

		updateSizeMapping(siteId, { ...inventoryData, sizeMapping, siteId })
			.then(() => {
				this.fetchSiteInventories();
				const notificationData = {
					mode: 'success',
					title: 'Operation Successfull',
					autoDismiss: 5,
					message: 'Size Mapping Settings Saved'
				};
				showNotification(notificationData);
			})
			.catch(error => {
				// eslint-disable-next-line no-console
				console.log(error);
				const notificationData = {
					mode: 'error',
					title: 'Operation Failed',
					autoDismiss: 5,
					message: 'Something went wrong'
				};
				showNotification(notificationData);
			});
	};

	renderPropertyError = (errors, index) =>
		!!errors[index] && <div className="error-message">{errors[index]}</div>;

	getTableRows = (sizeMapping, adUnitSize) => {
		const { errors } = this.state;
		const {
			maxWidth: maxWidthErrors,
			maxHeight: maxHeightErrors,
			viewportWidth: viewportWidthErrors
		} = errors;

		return sizeMapping.map((mapping, index) => {
			const { name, viewportWidth, maxHeight, maxWidth } = mapping;
			return {
				name,
				viewportWidth: (
					<div>
						<FormControl
							min={0}
							type="number"
							value={viewportWidth}
							onChange={e => this.handlePropertyUpdate('viewportWidth', index, e)}
						/>
						{this.renderPropertyError(viewportWidthErrors, index)}
					</div>
				),
				maxHeight: (
					<>
						<FormControl
							type="number"
							min={0}
							value={maxHeight}
							onChange={e => this.handlePropertyUpdate('maxHeight', index, e, adUnitSize)}
						/>
						{this.renderPropertyError(maxHeightErrors, index)}
					</>
				),
				maxWidth: (
					<>
						<FormControl
							type="number"
							min={0}
							value={maxWidth}
							onChange={e => this.handlePropertyUpdate('maxWidth', index, e, adUnitSize)}
						/>
						{this.renderPropertyError(maxWidthErrors, index)}
					</>
				),
				actions: (
					<CustomButton
						type="button"
						className="actions-delete"
						variant="secondary"
						onClick={() => this.removeViewportRule(index, viewportWidth)}
					>
						Delete Rule
					</CustomButton>
				)
			};
		});
	};

	formatGroupLabel = group => (
		<div className="select-options-group">
			<span className="name">{group.label}</span>
			<span className="count">{group.options.length}</span>
		</div>
	);

	renderView = () => {
		const { inventoryOptions, selectedAdUnit, inventoryMap } = this.state;
		const { adUnitId, sizeMapping } = selectedAdUnit;
		const { size } = inventoryMap[adUnitId] || {};

		const data = this.getTableRows(sizeMapping, size);

		return (
			<div className="size-mapping">
				<Row>
					<Col lg={6} className="controls">
						<ControlLabel className="u-padding-v1">Ad Unit</ControlLabel>
						<Select
							onChange={this.handleAdUnitSelect}
							placeholder="Please select any Ad Unit"
							options={inventoryOptions}
							selected={adUnitId}
							isSearchable
							className="sizemapping-adunit-select"
							formatGroupLabel={this.formatGroupLabel}
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						{adUnitId ? (
							<div className="size-mapping-table">
								<CustomReactTable
									minRows={data.length}
									sortable={false}
									filterable={false}
									showPaginationTop={false}
									showPaginationBottom={false}
									columns={this.tableColumns}
									data={data}
								/>
								{data.length === 0 && (
									<p className="no-rules-message">
										No rules found. Please use the Add Rule button below to start adding rules
									</p>
								)}
							</div>
						) : (
							<div className="select-adunit-error text-center u-margin-v4 u-padding-v5">
								<p>Please select any Ad Unit</p>
							</div>
						)}
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<p className="downward-size-info error-message">
							NOTE: The downward compatible sizes will be added automatically according to the Max
							Height and Max Width set by you
						</p>
					</Col>
				</Row>
				<Row>
					<Col sm={12} className="text-right action-buttons pull-right">
						<CustomButton variant="secondary" onClick={this.addNewViewportRule}>
							Add Rule
						</CustomButton>
						<CustomButton variant="primary" onClick={this.saveSizeMapping}>
							Save
						</CustomButton>
					</Col>
				</Row>
			</div>
		);
	};

	render() {
		const { activeKey } = this.state;
		const { site } = this.props;
		const { siteId, siteDomain } = site;

		return (
			<div className="u-margin-t2">
				<PanelGroup
					accordion
					id={`size-mapping-panel-${siteId}-${siteDomain}`}
					activeKey={activeKey}
					onSelect={this.handlePanelSelect}
				>
					<Panel eventKey="size-mappings">
						<Panel.Heading>
							<Panel.Title toggle>Screen Size Mapping</Panel.Title>
						</Panel.Heading>
						{activeKey === 'size-mappings' ? (
							<Panel.Body collapsible>{this.renderView()}</Panel.Body>
						) : null}
					</Panel>
				</PanelGroup>
			</div>
		);
	}
}

export default SizeMapping;
