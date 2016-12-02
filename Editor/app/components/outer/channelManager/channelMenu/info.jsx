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

	resetDisabledBtns() {
		$(ReactDOM.findDOMNode(this.refs.saveUrl)).removeAttr('disabled').removeClass('disabled');
		$(ReactDOM.findDOMNode(this.refs.editUrl)).removeAttr('disabled').removeClass('disabled');
	}

	resetSampleUrl() {
		(!this.state.isSampleUrlChanged) ? this.setState({ sampleUrl: this.props.channel.sampleUrl }) : null;
	}

	onChange() {
		const val = $(ReactDOM.findDOMNode(this.refs.sampleUrl)).val().trim(),
			isValidUrl = val && utils.ValidUrl(val.trim()),
			isHostNameEqual = (utils.parseUrl(val).hostname == utils.parseUrl(window.ADP_SITE_DOMAIN).hostname);

		if (isValidUrl && (this.state.forceSampleUrl || isHostNameEqual)) {
			this.setState({ sampleUrl: utils.appendProtocolToUrl(val), hostNameValid: true, isSampleUrlChanged: true }, () => {
				$(ReactDOM.findDOMNode(this.refs.saveUrl)).removeAttr("disabled").removeClass("disabled");
			});
		} else if (isValidUrl && !isHostNameEqual) {
			this.setState({ sampleUrl: val, hostNameValid: false, isSampleUrlChanged: false }, () => {
				$(ReactDOM.findDOMNode(this.refs.saveUrl)).attr("disabled", true).addClass("disabled");
			});
		} else {
			this.setState({ sampleUrl: val, isSampleUrlChanged: false }, () => {
				$(ReactDOM.findDOMNode(this.refs.saveUrl)).attr("disabled", true).addClass("disabled");
			});
		}
	}

	onBlur() {
		this.setState({
			sampleUrl: utils.parseUrl(this.state.sampleUrl).href
		});
	}

	toggleStateValues(target) {
		const isRefsAvailable = (Object.keys(this.refs).length > 0),
			element = (isRefsAvailable) ? $(ReactDOM.findDOMNode(this.refs.sampleUrl)).get(0) : null,
			event = new Event('input', {
				'bubbles': true,
				'cancelable': false
			});

		switch (target) {
			case 'forceSampleUrl':
				this.setState({forceSampleUrl: !this.state.forceSampleUrl}, function () {
					if (element) {
						element.dispatchEvent(event);
					}
				});
				break;

			default:
				return false;
		}
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
						<InlineEdit compact font={400} value={channel.sampleUrl} submitHandler={onSampleUrlChange.bind(null, channel.id)} text="Sample Url" errorMessage="Sample Url cannot be blank" />
					</Col>
				</Row>
			</div>
		);
	}
}

info.defaultProps = {};

export default info;
