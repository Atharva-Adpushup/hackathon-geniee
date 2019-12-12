import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Row } from 'react-bootstrap';
import Bold from './Bold.jsx';

class CollapsePanel extends Component {
	constructor(props) {
		super(props);

		this.state = {
			open: props.open
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
	}

	toggleCollapse() {
		this.setState({ open: !this.state.open });
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ ...nextProps });
	}
	// shouldComponentUpdate(nextprop, nextstate) {
	// 	console.log(this.props, nextprop, this.state);
	// 	return this.state.open == nextprop.open ? true : false;
	// }

	render() {
		const { props, state } = this;

		return (
			<div className="_collapse-panel">
				<div onClick={this.toggleCollapse}>
					<div className="container-fluid">
						<Row className={props.className}>
							<div className="pull-left">{props.bold ? <Bold>{props.title}</Bold> : props.title}</div>
							<div className="pull-right">
								{!state.open
									? <i className="fa fa-caret-down" title={props.tooltipMessage} />
									: <i className="fa fa-caret-up" />}
							</div>
						</Row>
					</div>
				</div>
				<Panel collapsible expanded={state.open} className={!state.open && props.noBorder ? 'no-border' : ''}>
					{props.children}
				</Panel>
			</div>
		);
	}
}

CollapsePanel.propTypes = {
	open: PropTypes.bool,
	tooltipMessage: PropTypes.string,
	bold: PropTypes.bool
};

CollapsePanel.defaultProps = {
	//open: false,
	tooltipMessage: 'Click to view details',
	bold: false
};

export default CollapsePanel;
