import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap'
import commonConsts from '../../lib/commonConsts';

class LegendItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            serie: props.serie
        };

        this.toggleSerie = this.toggleSerie.bind(this);
    }

    toggleSerie() {
        const serie = this.state.serie;

        serie.visible ? serie.hide() : serie.show();
        this.setState(...serie, { visible: serie.visible });
    }

    componentWillReceiveProps(nextProps) {
        const { serie } = nextProps;

        this.setState({ serie });
    }

    render() {
        const { serie } = this.state,
            { toggleSerie } = this.props,
            fontColor = '#555';

        let style = {};
        if (serie.visible) {
            style = {
                borderBottom: `2px solid ${serie.color}`,
                color: fontColor
            };
        }

        const legendToggle = (<div className="legend-item" onClick={this.toggleSerie} style={style}>
            {serie.name}
        </div>), legendItem = commonConsts.IS_SUPERUSER ? (
            <div className="legend-col">
                {legendToggle}
            </div>
        ) : (
                <Col xs={4}>
                    {legendToggle}
                </Col>
            );

        return legendItem;
    }
}

LegendItem.propTypes = {
    serie: PropTypes.object.isRequired
};

export default LegendItem;
