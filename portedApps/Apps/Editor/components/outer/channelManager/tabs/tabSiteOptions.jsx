import { siteModes, uiModes } from 'consts/commonConsts.js';
import { Tooltip, Button, OverlayTrigger } from 'react-bootstrap';
import React, { PropTypes } from 'react';
import $ from 'jquery';
import Utils from 'libs/utils';

const showSiteModesPopover = (props, ev) => {
		const isLabelParent = $(ev.target)
				.parent()
				.hasClass('js-modes-label'),
			$el = isLabelParent ? $(ev.target).parent() : $(ev.target),
			positionOffsets = Utils.ui.outerMenuRenderPosition($el);

		props.showPublisherHelper(positionOffsets);
	},
	SiteModes = props => (
		<div className="modes modes--stateChange">
			<input
				type="radio"
				className="modes-input modes-input-off"
				name="view"
				value="editor"
				id="draftmode"
				checked={props.siteMode === siteModes.DRAFT}
				onChange={() => {}}
			/>
			<OverlayTrigger
				placement="bottom"
				overlay={
					<Tooltip id="siteModesPause">
						{props.siteMode === siteModes.DRAFT ? 'AdPushup is currently paused' : 'Pause AdPushup'}
					</Tooltip>
				}
			>
				<label
					onClick={props.showPublisherHelper}
					htmlFor="draftmode"
					className="modes-label modes-label-off js-modes-label"
				>
					<i className="fa fa-pause" />
				</label>
			</OverlayTrigger>

			<input
				type="radio"
				className="modes-input modes-input-on"
				name="view"
				value="browse"
				id="publishmode"
				checked={props.siteMode === siteModes.PUBLISH}
				onChange={() => {}}
			/>
			<OverlayTrigger
				placement="bottom"
				overlay={
					<Tooltip id="siteModesLive">
						{props.siteMode === siteModes.PUBLISH
							? 'AdPushup is currently optimizing your website'
							: 'Start Optimization'}
					</Tooltip>
				}
			>
				<label
					onClick={props.showPublisherHelper}
					htmlFor="publishmode"
					className="modes-label modes-label-on js-modes-label"
				>
					<i className="fa fa-play" />
				</label>
			</OverlayTrigger>

			<span className="modes-selection" />
		</div>
	),
	// eslint-disable-next-line react/no-multi-comp
	EditorModes = props => (
		<div className="modes">
			<input
				onChange={props.toggleEditorMode}
				type="radio"
				className="modes-input"
				name="editorMode"
				value={uiModes.EDITOR_MODE}
				id="editormode"
				defaultChecked
			/>
			<OverlayTrigger placement="bottom" overlay={<Tooltip id="editorModeTooltip">Editor Mode</Tooltip>}>
				<label htmlFor="editormode" className="modes-label modes-label-off">
					<i className="fa fa-code" />
				</label>
			</OverlayTrigger>

			<input
				onChange={props.toggleEditorMode}
				type="radio"
				className="modes-input"
				name="editorMode"
				value={uiModes.BROWSE_MODE}
				id="browsemode"
			/>
			<OverlayTrigger placement="bottom" overlay={<Tooltip id="browseModeTooltip">Browse Mode</Tooltip>}>
				<label htmlFor="browsemode" className="modes-label modes-label-on">
					<i className="fa fa-globe" />
				</label>
			</OverlayTrigger>

			<span className="modes-selection" />
		</div>
	),
	// eslint-disable-next-line react/no-multi-comp
	TabSiteOptions = props => (
		<div className="option-right">
			<EditorModes toggleEditorMode={props.toggleEditorMode} />

			<OverlayTrigger placement="bottom" overlay={<Tooltip id="masterSaveTooltip">Save changes</Tooltip>}>
				<Button
					onClick={props.masterSave}
					className="btn-sm btn-save btn-lightBg btn--success btn--icon pull-left"
				/>
			</OverlayTrigger>

			<SiteModes showPublisherHelper={showSiteModesPopover.bind(null, props)} siteMode={props.siteMode} />
		</div>
	);

TabSiteOptions.propTypes = {
	showPublisherHelper: PropTypes.func.isRequired,
	toggleEditorMode: PropTypes.func.isRequired,
	masterSave: PropTypes.func.isRequired,
	showOptionsMenu: PropTypes.func.isRequired,
	siteMode: PropTypes.number.isRequired
};

SiteModes.propTypes = {
	showPublisherHelper: PropTypes.func.isRequired,
	siteMode: PropTypes.number.isRequired
};

EditorModes.propTypes = {
	toggleEditorMode: PropTypes.func
};

export default TabSiteOptions;
