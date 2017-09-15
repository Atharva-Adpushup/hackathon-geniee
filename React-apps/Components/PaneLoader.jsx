import React from 'react';

const PaneLoader = props => {
    const styles = {
        height: '300px',
        background: '#eee',
        textAlign: 'center',
        fontSize: '1.4em',
        padding: '140px',
        color: '#555',
    },
        message = props.message ? props.message : 'Loading...';
    
    return (
        <div style={styles}>
            {
                message
            }
        </div>
    );
};

export default PaneLoader;