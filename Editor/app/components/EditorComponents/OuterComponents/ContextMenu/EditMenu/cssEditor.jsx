import React, { PropTypes }  from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from 'CustomComponents/Select/select.js';
import CustomCssEditor from './cutomCssEditor.jsx';
import _ from 'underscore';

const isCustomCss = (cssJson) => {
	for (let key in cssJson) {
		if (key.indexOf('margin') === -1 && key.indexOf('clear') === -1) { // margin and clear are default settings otherwise its custom css
			return true;
		}
	}
};

class cssEditor extends React.Component {
	constructor(props) {
		super(props);
		this.onSave = this.onSave.bind(this);
		this.state = {
			customCss: false
		};
	}

	toggleCustomCssEditor() {
		this.setState({ customCss: !this.state.customCss });
	}
}

cssEditor.propTypes = {
	onCreateAdd: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
};

export default cssEditor;

module.exports = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getInitialState: function(props) {
		props = props || this.props;
		return {
			activeSize: props.activeAd ? (props.activeAd.width + ' x ' + props.activeAd.height) : null,
			'margin-left': (props.activeAd && props.activeAd.css) ? ((props.activeAd.css['margin-left'] == 'auto') ? props.activeAd.css['margin-left'] : parseInt(props.activeAd.css['margin-left'])) : 0,
			'margin-top': (props.activeAd && props.activeAd.css) ? ((props.activeAd.css['margin-top'] == 'auto') ? props.activeAd.css['margin-top'] : parseInt(props.activeAd.css['margin-top'])) : 0,
			'margin-bottom': (props.activeAd && props.activeAd.css) ? ((props.activeAd.css['margin-bottom'] == 'auto') ? props.activeAd.css['margin-bottom'] : parseInt(props.activeAd.css['margin-bottom'])) : 0,
			'margin-right': (props.activeAd && props.activeAd.css) ? ((props.activeAd.css['margin-right'] == 'auto') ? props.activeAd.css['margin-right'] : parseInt(props.activeAd.css['margin-right'])) : 0,
			customCss: props.activeAd ? this.isCustomCss(props.activeAd.css) : false
		};
	},
	isCustomCss: function(cssJson) {
		for (var key in cssJson) {
			if (key.indexOf('margin') == -1 && key.indexOf('clear') == -1) // margin and clear are default settings otherwise its custom css
				return true;
		}
	},
	componentWillReceiveProps: function(nextProps) {
		this.setState(this.getInitialState(nextProps));
	},
	componentDidUpdate: function() {
		this.props.onUpdate();
	},
	getDefaultProps: function() {
		return {
			onSubmit: function() {
			}
		};
	},
	getSizeFromString: function(size) {
		size = size.split('x');
		return { width: parseInt(size[0]), height: parseInt(size[1]) };
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if (!this.state.activeSize || this.state.activeSize.length == 0) {
			this.props.errorHandler('Please Select Size First');
		} else {
			this.props.cssHandler(this.getSizeFromString(this.state.activeSize), {
				'margin-left': (this.state['margin-left'] == 'auto') ? this.state['margin-left'] : parseInt(this.state['margin-left']) + 'px',
				'margin-right': (this.state['margin-right'] == 'auto') ? this.state['margin-right'] : parseInt(this.state['margin-right']) + 'px',
				'margin-top': (this.state['margin-top'] == 'auto') ? this.state['margin-top'] : parseInt(this.state['margin-top']) + 'px',
				'margin-bottom': (this.state['margin-bottom'] == 'auto') ? this.state['margin-bottom'] : parseInt(this.state['margin-bottom']) + 'px',
				'clear': 'both'
			});
		}
	},
	saveCustomCss: function(cssJson) {
		this.props.cssHandler(this.getSizeFromString(this.state.activeSize), cssJson);
	},
	getActiveAd: function(size) {
		size = this.getSizeFromString(size);
		return _(this.props.adSizes).findWhere({ width: size.width, height: size.height });
	},
	setActiveSize: function(size) {
		this.setState(this.getInitialState({ activeAd: this.getActiveAd(size) }));
	},
	toggleCustomCssEditor: function() {
		this.setState({ customCss: !this.state.customCss });
	},
	setAlignment: function(align) {
		switch (align) {
			case 'left':
				this.setState({ 'margin-right': 'auto', 'margin-left': '0' });
				break;
			case 'right':
				this.setState({ 'margin-left': 'auto', 'margin-right': '0' });
				break;
			case 'center':
				this.setState({ 'margin-left': 'auto', 'margin-right': 'auto' });
				break;
		}
	},
	render: function() {
		var sizes = this.props.adSizes.map(function(size) {
			return (<option value={size.width + ' x ' + size.height}>{size.width + ' x ' + size.height}</option>);
		});
		if (this.state.customCss)
			return <CustomCssEditor code={JSON.stringify(this.getActiveAd(this.state.activeSize).css) } cancel={this.toggleCustomCssEditor.bind(this) } save={this.saveCustomCss.bind(this) }/>;
		else
			return (
				<div className="containerButtonBar">
					<SelectBox label="Select Ad Size" value={this.state.activeSize} onChange={this.setActiveSize}>
						{sizes}
					</SelectBox>
					{!this.state.activeSize ? <div className="selectSize">Please Select Size First</div> :
						<div>
							<div className="manualSettings">
								<Row className="cssPropertiesWrap">
									<Col xs={12} className="pdLR-0 mB-5">Margin: </Col>
									<Col xs={12} className="pd-0">
										<Row  className="cssPropertiesWrapInner">
											<Col xs={3} className="pd-2">
												<input disabled={!this.state.activeSize} type="text" name="margin-left" valueLink={this.linkState('margin-left') } />
												<span>Left</span>
											</Col>
											<Col xs={3} className="pd-2">
												<input disabled={!this.state.activeSize} type="text" name="margin-right" valueLink={this.linkState('margin-right') } />
												<span>Right</span>
											</Col>
											<Col xs={3} className="pd-2">
												<input disabled={!this.state.activeSize} type="text" name="margin-top" valueLink={this.linkState('margin-top') } />
												<span>Top</span>
											</Col>
											<Col xs={3} className="pd-2">
												<input disabled={!this.state.activeSize} type="text" name="margin-bottom" valueLink={this.linkState('margin-bottom') } />
												<span>Bottom</span>
											</Col>
										</Row>
									</Col>
								</Row>
							</div>

							<Row className="cssPropertiesAlign">
								<Col xs={4} className="pd-0 btnCol">
									<Button disabled={!this.state.activeSize} className="btn-align btn-align-left" onClick={this.setAlignment.bind(null, 'left') }>Left</Button>
								</Col>
								<Col xs={4} className="pd-0 btnCol">
									<Button disabled={!this.state.activeSize} className="btn-align btn-align-center" onClick={this.setAlignment.bind(null, 'center') }>Center</Button>
								</Col>
								<Col xs={4} className="pd-0 btnCol">
									<Button disabled={!this.state.activeSize} className="btn-align btn-align-right" onClick={this.setAlignment.bind(null, 'right') }>Right</Button>
								</Col>
							</Row>
						</div>
					}
					<Row className="butttonsRow">
						<Col xs={5} className="u-padding-l5px">
							<Button disabled={!this.state.activeSize} className="btn-lightBg btn-save " onClick={this.handleSubmit}>Save Css</Button>
						</Col>
						<Col xs={7}>
							<Button disabled={!this.state.activeSize} className="btn-lightBg btn-edit " onClick={this.toggleCustomCssEditor}>Custom Css</Button>
						</Col>
					</Row>


				</div>);
	}
});
