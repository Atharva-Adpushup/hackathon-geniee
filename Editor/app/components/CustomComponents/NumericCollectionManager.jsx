var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    NumericCollection = require("CustomComponents/CustomForm/NumericCollection.jsx"),
	$ = require('libs/third-party/jquery');

module.exports = React.createClass({

    getInitialState: function() {
        return {
			model: {},
			isUIChanged: false
        }
    },

    getDefaultProps: function () {
        return {
			collection: []
		};
    },

    componentDidMount: function() {
        this.setState({
            isUIChanged: true
        });
    },

    onSave: function() {
		this.props.onSave(this.state.model);
		this.setState(this.getInitialState());
    },

	onValueChange: function(config) {
		this.setState({
			model: config,
			isUIChanged: true
		});
	},

	getUniqueChannels: function(collection) {
		var uniquePageGroups = {};

		collection.forEach(function(channel, idx) {
			var channelName = channel.channelName.split("_");

			if (channelName.indexOf('APEX') !== -1) {
				channelName.splice(2, 1);
			}

			channelName = channelName.join("_");

			if (!uniquePageGroups.hasOwnProperty(channelName)) {
				uniquePageGroups[channelName] = [];
				uniquePageGroups[channelName].push(channel.channelName);
			} else {
				uniquePageGroups[channelName].push(channel.channelName);
			}
		});

		return uniquePageGroups;
	},

    getCollectionWithValues: function(collection, savedCollection) {
        var collectionKeys = Object.keys(collection),
            computedCollection = {},
            isSavedCollection = !!(savedCollection && Object.keys(savedCollection).length);

        collectionKeys.forEach(function(key) {
            var itemArr = collection[key], itemArrLength = itemArr.length,
                computedItemArr;

            computedItemArr = itemArr.map(function(val) {
                var itemObj = {},
                    itemArrValue = Number((100/itemArrLength).toFixed(2));

                if (isSavedCollection) {
                    itemArrValue = ((savedCollection.hasOwnProperty(val) && savedCollection[val])
                    ? parseInt(savedCollection[val], 10) : 0);
                }

                itemObj[val] = itemArrValue;
                return itemObj;
            });
            computedCollection[key] = computedItemArr;
        });

        return computedCollection;
    },

    getComputedCollection: function() {
		var newCollection = this.getUniqueChannels(this.props.collection),
            savedCollection, computedCollection;

        if (!this.props.savedCollection) {
            computedCollection = this.getCollectionWithValues(newCollection);
            return computedCollection;
        }

        savedCollection = this.getUniqueChannels(Object.keys(this.props.savedCollection).map(function(key) {
            return {"channelName": key};
        }));

        computedCollection = this.getCollectionWithValues(newCollection, this.props.savedCollection);
        return computedCollection;
    },

    renderNumericCollection: function() {
		var collection = this.getComputedCollection();

        return (
            <NumericCollection name="numericCollection" collection={collection} onChange={this.onValueChange} />
        )
    },

    render: function() {
        var isUIChanged = !!(this.state.isUIChanged);

        return (
            <div className="containerButtonBar sm-pad">
                {this.renderNumericCollection()}

                <Row>
                    <Col xs={12} className="u-padding-0px">
                        <Button disabled={!isUIChanged} className="btn-lightBg btn-save btn-block" onClick={this.onSave} >Save</Button>
                    </Col>
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