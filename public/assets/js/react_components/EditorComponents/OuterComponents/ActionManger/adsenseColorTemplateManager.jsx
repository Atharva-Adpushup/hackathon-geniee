var Fluxxor = require("../../../../libs/third-party/fluxxor"),
    React = window.React,
    Button = require("../../../BootstrapComponents/Button.jsx"),
    ButtonGroup = require("../../../BootstrapComponents/ButtonGroup.jsx"),
    Input = require("../../../BootstrapComponents/Input.jsx"),
    ListView = require("../listView.jsx"),
    AdsenseColorPicker = require("./adsneseColorPicker.jsx"),
    Panel = require("../../../BootstrapComponents/Panel.jsx"),
    FluxMixin = Fluxxor.FluxMixin(React);


module.exports = React.createClass({
    mixins: [FluxMixin],
    getDefaultProps: function () {
        return {templates: []};
    },
    getInitialState: function () {
        return {activeId: null};
    },
    componentWillReceiveProps(){
        this.setState(this.getInitialState());
    },
    resetState: function(){
        this.setState(this.getInitialState());
    },
    setActiveTemplate: function (activeTpl) {
        if (!activeTpl) return false;
        this.setState({activeId: activeTpl.id});
    },
    render: function () {
        var text = "Save Template";
        if (this.state.activeId) {
            text = "Edit Template"
        }

        var activeTpl = _.find(this.props.templates, function (tpl) {
            return tpl.id == this.state.activeId;
        }.bind(this))

        return (
            <div className="modal-body">
                <Panel header="Adsense Color Templates" bsStyle="primary">
                    <AdsenseColorPicker tpl={activeTpl} activeId={this.state.activeId} />
                </Panel>
                <ListView title="Templates" items={this.props.templates} display="name" addHandler={this.setActiveTemplate}/>
            </div>
        );
    }
})