var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Utils = require("libs/custom/utils"),
    defaultState = "(function($){" +
        "\n " +
        "\n " +
        "\n " +
        "})(adpushup.ap.$)",
    defaultIncontentState = "(function($){" +
        "\n " +
        "\n " +
        "\n " +
        "})($)",
    CodeMirrorEditor = require("CustomComponents/codeMirrorEditor.js");


var CustomJsCodeEditor = React.createClass({
    propTypes: {
        name: React.PropTypes.string,
        onValueChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            "name": "customJsCodeEditor"
        }
    },

    getInitialState: function(props) {
        props = props || this.props;

        return {
            "value": props.value ? (props.value) : (props.owner == "channelIncontent" ? defaultIncontentState: defaultState)
        }
    },

    componentWillReceiveProps: function(nextprops) {
        if (Utils.deepDiffMapper.test(this.props, nextprops).isChanged) {
            this.setState(this.getInitialState(nextprops));
        }
    },

    renderVerticalLayout: function() {
        var CodeMirror = React.createFactory(CodeMirrorEditor);

        return (
            <div className="clearfix">
                <Col className="u-padding-0px" xs={12} md={12}>
                    {
                        CodeMirror({
                            // style: {border: '1px solid black'},
                            textAreaClassName: ['form-control'],
                            textAreaStyle: {minHeight: '5em'},
                            value: this.state.value,
                            mode: 'javascript',
                            theme: 'solarized',
                            onChange: function(e) {
                                var value = (e.target.value);

                                this.setState({
                                    "value": value
                                }, function() {
                                    this.props.onValueChange(this.state.value);
                                }.bind(this));
                            }.bind(this)
                        })
                    }
                </Col>
            </div>
        )
    },

    render: function() {
        var options = {
            layoutClassName: "form-group form-group--vertical"
        };

        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {this.renderVerticalLayout()}
            </Row>
        );
    }

});

module.exports = CustomJsCodeEditor;