import _ from 'lodash';

const immutablePush = (arr, newEntry) => [...arr, newEntry],
	immutablePop = arr => arr.slice(0, -1),
	immutableArrayDelete = (arr, index) => arr.slice(0, index).concat(arr.slice(index + 1)),
	immutableObjectDelete = (object, keyToMatch, valueToDelete) => _.omitBy(object, { [keyToMatch]: valueToDelete });

export { immutableArrayDelete, immutablePop, immutablePush, immutableObjectDelete };
