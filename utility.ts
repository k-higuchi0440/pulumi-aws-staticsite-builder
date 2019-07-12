const name = require('./package.json')
export const addPrefix = (resourceName: string) => `${name}:${resourceName}`;
