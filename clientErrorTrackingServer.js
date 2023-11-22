const express = require('express');
const { clientErrorTrackingService } = require('./configs/config')

const app = express();

app.get('*', (req, res) => {
    const redirectHost = clientErrorTrackingService.appUrl
    res.redirect(307, `${redirectHost}${req.url}`)
});

app.listen(clientErrorTrackingService.port, () => console.log(`Server listening on port: ${clientErrorTrackingService.port}`))
