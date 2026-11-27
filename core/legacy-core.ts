// Core helpers a legacy.js port may use as shmCore.<name>. The build imports this only into a legacy bundle whose
// body mentions "shmCore.", so every other legacy bundle is unchanged.

export { payLine } from './salary';
