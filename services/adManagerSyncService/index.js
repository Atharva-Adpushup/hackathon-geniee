const runService = require('./syncService');

runService()
.then(result => {
    if(result instanceof Error) {
        console.error(result);
        process.exit(1);
    } else {
        process.exit(0);
    }
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
