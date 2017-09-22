import React, { PropTypes } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import TextRange from './TextRange.jsx';
import ListView from './listView.jsx';

class TextRangeListManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeItem: null,
			name: '',
			minRangeVal: props.minRangeVal || '',
			maxRangeVal: props.maxRangeVal || ''
		};
	}

	onremove(item) {
		if (confirm('Are you sure you want to delete this item from list?')) {
			const list = this.props.list,
				index = this.getItemIndex(this.props.list, this.getObjFromName(item));

			list.splice(index, 1);
			this.props.onSave(list);
			// this.setState(this.getInitialState());
		}
	}

	getItemIndex(arr, item) {
		let index = -1;
		const itemKey = Object.keys(item)[0];

		//TODO: Use lodash's _.findIndex if it loads properly
		// Using current array.map method as "lodash/fp/findIndex" does not
		// work as expected after require call completion here
		arr.forEach((obj, idx) => {
			if (obj[itemKey] === item[itemKey]) {
				index = idx;
			}
		});

		// index = (_findIndex(array, item) > -1) ? _findIndex(array, item) : index;
		return index;
	}

	getNameFromObj(obj) {
		const key = Object.keys(obj)[0];

		return `${key} , ${obj[key]}`;
	}

	getObjFromName(str) {
		const array = str.split(' , '),
			key = array[0],
			value = array[1],
			obj = {};

		obj[key] = value;
		return obj;
	}

	onActive(item) {
		const index = this.getItemIndex(this.props.list, this.getObjFromName(item)),
			itemObj = this.props.list[index],
			itemKey = Object.keys(itemObj)[0];

		this.setState({ activeItem: index, name: itemObj, minRangeVal: itemKey, maxRangeVal: itemObj[itemKey] });
	}

	onChange(obj) {
		const key = Object.keys(obj)[0],
			value = obj[key];

		this.setState({ name: obj, minRangeVal: key, maxRangeVal: value });
	}

	onSave() {
		const list = this.props.list,
			name = this.state.name;

		if (this.state.activeItem !== null) {
			list[this.state.activeItem] = this.state.name;
		} else if (this.getItemIndex(list, name) === -1) {
			list.push(this.state.name);
		}

		this.props.onSave(list);
		// this.setState(this.getInitialState());
	}

	renderTextRange() {
		return (
			<TextRange
				name="textRange"
				minRange={this.state.minRangeVal}
				maxRange={this.state.maxRangeVal}
				onValueChange={a => this.onChange(a)}
			/>
		);
	}

	render() {
		let allset = this.state.name && Object.keys(this.state.name).length;

		try {
			allset && new RegExp(this.state.name);
		} catch (e) {
			allset = false;
		}

		return (
			<div className="containerButtonBar sm-pad">
				{this.renderTextRange()}
				<Row>
					<Col xs={12} className="u-padding-0px">
						<Button
							disabled={!allset}
							className="btn-lightBg btn-save btn-block"
							onClick={a => this.onSave(a)}
						>
							Add New
						</Button>
					</Col>
				</Row>

				<Row>
					<ListView
						items={this.props.list || []}
						removeHandler={a => this.onremove(a)}
						addHandler={a => this.onActive(a)}
					/>
				</Row>

				<Row className="butttonsRow">
					<Col xs={12}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onBack}>
							Back
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

export default TextRangeListManager;
