var React = window.React;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        var style = {display:(this.props.selected) ? "block" : "none"};
        return (<div className="tabContentArea" style={style}>{this.props.children}</div>);
    }
})