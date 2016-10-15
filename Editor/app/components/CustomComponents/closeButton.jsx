var React = window.React;
var _ = require("../../libs/third-party/underscore");

var Fluxxor = require("../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function () {
        return {
            clickHandler: function () {
                return;
            }
        }
    },

    render: function () {
        return (<i {...this.props} onClick={this.props.clickHandler} className="fa fa-times"></i>);
    }
});