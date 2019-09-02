import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import NumericCollectionManager from 'components/shared/NumericCollectionManager/index.jsx';

class TrafficPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			autoOptimise: this.props.channel.hasOwnProperty('autoOptimise') ? this.props.channel.autoOptimise : false
		};
		this.toggleHandler = this.toggleHandler.bind(this);
	}

	toggleHandler(target, val, cb = false) {
		this.setState({ [target]: val }, () => {
			cb && typeof cb === 'function' ? cb(val) : false;
		});
	}

	render() {
		const {
			onAutoptimizeChange,
			channel,
			trafficDistributionConfig,
			saveTrafficDistributions,
			allTrafficDistributions
		} = this.props;
		const { autoOptimise } = this.state;

		return (
			<Row>
				<Col xs={12}>
					<CustomToggleSwitch
						labelText="Auto Optimise"
						className="mB-0"
						defaultLayout
						checked={autoOptimise}
						name={`autoOptimize-${channel.id}`}
						onChange={v =>
							this.toggleHandler('autoOptimise', v, onAutoptimizeChange.bind(null, channel.id))
						}
						layout="horizontal"
						size="m"
						id={`js-auto-optimise-${channel.id}`}
						on="On"
						off="Off"
					/>
					{!autoOptimise ? (
						<NumericCollectionManager
							required
							description={trafficDistributionConfig.description}
							sumMismatchErrorMessage={trafficDistributionConfig.sumMismatchErrorMessage}
							collection={allTrafficDistributions}
							uiMinimal
							maxValue={100}
							onSave={a => saveTrafficDistributions(a)}
						/>
					) : null}
				</Col>
			</Row>
		);
	}
}

export default TrafficPanel;
