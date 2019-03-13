import React from 'react';
import {
	Row,
	Col,
	ListGroup,
	ListGroupItem,
	FormGroup,
	InputGroup,
	FormControl
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEdit, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomButton from '../CustomButton/index';
import PlaceHolder from '../PlaceHolder/index';
import OverlayTooltip from '../OverlayTooltip/index';
import { getDuplicatesInArray, getTruthyArray, isItemInArray } from '../../helpers/commonFunctions';

library.add(faEdit, faTimesCircle);

class UiList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeItemValue: '',
			activeItemKey: '',
			collection: props.itemCollection
		};
		this.constants = {
			plugins: {
				URL_HTTP_HTTPS: 'url-http-https'
			},
			regex: {
				URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
				HTTPS_PREFIX: /^https:\/\//,
				HTTP_PREFIX: /^http:\/\//
			}
		};

		const {
			plugins: { URL_HTTP_HTTPS }
		} = this.constants;
		this.plugins = [URL_HTTP_HTTPS];
	}

	applyUrlHttpHttpsPlugin = collection => {
		const inputCollection = collection.concat([]);
		const { regex } = this.constants;

		collection.forEach((item, idx) => {
			const { URL, HTTPS_PREFIX, HTTP_PREFIX } = regex;
			const isValidItem = !!item;
			const isValidURL = !!(isValidItem && URL.test(item));

			if (!isValidURL) {
				return true;
			}

			const isHttpsUrlPrefix = HTTPS_PREFIX.test(item);
			const isHttpUrlPrefix = HTTP_PREFIX.test(item);
			const isValidUrlWithoutProtocol = !!(isValidURL && !isHttpUrlPrefix && !isHttpsUrlPrefix);
			const computedReplaceeArray = isHttpUrlPrefix || isHttpsUrlPrefix ? [item] : [];
			let computedItemString;
			let computedProtoColSuffix;

			if (isValidUrlWithoutProtocol) {
				computedItemString = `http://${item}`;
				if (!isItemInArray(computedItemString, inputCollection)) {
					computedReplaceeArray.push(computedItemString);
				}

				computedItemString = `https://${item}`;
				if (!isItemInArray(computedItemString, inputCollection)) {
					computedReplaceeArray.push(computedItemString);
				}
			} else if (isHttpsUrlPrefix) {
				// Below variable gets the remaining item value by removing https prefix
				computedProtoColSuffix = item.substring(8);
				computedItemString = `http://${computedProtoColSuffix}`;
				if (!isItemInArray(computedItemString, inputCollection)) {
					computedReplaceeArray.push(computedItemString);
				}
			} else if (isHttpUrlPrefix) {
				// Below variable gets the remaining item value by removing http prefix
				computedProtoColSuffix = item.substring(7);
				computedItemString = `https://${computedProtoColSuffix}`;
				if (!isItemInArray(computedItemString, inputCollection)) {
					computedReplaceeArray.push(computedItemString);
				}
			}

			if (computedReplaceeArray) {
				const computedIdx = inputCollection.indexOf(collection[idx]);
				inputCollection.splice(computedIdx, 1, ...computedReplaceeArray);
			}

			return true;
		});

		return inputCollection;
	};

	applyPlugins = collection => {
		const isActivePlugins = this.isActivePlugins();

		if (!isActivePlugins) {
			return collection;
		}

		const { plugins } = this.props;
		const {
			plugins: { URL_HTTP_HTTPS }
		} = this.constants;
		let inputCollection = collection.concat([]);

		plugins.forEach(plugin => {
			switch (plugin) {
				case URL_HTTP_HTTPS:
					inputCollection = this.applyUrlHttpHttpsPlugin(inputCollection);
					break;

				default:
					break;
			}
		});

		return inputCollection;
	};

	updateItem = () => {
		const { activeItemKey, activeItemValue, collection } = this.state;
		const { validate, isSeparateSaveButton } = this.props;
		const isValidActiveItemKey = !!(activeItemKey !== null && activeItemKey !== '');
		const isValidActiveItemValue = !!activeItemValue;
		const isValidActiveItem = !!(isValidActiveItemKey && isValidActiveItemValue);
		const computedItemAction = isValidActiveItemKey ? 'update' : 'add';
		const confirmMessage = `Are you sure you want to ${computedItemAction} ${activeItemValue}`;
		const emptyValueAlertMessage = 'Please fill empty value';
		let inputCollection = collection.concat([]);

		if (!isValidActiveItemValue) {
			window.alert(emptyValueAlertMessage);
			return false;
		}

		const confirmationMessage = window.confirm(confirmMessage);
		if (!confirmationMessage) {
			return false;
		}

		const bulkEntriesResult = this.isBulkEntries(activeItemValue);
		const isBulkEntries = !!(
			bulkEntriesResult &&
			Object.keys(bulkEntriesResult).length &&
			bulkEntriesResult.array &&
			bulkEntriesResult.length
		);
		const isActiveItemBulkEntries = !!(isValidActiveItem && isBulkEntries);

		if (isActiveItemBulkEntries) {
			inputCollection.splice(activeItemKey, 1, ...bulkEntriesResult.array);
		} else if (isBulkEntries) {
			bulkEntriesResult.array.forEach(item => inputCollection.push(item));
		} else if (isValidActiveItem) {
			inputCollection[activeItemKey] = activeItemValue;
		} else {
			inputCollection.push(activeItemValue);
		}

		const duplicateItems = getDuplicatesInArray(inputCollection).duplicates;
		const isValidDuplicateItems = !!(validate && duplicateItems && duplicateItems.length);

		if (isValidDuplicateItems) {
			const computedDuplicateItemPrefixMessage = isValidActiveItem
				? 'These values are already present in list:'
				: 'These values are duplicate:';
			const duplicateItemsMessage = `${computedDuplicateItemPrefixMessage} ${duplicateItems.join(
				', '
			)}. Please delete them first.`;

			window.alert(duplicateItemsMessage);
			return false;
		}

		inputCollection = this.applyPlugins(inputCollection);

		return this.setState(
			{ collection: inputCollection, activeItemKey: '', activeItemValue: '' },
			() => {
				if (!isSeparateSaveButton) {
					this.masterSaveData(inputCollection);
				}
			}
		);
	};

	deleteItem = key => {
		const { collection } = this.state;
		const { isSeparateSaveButton } = this.props;
		const item = collection[key];
		const message = `Are you sure you want to delete ${item}`;
		const inputCollection = collection.concat([]);

		if (window.confirm(message)) {
			inputCollection.splice(key, 1);
			this.setState({ collection: inputCollection, activeItemValue: '', activeItemKey: '' }, () => {
				if (!isSeparateSaveButton) {
					this.masterSaveData(inputCollection);
				}
			});
		}
	};

	editItem = key => {
		const { collection, activeItemKey } = this.state;
		const inputCollection = collection.concat([]);
		const isValidActiveItem = !!(activeItemKey === Number(key));
		let computedActiveItem;
		let computedActiveItemKey;

		if (!isValidActiveItem) {
			computedActiveItem = inputCollection[key];
			computedActiveItemKey = key;
		} else {
			computedActiveItem = '';
			computedActiveItemKey = '';
		}

		this.setState({
			activeItemValue: computedActiveItem,
			activeItemKey: computedActiveItemKey ? Number(computedActiveItemKey) : ''
		});
	};

	masterSaveData = inputCollection => {
		const { collection } = this.state;
		const { onSave } = this.props;
		const computedCollection = inputCollection || collection;

		onSave(computedCollection);
		return true;
	};

	generatePlaceHolder = () => {
		const { emptyCollectionPlaceHolder } = this.props;

		return <PlaceHolder rootClassName="u-margin-b4">{emptyCollectionPlaceHolder}</PlaceHolder>;
	};

	generateContent = () => {
		const _ref = this;
		const { collection, activeItemKey } = _ref.state;
		const isItemCollection = !!(collection && collection.length);

		return isItemCollection ? (
			<ListGroup className="u-margin-b4">
				{collection.map((itemValue, itemKey) => {
					const listItemKey = `blocklist-item-${itemKey}`;
					const isActiveItem = !!(itemKey === activeItemKey);
					const computedActiveClassName = isActiveItem ? ' is-active' : '';
					const computedRootClassName = `u-padding-3 aligner aligner--row u-margin-b3${computedActiveClassName}`;
					let computedEditTooltipText = isActiveItem ? 'Click to unselect' : 'Click to edit';

					computedEditTooltipText = `${computedEditTooltipText} this value below`;

					return (
						<ListGroupItem key={listItemKey} className={computedRootClassName}>
							<div className="aligner-item">{itemValue}</div>
							<div className="aligner-item aligner aligner--row aligner--vCenter aligner--hEnd">
								<OverlayTooltip
									id="tooltip-edit-item-info"
									placement="top"
									tooltip={computedEditTooltipText}
								>
									<FontAwesomeIcon
										data-key={`${itemKey}-edit`}
										size="1x"
										icon="edit"
										className="u-margin-r3 u-cursor-pointer"
										data-name="edit"
										onClick={_ref.handleClickHandler}
									/>
								</OverlayTooltip>

								<OverlayTooltip
									id="tooltip-delete-item-info"
									placement="top"
									tooltip="Click to delete this value"
								>
									<FontAwesomeIcon
										data-key={`${itemKey}-delete`}
										size="1x"
										icon="times-circle"
										className="u-cursor-pointer"
										data-name="delete"
										onClick={_ref.handleClickHandler}
									/>
								</OverlayTooltip>
							</div>
						</ListGroupItem>
					);
				})}
			</ListGroup>
		) : (
			_ref.generatePlaceHolder()
		);
	};

	handleClickHandler = inputParam => {
		const { target } = inputParam;
		const isPathElement = !!(target && target.parentNode.tagName.toUpperCase() === 'SVG');
		let computedElement;

		if (isPathElement) {
			computedElement = target.parentNode;
		} else {
			computedElement = target;
		}

		const name = computedElement.getAttribute('data-name');
		const keyString = computedElement.getAttribute('data-key');
		const computedItemKey = keyString.split('-')[0];

		switch (name) {
			case 'edit':
				this.editItem(computedItemKey);
				break;

			case 'delete':
				this.deleteItem(computedItemKey);
				break;

			case 'save':
				this.updateItem();
				break;

			case 'separate-save':
				this.masterSaveData();
				break;

			default:
				break;
		}
	};

	isBulkEntries = inputValue => {
		const computedArray = inputValue
			.split(',')
			.map(value => value.trim())
			.filter(value => !!value);
		const isValidArray = !!(computedArray && computedArray.length);
		const resultArray = isValidArray
			? { array: computedArray, length: computedArray.length }
			: null;

		return resultArray;
	};

	isActivePlugins = () => {
		const { plugins } = this.props;
		const pluginsArray = this.plugins;
		const isValidPlugins = !!(plugins && plugins.length);
		// Below array map checks whether atleast one valid plugin is present in 'plugins' prop
		const isValid = !!(
			isValidPlugins &&
			getTruthyArray(
				plugins.map(plugin => !!(plugin && pluginsArray.includes(plugin.toLowerCase())))
			).length
		);

		return isValid;
	};

	renderActionInputGroup = () => {
		const {
			inputPlaceholder,
			saveButtonText,
			sticky,
			separateSaveButtonText,
			isSeparateSaveButton
		} = this.props;
		const { activeItemValue, activeItemKey } = this.state;
		const isActiveItem = !!(
			activeItemValue &&
			activeItemKey !== '' &&
			!Number.isNaN(activeItemKey)
		);
		const isValidSeparateSaveButtonProp = !!(isSeparateSaveButton && separateSaveButtonText);
		const computedActiveFormControlClassName = isActiveItem ? 'u-box-shadow-active' : '';
		const computedStickyClassName = sticky ? 'u-position-sticky u-bg-color-white' : '';
		const computedFormGroupMarginClassName = isValidSeparateSaveButtonProp ? 'u-margin-b3' : '';
		const computedRootElClassName = `u-margin-b4 ${computedStickyClassName}`;
		const computedInputGroupButtonVariant = isValidSeparateSaveButtonProp ? 'secondary' : 'primary';

		return (
			<div className={computedRootElClassName}>
				<FormGroup className={computedFormGroupMarginClassName}>
					<InputGroup>
						<FormControl
							type="text"
							value={activeItemValue}
							placeholder={inputPlaceholder}
							onChange={e => this.setState({ activeItemValue: e.target.value })}
							className={computedActiveFormControlClassName}
						/>
						<InputGroup.Button>
							<CustomButton
								variant={computedInputGroupButtonVariant}
								className=""
								name="blocklist-save-button"
								data-name="save"
								data-key="0-save"
								onClick={this.handleClickHandler}
							>
								{saveButtonText}
							</CustomButton>

							{/* <Button>Before</Button> */}
						</InputGroup.Button>
					</InputGroup>
				</FormGroup>
				{isValidSeparateSaveButtonProp ? (
					<div className="aligner aligner--hEnd">
						<CustomButton
							variant="primary"
							className=""
							name="blocklist-separate-save-button"
							data-name="separate-save"
							data-key="0-separate-save"
							onClick={this.handleClickHandler}
						>
							{separateSaveButtonText}
						</CustomButton>
					</div>
				) : null}
			</div>
		);
	};

	render() {
		const { rootClassName } = this.props;
		const computedRootClassName = `layout-uiList ${rootClassName}`;
		const uiListItems = this.generateContent();
		const actionInputGroup = this.renderActionInputGroup();

		return (
			<Row className={computedRootClassName}>
				<Col className="u-margin-0 u-padding-0 layout-uiList-cols">
					{actionInputGroup}
					{uiListItems}
				</Col>
			</Row>
		);
	}
}

UiList.propTypes = {
	rootClassName: PropTypes.string,
	separateSaveButtonText: PropTypes.string,
	sticky: PropTypes.bool,
	validate: PropTypes.bool,
	isSeparateSaveButton: PropTypes.bool,
	plugins: PropTypes.array,
	itemCollection: PropTypes.array.isRequired,
	emptyCollectionPlaceHolder: PropTypes.string.isRequired,
	inputPlaceholder: PropTypes.string.isRequired,
	saveButtonText: PropTypes.string.isRequired,
	onSave: PropTypes.func.isRequired
};

UiList.defaultProps = {
	rootClassName: '',
	separateSaveButtonText: '',
	sticky: false,
	validate: true,
	isSeparateSaveButton: false,
	plugins: []
};

// Example props values
// plugins: ['url-http-https']

export default UiList;
