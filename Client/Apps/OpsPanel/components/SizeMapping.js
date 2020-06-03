import React, { Component } from 'react';

import Select from 'react-select';
import CustomReactTable from '../../../Components/CustomReactTable';
import CustomButton from '../../../Components/CustomButton';
import {
	Row,
	Col,
	Panel,
	PanelGroup,
	FormControl,
	ControlLabel
} from '@/Client/helpers/react-bootstrap-imports';

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
		{ Header: 'Viewport Size (px)', accessor: 'viewportWidth' },
		{ Header: 'Max Width (px)', accessor: 'maxWidth' },
		{ Header: 'Max Height (px)', accessor: 'maxHeight' },
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
		name: `Viewport Width <= ${viewportWidth}px`,
		maxWidth: 0,
		maxHeight: 0
	});

	handlePanelSelect = activeKey => this.setState({ activeKey });

	handleAdUnitSelect = data => {
		const { value: adUnitId, type } = data;
		const { inventoryMap } = this.state;
		const { sizeMapping = [] } = inventoryMap[adUnitId];

		this.setState(state => ({
			selectedAdUnit: {
				adUnitId,
				sizeMapping
			},
			errors: {
				...state.errors,
				viewportWidth: {}
			}
		}));
	};

	sanitizePropertyValue = value => {
		let sanitizedValue = value;

		if (sanitizedValue === '') {
			sanitizedValue = 0;
		}

		if (Number.isNaN(parseInt(sanitizedValue, 10))) {
			sanitizedValue = 0;
		} else {
			sanitizedValue = parseInt(sanitizedValue, 10);
		}

		return sanitizedValue;
	};

	validateViewportWidth = (viewportWidth, currentIndex) => {
		/*
			-	check if the entered viewportWidth already exists in the sizeMapping array
			-	currentIndex indicates the index of the item that is being updated
			-	this index is used to set validation errors and comparison
		*/
		const { selectedAdUnit } = this.state;
		const { sizeMapping } = selectedAdUnit;
		let hasAlreadyViewportWidth = false;

		// eslint-disable-next-line no-plusplus
		for (let index = 0; index < sizeMapping.length; index++) {
			const mapping = sizeMapping[index];
			if (mapping.viewportWidth === viewportWidth && index !== currentIndex) {
				hasAlreadyViewportWidth = true;
				break;
			}
		}

		this.setState(state => {
			const viewportWidthErrors = {
				...state.errors.viewportWidth
			};

			if (hasAlreadyViewportWidth) {
				viewportWidthErrors[currentIndex] = `Rule for Width ${viewportWidth}px already exists`;
			} else {
				delete viewportWidthErrors[currentIndex];
			}

			return {
				errors: {
					...state.errors,
					viewportWidth: {
						...viewportWidthErrors
					}
				}
			};
		});
	};

	handlePropertyUpdate = (type, index, e) => {
		e.persist();

		const newValue = this.sanitizePropertyValue(e.target.value);

		if (type === 'viewportWidth') {
			this.validateViewportWidth(newValue, index);
		}

		this.setState(state => {
			const {
				selectedAdUnit: { sizeMapping }
			} = state;

			const newSizeMapping = [...sizeMapping];
			const mappingData = {
				...newSizeMapping[index],
				[type]: newValue
			};

			if (type === 'viewportWidth') {
				mappingData.name = `Viewport Width <= ${newValue}px`;
			}

			newSizeMapping[index] = mappingData;

			return {
				selectedAdUnit: {
					...state.selectedAdUnit,
					sizeMapping: newSizeMapping
				}
			};
		});
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
				const { selectedAdUnit } = this.state;
				this.validateViewportWidth(0, selectedAdUnit.sizeMapping.length - 1);
			}
		);
	};

	removeViewportRule = (mappingIndex, viewportWidth) => {
		// eslint-disable-next-line no-alert
		const isUserSure = confirm(
			`Are you sure you want to remove rule for Viewport Width <= ${viewportWidth} ?`
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
		const { viewportWidth } = errors;

		return !!Object.keys(viewportWidth).length;
	};

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

	getTableRows = sizeMapping => {
		const { errors } = this.state;
		const { viewportWidth: viewportWidthErrors } = errors;

		const renderViewportWidthError = index =>
			!!viewportWidthErrors[index] && (
				<div className="error-message">{viewportWidthErrors[index]}</div>
			);

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
						{renderViewportWidthError(index)}
					</div>
				),
				maxHeight: (
					<FormControl
						type="number"
						min={0}
						value={maxHeight}
						onChange={e => this.handlePropertyUpdate('maxHeight', index, e)}
					/>
				),
				maxWidth: (
					<FormControl
						type="number"
						min={0}
						value={maxWidth}
						onChange={e => this.handlePropertyUpdate('maxWidth', index, e)}
					/>
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
		const { inventoryOptions, selectedAdUnit } = this.state;
		const { adUnitId, sizeMapping } = selectedAdUnit;

		const data = this.getTableRows(sizeMapping);

		return (
			<div className="size-mapping">
				<Row>
					<Col lg={6} className="controls">
						<ControlLabel className="u-padding-v1">Ad Unit</ControlLabel>
						<Select
							onChange={this.handleAdUnitSelect}
							placeholder="Please select an Ad Unit"
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
