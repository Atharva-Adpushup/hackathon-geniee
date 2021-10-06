const Yup = require('yup');

const adUnitValidationSchema = Yup.object().shape({
	name: Yup.string().required(),
	code: Yup.string().required(),
	isActive: Yup.boolean(),
	platform: Yup.string()
		.oneOf(['DESKTOP', 'MOBILE', 'TABLET'])
		.required(),
	width: Yup.string().required(),
	height: Yup.string().required()
});

const lineItemValidationSchema = Yup.object().shape({
	id: Yup.string().required()
});

const pnpConfigValidation = {
	siteId: Yup.string().required('SiteId is requird'),
	pnpSiteId: Yup.string().required('PnP siteId is required'),
	adUnits: Yup.array()
		.of(adUnitValidationSchema)
		.min(1),
	lineItems: Yup.array().of(lineItemValidationSchema),
	native: Yup.boolean(),
	outstream: Yup.boolean(),
	filledInsertionTrigger: Yup.number()
		.min(30)
		.optional(),
	unfilledInsertionTrigger: Yup.number()
		.min(5)
		.optional(),
	refreshType: Yup.string()
		.oneOf(['activeView', 'activeTab', 'bgRefresh'])
		.required()
};

module.exports = {
	pnpConfigValidation
};
