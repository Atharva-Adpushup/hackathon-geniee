import React from 'react';

import UiList from '../../../Components/Layout/UiList';
import siteService from '../../../services/siteService';
import { errorHandler } from '../../../helpers/commonFunctions';
import MixpanelHelper from '../../../helpers/mixpanel';

export default function LineItemBlockList(props) {
	const {
		siteData: { blockListedLineItems = [], siteId },
		customProps,
		user,
		showNotification,
		updateBlocklistedLineItems
	} = props;
	const onSaveBlockListedLineItems = collection => {
		const dataForAuditLogs = {
			appName: customProps.appName,
			siteDomain: user.sites[siteId].domain
		};
		const updatedBlockListedLineItems = collection;
		return siteService
			.updateBlockListedLineItems(siteId, updatedBlockListedLineItems, {
				...dataForAuditLogs,
				actionInfo: 'Updated blockListedLineItems'
			})
			.then(() => {
				updateBlocklistedLineItems(siteId, updatedBlockListedLineItems);
				const dataForMixPanelLogging = {
					oldBlockListedLineItems: blockListedLineItems,
					updatedBlockListedLineItems,
					siteId,
					userEmail: user.email,
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
	return (
		<div className="clearfix">
			<h4 className="u-margin-t0 u-margin-b4 u-text-bold">Manage Refresh With Line Item IDs</h4>
			<p className="u-margin-b4">Block the following line item IDs from getting refreshed</p>
			<UiList
				itemCollection={blockListedLineItems}
				emptyCollectionPlaceHolder="No blocklist added"
				inputPlaceholder="Enter comma separated line item ID to block them from getting refreshed"
				saveButtonText="Add"
				itemUpdateSaveButtonText="Update"
				sticky
				validate
				plugins={['url-remove-protocol-prefix']}
				separateSaveButtonText="Save Data"
				onSave={onSaveBlockListedLineItems}
			/>
		</div>
	);
}
