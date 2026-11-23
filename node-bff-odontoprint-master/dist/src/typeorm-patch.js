const { MetadataArgsStorage } = require('typeorm/metadata-args/MetadataArgsStorage');
const proto03 = MetadataArgsStorage.prototype;
function applyPatches(target) {
    if (!target)
        return;
    if (!target.foreignKeys)
        target.foreignKeys = [];
    if (!target.uniques)
        target.uniques = [];
    if (!target.checks)
        target.checks = [];
    if (!target.exclusions)
        target.exclusions = [];
    for (const key of Object.getOwnPropertyNames(proto03)) {
        if (typeof proto03[key] === 'function' && typeof target[key] !== 'function') {
            target[key] = proto03[key].bind(target);
        }
    }
}
let _storage = global.typeormMetadataArgsStorage;
if (_storage) {
    applyPatches(_storage);
}
Object.defineProperty(global, 'typeormMetadataArgsStorage', {
    configurable: true,
    enumerable: true,
    get() {
        return _storage;
    },
    set(val) {
        _storage = val;
        applyPatches(_storage);
    },
});
//# sourceMappingURL=typeorm-patch.js.map