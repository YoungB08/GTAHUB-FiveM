const fs = require('fs');
const path = require('path');

// Protect against FiveM filesystem sandbox violations (e.g. Prisma checking for .env outside resource root)
const origExistsSync = fs.existsSync;
fs.existsSync = function (p) {
    try {
        return origExistsSync.call(fs, p);
    } catch (e) {
        return false;
    }
};

const origStatSync = fs.statSync;
fs.statSync = function (p, options) {
    try {
        return origStatSync.call(fs, p, options);
    } catch (e) {
        return undefined;
    }
};

const origLstatSync = fs.lstatSync;
fs.lstatSync = function (p, options) {
    try {
        return origLstatSync.call(fs, p, options);
    } catch (e) {
        return undefined;
    }
};

const origAccessSync = fs.accessSync;
if (typeof origAccessSync === 'function') {
    fs.accessSync = function (p, mode) {
        try {
            return origAccessSync.call(fs, p, mode);
        } catch (e) {
            return undefined;
        }
    };
}

const resourcePath = GetResourcePath(GetCurrentResourceName());
const isWindows = process.platform === 'win32';
const engineName = isWindows ? 'query-engine-windows.exe' : 'query-engine-linux-musl';
process.env.PRISMA_QUERY_ENGINE_BINARY = path.join(resourcePath, 'build', engineName);

const hmr = require('./src/hmr.js');
const hotReload = GetConvar('soz_core_hot_reload', 'false') == 'true';

if (hotReload) {
    console.log('[soz-core] hot module reload enabled');

    hmr.hmr('build/server.js', newContent => {
        console.log('[soz-core] hmr: reloading dist/server.js');
        emit('soz_core.__internal__.stop_application');

        eval(newContent);
    });

    hmr.hmr('build/client.js', newContent => {
        console.log('[soz-core] hmr: reloading dist/client.js');

        emitNet('soz-core:__development__:hot-reload', -1, newContent);
    });
}
