import { Schema, valuesOf } from 'normalizr';

const channelSchema = new Schema('channelData', { idAttribute: 'id' }),
	variationSchema = new Schema('variationByIds'),
	sectionSchema = new Schema('sectionByIds'),
	adSchema = new Schema('adByIds');

//TODO: Find a way to change 'variations' type from {} to []
// after normalization
channelSchema.define({
	variations: valuesOf(variationSchema)
});

//TODO: Find a way to change 'sections' type from {} to []
// after normalization
variationSchema.define({
	sections: valuesOf(sectionSchema)
});

//TODO: Find a way to change 'ads' type from {} to []
// after normalization
sectionSchema.define({
	ads: valuesOf(adSchema)
});

export { channelSchema };
