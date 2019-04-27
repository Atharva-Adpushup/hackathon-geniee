import $ from 'jquery';
import Selectorator from 'libs/cssSelectorator';
import Utils from 'libs/utils';
import { uiModes } from 'consts/commonConsts';
import { highlightElement, setElementSelectorCords, hideHighlighter } from '../../actions/inner/actions';
import { sendMessage } from './messengerHelper';
import { messengerCommands } from '../../consts/commonConsts';
import IncontentAnalyzer from 'libs/IncontentAnalyzer';

const selectorator = new Selectorator(),
	events = 'click mouseup mouseleave mousedown mouseover',
	getInsertOptions = el => {
		switch (el.nodeName.toLowerCase()) {
			case 'table':
			case 'ul':
			case 'img':
			case 'input':
			case 'textarea':
			case 'button':
			case 'embed':
				return ['Insert After', 'Insert Before'];

			case 'li':
			case 'td':
				return ['Append', 'Prepend'];

			default:
				return ['Append', 'Prepend', 'Insert After', 'Insert Before'];
		}
	},
	getAdpVitals = ($el, force = false) => {
		if (
			!force &&
			($el.get(0).tagName === 'HTML' ||
				$el.get(0).tagName === 'BODY' ||
				$el.hasClass('_ap_reject') ||
				$el.parents().hasClass('_ap_reject'))
		) {
			return false;
		}
		const xpath = selectorator.generate($el)[0],
			insertOptions = getInsertOptions($el.get(0)),
			position = Utils.dom.getElementBounds($el),
			parents = [{ xpath, tagName: $el.prop('tagName') }],
			firstFold = Utils.dom.isElementInFirstFold($el);

		$el.parents().each((index, parent) => {
			if (parent.tagName !== 'HTML' && parent.tagName !== 'BODY') {
				parents.push({
					xpath: selectorator.generate($(parent))[0],
					tagName: parent.tagName
				});
			}
		});

		return { xpath, insertOptions, parents, position, firstFold };
	},
	getAllXPaths = xpath => selectorator.generate($(xpath)),
	isValidXPath = xpath => {
		try {
			return $(xpath).length ? true : false;
		} catch (err) {
			return false;
		}
	},
	updateAdSize = data => {
		let adSelector = `#ad-${data.adId}`,
			$el = $(adSelector),
			isElement = !!($el && $el.length),
			isSizeObject = !!(
				data.sizeObject &&
				Object.keys(data.sizeObject).length &&
				data.sizeObject.width &&
				data.sizeObject.height
			),
			isDataValid = !!(isElement && isSizeObject);

		if (!isDataValid) {
			return false;
		}

		const width = data.sizeObject.width,
			height = data.sizeObject.height,
			sizeString = `${width} X ${height}`,
			sizeObject = { width: `${width}px`, height: `${height}px` };

		$el.css(sizeObject)
			.find('> ul.tags > li:nth-child(2) > .tag')
			.text(sizeString)
			.end()
			.closest('._ap_reject')
			.parent()
			.css(sizeObject);

		// For testing
		placeIncontentAds();

		return true;
	},
	placeIncontentAds = () => {
		const placeAd = function(adObject, $element) {
			var $container = $('<div/>');
			var css = $.extend({}, adObject.css, adObject.customCSS, {
				width: adObject.width + 'px',
				height: adObject.height + 'px',
				background: '#ffff0040',
				boxShadow: 'rgb(0, 0, 0) 0px 0px 0px 2px inset',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			});
			var attributes = {
				sectionNumber: adObject.section,
				minDistanceFromPrevAd: adObject.minDistanceFromPrevAd,
				selectorsTreeLevel: adObject.selectorsTreeLevel
			};
			var htmlString = adObject.section + ', ' + adObject.width + 'x' + adObject.height;
			var $strongEl = $('<strong />').text(htmlString);

			$container
				.css(css)
				.attr(attributes)
				.addClass('_ap_apex_ad')
				.append($strongEl);
			$element.after($container);
		};
		const setContentOverlayHeight = function($element) {
			const $contentOverlayEl = $('._ap_contentOverlay._ap_reject');

			$contentOverlayEl.css({ height: `${$element.height()}px` });
		};
		const removeExistingAds = function($element) {
			$('._ap_apex_ad', $element).remove();
		};

		const parameters = {
			$,
			$selector: $('.region-content-inner'),
			placementConfig: [
				{
					id: 'd010f958-1466-4244-b8e5-875db679e3d4',
					network: 'custom',
					css: {
						'margin-left': 'auto',
						'margin-right': 'auto',
						'margin-top': '0px',
						'margin-bottom': '0px',
						clear: 'both'
					},
					height: 250,
					width: 300,
					isIncontent: true,
					float: 'left',
					minDistanceFromPrevAd: '200',
					ignoreXpaths: [],
					section: 1,
					customCSS: { 'margin-top': '10px', 'margin-bottom': '10px' },
					networkData: { adCode: 'c29tZSBhZCBjb2RlIDEuLi4=', refreshSlot: false, logWritten: true }
				},
				{
					id: '95281ad5-783f-429e-9337-b974760bbafb',
					network: 'custom',
					css: {
						'margin-left': 'auto',
						'margin-right': 'auto',
						'margin-top': '0px',
						'margin-bottom': '0px',
						clear: 'both'
					},
					height: 250,
					width: 300,
					isIncontent: true,
					float: 'left',
					minDistanceFromPrevAd: '200',
					ignoreXpaths: [],
					section: 2,
					customCSS: { 'margin-top': '10px', 'margin-bottom': '10px' },
					networkData: { adCode: 'c29tZSBhZCBjb2RlIDIuLi4=', refreshSlot: false, logWritten: true }
				},
				{
					id: '95281ad5-783f-429e-9337-b974760bbafb',
					network: 'custom',
					css: {
						'margin-left': 'auto',
						'margin-right': 'auto',
						'margin-top': '0px',
						'margin-bottom': '0px',
						clear: 'both'
					},
					height: 250,
					width: 300,
					isIncontent: true,
					minDistanceFromPrevAd: '200',
					ignoreXpaths: [],
					section: 3,
					customCSS: { 'margin-top': '10px', 'margin-bottom': '10px' },
					networkData: { adCode: 'c29tZSBhZCBjb2RlIDIuLi4=', refreshSlot: false, logWritten: true }
				},
				{
					id: '95281ad5-783f-429e-9337-b974760bbafb',
					network: 'custom',
					css: {
						'margin-left': 'auto',
						'margin-right': 'auto',
						'margin-top': '0px',
						'margin-bottom': '0px',
						clear: 'both'
					},
					height: 250,
					width: 300,
					isIncontent: true,
					float: 'left',
					minDistanceFromPrevAd: '200',
					ignoreXpaths: [],
					section: 4,
					customCSS: { 'margin-top': '10px', 'margin-bottom': '10px' },
					networkData: { adCode: 'c29tZSBhZCBjb2RlIDIuLi4=', refreshSlot: false, logWritten: true }
				},
				{
					id: '95281ad5-783f-429e-9337-b974760bbafb',
					network: 'custom',
					css: {
						'margin-left': 'auto',
						'margin-right': 'auto',
						'margin-top': '0px',
						'margin-bottom': '0px',
						clear: 'both'
					},
					height: 250,
					width: 300,
					isIncontent: true,
					float: 'left',
					minDistanceFromPrevAd: '200',
					ignoreXpaths: [],
					section: 5,
					customCSS: { 'margin-top': '10px', 'margin-bottom': '10px' },
					networkData: { adCode: 'c29tZSBhZCBjb2RlIDIuLi4=', refreshSlot: false, logWritten: true }
				},
				{
					id: '95281ad5-783f-429e-9337-b974760bbafb',
					network: 'custom',
					css: {
						'margin-left': 'auto',
						'margin-right': 'auto',
						'margin-top': '0px',
						'margin-bottom': '0px',
						clear: 'both'
					},
					height: 250,
					width: 300,
					isIncontent: true,
					float: 'left',
					minDistanceFromPrevAd: '200',
					ignoreXpaths: [],
					section: 6,
					customCSS: { 'margin-top': '10px', 'margin-bottom': '10px' },
					networkData: { adCode: 'c29tZSBhZCBjb2RlIDIuLi4=', refreshSlot: false, logWritten: true }
				}
			],
			doneCallback: placementData => {
				const isPlacementData = !!(placementData && Object.keys(placementData).length);

				if (!isPlacementData) {
					return false;
				}

				Object.keys(placementData).forEach(placementId => {
					const placementObject = placementData[placementId];
					const $el = placementObject.elem;
					const adObject = parameters.placementConfig.filter(
						object => Number(object.section) === Number(placementId)
					);
					const isValidDataToPlaceAd = !!($el && adObject && adObject.length);

					if (isValidDataToPlaceAd) {
						placeAd(adObject[0], $el);
					}
				});

				setContentOverlayHeight(parameters.$selector);
			}
		};

		removeExistingAds(parameters.$selector);
		setContentOverlayHeight(parameters.$selector);
		IncontentAnalyzer(parameters);
	},
	scrollToView = adId => {
		let id = `#ad-${adId}`,
			ele = $(id);

		$('html, body').animate(
			{
				scrollTop: ele.offset().top
			},
			500
		);

		ele.css('border', '3px solid #cf474b');
		return true;
	},
	initDomEvents = ({ getState, dispatch }) => {
		$(document).ready(() => {
			sendMessage(messengerCommands.CM_FRAMELOAD_SUCCESS, { channelId: window.ADP_CHANNEL_ID });
		});

		$('html')
			.off()
			.on(events, e => {
				// isScriptedEvent, a variable that checks whether e was triggered by a script or not
				const isScriptedEvent =
						typeof e.originalEvent === 'undefined' ||
						(e.originalEvent.hasOwnProperty('isTrusted') && !e.originalEvent.isTrusted) ||
						(e.originalEvent.screenX === 0 && e.originalEvent.screenY === 0),
					state = getState(),
					$target = $(e.target);

				if (!isScriptedEvent && parseInt(state.editorViewing.mode) == uiModes.EDITOR_MODE) {
					e.preventDefault();

					switch (e.type) {
						case 'mouseover':
							dispatch(highlightElement($target));
							break;

						case 'click':
							const vitals = getAdpVitals($target);
							if (vitals) {
								sendMessage(messengerCommands.SHOW_INSERT_CONTEXTMENU, {
									position: vitals.position,
									parents: vitals.parents,
									insertOptions: vitals.insertOptions,
									firstFold: vitals.firstFold
								});
								dispatch(setElementSelectorCords(Utils.ui.getElementSelectorCords($target)));
							}
							break;
						default:
							return;
					}
				}
			});
	};

export { initDomEvents, getAdpVitals, getAllXPaths, isValidXPath, scrollToView, updateAdSize };
