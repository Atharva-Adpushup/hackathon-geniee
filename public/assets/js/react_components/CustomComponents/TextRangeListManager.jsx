var React = window.React,
    Utils = require("libs/custom/utils"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Input = require("BootstrapComponents/Input.jsx"),
    TextRange = require("CustomComponents/CustomForm/TextRange.jsx"),
    ListView = require("listView.jsx");

module.exports = React.createClass({

    getInitialState: function() {
        return {
            activeItem: null,
            name: "",
            minRangeVal: this.props.minRangeVal || "",
            maxRangeVal: this.props.maxRangeVal || ""
        }
    },

    getDefaultProps: function () {
        return {};
    },

    onremove: function(item) {
        if (confirm("Are you sure you want to delete this item from list?")) {
            var list = this.props.list;
            var index = this.getItemIndex(this.props.list, this.getObjFromName(item));

            list.splice(index, 1);
            this.props.onSave(list);
			this.setState(this.getInitialState());
        }
    },

    getItemIndex: function(arr, item) {
        var index = -1,
            itemKey = Object.keys(item)[0];

		//TODO: Use lodash's _.findIndex if it loads properly
		// Using current array.map method as "lodash/fp/findIndex" does not
		// work as expected after require call completion here
		arr.map(function(obj, idx, origArr) {
			if (obj[itemKey] === item[itemKey]) {
				index = idx;
			}
		});

		// index = (_findIndex(array, item) > -1) ? _findIndex(array, item) : index;
        return index;
    },

	getNameFromObj: function(obj) {
        var key = Object.keys(obj)[0];

		return key + " , " + obj[key];
	},

	getObjFromName: function(str) {
        var array = str.split(" , "),
            key = array[0], value = array[1],
            obj = {};

            obj[key] = value;
        return obj;
	},

    onActive: function(item) {
        var index = this.getItemIndex(this.props.list, this.getObjFromName(item));
        var itemObj = this.props.list[index];
        var itemKey = Object.keys(itemObj)[0];

        this.setState({activeItem: index, name: itemObj, minRangeVal: itemKey, maxRangeVal: itemObj[itemKey]});
    },

    onChange: function(obj) {
        var key = Object.keys(obj)[0],
            value = obj[key];

        this.setState({name: obj, minRangeVal: key, maxRangeVal: value});
    },

    onSave: function() {
        var list = this.props.list;
        var name = this.state.name;

        if (this.state.activeItem !== null) {
            list[this.state.activeItem] = this.state.name;
        }
        else if (this.getItemIndex(list, name) == -1) {
            list.push(this.state.name);
        }

        this.props.onSave(list);
        this.setState(this.getInitialState());
    },

    renderTextRange: function() {
        return (
            <TextRange name="textRange" minRange={this.state.minRangeVal} maxRange={this.state.maxRangeVal} onValueChange={this.onChange} />
        )
    },

    render: function() {
        var allset = this.state.name && Object.keys(this.state.name).length;
        try{
            allset && new RegExp(this.state.name);
        }catch(e){
            allset = false;
        }

        return (
            <div className="containerButtonBar sm-pad">
                {this.renderTextRange()}
                <Row>
                    <Col xs={12} className="u-padding-0px">
                        <Button disabled={!allset} className="btn-lightBg btn-save btn-block" onClick={this.onSave} >Add New</Button>
                    </Col>
                </Row>

                <Row>
                    <ListView items={this.props.list || []} removeHandler={this.onremove} addHandler={this.onActive} />
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