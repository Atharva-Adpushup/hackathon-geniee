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
        return (
            <div className="ContentExtWrap">
                {this.props.children}
            </div>
        );
    }
})