import React from 'react';
import { OverlayTrigger, Tooltip } from '@/Client/helpers/react-bootstrap-imports';
import map from 'lodash/map';
import clipboard from 'clipboard-polyfill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
	colorAndBoxShadowData,
	fontSizeData,
	zIndexData,
	iconData,
	styleElementData
} from './constants';

function LinkWithTooltip({ id, children, tooltip, placement }) {
	return (
		<OverlayTrigger
			overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
			placement={placement}
			delayShow={300}
			delayHide={150}
		>
			{children}
		</OverlayTrigger>
	);
}

function clipBoardButtonClickHandler(e) {
	const elem = e.target;
	const isIconElement = !!(
		elem &&
		elem.tagName !== 'BUTTON' &&
		(elem.parentNode.tagName === 'BUTTON' || elem.parentNode.parentNode.tagName === 'BUTTON')
	);
	const isPathElement = !!(isIconElement && elem.parentNode.parentNode.tagName === 'BUTTON');
	const isSVGElement = !!(isIconElement && elem.parentNode.tagName === 'BUTTON');
	let toCopy;

	if (isPathElement) {
		toCopy = elem.parentNode.parentNode.getAttribute('data-clipboard');
	} else if (isSVGElement) {
		toCopy = elem.parentNode.getAttribute('data-clipboard');
	} else {
		toCopy = elem.getAttribute('data-clipboard');
	}

	console.log(elem.tagName);

	clipboard.writeText(toCopy);
	window.alert('Text Copied: ' + toCopy);
}

const renderDataUI = collection => {
	return map(collection, rowCollection => (
		<div className="row">
			{map(rowCollection, (itemObject, rowItemKey) => {
				const isItemObject = !!itemObject;
				const isInlineElement = !!(isItemObject && itemObject.componentInlineText);
				const isColumnClassName = !!(isItemObject && itemObject.componentColumnClassName);
				const computedColumnClassName = isColumnClassName
					? itemObject.componentColumnClassName
					: 'col-sm-4 col-md-2 col-lg-2';

				return (
					<div className={computedColumnClassName}>
						<LinkWithTooltip
							id={`tooltip-${rowItemKey}`}
							placement="top"
							tooltip={itemObject.tooltip}
						>
							<div className="thumbnail u-border-none">
								<div className={`color-swatch ${itemObject.componentThumnailClassName}`}>
									{isInlineElement ? (
										<strong style={itemObject.componentInlineStyle}>
											{itemObject.componentInlineText}
										</strong>
									) : null}

									{itemObject.componentFontAwesomeIcon ? (
										<FontAwesomeIcon
											icon={itemObject.componentCode}
											style={itemObject.componentInlineStyle}
										/>
									) : null}

									<LinkWithTooltip
										id={`tooltip-code-${rowItemKey}`}
										placement="bottom"
										tooltip="Copy to clipboard"
									>
										<button
											type="button"
											className="button button--line"
											data-clipboard={itemObject.componentCode}
											onClick={clipBoardButtonClickHandler}
										>
											<FontAwesomeIcon icon="copy" className="" />
										</button>
									</LinkWithTooltip>
								</div>
								<div className="caption text-center">
									<h4>{itemObject.componentText}</h4>
									<h5>
										<code>{itemObject.componentCode}</code>
									</h5>
								</div>
							</div>
						</LinkWithTooltip>
					</div>
				);
			})}
		</div>
	));
};

const Theme = () => (
	<div className="container-fluid">
		<style
			dangerouslySetInnerHTML={{
				__html: styleElementData
			}}
		/>
		<h1 className="u-margin-b4">Theme</h1>
		<p>Visual Representation of our theme settings.</p>

		<div className="panel panel-default u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3 className="u-margin-0">Color & Box-Shadow</h3>
			</div>
			<div className="panel-body">{renderDataUI(colorAndBoxShadowData)}</div>
		</div>

		<div className="panel panel-default u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3 className="u-margin-0">Font Size</h3>
				<em className="panel-heading-description u-margin-t2">
					All font sizes are based on rem. 1rem equals 16px.
				</em>
			</div>
			<div className="panel-body">{renderDataUI(fontSizeData)}</div>
		</div>

		<div className="panel panel-default u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3 className="u-margin-0">zIndex</h3>
			</div>
			<div className="panel-body">{renderDataUI(zIndexData)}</div>
		</div>

		<div className="panel panel-default u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3 className="u-margin-0">Icons</h3>
			</div>
			<div className="panel-body">{renderDataUI(iconData)}</div>
		</div>
	</div>
);

export default Theme;
