import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import Papa from 'papaparse';
import uniq from 'lodash/uniq';
import { Panel, PanelGroup } from '@/Client/helpers/react-bootstrap-imports';
import FieldGroup from '../../../../../../Components/Layout/FieldGroup';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import SelectBox from '../../../../../../Components/SelectBox/index';
import CustomButton from '../../../../../../Components/CustomButton/index';
import {
	REFRESH_RATE_ENTRIES,
	UNFILLED_REFRESH_RATE_ENTRIES,
	PNP_REPLACE_TYPES,
	PNP_AD_UNIT_OPERATIONS,
	ADPUSHUP_DFP,
	adUnitsData,
	adUnitsHeaders
} from '../../../../configs/commonConsts';
import axios from '../../../../../../helpers/axiosInstance';
import AdUnitsModal from './AdUnitsModal';
import { SIZES } from '../../../../../ApTag/configs/commonConsts';

const uploadAdUnitsLabel = (
	<React.Fragment>
		GAM Ad Units{' '}
		<CSVLink
			headers={[
				{ label: 'Ad unit', key: 'dfpAdUnit' },
				{ label: 'Ad Unit Code', key: 'dfpAdUnitCode' },
				{ label: 'Size', key: 'size' },
				{ label: 'Platform', key: 'platform' }
			]}
			data={adUnitsData}
			filename="adUnitsTemplate.csv"
			style={{ display: 'block' }}
		>
			<small> (Download CSV Template)</small>
		</CSVLink>
	</React.Fragment>
);

const uploadLineItemsLabel = (
	<React.Fragment>
		GAM Line Items{' '}
		<CSVLink
			headers={[{ label: 'Line Item ID', key: 'lineItemID' }]}
			data={[]}
			filename="lineItemsTemplate.csv"
			style={{ display: 'block' }}
		>
			<small> (Download CSV Template)</small>
		</CSVLink>
	</React.Fragment>
);

const uploadBlacklistedLineItemsLabel = (
	<React.Fragment>
		GAM Blacklisted Line Items{' '}
		<CSVLink
			headers={[{ label: 'Line Item ID', key: 'lineItemID' }]}
			data={[]}
			filename="blacklistedLineItemsTemplate.csv"
			style={{ display: 'block' }}
		>
			<small> (Download CSV Template)</small>
		</CSVLink>
	</React.Fragment>
);

const DEFAULT_LINE_ITEMS = [];
const DEFAULT_BLACKLISTED_LINE_ITEMS = [];
const DEFAULT_AD_UNITS = [];
const DEFAULT_PNP_CONFIG = {};
const DEFAULT_HOSUE_LINE_ITEM_QUICK_REPLACE_VALUE = false;
const PICKER_STYLE = {
	display: 'inline-block',
	float: 'right',
	width: '220',
	fontWeight: '700'
};
const SELECT_BOX_STYLE = { marginLeft: 'auto', width: '20%' };

const defaultFilledInsertionTrigger = REFRESH_RATE_ENTRIES.find(entry => entry.default);
const defaultUnfilledInsertionTrigger = UNFILLED_REFRESH_RATE_ENTRIES.find(entry => entry.default);

