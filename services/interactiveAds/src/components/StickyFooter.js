import { h, Component } from 'preact';
import Abstract from './Abstract';
import commonConsts from '../commonConsts';

class StickyFooter extends Abstract {
	constructor(props) {
		super(props);
	}
	render() {
		const style = {
			width: this.props.width || this.width,
			height: this.props.height || this.height
		};
		return <div style={style}>{this.props.adCode}</div>;
	}
}

export default StickyFooter;
