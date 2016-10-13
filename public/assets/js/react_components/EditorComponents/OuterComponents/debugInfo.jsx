var React = window.React,
    $ = window.jQuery;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        if(!window.DEBUG_MODE || !this.props.info)
            return (null);
        var style = {
            "position":"absolute",
            "top":0,
            left:0,
            width:"100%",
            height:"20px"
        }
        return(
            <div>
                <b>xpath:</b>{this.props.info.xpath} <b>tagName:</b>{this.props.info.tagName}
            </div>
        )
    }
})