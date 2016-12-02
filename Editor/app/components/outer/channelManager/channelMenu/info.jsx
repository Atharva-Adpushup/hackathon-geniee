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
			forceSampleUrl: (this.props.channel.forceSampleUrl) ? this.props.channel.forceSampleUrl : false,
			sampleUrl: this.props.channel.sampleUrl,
			isSampleUrlChanged: false
		};
	}

	componentWillReceiveProps() {
		const props = this.props;

		this.setState({
			sampleUrl: props.channel.sampleUrl,
			forceSampleUrl: props.channel.forceSampleUrl
		});
	}

	onChange(sampleUrl) {
		const isValidUrl = utils.ValidUrl(sampleUrl.trim()),
			isHostNameEqual = isValidUrl ? (utils.parseUrl(sampleUrl).hostname == utils.parseUrl(window.ADP_SITE_DOMAIN).hostname) : false;
		
		return isHostNameEqual;
	}

	getClass(name) {
		let icon = "desktop";

		if (name === "MOBILE")
			icon = "mobile";
		else if (name === "TABLET")
			icon = "tablet";

		return icon;
	}

	render() {
		const { channel, onContentSelectorChange, onSampleUrlChange } = this.props;
		return (
			<div className="rowPadding containerButtonBar">
				<Row>
					<Col xs={6}>
						<label>Page Group</label>
					</Col>
					<Col xs={6} className="wrapfeature">{channel.pageGroup}</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<label>Platform</label>
					</Col>
					<Col xs={6}>
						<i className={"fa fa-" + this.getClass(channel.platform)}></i>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<label>Content Selector</label>
					</Col>
					<Col xs={12} className="wrapfeature">
						<InlineEdit compact font={400} value={channel.contentSelector} submitHandler={onContentSelectorChange.bind(null, channel.id)} text="Content Selector" errorMessage="Content Selector cannot be blank" />
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<label>Sample Url</label>
					</Col>
					<Col xs={12} className="wrapfeature">
						<InlineEdit compact font={400} validation={this.onChange} validationError="Sample Url must be from your website only" value={channel.sampleUrl} submitHandler={onSampleUrlChange.bind(null, channel.id)} text="Sample Url" errorMessage="Sample Url cannot be blank" />
					</Col>
				</Row>
			</div>
		);
	}
}

info.defaultProps = {};

export default info;
