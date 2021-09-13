import React, { useState } from 'react';
import { Panel, PanelGroup } from '@/Client/helpers/react-bootstrap-imports';

import GroupSelect from '../../../../../../Components/GroupSelect';
import CustomButton from '../../../../../../Components/CustomButton/index';
import { LINE_ITEM_TYPES } from '../../../../../../../configs/lineItemsConstants';

const LineItemTypeRefresh = ({ site, updateSiteData, updateSite }) => {
	const [activeKey, setActiveKey] = useState(null);

	const { lineItemTypes: selectedLineItemTypes = [], siteId, siteDomain } = site;

	const dataForAuditLogs = {
		appName: 'LineItemTypeRefreshPanel',
		siteDomain: site.domain
	};

	const allLineItemTypesList = LINE_ITEM_TYPES.map(type => {
		if (selectedLineItemTypes.includes(type.value) || type.isMandatory) {
			return {
				...type,
				isDisabled: true,
				disabledMessage: 'Item already selected'
			};
		}
		return type;
	});

	const selectedLineItemTypeList = LINE_ITEM_TYPES.filter(
		type => selectedLineItemTypes.includes(type.value) || (!type.isDisabled && type.isMandatory)
	);

	const onItemSelected = item => {
		const existingLineItemsList = site.lineItemTypes || [];
		const newSiteData = {
			...site,
			lineItemTypes: [...existingLineItemsList, item.value]
		};
		updateSiteData(site.siteId, newSiteData);
	};

	const onRemoveItem = item => {
		const existingLineItemsList = site.lineItemTypes || [];
		const newLineItemsList = existingLineItemsList.filter(type => type !== item.value);
		const newSiteData = {
			...site,
			lineItemTypes: [...newLineItemsList]
		};
		updateSiteData(site.siteId, newSiteData);
	};

	const handleSave = () => {
		updateSite(
			site.siteId,
			[
				{ key: 'lineItemTypes', value: selectedLineItemTypes, replace: true, requireResponse: true }
			],
			{
				...dataForAuditLogs,
				actionInfo: 'Line Item Type Refresh'
			}
		);
	};

	const renderView = () => (
		<div>
			<GroupSelect
				title="Line Item Types"
				itemsList={allLineItemTypesList}
				selectedItems={selectedLineItemTypeList}
				onItemSelect={onItemSelected}
				onRemoveItem={onRemoveItem}
			/>
			<CustomButton
				type="submit"
				variant="primary"
				className="pull-right u-margin-r3 u-margin-t4"
				onClick={handleSave}
			>
				Save
			</CustomButton>
		</div>
	);

	return (
		<div className="u-margin-t4">
			<PanelGroup
				accordion
				id={`line-item-type-panel-${siteId}-${siteDomain}`}
				activeKey={activeKey}
				onSelect={setActiveKey}
			>
				<Panel eventKey="pnp">
					<Panel.Heading>
						<Panel.Title toggle>Refresh by Line Item Types</Panel.Title>
					</Panel.Heading>
					{activeKey === 'pnp' ? <Panel.Body collapsible>{renderView()}</Panel.Body> : null}
				</Panel>
			</PanelGroup>
		</div>
	);
};

export default LineItemTypeRefresh;
