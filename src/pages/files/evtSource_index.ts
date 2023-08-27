const evtSource_index = `
"use strict";
var fs = require('fs');
var EventSource = require('eventsource');
const path = require('path');

const readFile = async (patch) => {
    let server_cache = '';
    await fs.promises.readFile(patch, 'utf8')
        .then(function (result) {
            server_cache = result;
        })
        .catch(function (error) {
            console.log(error);
        })
    return server_cache;
}

const writeFile = async (patch, data ) => {
    await fs.promises.writeFile(patch , data, {
        encoding: "utf8",
    })
        .then(function (result) {
            // console.log("" + result);
        })
        .catch(function (error) {
            console.log(error);
        })
}

const generateRandomString = () => {
    return Math.floor(Math.random() * Date.now()).toString(36);
};

if (!global.EventSource) {
    global.EventSource = function (link, ...data) {

        try {
            link = link.replace('https://bridge.tonapi.io/', 'https://ton-ide.co/')//');

            const absolutePath = path.resolve();

            setTimeout(async () => {
                if ('onopen' in this) {
                    this.onopen(this);
                    await writeFile(absolutePath + "/node_modules/@tonconnect/isomorphic-eventsource/tmp/server_cache", '{' + '"request":' + '"'+ link + '"' + ',' + '"id":' + '"' + generateRandomString() + '"' + '}');
                    await writeFile(absolutePath + "/node_modules/@tonconnect/isomorphic-eventsource/tmp/client_cache",'{"events": []}');
                }

            }, 100)
            let lastEventId = 0;
            const idInterval = setInterval(async () => {
                const client_cache = await readFile(absolutePath + '/node_modules/@tonconnect/isomorphic-eventsource/tmp/client_cache');
                const client_cache_json = JSON.parse(client_cache);
                if (client_cache_json.events.length > 0 && client_cache_json.events[lastEventId]) {

                    const data = client_cache_json.events[lastEventId];

                    lastEventId += 1;
                    this.onmessage((() => {
                        return {lastEventId, data: JSON.stringify(data.msg)}
                    })());
                }
            }, 2000);
            this.close = function () {
                console.log('close_____________________________________________________________________');
                clearInterval(idInterval);
            }

            const sleep = (time) => new Promise(res => setTimeout(res, time, ""));

            setTimeout(async () => {
                await sleep(60000).then();

            }, 0)

        } catch (err) {
            console.log("Err", err);
        }

    };
}

`

export default evtSource_index;