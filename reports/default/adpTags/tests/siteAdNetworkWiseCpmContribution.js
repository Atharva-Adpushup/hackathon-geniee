const queryHelper = require('../queries/siteAdNetworkWiseDataContribution');

let params = {
	siteId: 31000,
	fromDate: '2017-11-20',
	toDate: '2017-11-24',
	transform: true
};

function getData() {
	queryHelper
		.getData(params)
		.then(response => {
			console.log(`Got ad network data: ${JSON.stringify(response)}`);
			return true;
		})
		.catch(err => {
			console.log(`Error while fetching ad network data: ${err.message}`);
			return false;
		});
}

setTimeout(() => {
	getData();
}, 3000);

/*****RESULT DATA*****/
//{"aggregated":{"ADSENSE":{"revenue":534.39,"impressions":691251,"requests":841248,"cpm":0.77},"ADX":{"revenue":225.16,"impressions":252986,"requests":841248,"cpm":0.89},"DFP":{"revenue":326.38,"impressions":372159,"requests":841248,"cpm":0.88}},"dayWise":{"ADSENSE":{"2017-11-20":{"revenue":95.8,"impressions":142543,"requests":168300,"cpm":0.67},"2017-11-21":{"revenue":91.2,"impressions":136699,"requests":171863,"cpm":0.67},"2017-11-22":{"revenue":116.49,"impressions":138822,"requests":175565,"cpm":0.84},"2017-11-23":{"revenue":98.28,"impressions":127819,"requests":159665,"cpm":0.77},"2017-11-24":{"revenue":132.62,"impressions":145368,"requests":165855,"cpm":0.91}},"ADX":{"2017-11-20":{"revenue":43.13,"impressions":53221,"requests":168300,"cpm":0.81},"2017-11-21":{"revenue":44.66,"impressions":53675,"requests":171863,"cpm":0.83},"2017-11-22":{"revenue":47.55,"impressions":52804,"requests":175565,"cpm":0.9},"2017-11-23":{"revenue":39.47,"impressions":45940,"requests":159665,"cpm":0.86},"2017-11-24":{"revenue":50.35,"impressions":47346,"requests":165855,"cpm":1.06}},"DFP":{"2017-11-20":{"revenue":143.17,"impressions":166420,"requests":168300,"cpm":0.86},"2017-11-21":{"revenue":36.9,"impressions":53603,"requests":171863,"cpm":0.69},"2017-11-22":{"revenue":0.5,"impressions":753,"requests":175565,"cpm":0.66},"2017-11-23":{"revenue":0.35,"impressions":421,"requests":159665,"cpm":0.83},"2017-11-24":{"revenue":145.46,"impressions":150962,"requests":165855,"cpm":0.96}}},"contribution":{"revenue":{"ADSENSE":49.21,"ADX":20.73,"DFP":30.06}}}
