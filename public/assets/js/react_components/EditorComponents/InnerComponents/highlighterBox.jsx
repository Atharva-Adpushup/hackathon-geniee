var React = window.React; //To avoid using browserify's require (during compilation)

module.exports = React.createClass({

    getInitialState: function () {
        return {shown: true};
    },

    getDefaultProps: function () {
        return {
            highlighterClass: '_APD_highlighter',
            borderColor: '#000',
            backgroundColor: 'rgba(255, 27, 27, 0.247059)',
            opacity: ".25",
            width: 0,
            height: 0,
            top: 0,
            left: 0
        };
    },

    setStyle: function (style) {
        this.setProps(style);
    },


    render: function () {

        var HB_style = {
            'boxShadow': 'rgb(255, 27, 27) 0px 0px 0px 2px inset',
            'backgroundColor': this.props.backgroundColor,
            'zIndex': 9999,
            'pointerEvents': 'none',
            'position': 'absolute',
            'width': this.props.width,
            'height': this.props.height,
            'top': this.props.top,
            'left': this.props.left
        },
        selector_style = {
            float: "left",
            position: "absolute",
            top: "-18px",
            border: "solid 2px",
            "background-color": "lemonchiffon",
            "border-bottom": "red",
            padding: "0px 10px"
        }



        return (<div className={this.props.highlighterClass} style={HB_style}>
            {/*<div style={selector_style}>
                {this.props.selector}
            </div>*/}
        </div>);
    }
});
