// Ad Code component

import { h, Component } from 'preact';

class AdCode extends Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const adCode = [];
		adCode.push('<div id="a">');
		adCode.push('<script type="text/javascript">');
		adCode.push('window.adpTags.extendConfig({})');
		adCode.push('</script>');
		adCode.push('</div>');
		this.base.innerHTML = adCode;
	}

	render() {
		const { style } = this.props;
		return <div style={style}>ad</div>;
	}
}

export default AdCode;
