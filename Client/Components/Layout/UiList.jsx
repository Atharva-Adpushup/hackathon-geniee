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

library.add(faEdit, faTimesCircle);

class UiList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeItemValue: '',
			activeItemKey: '',
			collection: props.itemCollection
		};
	}

	updateItem = () => {
		const { activeItemValue, activeItemKey, collection } = this.state;
		const item = collection[activeItemKey];
		const message = `Are you sure you want to update ${item}`;

		if (window.confirm(message)) {
			collection[activeItemKey] = activeItemValue;
			this.setState({ collection, activeItemKey: '', activeItemValue: '' });
		}
	};

	deleteItem = key => {
		const { collection } = this.state;
		const item = collection[key];
		const message = `Are you sure you want to delete ${item}`;

		if (window.confirm(message)) {
			collection.splice(key, 1);
			this.setState({ collection, activeItemValue: '', activeItemKey: '' });
		}
	};

	editItem = key => {
		const { collection } = this.state;
		const activeItemValue = collection[key];

		this.setState({ activeItemValue, activeItemKey: key });
	};

	generatePlaceHolder = () => {
		const { emptyCollectionPlaceHolder } = this.props;

		return <PlaceHolder rootClassName="u-margin-b4">{emptyCollectionPlaceHolder}</PlaceHolder>;
	};

	generateContent = () => {
		const _ref = this;
		const { collection, activeItemKey, activeItemValue } = _ref.state;
		const isItemCollection = !!(collection && collection.length);

		return isItemCollection ? (
			<ListGroup className="u-margin-b4">
				{collection.map((itemValue, itemKey) => {
					const listItemKey = `blocklist-item-${itemKey}`;
					const isActiveItem = !!(
						itemValue === activeItemValue && itemKey === Number(activeItemKey)
					);
					const computedActiveClassName = isActiveItem ? ' is-active' : '';
					const computedRootClassName = `u-padding-3 aligner aligner--row u-margin-b3${computedActiveClassName}`;

					return (
						<ListGroupItem key={listItemKey} className={computedRootClassName}>
							<div className="aligner-item">{itemValue}</div>
							<div className="aligner-item aligner aligner--row aligner--vCenter aligner--hEnd">
								<OverlayTooltip
									id="tooltip-edit-item-info"
									placement="top"
									tooltip="Edit this value"
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
									tooltip="Delete this value"
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
		const isSVGElement = !!(target && target.tagName.toUpperCase() === 'SVG');
		let computedElement;

		if (isPathElement) {
			computedElement = target.parentNode;
		} else if (isSVGElement) {
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

			default:
				break;
		}
	};

	renderActionInputGroup = () => {
		const { inputPlaceholder, saveButtonText } = this.props;
		const { activeItemValue } = this.state;

		return (
			<FormGroup>
				<InputGroup>
					<FormControl type="text" value={activeItemValue} placeholder={inputPlaceholder} />
					<InputGroup.Button>
						<CustomButton
							variant="primary"
							className=""
							name="blocklist-save-button"
							onClick={() => {}}
						>
							{saveButtonText}
						</CustomButton>

						{/* <Button>Before</Button> */}
					</InputGroup.Button>
				</InputGroup>
			</FormGroup>
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
					{uiListItems}
					{actionInputGroup}
				</Col>
			</Row>
		);
	}
}

UiList.propTypes = {
	rootClassName: PropTypes.string,
	itemCollection: PropTypes.array.isRequired,
	emptyCollectionPlaceHolder: PropTypes.string.isRequired,
	inputPlaceholder: PropTypes.string.isRequired,
	saveButtonText: PropTypes.string.isRequired
};

UiList.defaultProps = {
	rootClassName: ''
};

export default UiList;
