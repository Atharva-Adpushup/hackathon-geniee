var React = window.React,
    Col = require("BootstrapComponents/Col.jsx"),
    Row = require("BootstrapComponents/Row.jsx"),
    CodeMirror = require("libs/third-party/codemirror/codemirror.min.js"),
    CodeMirrorJS = require("libs/third-party/codemirror/codemirror.javascript.min.js"),
    CodeMirrorEditor = require("CustomComponents/codeMirrorEditor.js");

module.exports = React.createClass({
    getInitialState: function () {
        var code = this.props.code.replace(/,/g,",\r\n");
        code = code.replace(/{/,"{\r\n");
        code = code.replace(/}/,"\r\n}");
        return {
            code: code || "{\r\n}",
            error:false
        };
    },
    getDefaultProps: function () {
        return {};
    },
    save: function(){
        try{
            this.props.save(JSON.parse(this.state.code));
            this.setState({error:false});
        }catch(e){
            this.setState({error:true});
        }

    },
    render: function () {
        var CodeMirror = React.createFactory(CodeMirrorEditor);
        return (
            <div className="containerButtonBar">
                {this.state.error ? (<div>Some Error in CSS, remove comma in last property if there.</div>) : null}
                {
                    CodeMirror({
                        // style: {border: '1px solid black'},
                        textAreaClassName: ['form-control'],
                        textAreaStyle: {minHeight: '5em'},
                        value: this.state.code,
                        mode: 'javascript',
                        theme: 'solarized',
                        onChange: function (e) {
                            this.setState({code: e.target.value});
                        }.bind(this)
                    })
                }
                <Row className="butttonsRow">
                    <Col xs={6}>
                        <Button className="btn-lightBg btn-save" onClick={this.save}>Save</Button>
                    </Col>
                    <Col xs={6}>
                        <Button className="btn-lightBg btn-cancel" onClick={this.props.cancel}>Cancel</Button>
                    </Col>
                </Row>
            </div>
        );
    }
});