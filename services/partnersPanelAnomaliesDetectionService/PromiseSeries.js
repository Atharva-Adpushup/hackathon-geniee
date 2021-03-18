
Promise.resolveInSeries = function(queue) {
    function methodThatReturnsAPromise(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Processing ${id}`);
                resolve(id);
            }, 1000);
        });
    }
    var responseAll = [];
    return queue.reduce((accumulatorPromise, nextItem) => {
        return accumulatorPromise.then(() => {
            return methodThatReturnsAPromise(nextItem).then(res => {
                responseAll.push(res);
                return responseAll;
            });
        });
    }, Promise.resolve());
    
};

// result.then(e => {
//     console.log("Resolution is complete! Let's party.", responseAll);
// });    

Promise.resolveInSeries([1,2,3]).then(e => {
    console.log("Resolution is complete! Let's party.", e);
});   
