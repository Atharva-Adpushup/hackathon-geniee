import $ from 'jquery';
import Selectorator from 'libs/cssSelectorator';
import Utils from 'libs/utils';
import { uiModes } from 'consts/commonConsts';
import { highlightElement, setElementSelectorCords, hideHighlighter } from '../../actions/inner/actions';
import { sendMessage } from './messengerHelper';
import { messengerCommands } from '../../consts/commonConsts';
const IncontentAnalyzer = require('../../../../../services/genieeAdSyncService/adpushup.js/libs/aa');

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

		return true;
	},
	placeIncontentAds = (contentSelector, ads, globalConfig) => {
		const resultData = {
			placement: {
				count: 0,
				sectionNumbers: []
			},
			xpathMiss: {
				count: 0,
				sectionNumbers: []
			}
		};
		const parameters = {
			$,
			$selector: $(contentSelector),
			placementConfig: ads,
			...globalConfig
		};
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
			$('._ap_apex_ad', $element || $(window.document.body)).remove();
		};
		const pushDataInXpathMissFeedback = sectionNumber => {
			resultData.xpathMiss.count++;
			resultData.xpathMiss.sectionNumbers.push(sectionNumber);
		};
		const pushDataInPlacementFeedback = sectionNumber => {
			resultData.placement.count++;
			resultData.placement.sectionNumbers.push(sectionNumber);
		};
		const computeXpathMissFeedback = inputData => {
			inputData.forEach(adObject => {
				pushDataInXpathMissFeedback(adObject.section);
			});
		};
		const successCallback = placementData => {
			const isPlacementData = !!(placementData && Object.keys(placementData).length);

			if (!isPlacementData) {
				computeXpathMissFeedback(ads);
				return resultData;
			}

			ads.forEach(adObject => {
				const isAdSectionNumberPresent = !!(
					placementData.hasOwnProperty(adObject.section) && placementData[adObject.section]
				);

				if (!isAdSectionNumberPresent) {
					pushDataInXpathMissFeedback(adObject.section);
					return true;
				}

				const placementObject = placementData[adObject.section];
				const $el = placementObject && placementObject.elem;
				const isValidDataToPlaceAd = !!(placementObject && Object.keys(placementObject).length && $el);

				if (!isValidDataToPlaceAd) {
					return true;
				}

				placeAd(adObject, $el);
				pushDataInPlacementFeedback(adObject.section);
			});

			setContentOverlayHeight(parameters.$selector);
			return resultData;
		};
		const transformResultData = result => {
			const transformedResult = {
				type: 'info',
				message: `Ad placed ✅: __placedAdsCount__, section numbers: __placedAdsSectionNumbers__, 
Ad xpathMiss ❌: __xpathMissAdsCount__, section numbers: __xpathMissAdsSectionNumbers__`
			};
			const isResult = !!(result && Object.keys(result).length);
			const isValidPlacement = !!(
				isResult &&
				result.placement &&
				result.placement.count &&
				result.placement.sectionNumbers.length
			);
			const isValidXPathMiss = !!(
				isResult &&
				result.xpathMiss &&
				result.xpathMiss.count &&
				result.xpathMiss.sectionNumbers.length
			);
			const isResultSuccess = !!(isValidPlacement && !isValidXPathMiss);
			const isResultInfo = !!(isValidPlacement && isValidXPathMiss);
			const isResultFailure = !!(!isValidPlacement && isValidXPathMiss);

			if (isResultSuccess) {
				transformedResult.type = 'success';
			} else if (isResultInfo) {
				transformedResult.type = 'info';
			} else if (isResultFailure) {
				transformedResult.type = 'error';
			}

			transformedResult.message = transformedResult.message
				.replace('__placedAdsCount__', result.placement.count)
				.replace('__placedAdsSectionNumbers__', result.placement.sectionNumbers.join(', '))
				.replace('__xpathMissAdsCount__', result.xpathMiss.count)
				.replace('__xpathMissAdsSectionNumbers__', result.xpathMiss.sectionNumbers.join(', '));

			return transformedResult;
		};

		removeExistingAds(parameters.$selector);
		setContentOverlayHeight(parameters.$selector);
		return IncontentAnalyzer(parameters)
			.then(successCallback)
			.then(transformResultData);
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

export { initDomEvents, getAdpVitals, getAllXPaths, isValidXPath, scrollToView, updateAdSize, placeIncontentAds };
