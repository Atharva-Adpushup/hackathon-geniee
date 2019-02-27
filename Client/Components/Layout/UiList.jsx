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
import CustomButton from '../CustomButton/index';
import PlaceHolder from '../PlaceHolder/index';

class UiList extends React.Component {
	state = {};

	generatePlaceHolder = () => {
		const { emptyCollectionPlaceHolder } = this.props;

		return <PlaceHolder rootClassName="u-margin-b4">{emptyCollectionPlaceHolder}</PlaceHolder>;
	};

	generateContent = () => {
		const { itemCollection } = this.props;
		const isItemCollection = !!(itemCollection && itemCollection.length);

		return isItemCollection ? (
			<ListGroup className="u-margin-b4">
				{itemCollection.map(itemValue => (
					<ListGroupItem>{itemValue}</ListGroupItem>
				))}
			</ListGroup>
		) : (
			this.generatePlaceHolder()
		);
	};

	renderActionInputGroup = () => {
		const { inputPlaceholder, saveButtonText } = this.props;

		return (
			<FormGroup>
				<InputGroup>
					<FormControl type="text" placeholder={inputPlaceholder} />
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
