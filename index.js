'use strict';
const request = require('request');

const SPACE_INDENT = 4;
const STT_CODE_OK = 200;

let pathname = '/myself';
let maxErr = 10;
let _callback = () => {
};

let hostname;
let timeout = 600000;

let errCounter = 0;
let intervalID = -1;

const requestEach = () => {
    request(hostname + pathname, (error, res) => {
        if (res && res.statusCode === STT_CODE_OK) {
            errCounter = 0;
            requestEach();
            _callback(null, res);
        } else {
            errCounter++;
            if (errCounter < maxErr) {
            } else {
                _callback(new Error(`Requested ${errCounter} time.`));
                clearInterval(intervalID);
            }
        }
    });
};

let handleOption = (option) => {

    hostname = new URL(option.hostname).origin;
    timeout = parseInt(option.timeout) || timeout;
    if (typeof option !== 'object') {
        throw new Error('option must be object.');
    }
    pathname = option.pathname || pathname;
    maxErr = option.maxErr || maxErr;
};

let requestMyself = (option, callback) => {
    handleOption(option);

    if (option.callback && typeof option.callback !== 'function') {
        throw new Error('callback must be function.')
    }
    _callback = callback || _callback;

    intervalID = setInterval(requestEach, timeout);
    return (req, res, next) => {
        if (req.originalUrl === pathname) {
            res.writeHead(STT_CODE_OK, {
                'Content-Type': 'text/json; charset=utf-8'
            });
            res.end(JSON.stringify({isRunning: true}, null, SPACE_INDENT));
        } else {
            next();
        }
    };
};

module.exports = requestMyself;
