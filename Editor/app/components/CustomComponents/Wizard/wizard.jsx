var React = window.React,
    Modal = require("../../BootstrapComponents/Modal.jsx");

module.exports = React.createClass({
    mixins: [],
    propTypes: {
        activeSlide: React.PropTypes.number,
        onClose: React.PropTypes.func,
        infinite: React.PropTypes.bool
    },
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function (props) {
        props = props || this.props;
        return {
            activeSlide: (props.activeSlide-1) || 0,
            totalSteps: props.children.length || 0,
            modalShow: true
        };
    },
    getNextStep: function(){
        var nextStep = this.state.activeSlide;
        nextStep++;
        if(nextStep >= this.state.totalSteps && this.props.infinite){
            nextStep = 0;
        }else if(nextStep >= this.state.totalSteps && !this.props.infinite){
            nextStep = null;
        }
        return nextStep;
    },
    getPrevStep: function(){
        var prevStep = this.state.activeSlide;
        prevStep--;
        if(prevStep < 0 && this.props.infinite){
            prevStep = this.state.totalSteps;
            prevStep--
        }else if(prevStep < 0 && !this.props.infinite){
            prevStep = null;
        }
        return prevStep;
    },
    finishWizard: function(){
        this.setState({activeSlide: null});
    },
    nextStep: function(){
        var nextStep = this.getNextStep()
        if(nextStep == null){
            this.finishWizard();
        }else{
            this.setState({activeSlide: nextStep});
        }
    },
    prevStep: function(){
        var prevStep = this.getPrevStep();
        if(prevStep == null){
            this.finishWizard();
        }else{
            this.setState({activeSlide: prevStep});
        }
    },
    getCurrentSlide: function(){
        return Array.isArray(this.props.children) ? this.props.children[this.state.activeSlide] : this.props.children ;
    },
    renderNavigation(back,next){
        return (
            <div>
                {(this.getNextStep() == null) ? <div onClick={this.nextStep} className="btn-lightBg btn btn-red"> {next || "Finish"}<i className="fa fa-chevron-right mL-10"></i></div> : <div onClick={this.nextStep} className="btn-lightBg btn btn-red">{next || "Next"}<i className="fa fa-chevron-right mL-10"></i></div>}

                {(this.getPrevStep() == null) ? null : <div onClick={this.prevStep} className="btn-lightBg btn btn-red pull-left "><i className="fa fa-chevron-left mR-5"></i>{back || "Previous"}</div>}

            </div>
        )
    },
    onModalClose: function() {
        this.setState({modalShow: false});
    },
    render: function () {
        if (this.state.activeSlide == null || !this.state.modalShow) {
            return null;
        }

        var currentSlide = this.getCurrentSlide();
        return (<Modal className="_ap_modal wizard_modal" keyboard={true} onRequestHide={this.props.onClose ? this.props.onClose : this.onModalClose} title={currentSlide.props.title} animation={true}>
            <div className="modal-body">
                {currentSlide}
            </div>
        <div className="modal-footer modalfooter-btn row">
            {this.renderNavigation(currentSlide.props.prev,currentSlide.props.next)}
        </div>
        </Modal>);
    }
})