var React = window.React,
    Utils = require("libs/custom/utils"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Input = require("BootstrapComponents/Input.jsx"),
    NumericRange = require("CustomComponents/CustomForm/NumericRange.jsx"),
    ListView = require("listView.jsx");


module.exports = React.createClass({

    getInitialState: function() {

        return {
            activeItem: null,
            name: "",
            minRangeVal: this.props.minRangeVal || 0,
            maxRangeVal: this.props.maxRangeVal || 100,
            min: this.props.min || 0,
            max: this.props.max || 1000
        }
    },

    getDefaultProps: function () {
        return {};
    },

    onremove: function(item) {
        if (confirm("Are you sure you want to delete url from list ?")) {
            var blockList = this.props.blockList;
            var index = this.getItemIndex(this.props.blockList, item);

            blockList.splice(index, 1);
            this.props.onSave(blockList);
        }
    },

    getItemIndex: function(array, item) {
        var index = -1;

        if ((typeof item == "string") && item.constructor === String) {
            item = item.split(" , ");
        }

        array.map(function(val, idx, origArr) {
            if (val[0] == item[0] && val[1] == item[1]) {
                index = idx;
            }
        });

        return index;
    },

    onActive: function(item) {
        var index = this.getItemIndex(this.props.blockList, item);
        var arrayItem = this.props.blockList[index];
        var name = arrayItem.join(" , ");

        this.setState({activeItem: index, name: name, minRangeVal: arrayItem[0], maxRangeVal: arrayItem[1]});
    },

    onChange: function(value) {
        this.setState({name: value, minRangeVal: value[0], maxRangeVal: value[1]});
    },

    onSave: function() {
        var blockList = this.props.blockList;
        var name = this.state.name ? this.state.name.join(" , "): this.state.name;

        if (this.state.activeItem !== null) {
            blockList[this.state.activeItem] = this.state.name;
        }
        else if (this.getItemIndex(blockList, name) == -1) {
            blockList.push(this.state.name);
        }

        this.props.onSave(blockList);
        console.log("NumBlockList::onSave: current blockList, ", blockList)
        this.setState(this.getInitialState());
    },

    renderNumericRange: function() {
        return (
            <NumericRange name="numericRange" min={this.state.min} max={this.state.max} minRange={this.state.minRangeVal} maxRange={this.state.maxRangeVal} onValueChange={this.onChange} />
        )
    },

    render: function() {
        var allset = this.state.name && this.state.name.length;
        try{
            allset && new RegExp(this.state.name);
        }catch(e){
            allset = false;
        }

        return (
            <div className="containerButtonBar sm-pad">
                {this.renderNumericRange()}
                <Row>
                    <Col xs={12} className="u-padding-0px">
                        <Button disabled={!allset} className="btn-lightBg btn-save btn-block" onClick={this.onSave} >Add New</Button>
                    </Col>
                </Row>

                <Row>
                    <ListView items={this.props.blockList || []} removeHandler={this.onremove} addHandler={this.onActive} />
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