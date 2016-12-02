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

	saveSampleUrl() {
		this.props.onSampleUrlChange(this.state.sampleUrl);
		this.toggleSampleUrl();
	}

	resetDisabledBtns() {
		$(ReactDOM.findDOMNode(this.refs.saveUrl)).removeAttr('disabled').removeClass('disabled');
		$(ReactDOM.findDOMNode(this.refs.editUrl)).removeAttr('disabled').removeClass('disabled');
	}

	resetSampleUrl() {
		(!this.state.isSampleUrlChanged) ? this.setState({ sampleUrl: this.props.channel.sampleUrl }) : null;
	}

	toggleSampleUrl() {
		this.setState({ manageSampleUrl: !this.state.manageSampleUrl }, () => {
			this.resetDisabledBtns();
			this.resetSampleUrl();
		});
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
		return (
			<div className="rowPadding containerButtonBar">
				<Row>
					<Col xs={6}>
						<label>Page Group</label>
					</Col>
					<Col xs={6} className="wrapfeature">{this.props.channel.pageGroup}</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<label>Platform</label>
					</Col>
					<Col xs={6}>
						<i className={"fa fa-" + this.getClass(this.props.channel.platform)}></i>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<label>Content Selector</label>
					</Col>
					<Col xs={12} className="wrapfeature">
						<InlineEdit value={this.props.channel.contentSelector} submitHandler={this.props.onContentSelectorChange.bind(null, this.props.channel.id)} text="Content Selector" errorMessage="Content Selector cannot be blank" />
					</Col>
				</Row>
				{!this.state.manageSampleUrl ?
					<div>
						<Row>
							<Col xs={12}>
								<label>Sample Url</label>
							</Col>
							<Col xs={12} className="wrapfeature">{this.props.channel.sampleUrl}</Col>
						</Row>
						<Row className="butttonsRow">
							<Col xs={12}>
								<Button ref="editUrl" onClick={a => this.toggleSampleUrl(a)} className="btn-lightBg btn-edit btn-block">Edit Url</Button>
							</Col>
						</Row>
					</div>
					:
					<div>
						<CustomToggleSwitch labelText="Force sample url" className="mB-0" defaultLayout checked={this.state.forceSampleUrl} name="forceSampleUrl" onChange={a => this.toggleStateValues('forceSampleUrl', a)} layout="horizontal" size="m" id="js-force-sample-url" on="On" off="Off" />
						<Row>
							<Col xs={12}>
								<label>Sample Url</label>
							</Col>
							<Col xs={12}>
								<Input type="text" ref="sampleUrl" onBlur={a => this.onBlur(a)} onChange={a => this.onChange(a)} value ={this.state.sampleUrl}/>
							</Col>
							{!this.state.hostNameValid ?
								<Col xs={12}>
									<span style={{color:"red"}}>Url should be from your website only</span>
								</Col>
								:
								null
								}
						</Row>
						<Row className="butttonsRow">
							<Col xs={6}>
								<Button ref="saveUrl" onClick={a => this.saveSampleUrl(a)} className="btn-lightBg btn-save">Save Url</Button>
							</Col>
							<Col xs={6}>
								<Button onClick={a => this.toggleSampleUrl(a)} className="btn-lightBg btn-cancel">Cancel</Button>
							</Col>
						</Row>
					</div>
					}
			</div>
		);
	}
}

info.defaultProps = {};

export default info;
