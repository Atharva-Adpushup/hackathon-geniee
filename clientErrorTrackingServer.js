const express = require('express');
const { clientErrorTrackingService } = require('./configs/config')
const path = require('path');

const app = express();

app.get('*', (req, res) => {
    res.sendFile(`${path.join(process.cwd(), 'clientDist', req.url)}`)
});

app.listen(clientErrorTrackingService.port, () => console.log(`Server listening on port: ${clientErrorTrackingService.port}`))
