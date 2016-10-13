var React = window.React,
    Utils = require("libs/custom/utils"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Input = require("BootstrapComponents/Input.jsx"),
    ListView = require("listView.jsx")


module.exports = React.createClass({
    getInitialState: function () {
        return {
            activeItem:null,
            name: "",
            value: this.props.blocklist || []
        }
    },
    getDefaultProps: function () {
        return {};
    },
    componentWillMount: function() {
        if (this.props.attachToForm) {
            this.props.attachToForm(this);
        }
    },
    componentWillUnmount: function() {
        if (this.props.detachFromForm) {
            this.props.detachFromForm(this);
        }
    },
    onremove: function(item) {
        if (confirm("Are you sure you want to delete url from list ?")) {
            var blockList = this.state.value;
            var index = blockList.indexOf(item);

            blockList.splice(index, 1);
            this.setState({
                value: blockList
            });
        }
    },
    onActive: function(item) {
        var index = this.state.value.indexOf(item);
        this.setState({
            activeItem: index,
            name: this.state.value[index]
        });
    },
    handleChange: function(ev) {
        ev.target.value ? this.setState({name: ev.target.value.trim()}) : this.setState({name: ""});
    },
    onSave: function() {
        var blockList = this.state.value;

        if (this.state.activeItem !== null) {
            blockList[this.state.activeItem] = this.state.name;
        }
        else if (blockList.indexOf(this.state.name) == -1) {
            blockList.push(this.state.name)
        }

        this.setState({
            value: blockList
        });
        this.setState(this.getInitialState());
    },
    render: function() {
        var allset = this.state.name && this.state.name.length;

        try {
            allset && new RegExp(this.state.name);
        }  catch(e) {
            allset = false;
        }

        return (
            <div className="containerButtonBar sm-pad">
                <Row>
                    <Col xs={12}><Input type="text" name={this.props.name} onChange={this.handleChange} value={this.state.name} /></Col>
                    <Col xs={12}><Button disabled={!allset} className="btn-lightBg btn-save btn-block" onClick={this.onSave} >Add New</Button></Col>
                </Row>

                <Row>
                    <ListView items={this.state.value || []} removeHandler={this.onremove} addHandler={this.onActive} />
                </Row>

                <Row className="butttonsRow">
                    <Col xs={12}>
                        <Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onBack} >Back</Button>
                    </Col>
                </Row>
            </div>
        );
    }
});