var React = window.React,
    $ = window.jQuery;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    closeChannel: function (saveChnages) {
        this.props.onCloseChannel(saveChnages);
    },
    onDeleteChannel: function () {
        var cnfrm = window.confirm("Are you sure you want to delete this channel. This can't be undone");
        if(cnfrm)
            this.props.onDeleteChannel();
    },
    render: function () {
        return (<div>
            <div className="installBtnBg">
              <Row>
                <Col md={12}>
                  <Button onClick={this.closeChannel.bind(null,true)} className="btn-lightBg btn-save btn-block">Save Changes & Close</Button>
                </Col>
              </Row>
            </div>
            <div className="installBtnBg">
              <Row>
                <Col md={12}>
                  <Button onClick={this.closeChannel.bind(null,false)} className="btn-lightBg btn-cancel btn-block">Discard Changes & Close</Button>
                </Col>
              </Row>
            </div>
            <div className="installBtnBg">
              <Row>
                <Col md={12}>
                  <Button onClick={this.onDeleteChannel} className="btn-lightBg btn-cancel btn-block">Delete Channel</Button>
                </Col>
              </Row>
            </div>
        </div>);
    }
})