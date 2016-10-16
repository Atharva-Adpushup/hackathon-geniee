var React = window.React,
    CommonConsts = require("../../../../editor/commonConsts"),
    Modal = require("../../../BootstrapComponents/Modal.jsx");

module.exports = React.createClass({
    renderWaitMessage: function () {
        return (
            <div>
            <div className='modal-body'>
                <h4>Saving Please Wait</h4>
                <p>Optimization is few seconds away.</p>
            </div>
            <div className="spin"></div>
        </div>)
    },
    resetSaveStatus: function(){
        this.props.flux.actions.resetSaveStatus();
    },
    renderSuccessMessage: function () {
        return (
            <div className='modal-body'>
                <h4>Saved</h4>
                <p>Happy Optimization.</p>
            </div>
        )
    },
    renderErrorMessage: function () {
        return (
            <div className='modal-body'>
                <h4>Save Error</h4>
                <p>There was some error while saving your changes, please try again by clicking save button again. If problem persists, please contact support by using chat widget on bottom right of your screen.</p>
            </div>
        )
    },
    render: function () {
        return (<Modal close={this.props.status != CommonConsts.enums.status.PENDING} {...this.props} onRequestHide={this.resetSaveStatus} className="_ap_modal_logo  _ap_modal_smily" keyboard={true} title='Saved' animation={true}>
                {this.props.status == CommonConsts.enums.status.PENDING ? this.renderWaitMessage() : (this.props.status == CommonConsts.enums.status.SUCCESS) ? this.renderSuccessMessage() : this.renderErrorMessage()}
        </Modal>);
    }
});