import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';
import AdBox from './adBox.jsx';
import { adInsertOptions } from '../../consts/commonConsts';

class Section extends React.Component {
	constructor(props) {
		super(props);
		this.node = null;
		this.$target = null;
	}

	init(props) {
		this.$target = $(props.xpath);
		if (!this.$target.length) {
			props.onXpathMiss(props.id);
			return false;
		}
		this.$node = this.injectSection(props);
		this.node = this.$node.get(0);
		this.renderSection();
	}

	componentDidMount() {
		this.init(this.props);
	}

	componentWillReceiveProps(newProps) {
		const isDifferentOperation = !!(this.props.operation !== newProps.operation);

		if (
			this.props.xpath !== newProps.xpath ||
			!_.isEqual(this.props.ads[0].css, newProps.ads[0].css) ||
			isDifferentOperation
		) {
			this.unMountSection();
			this.init(newProps);
		}

		this.renderSection(newProps);
	}

	componentWillUnmount() {
		this.unMountSection();
	}

	getMaxDimensions() {
		const ads = this.props.ads,
			d = { width: 0, height: 0 };
		if (ads.length) {
			let ad;
			ad = _.max(
				ads,
				adObj =>
					adObj.adObjWidth +
					(parseInt(adObj.css['margin-right'], 10) || 0) +
					(parseInt(adObj.css['margin-left'], 10) || 0)
			);
			d.width =
				ad.width + (parseInt(ad.css['margin-right'], 10) || 0) + (parseInt(ad.css['margin-left'], 10) || 0);
			ad = _.max(
				ads,
				adObj =>
					adObj.adObjHeight + parseInt(adObj.css['margin-top'], 10) ||
					0 + (parseInt(adObj.css['margin-bottom'], 10) || 0)
			);
			d.height =
				parseInt(ad.height, 10) +
				(parseInt(ad.css['margin-top'], 10) || 0) +
				(parseInt(ad.css['margin-bottom'], 10) || 0);
			d.clientHeight = parseInt(ad.height, 10);
			d.clientWidth = parseInt(ad.width, 10);
		}
		return d;
	}

	injectSection(props) {
		const { operation, xpath } = props,
			$el = $('<div />');
		if (operation === adInsertOptions.INSERT_BEFORE) {
			$el.insertBefore($(xpath));
		} else if (operation === adInsertOptions.INSERT_AFTER) {
			$el.insertAfter($(xpath));
		} else if (operation === adInsertOptions.APPEND) {
			$(xpath).append($el);
		} else {
			$(xpath).prepend($el);
		}
		return $el;
	}

	unMountSection() {
		if (this.node) {
			ReactDOM.unmountComponentAtNode(this.node);
			this.$node.remove();
		}
		this.node = null;
		this.$target = null;
	}

	renderSection(props = this.props) {
		if (!this.node) {
			return false;
		}
		let { networkData } = props.ads[0];
		if (networkData && networkData.isResponsive) {
			props.ads[0].width = $(this.node).width() || 300;
			props.ads[0].height = 200;
		}
		const css = Object.assign(
			{},
			{ position: 'relative', clear: 'both', pointerEvents: 'none', width: '100%' },
			{ height: this.getMaxDimensions().clientHeight, width: this.getMaxDimensions().clientWidth },
			props.ads[0].css
		);
		this.$node.css(css);
		ReactDOM.render(
			<div className="_ap_reject">
				{props.ads.map(ad => {
					return (
						<AdBox
							key={ad.id}
							ad={ad}
							sectionName={props.sectionName}
							partnerData={props.partnerData}
							mode={props.mode}
							clickHandler={props.onAdClick.bind(this, props.variationId, props.id)}
						/>
					);
				})}
			</div>,
			this.node
		);
	}

	render() {
		return null;
	}
}

Section.propTypes = {
	xpath: PropTypes.string.isRequired,
	operation: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	ads: PropTypes.array.isRequired,
	onXpathMiss: PropTypes.func.isRequired,
	onAdClick: PropTypes.func.isRequired,
	partnerData: PropTypes.object
};

export default Section;
