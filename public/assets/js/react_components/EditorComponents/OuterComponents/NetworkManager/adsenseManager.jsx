var React = window.React;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function (props) {
        props = props || this.props;
        return {
            name: props.name
        };
    },
    render: function () {
        return (
            <div>

            </div>
        );
    }
})