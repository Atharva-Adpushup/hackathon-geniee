import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Panel, Row } from 'react-bootstrap';

class CollapsePanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open
        }

        this.toggleCollapse = this.toggleCollapse.bind(this);
    }

    toggleCollapse() {
        this.setState({ open: !this.state.open });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ ...nextProps });
    }

    render() {
        const { props, state } = this;

        return (
            <div className="_collapse-panel">
                <div onClick={this.toggleCollapse}>
                    <div className="container-fluid">
                        <Row>
                            <div className="pull-left">
                                {props.title}
                            </div>
                            <div className="pull-right">
                                {/* {
                                    !state.open ? <i className="fa fa-caret-down" title={props.tooltipMessage}></i> : <i className="fa fa-caret-up"></i>
                                } */}
                            </div>
                        </Row>
                    </div>
                </div>
                <Panel collapsible expanded={state.open}>
                    {props.children}
                </Panel>
            </div>
        );
    }
}

CollapsePanel.propTypes = {
    open: PropTypes.bool,
    tooltipMessage: PropTypes.string
};

CollapsePanel.defaultProps = {
    open: false,
    tooltipMessage: 'Click to view details'
};

export default CollapsePanel;