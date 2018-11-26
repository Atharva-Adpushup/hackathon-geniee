import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import utils from 'libs/utils';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import Row from 'react-bootstrap/lib/Row';
import Input from 'react-bootstrap/lib/FormControl';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import InlineEdit from 'shared/inlineEdit/index.jsx';

class info extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			manageSampleUrl: false,
			hostNameValid: true,
			forceSampleUrl: this.props.channel.forceSampleUrl ? this.props.channel.forceSampleUrl : false,
			sampleUrl: this.props.channel.sampleUrl,
			isSampleUrlChanged: false,
			autoptimize: this.props.channel.hasOwnProperty('autoOptimise') ? this.props.channel.autoOptimise : true
		};
	}

	toggleStateValues(target, val, cb = false) {
		this.setState({ [target]: val }, () => {
			cb && typeof cb === 'function' ? cb(val) : false;
		});
	}

	onChange(sampleUrl) {
		if (!this.state.forceSampleUrl) {
			const isValidUrl = utils.ValidUrl(sampleUrl.trim()),
				isHostNameEqual = isValidUrl
					? utils.parseUrl(sampleUrl).hostname == utils.parseUrl(window.ADP_SITE_DOMAIN).hostname
					: false;

			return isHostNameEqual;
		} else {
			return true;
		}
	}

	getClass(name) {
		let icon = 'desktop';

		if (name === 'MOBILE') icon = 'mobile';
		else if (name === 'TABLET') icon = 'tablet';

		return icon;
	}

	render() {
		const { channel, onContentSelectorChange, onSampleUrlChange, onAutoptimizeChange } = this.props;
		return (
			<div className="rowPadding containerButtonBar">
				<Row>
					<Col xs={6}>
						<label>Page Group</label>
					</Col>
					<Col xs={6} className="wrapfeature">
						{channel.pageGroup}
					</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<label>Platform</label>
					</Col>
					<Col xs={6}>
						<i className={'fa fa-' + this.getClass(channel.platform)} />
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<label>Sample Url</label>
					</Col>
					<Col xs={12} className="wrapfeature">
						<InlineEdit
							compact
							validate
							font={400}
							changeHandler={this.onChange.bind(this)}
							validationError="Sample Url must be from your website only"
							value={channel.sampleUrl}
							submitHandler={onSampleUrlChange.bind(null, channel.id)}
							text="Sample Url"
							errorMessage="Sample Url cannot be blank"
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<CustomToggleSwitch
							labelText="Force sample url"
							className="mB-0"
							defaultLayout
							checked={this.state.forceSampleUrl}
							name="forceSampleUrl"
							onChange={a => this.toggleStateValues('forceSampleUrl', a)}
							layout="horizontal"
							size="m"
							id="js-force-sample-url"
							on="On"
							off="Off"
						/>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<CustomToggleSwitch
							labelText="Auto Optimize"
							className="mB-0"
							defaultLayout
							checked={this.state.autoptimize}
							name={`autoOptimize-${channel.id}`}
							onChange={v =>
								this.toggleStateValues('autoptimize', v, onAutoptimizeChange.bind(null, channel.id))
							}
							layout="horizontal"
							size="m"
							id={`js-auto-optimize-${channel.id}`}
							on="On"
							off="Off"
						/>
					</Col>
				</Row>
			</div>
		);
	}
}

info.defaultProps = {};

export default info;
