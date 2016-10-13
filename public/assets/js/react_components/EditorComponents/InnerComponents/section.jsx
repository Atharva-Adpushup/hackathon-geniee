var React = window.React,
    AdBox = require("./adBox.jsx");

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        var AB_style = {
            width: this.props.width,
            height: this.props.height
        };
        return (<div className="_ap_reject">
            {this.props.ads.map(function(ad){
                return (<AdBox width={ad.adWidth} height= {ad.adHeight} id={ad.id} css={ad.css} clickHandler={ad.clickHandler} ref={ad.id}/>)
            })}
        </div>)
    }
})