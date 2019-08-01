const uuid = require('uuid');

function generateSectionName({
	service,
	platform = null,
	pagegroup = null,
	width,
	height,
	id = uuid.v4()
}) {
	const name = ['AP', service];

	if (platform) name.push(platform.toUpperCase().slice(0, 1));
	if (pagegroup) name.push(pagegroup.toUpperCase().replace(/\s/g, '-'));

	name.push(`${width}X${height}`);
	name.push(id.slice(0, 5));

	return name.join('_');
}

module.exports = {
	generateSectionName
};
