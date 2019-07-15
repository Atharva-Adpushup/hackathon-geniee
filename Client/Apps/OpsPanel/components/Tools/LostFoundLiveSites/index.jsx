import React, { Component } from 'react';
import { PanelGroup, Panel, Col, Badge } from 'react-bootstrap';
import LostSites from './LostSites';
import NewSites from './NewSites';
import RetentionSites from './RetentionSites';

class LostFoundLiveSites extends Component {
	state = {
		activeKey: null
	};

	componentDidMount() {}

	handleSelect = (value = null) => {
		this.setState({
			activeKey: value
		});
	};

	renderPanel() {
		const { activeKey } = this.state;

		return (
			<PanelGroup accordion id="sites" activeKey={activeKey} onSelect={this.handleSelect}>
				<Panel eventKey="lost">
					<Panel.Heading>
						<Panel.Title toggle>
							Lost <Badge> 10 </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'lost' ? <LostSites /> : null}
				</Panel>

				<Panel eventKey="new">
					<Panel.Heading>
						<Panel.Title toggle>
							New <Badge> 99 </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'new' ? <NewSites /> : null}
				</Panel>

				<Panel eventKey="retention">
					<Panel.Heading>
						<Panel.Title toggle>
							Retention <Badge> 50 </Badge>
						</Panel.Title>
					</Panel.Heading>
					{activeKey === 'retention' ? <RetentionSites /> : null}
				</Panel>
			</PanelGroup>
		);
	}

	render() {
		return <Col xs={8}>{this.renderPanel()}</Col>;
	}
}

export default LostFoundLiveSites;
