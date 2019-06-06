import React, { Component } from 'react';
import { PanelGroup, Panel, Col } from 'react-bootstrap';

class Apps extends Component {
	state = {
		activeKey: null
	};

	handleSelect = value => {
		this.setState({
			activeKey: value
		});
	};

	render() {
		const { activeKey } = this.state;

		return (
			<Col xs={8}>
				<PanelGroup
					accordion
					id="apps-accordion"
					activeKey={activeKey}
					onSelect={this.handleSelect}
				>
					<Panel eventKey="layout">
						<Panel.Heading>
							<Panel.Title toggle>Layout App</Panel.Title>
						</Panel.Heading>
						<Panel.Body collapsible>Layout App</Panel.Body>
					</Panel>
				</PanelGroup>
			</Col>
		);
	}
}

export default Apps;
