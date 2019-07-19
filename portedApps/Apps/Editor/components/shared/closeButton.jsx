let React = window.React;

let Fluxxor = require('../../libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
	mixins: [FluxMixin],

	getDefaultProps() {
		return {
			clickHandler() {
				return;
			}
		};
	},

	render() {
		return <i {...this.props} onClick={this.props.clickHandler} className="fa fa-times" />;
	}
});
