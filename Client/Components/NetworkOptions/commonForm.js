import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CodeBox from '../CodeBox/index';
import CustomToggleSwitch from '../CustomToggleSwitch/index';
import SelectBox from '../SelectBox/index';
import { refreshIntervals } from '../../constants/visualEditor';

const FormWrapper = (adCodeCheck, name, adUnitRegex) => {
		return class extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					error: false,
					adunitId: this.props.code.adunitId || '',
					adCode: this.props.code.adCode || '',
					refreshSlot: !!this.props.code.refreshSlot,
					refreshInterval: this.props.code.refreshInterval
				};
				this.checkAdCode = this.checkAdCode.bind(this);
				this.getAdUnitId = this.getAdUnitId.bind(this);
				this.submitHandler = this.submitHandler.bind(this);
				this.inputChange = this.inputChange.bind(this);
				this.toggleRefreshSlot = this.toggleRefreshSlot.bind(this);
				this.onRefreshIntervalChange = this.onRefreshIntervalChange.bind(this);
			}

			checkAdCode(value) {
				const response = adCodeCheck(value);
				if (response.error) {
					this.props.showNotification({
						mode: 'error',
						title: 'Invalid Adcode',
						message: response.message
					});
					return this.setState({ error: true, adCode: '', adunitId: '' });
				}
				this.setState({ error: false, adunitId: this.getAdUnitId(value), adCode: btoa(value) });
			}

			getAdUnitId(value) {
				let matchedItems = value.match(adUnitRegex),
					adunitId = matchedItems.length ? matchedItems[0].split('=')[1].replace(/\"/g, '') : '';
				return adunitId;
			}

			submitHandler(value) {
				if (!value || !value.trim().length || value == '') {
					this.props.showNotification({
						mode: 'error',
						title: 'Invalid AdCode',
						message: `${name} cannot be left blank`
					});
					return false;
				}

				if (this.state.error) {
					this.props.showNotification({
						mode: 'error',
						title: 'Invalid AdCode',
						message: 'Invalid AdCode inserted'
					});
					return false;
				}

				this.props.submitHandler({
					adCode: value,
					adunitId: this.state.adunitId,
					refreshSlot: this.state.refreshSlot,
					refreshInterval: this.state.refreshInterval
				});
			}

			inputChange(ev) {
				this.setState({ adunitId: ev.target.value });
			}
			toggleRefreshSlot(value) {
				this.setState({
					refreshSlot: !!value
				});
			}

			onRefreshIntervalChange(value) {
				this.setState({
					refreshInterval: value
				});
			}

			render() {
				return (
					<Form
						adunitId={this.state.adunitId}
						inputChange={this.inputChange}
						refreshSlot={this.state.refreshSlot}
						refreshInterval={this.state.refreshInterval}
						toggleRefreshSlot={this.toggleRefreshSlot}
						onRefreshIntervalChange={this.onRefreshIntervalChange}
						adCode={this.state.adCode}
						onCodeBoxChange={this.checkAdCode}
						onCancel={this.props.onCancel}
						onSubmit={this.submitHandler}
						showButtons={this.props.showButtons || false}
						codeBoxSize="small"
						fromPanel={this.props.fromPanel}
						label="Adunit Id"
						placeholder="Enter Adunit Id"
						networkConfig={this.props.networkConfig}
					/>
				);
			}
		};
	},
	Form = props => {
		return (
			<div className="mT-10">
				<Row>
					<Col xs={5} className={props.fromPanel ? 'u-padding-r10px' : ''}>
						<strong>{props.label}</strong>
					</Col>
					<Col xs={7} className={props.fromPanel ? 'u-padding-l10px' : ''}>
						<input
							type="text"
							placeholder={props.placeholder}
							className="inputBasic mB-10"
							value={props.adunitId}
							onChange={props.inputChange}
							readOnly
						/>
					</Col>
				</Row>
				{props.networkConfig && props.networkConfig.enableRefreshSlot ? (
					<div>
						<Row>
							<Col xs={12}>
								<CustomToggleSwitch
									labelText="Refresh Ad"
									className="mB-10"
									checked={props.refreshSlot}
									onChange={props.toggleRefreshSlot}
									layout="horizontal"
									size="m"
									on="Yes"
									off="No"
									defaultLayout={true}
									name="Refresh Ad"
									id={props.id ? `js-refresh-slot-switch-${props.id}` : 'js-refresh-slot-switch'}
								/>
							</Col>
						</Row>
						<Row>
							<Col xs={6}>
								<strong>Refresh Interval</strong>
							</Col>
							<Col xs={6}>
								<SelectBox
									id="refresh-interval-selectbox"
									title="Select Refresh Interval"
									onSelect={props.onRefreshIntervalChange}
									options={refreshIntervals.map(item => ({
										name: item,
										value: item
									}))}
									selected={props.refreshInterval || refreshIntervals[0]}
								/>
							</Col>
						</Row>
					</div>
				) : null}
				<div>
					<CodeBox
						showButtons={props.showButtons || true}
						onSubmit={props.onSubmit}
						onCancel={props.onCancel}
						onChange={props.onCodeBoxChange}
						code={props.adCode}
						size={props.codeBoxSize}
					/>
				</div>
			</div>
		);
	};

export { Form, FormWrapper };
