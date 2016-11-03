import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import _ from 'lodash';
import AdBox from './adBox.jsx';

class Section extends React.Component {
	constructor(props) {
		super(props);
		this.node = null;
		this.$target = null;
	}

	componentDidMount() {
		this.$target = $(this.props.xpath);
		if (!this.$target.length) {
			this.props.onXpathMiss(this.props.id);
			return false;
		}
		this.$node = this.injectSection();
		this.node = this.$node.get(0);
		this.renderSection();
	}

	componentWillReceiveProps(newProps) {
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
			ad = _.max(ads, (adObj) => (adObj.adObjWidth + (parseInt(adObj.css['margin-right'], 10) || 0) + (parseInt(adObj.css['margin-left'], 10) || 0)));
			d.width = ad.width + (parseInt(ad.css['margin-right'], 10) || 0) + (parseInt(ad.css['margin-left'], 10) || 0);
			ad = _.max(ads, (adObj) => adObj.adObjHeight + (parseInt(adObj.css['margin-top'], 10)) || 0 + (parseInt(adObj.css['margin-bottom'], 10) || 0));
			d.height = parseInt(ad.height, 10) + (parseInt(ad.css['margin-top'], 10) || 0) + (parseInt(ad.css['margin-bottom'], 10) || 0);
		}
		return d;
	}

	injectSection() {
		const { operation, xpath } = this.props,
			$el = $('<div />');
		if (operation === 'Insert Before') {
			$el.insertBefore($(xpath));
		} else if (operation === 'Insert After') {
			$el.insertAfter($(xpath));
		} else if (operation === 'Append') {
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
		const css = Object.assign({}, { position: 'relative', clear: 'both', pointerEvents: 'none', width: '100%', }, { height: this.getMaxDimensions().height });
		this.$node.css(css);
		ReactDOM.render(<div className="_ap_reject">
			{props.ads.map((ad) => <AdBox key={ad.id} ad={ad} clickHandler={this.props.onAdClick.bind(this, props.variationId, props.id)} />)}
		</div>, this.node);
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
	onAdClick: PropTypes.func.isRequired
};

export default Section;
