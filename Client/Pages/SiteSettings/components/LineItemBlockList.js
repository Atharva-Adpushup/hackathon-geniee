/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import siteService from '../../../services/siteService';
import { errorHandler } from '../../../helpers/commonFunctions';
import MixpanelHelper from '../../../helpers/mixpanel';
import CSVReaderComponent from '../../../Components/CsvUpload';
import SelectBox from '../../../Components/SelectBox';

export default function LineItemBlockList(props) {
	const {
		siteData: { blockListedLineItems = [], siteId },
		customProps,
		user,
		showNotification,
		updateBlocklistedLineItems
	} = props;

	const selectBoxOptions = [
		{
			name: 'Append',
			value: 'append'
		},
		{
			name: 'Replace',
			value: 'replace'
		}
	];

	const [uploadedBlockListedCsv, setUploadedBlockListedCsv] = useState(null);
	const [csvAction, setCsvAction] = useState('append');
	const [isDuplicateAdded, setIsDuplicateAdded] = useState(false);
	const onSaveBlockListedLineItems = collection => {
		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain,
			csvAction
		};
		const updatedBlockListedLineItems = collection;
		return siteService
			.updateBlockListedLineItems(siteId, updatedBlockListedLineItems, {
				...dataForAuditLogs,
				actionInfo: 'Updated blockListedLineItems'
			})
			.then(() => {
				updateBlocklistedLineItems(siteId, updatedBlockListedLineItems);
				setUploadedBlockListedCsv(null);
				const dataForMixPanelLogging = {
					oldBlockListedLineItems: blockListedLineItems,
					updatedBlockListedLineItems,
					siteId,
					userEmail: user.email,
					csvAction,
					...dataForAuditLogs
				};
				MixpanelHelper.trackEvent('BlocklistLineItemUpdate', dataForMixPanelLogging);
				showNotification({
					mode: 'success',
					title: 'Settings Saved',
					message: 'Successfully saved blocklist line items setting',
					autoDismiss: 3
				});

				return true;
			})
			.catch(err => {
				errorHandler(err);

				return false;
			});
	};
	const handleCsvFileUpload = dataList => {
		/** 
	    dataList Sample
		dataList=[
			[
				"5221339618"
			],
			[
				"363122458"
			]
		] 
		*/

		const lineItemsBlocklist = [];
		const mapOfAddedValues = {};
		for (let index = 0; index < dataList.length; index += 1) {
			const value = dataList[index][0];
			if (value !== '') {
				if (!mapOfAddedValues[value]) {
					mapOfAddedValues[value] = true;
					lineItemsBlocklist.push(value);
				} else {
					setIsDuplicateAdded(true);
				}
			}
		}
		setUploadedBlockListedCsv(lineItemsBlocklist);
	};

	const isValidValue = value => !isNaN(value) && parseInt(Number(value), 10) === Number(value);

	const handleCsvFileBlocklistSave = () => {
		if (!uploadedBlockListedCsv) {
			return window.alert('Please upload CSV first.');
		}
		const isValidValuesUploaded = uploadedBlockListedCsv.every(item => isValidValue(item));
		if (!isValidValuesUploaded) {
			window.alert('Lineitems can only be numbers.Please check uploaded CSV.');
		} else {
			let finalList = null;
			if (csvAction === 'append') {
				const dataList = [...blockListedLineItems, ...uploadedBlockListedCsv];
				finalList = [...new Set(dataList)];
				const isDuplicate = dataList.length !== finalList.length;
				if (isDuplicate || isDuplicateAdded) {
					const confirmationMessage = window.confirm(
						'Duplicates line items are present, which will be removed. Please press Ok to continue.'
					);
					if (!confirmationMessage) {
						return false;
					}
				}
			} else {
				if (isDuplicateAdded) {
					const confirmationMessage = window.confirm(
						'Duplicates line items are present, which will be removed. Please press Ok to continue.'
					);
					if (!confirmationMessage) {
						return false;
					}
				}
				finalList = [...uploadedBlockListedCsv];
			}
			onSaveBlockListedLineItems(finalList);
		}
	};

	const onFileRemoved = () => {
		setUploadedBlockListedCsv(null);
	};

	return (
		<div className="clearfix">
			<h4 className="u-margin-t0 u-margin-b4 u-text-bold">Manage Refresh With Line Item IDs</h4>
			<p className="u-margin-b4">Block the following line item IDs from getting refreshed</p>
			<div className="lineitem-blocklist-container">
				<CSVLink
					headers={[{ label: 'Line Item Ids', key: 'lineItemId' }]}
					data={blockListedLineItems.map(item => ({
						lineItemId: item
					}))}
					filename="lineItemBlocklist.csv"
				>
					<div className="csvLink">
						<small>
							{' '}
							{blockListedLineItems.length
								? 'Download Blocklisted Line Items CSV'
								: 'Download Blocklisted Line Items Sample'}
						</small>
					</div>
				</CSVLink>

				<div className="csvReader">
					<CSVReaderComponent
						onFileLoadedSuccess={handleCsvFileUpload}
						uploadedBlockListedCsv={uploadedBlockListedCsv}
						onFileRemoved={onFileRemoved}
						width="80%"
						message="Upload Blocklist Line Items CSV"
					/>
					<SelectBox
						key="blocklistAction"
						id="blocklistAction"
						wrapperClassName="hb-input"
						selected={csvAction}
						options={selectBoxOptions}
						onSelect={setCsvAction}
					/>
					<div onClick={handleCsvFileBlocklistSave} className="saveUploadedCsv">
						Save
					</div>
				</div>
			</div>
		</div>
	);
}
