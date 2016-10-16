var React = window.React,
    CommonConsts = require("editor/commonConsts"),
    Modal = require("BootstrapComponents/Modal.jsx");

module.exports = React.createClass({
    renderWaitMessage: function () {
        return (
            <div>
                <div className='modal-body'>
                    <h4>Please Wait</h4>
                    <p>AdPushup is starting up..</p>
                </div>
                <div className="spin"></div>
            </div>)
    },
    resetSaveStatus: function(){

    },
    renderErrorMessage: function () {
        return (
            <div className='modal-body'>
                <h4>Error!</h4>
                <p>Something seems wrong - please reload the window. Contact support if the issue persists.</p>
            </div>
        )
    },
    render: function () {
        return (<Modal {...this.props} onRequestHide={this.resetSaveStatus} className="_ap_modal_logo  _ap_modal_smily" title='Saved' closeButton={false} keyboard={false} animation={true}>
            {(this.props.status == CommonConsts.enums.status.LOADING || !this.props.status) ? this.renderWaitMessage() : (this.props.status == CommonConsts.enums.status.FAILED) ? this.renderErrorMessage() : null}
        </Modal>);
    }
});