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
        var border = {"backgroundColor": this.props.tpl.border};
        var title = {"backgroundColor": this.props.tpl.title};
        var background = {"backgroundColor": this.props.tpl.background};
        var text = {"backgroundColor": this.props.tpl.text};
        var url = {"backgroundColor": this.props.tpl.url};

        return (<div {...this.props} className="swatch">
                <div className="colorOuter">
                    <span className="color" style={border}></span>
                    <span className="color" style={title}></span>
                    <span className="color" style={background}></span>
                    <span className="color" style={text}></span>
                    <span className="color" style={url}></span>
                </div>
        </div>);
    }
})


