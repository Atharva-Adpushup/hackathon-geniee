import React, { PropTypes } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Utils from '../../libs/utils';

class TextRange extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			minRange: props.minRange,
			maxRange: props.maxRange
		};
		this.setValue = this.setValue.bind(this);
	}

	componentWillReceiveProps(nextprops) {
		// if (Utils.deepDiffMapper.test(this.props, nextprops).isChanged) {
		// 	this.setState(this.getInitialState(nextprops));
		// }
	}

	getRangeObj(minRange, maxRange) {
		const obj = {};

		obj[minRange] = maxRange;
		return obj;
	}

	setValue(name, ev) {
		let val;

		if (ev && ev.currentTarget) {
			val = ev.currentTarget.value;
		}

		switch (name) {
			case 'minRange':
				this.setState({ minRange: val }, () => {
					this.props.onValueChange(this.getRangeObj(this.state.minRange, this.state.maxRange));
				});
				break;

			case 'maxRange':
				this.setState({ maxRange: val }, () => {
					this.props.onValueChange(this.getRangeObj(this.state.minRange, this.state.maxRange));
				});
				break;

			default:
				break;
		}
	}

	renderHorizontalLayout() {
		return (
			<div className="clearfix">
				<Col className="u-padding-0px" xs={12} md={12}>
					<input
						type="text"
						className="form-control"
						onChange={this.setValue.bind(null, 'minRange')}
						value={this.state.minRange}
					/>
					<span className="u-separator--colon">:</span>
					<input
						type="text"
						className="form-control"
						onChange={this.setValue.bind(null, 'maxRange')}
						value={this.state.maxRange}
					/>
				</Col>
			</div>
		);
	}

	render() {
		const options = {
			layoutClassName: 'form-group form-group--horizontal form-group--range form-group--range-text'
		};

		return (
			<Row key={this.props.name} className={options.layoutClassName}>
				{this.renderHorizontalLayout()}
			</Row>
		);
	}
}

TextRange.defaultProps = {
	name: 'textRange',
	minRange: '',
	maxRange: ''
};

TextRange.propTypes = {
	name: PropTypes.string,
	minRange: PropTypes.string,
	maxRange: PropTypes.string,
	onValueChange: PropTypes.func
};

export default TextRange;
