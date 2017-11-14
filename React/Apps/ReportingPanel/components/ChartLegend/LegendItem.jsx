import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'react-bootstrap'

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

        return (
            <Col xs={2}>
                <div className="legend-item" onClick={this.toggleSerie} style={style}>
                    {serie.name}
                </div>
            </Col>
        );
    }
}

LegendItem.propTypes = {
    serie: PropTypes.object.isRequired
};

export default LegendItem;
