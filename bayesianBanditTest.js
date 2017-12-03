const Promise = require('bluebird'),
	_ = require('lodash'),
	jsonFile = Promise.promisifyAll(require('jsonfile')),
	bayesianBanditModel = require('./bayesianBanditModel')(),
	allVariations = {
		1: {
			sum: 1, // revenue
			count: 1, // pageViews,
			cpm: 1,
			traffic: 0,
			revenue: 0
		},
		2: {
			sum: 1, // revenue
			count: 1, // pageViews
			cpm: 0.5,
			traffic: 0,
			revenue: 0
		},
		3: {
			sum: 1, // revenue
			count: 1, // pageViews
			cpm: 0.3,
			traffic: 0,
			revenue: 0
		}
	},
	cpms = {
		1: {
			1: 1,
			2: 1,
			3: 0.7
		},
		2: {
			1: 1,
			2: 0.4,
			3: 0.6
		},
		3: {
			1: 1,
			2: 0.5,
			3: 0.8
		}
	};

function processOutput(output) {
	let variations = {
		1: {
			traffic: 0,
			revenue: 0
		},
		2: {
			traffic: 0,
			revenue: 0
		},
		3: {
			traffic: 0,
			revenue: 0
		}
	};
	output.forEach(element => (variations[element].traffic += 1));
	_.forEach(variations, (variation, key) => {
		variation.revenue = Number((allVariations[key].cpm * variation.traffic / 1000).toFixed(3));
	});
	return Promise.resolve(variations);
	debugger;
}

function runBayesian() {
	let BayesianOutput = [],
		runs = 10000;
	_.times(runs, () => {
		let chosenVariation = bayesianBanditModel.chooseVariation(allVariations);
		BayesianOutput.push(chosenVariation[0]);
	});
	return Promise.resolve(BayesianOutput);
}

function writeFile(data) {
	return jsonFile
		.writeFileAsync('./results.json', data, { flag: 'a', spaces: 4 })
		.then(() => console.log('File written'))
		.catch(err => console.log('Error while writing file'));
}

function modifyAndWriteData(run, processedData) {
	_.forEach(processedData, (data, key) => {
		allVariations[key].traffic += data.traffic;
		allVariations[key].revenue += data.revenue;
		allVariations[key].cpm = cpms[key][run];
		allVariations[key].sum = data.revenue;
		allVariations[key].count += data.traffic;
		processedData[key].cpm = cpms[key][run - 1];
	});
	return writeFile(processedData);
}

function init(run) {
	return runBayesian()
		.then(processOutput)
		.then(modifyAndWriteData.bind(null, run));
}

Promise.each([2, 3], run => init(run)).then(() => writeFile(allVariations));