const PnP = (props = {}) => {
	const [activeKey, setActiveKey] = useState(null);
	const [adUnitsFileName, setAdUnitsFileName] = useState('');
	const [lineItemsFileName, setLineItemsFileName] = useState('');
	const [blacklistedLineItemsFileName, setBlacklistedItemsFileName] = useState('');
	const [showAdUnitsModal, setShowAdUnitsModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedAdUnitOperation, setSelectedAdUnitOperation] = useState(
		PNP_AD_UNIT_OPERATIONS[0].value
	);
	const [isPnpSiteIdSynced, setIsPnpSiteIdSynced] = useState(false);
	const [prevConfig, setPrevConfig] = useState({});

	const {
		site: { apps = {}, siteId, siteDomain },
		updatePnPConfig,
		updatePnPConfigKey,
		pnpConfig,
		showNotification,
		dfpData
	} = props;
	const {
		adUnits = DEFAULT_AD_UNITS,
		lineItems = DEFAULT_LINE_ITEMS,
		blacklistedLineItems = DEFAULT_BLACKLISTED_LINE_ITEMS,
		pnpSiteId,
		native,
		outstream,
		filledInsertionTrigger,
		unfilledInsertionTrigger,
		refreshType,
		isHouseLineItemQuickReplaceEnabled = DEFAULT_HOSUE_LINE_ITEM_QUICK_REPLACE_VALUE
	} = pnpConfig[siteId] || DEFAULT_PNP_CONFIG;

	const isPublisherGamAvailable = useMemo(() => {
		const activeDFPNetwork = dfpData && dfpData.activeDFPNetwork;
		if (!activeDFPNetwork || activeDFPNetwork === ADPUSHUP_DFP.code) return false;
		return true;
	}, [dfpData]);

	const isNativeEnabledOnAllUnits = useMemo(
		() => adUnits.length && adUnits.every(unit => unit.formats && unit.formats.native),
		[adUnits]
	);

	const isOutstreamEnabledOnAllUnits = useMemo(
		() => adUnits.length && adUnits.every(unit => unit.formats && unit.formats.video),
		[adUnits]
	);

	const fetchPnPData = useCallback(() => {
		setIsLoading(true);
		axios
			.get(`ops/pnp-refresh/${siteId}`)
			.then(res => {
				const { data: config = {} } = res.data || {};
				setPrevConfig(config);
				if (config.pnpSiteId) {
					setIsPnpSiteIdSynced(true);
				}
				updatePnPConfig(siteId, config);
			})
			.catch(err => {
				// eslint-disable-next-line
				console.log({ err });
			})
			.finally(() => setIsLoading(false));
	}, [siteId, updatePnPConfig]);

	useEffect(() => {
		fetchPnPData();
	}, [fetchPnPData]);

	const handleToggle = useCallback(
		(value, e) => {
			const key = e.target.name.split('-')[0];
			updatePnPConfigKey(siteId, key, value);

			const newAdUnits = adUnits.map(unit => {
				const formats =
					unit.formats && Object.keys(unit.formats).length ? unit.formats : { display: true };
				if (key === 'native') formats.native = value;
				else if (key === 'outstream') formats.video = value;

				return {
					...unit,
					formats
				};
			});
			updatePnPConfigKey(siteId, 'adUnits', newAdUnits);
		},
		[adUnits, siteId, updatePnPConfigKey]
	);
	const handleHosueLineItemQuickReplaceToggle = useCallback(
		(value, e) => {
			const key = e.target.name;
			updatePnPConfigKey(siteId, key, value);
		},
		[siteId, updatePnPConfigKey]
	);
	const handleAdUnitActiveToggle = useCallback(
		(active, code, platform) => {
			const newAdUnits = adUnits.map(unit => {
				if (unit.code === code && unit.platform === platform) {
					return {
						...unit,
						isActive: active
					};
				}
				return unit;
			});
			updatePnPConfigKey(siteId, 'adUnits', newAdUnits);
		},
		[adUnits, siteId, updatePnPConfigKey]
	);

	const handleAdUnitMultiformatToggle = useCallback(
		// eslint-disable-next-line
		(active, code, platform, type) => {
			const newAdUnits = adUnits.map(unit => {
				if (unit.code === code && unit.platform === platform) {
					return {
						...unit,
						formats: {
							...unit.formats,
							[type]: active
						}
					};
				}
				return unit;
			});
			updatePnPConfigKey(siteId, 'adUnits', newAdUnits);
		},
		[adUnits, siteId, updatePnPConfigKey]
	);

	const showUploadedAdUnits = useCallback(() => setShowAdUnitsModal(true), []);

	const hideAdUnitsModal = useCallback(() => setShowAdUnitsModal(false), []);

	const onSelect = useCallback(
		(value, key) => {
			updatePnPConfigKey(siteId, key, value);
		},
		[siteId, updatePnPConfigKey]
	);

	const onSelectDropDown = value => {
		setSelectedAdUnitOperation(value);
		setAdUnitsFileName('');
	};

	const validateUploadedAdUnits = useCallback(
		(units = []) => {
			let areUnitsValid = true;
			const existingUnitKeys = new Set(adUnits.map(unit => `${unit.code}-${unit.platform}`)); // creating a set of existing units;

			units.forEach(unit => {
				if (!unit.code) {
					areUnitsValid = false;
					showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: `Unit ${unit.code} is invalid`,
						autoDismiss: 10
					});
					return;
				}
				if (!unit.width) {
					areUnitsValid = false;
					showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: `Unit ${unit.code} has invalid width of ${unit.width}`,
						autoDismiss: 10
					});
					return;
				}
				if (!unit.height) {
					areUnitsValid = false;
					showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: `Unit ${unit.code} has invalid height of ${unit.height}`,
						autoDismiss: 10
					});
					return;
				}
				if (!unit.platform) {
					areUnitsValid = false;
					showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: `Unit ${unit.code} has invalid platform of ${unit.platform}`,
						autoDismiss: 10
					});
					return;
				}

				const SUPPORTED_DISPLAY_SIZES = SIZES.DISPLAY;
				const size = `${unit.width}x${unit.height}`;
				const unitUniqueKey = `${unit.code}-${unit.platform}`;

				// This condition will be checked in case of Append only , as in case of Replace we don't have to check duplicate adunit code
				if (
					selectedAdUnitOperation === PNP_AD_UNIT_OPERATIONS[0].value &&
					existingUnitKeys.has(unitUniqueKey)
				) {
					areUnitsValid = false;
					showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: `Platfrom ${unit.platform} has duplicate unit code ${unit.code}. Please make sure adUnitCode is unique for each platform`,
						autoDismiss: 10
					});
					return;
				}
				existingUnitKeys.add(unitUniqueKey);

				const availableSizesForPlatform =
					unit.platform.toUpperCase() === 'TABLET'
						? uniq([...SUPPORTED_DISPLAY_SIZES.DESKTOP, ...SUPPORTED_DISPLAY_SIZES.MOBILE])
						: SUPPORTED_DISPLAY_SIZES[unit.platform.toUpperCase()];

				if (!availableSizesForPlatform.includes(size)) {
					areUnitsValid = false;
					showNotification({
						mode: 'error',
						title: 'Operation Failed',
						message: `Unit ${unit.code} has an unsupported size ${size}. Please change the size or remove the unit to proceed.`,
						autoDismiss: 10
					});
				}
			});
			return areUnitsValid;
		},
		[adUnits, showNotification, selectedAdUnitOperation]
	);

	const processAdUnits = useCallback(
		(units = []) => {
			const formats = { display: true };
			if (isNativeEnabledOnAllUnits) formats.native = true;
			if (isOutstreamEnabledOnAllUnits) formats.video = true;

			const processedUnits = units
				.splice(1) // splicing by 1 to ignore title csv entry.
				.filter(config => config.length > 1) // filter out empty lines having structure [""]
				.map(([unitName, unitCode, size, platform]) => ({
					name: unitName,
					code: unitCode,
					isActive: true,
					apTagId: null,
					platform,
					width: size.split('x')[0],
					height: size.split('x')[1],
					formats
				}));

			const areUnitsValid = validateUploadedAdUnits(processedUnits);
			if (!areUnitsValid) {
				setAdUnitsFileName('');
				return;
			}

			let newAdUnits = [];
			if (selectedAdUnitOperation === PNP_AD_UNIT_OPERATIONS[1].value) {
				newAdUnits = processedUnits;
			} else if (selectedAdUnitOperation === PNP_AD_UNIT_OPERATIONS[0].value) {
				newAdUnits = [...adUnits, ...processedUnits];
			}
			updatePnPConfigKey(siteId, 'adUnits', newAdUnits);
		},
		[
			adUnits,
			siteId,
			isNativeEnabledOnAllUnits,
			isOutstreamEnabledOnAllUnits,
			validateUploadedAdUnits,
			updatePnPConfigKey,
			selectedAdUnitOperation
		]
	);

	const processLineItems = useCallback(
		(items = []) => {
			const processedLineItems = items
				.splice(1) // splicing by 1 to ignore title csv entry
				.map(([lineItemId]) => ({ id: lineItemId }));
			updatePnPConfigKey(siteId, 'lineItems', processedLineItems);
		},
		[siteId, updatePnPConfigKey]
	);

	const processBlacklistedLineItems = useCallback(
		(items = []) => {
			const processedBlacklistedLineItems = items
				.splice(1)
				.map(([lineItemId]) => ({ id: lineItemId }));
			updatePnPConfigKey(siteId, 'blacklistedLineItems', processedBlacklistedLineItems);
		},
		[siteId, updatePnPConfigKey]
	);

	const parseFile = useCallback(
		(type, csvFile) => {
			Papa.parse(csvFile, {
				delimiter: ',',
				newline: '',
				chunkSize: 3,
				header: false,
				skipEmptyLines: true,
				complete: responses => {
					if (type === 'gamAdUnits') {
						processAdUnits(responses.data);
					} else if (type === 'lineItems') {
						processLineItems(responses.data);
					} else if (type === 'blacklistedLineItems') {
						processBlacklistedLineItems(responses.data);
					}
				}
			});
		},
		[processAdUnits, processLineItems, processBlacklistedLineItems]
	);

	const handleUploadUnits = useCallback(
		e => {
			const uploadType = e.target.id;
			if (!e.target.value.endsWith('.csv')) {
				if (uploadType === 'gamAdUnits') {
					setAdUnitsFileName('');
				} else if (uploadType === 'lineItems') {
					setLineItemsFileName('');
				} else if (uploadType === 'blacklistedLineItems') {
					setBlacklistedItemsFileName('');
				}

				showNotification({
					mode: 'error',
					title: 'Operation Failed',
					message: 'Only csv files are allowed',
					autoDismiss: 5
				});
				return;
			}
			const fileName = e.target.value;
			const fileToBeParsed = e.target.files[0];

			if (uploadType === 'gamAdUnits') {
				setAdUnitsFileName(fileName);
			} else if (uploadType === 'lineItems') {
				setLineItemsFileName(fileName);
			} else if (uploadType === 'blacklistedLineItems') {
				setBlacklistedItemsFileName(fileName);
			}
			parseFile(uploadType, fileToBeParsed);
		},
		[parseFile, showNotification]
	);

	const handleGAM = e => {
		const { value } = e.target;
		if (!value.endsWith('.csv')) {
			setAdUnitsFileName('');
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Only csv files are allowed',
				autoDismiss: 5
			});
		}
		const fileToBeParsed = e.target.files[0];
		setAdUnitsFileName(value);
		parseFile('gamAdUnits', fileToBeParsed);
		return null;
	};

	const handleInputchange = useCallback(
		e => {
			if (!isPnpSiteIdSynced) {
				updatePnPConfigKey(siteId, 'pnpSiteId', e.target.value);
			}
		},
		[siteId, updatePnPConfigKey, isPnpSiteIdSynced]
	);

	const handleReset = useCallback(() => {
		setAdUnitsFileName('');
		setLineItemsFileName('');
		setBlacklistedItemsFileName('');
		fetchPnPData();
	}, [fetchPnPData]);

	const handleSave = () => {
		const { dataForAuditLogs } = props;
		const updaedPnpConfig = {
			adUnits,
			lineItems,
			blacklistedLineItems,
			pnpSiteId,
			native,
			outstream,
			isHouseLineItemQuickReplaceEnabled,
			filledInsertionTrigger,
			unfilledInsertionTrigger,
			refreshType,
			siteId
		};
		const payload = {
			pnpConfig: updaedPnpConfig,
			isPnpSiteIdSynced,
			dataForAuditLogs: { ...dataForAuditLogs, prevConfig }
		};
		setIsLoading(true);
		axios
			.put(`ops/pnp-refresh/${siteId}`, payload)
			.then(res => {
				const { data: config } = res.data || {};
				updatePnPConfig(siteId, config);
				if (!isPnpSiteIdSynced && pnpSiteId) {
					setIsPnpSiteIdSynced(true);
				}
				showNotification({
					mode: 'success',
					title: 'Success',
					message: 'Successfully created pnp config',
					autoDismiss: 5
				});
			})
			.catch(err => {
				const {
					data: { data: error }
				} = err.response;
				showNotification({
					mode: 'error',
					title: 'Failure',
					message: error.message || 'Unable to save PnP config',
					autoDismiss: 5
				});
			})
			.finally(() => {
				setIsLoading(false);
				handleReset();
			});
	};

	const renderView = () => (
		<div>
			<FieldGroup
				name="GAM Ad Units"
				className="u-padding-v4 u-padding-h4"
				value={adUnitsFileName}
				onChange={handleGAM}
				type="toggle-file-select-group"
				accept=".csv"
				label={uploadAdUnitsLabel}
				size={6}
				id="gamAdUnits"
				itemCollection={PNP_AD_UNIT_OPERATIONS}
				dataKey="selectedAdUnitOperation"
				fileDropdownValue={selectedAdUnitOperation}
				onFileDropdownChange={onSelectDropDown}
				fileDropdownTitle="Select Operation"
				reset
			/>
			<FieldGroup
				name="Line Items"
				value={lineItemsFileName}
				onChange={handleUploadUnits}
				accept=".csv"
				type="file"
				label={uploadLineItemsLabel}
				size={6}
				id="lineItems"
				style={PICKER_STYLE}
			/>
			<FieldGroup
				name="Blacklisted Line Items"
				value={blacklistedLineItemsFileName}
				onChange={handleUploadUnits}
				accept=".csv"
				type="file"
				label={uploadBlacklistedLineItemsLabel}
				size={6}
				id="blacklistedLineItems"
				style={PICKER_STYLE}
			/>
			<CustomToggleSwitch
				labelText="Enable native"
				className="u-margin-b4 negative-toggle"
				checked={isNativeEnabledOnAllUnits}
				onChange={handleToggle}
				layout="horizontal"
				size="m"
				on="Yes"
				off="No"
				defaultLayout
				name={`native-${siteId}-${siteDomain}`}
				id={`js-native-${siteId}-${siteDomain}`}
			/>
			<CustomToggleSwitch
				labelText="Enable outstream"
				className="u-margin-b4 negative-toggle"
				checked={isOutstreamEnabledOnAllUnits}
				onChange={handleToggle}
				layout="horizontal"
				size="m"
				on="Yes"
				off="No"
				defaultLayout
				name={`outstream-${siteId}-${siteDomain}`}
				id={`js-outstream-${siteId}-${siteDomain}`}
			/>
			<CustomToggleSwitch
				labelText="Enable House lineitem Quick Replace"
				className="u-margin-b4 negative-toggle"
				checked={isHouseLineItemQuickReplaceEnabled}
				onChange={handleHosueLineItemQuickReplaceToggle}
				disabled={!isPublisherGamAvailable}
				layout="horizontal"
				size="m"
				on="Yes"
				off="No"
				defaultLayout
				name="isHouseLineItemQuickReplaceEnabled"
				id="house-lineitem-quick-refresh-toggle"
			/>
			<div className="refresh-rate" style={{ display: 'flex' }}>
				<p className="u-text-bold u-margin-b4">Filled Inventory Insertion Trigger</p>
				<SelectBox
					selected={filledInsertionTrigger || defaultFilledInsertionTrigger.value}
					options={REFRESH_RATE_ENTRIES}
					onSelect={onSelect}
					id="select-entry"
					title="Select Entry"
					dataKey="filledInsertionTrigger"
					style={SELECT_BOX_STYLE}
					className="filled-refresh-rate"
				/>
			</div>
			<div className="refresh-rate" style={{ display: 'flex' }}>
				<p className="u-text-bold u-margin-b4">Unfilled Inventory Insertion Trigger</p>
				<SelectBox
					selected={unfilledInsertionTrigger || defaultUnfilledInsertionTrigger.value}
					options={UNFILLED_REFRESH_RATE_ENTRIES}
					onSelect={onSelect}
					id="select-entry"
					title="Select Entry"
					dataKey="unfilledInsertionTrigger"
					style={SELECT_BOX_STYLE}
					className="unfilled-refresh-rate"
				/>
			</div>
			<div className="refresh-rate" style={{ display: 'flex' }}>
				<p className="u-text-bold u-margin-b4">Replace Type</p>
				<SelectBox
					selected={refreshType}
					options={PNP_REPLACE_TYPES}
					onSelect={onSelect}
					id="select-entry"
					title="Select Entry"
					dataKey="refreshType"
					reset
					style={SELECT_BOX_STYLE}
					className="refresh-type"
				/>
			</div>
			<FieldGroup
				label="PnP Site ID"
				name="pnpSiteId"
				value={pnpSiteId}
				type="number"
				onChange={handleInputchange}
				readOnly={isPnpSiteIdSynced}
				size={6}
				id={`pnpSiteId-input-${siteId}-${siteDomain}`}
				className="u-padding-v4 u-padding-h4"
				style={PICKER_STYLE}
			/>
			<div style={{ display: 'block' }}>
				<CustomButton variant="primary" bsSize="large" onClick={showUploadedAdUnits}>
					Show Uploaded Ad Units
				</CustomButton>
				<CSVLink
					headers={adUnitsHeaders}
					data={adUnits}
					filename="UploadedAdUnits.csv"
					className="downloadBtnStyles"
				>
					<CustomButton variant="primary" bsSize="large">
						Download Uploaded Ad Units
					</CustomButton>
				</CSVLink>
				<CSVLink
					headers={[{ label: 'Line Item ID', key: 'id' }]}
					data={lineItems}
					filename="lineItems.csv"
					className="downloadBtnStyles"
				>
					<CustomButton variant="primary" bsSize="large">
						Download Uploaded Line Items
					</CustomButton>
				</CSVLink>
				<CSVLink
					headers={[{ label: 'Line Item ID', key: 'id' }]}
					data={blacklistedLineItems}
					filename="blacklistedLineItems.csv"
					className="downloadBtnStyles"
				>
					<CustomButton variant="primary" bsSize="large">
						Download Uploaded Blacklisted Line Items
					</CustomButton>
				</CSVLink>
			</div>
			<CustomButton
				variant="secondary"
				className="pull-right u-margin-r3 u-margin-t4"
				onClick={handleReset}
				disabled={isLoading}
				showSpinner={isLoading}
			>
				Reset
			</CustomButton>
			<CustomButton
				type="submit"
				variant="primary"
				className="pull-right u-margin-r3 u-margin-t4"
				onClick={handleSave}
				disabled={isLoading}
				showSpinner={isLoading}
			>
				Save
			</CustomButton>
		</div>
	);

	if (!apps.pnp) return null;
	return (
		<div className="u-margin-t4">
			<PanelGroup
				accordion
				id={`pnp-panel-${siteId}-${siteDomain}`}
				activeKey={activeKey}
				onSelect={setActiveKey}
			>
				<Panel eventKey="pnp">
					<Panel.Heading>
						<Panel.Title toggle>Plug and Play Refresh</Panel.Title>
					</Panel.Heading>
					{activeKey === 'pnp' ? <Panel.Body collapsible>{renderView()}</Panel.Body> : null}
				</Panel>
			</PanelGroup>
			<AdUnitsModal
				show={showAdUnitsModal}
				onHide={hideAdUnitsModal}
				units={adUnits}
				onActiveChange={handleAdUnitActiveToggle}
				onMultiFormatChange={handleAdUnitMultiformatToggle}
			/>
		</div>
	);
};
export default PnP;
