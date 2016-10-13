var React = window.React,
    _ = require("../../../../../libs/third-party/underscore");
module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        return (<div style={{background:this.props.tpl.bgColor || this.props.tpl.background,border:"1px solid "+this.props.tpl.borderColor || this.props.tpl.border}} className="adsWrapper">
            <div className="row">
                <div className="col-sm-12">
                    <h5><a style={{color:this.props.tpl.titleColor || this.props.tpl.title}} href="#">Ad title</a></h5>
                </div>
                <div className="col-sm-12">
                    <p style={{color:this.props.tpl.textColor || this.props.tpl.text}} className="txt">Your Ad text goes here.</p>
                </div>
                <div className="col-sm-12">
                    <img src="../assets/images/urlico.png"  className="urlimg"/>
                    <p className="txt"><a href="#" style={{color:this.props.tpl.urlColor || this.props.tpl.url}}>Your Ad url goes here.</a></p>
                </div>
            </div>
        </div> );
    }
})