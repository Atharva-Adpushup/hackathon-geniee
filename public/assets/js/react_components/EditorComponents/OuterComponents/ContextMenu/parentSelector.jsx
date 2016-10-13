var React = window.React,
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx"),
    _ = require("../../../../libs/third-party/underscore");

var Fluxxor =  require("../../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],

    highlightElement: function (selector) {
        this.getFlux().actions.highlightElement(selector);
    },

    selectElement: function (selector) {
        this.getFlux().actions.selectElement(selector);
    },

    render: function () {
        var firstSelector = this.props.selectors[0];
        return (<div className="SelectParent">{this.props.selectors.map(function (selector,index) {
            return(
            <Row onMouseOut={function () { this.highlightElement(firstSelector.xpath) }.bind(this) }
                 onMouseOver={function () {this.highlightElement(selector.xpath)}.bind(this) }
                 onClick={function () { this.selectElement(selector.xpath) }.bind(this) }>

                <Col md={3}><b>{selector.tagName}</b></Col>
                {index == 0 ? <Col md={9}><b>{selector.xpath}</b></Col> : <Col md={9}>{selector.xpath}</Col>}


            </Row>)
        }.bind(this)) }</div>);
    }
});