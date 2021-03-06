"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("./errors");
const AMPLITUDE_TOKEN_ENDPOINT = 'https://api.amplitude.com';
const AMPLITUDE_DASHBOARD_ENDPOINT = 'https://amplitude.com/api/2';
axios_1.default.defaults.headers.common['User-Agent'] = `amplitude/${
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../package').version} node/${process.version} (${process.arch})`;
const camelCaseToSnakeCasePropertyMap = {
    userId: 'user_id',
    deviceId: 'device_id',
    sessionId: 'session_id',
    eventType: 'event_type',
    eventProperties: 'event_properties',
    userProperties: 'user_properties',
    appVersion: 'app_version',
    osName: 'os_name',
    osVersion: 'os_version',
    deviceBrand: 'device_brand',
    deviceManufacturer: 'device_manufacturer',
    deviceModel: 'device_model',
    locationLat: 'location_lat',
    locationLng: 'location_lng'
};
class Amplitude {
    constructor(token, options = {}) {
        if (!token) {
            throw new Error('No token provided');
        }
        this.token = token;
        this.tokenEndpoint =
            options.tokenEndpoint ||
                process.env.AMPLITUDE_TOKEN_ENDPOINT ||
                AMPLITUDE_TOKEN_ENDPOINT;
        this.secretKey = options.secretKey;
        this.userId = options.userId || options.user_id;
        this.deviceId = options.deviceId || options.device_id;
        this.sessionId = options.sessionId || options.session_id;
    }
    _generateRequestData(data) {
        if (!Array.isArray(data)) {
            data = [data];
        }
        return data.map((item) => {
            return Object.keys(item).reduce((obj, key) => {
                const transformedKey = camelCaseToSnakeCasePropertyMap[key] || key;
                obj[transformedKey] = item[key];
                return obj;
            }, {
                event_type: item.event_type || item.eventType,
                device_id: item.device_id || this.deviceId,
                session_id: item.session_id || this.sessionId,
                user_id: item.user_id || this.userId
            });
        });
    }
    identify(data) {
        const transformedData = this._generateRequestData(data);
        const params = {
            api_key: this.token,
            identification: JSON.stringify(transformedData)
        };
        const encodedParams = Object.keys(params)
            .map(key => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        })
            .join('&');
        return errors_1.axiosErrorCatcher(axios_1.default
            .post(`${this.tokenEndpoint}/identify`, encodedParams, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        })
            .then(res => res.data));
    }
    track(data, options) {
        const transformedData = this._generateRequestData(data);
        const params = {
            api_key: this.token,
            events: transformedData,
            options
        };
        return errors_1.axiosErrorCatcher(axios_1.default
            .post(`${this.tokenEndpoint}/2/httpapi`, params)
            .then(res => res.data));
    }
    export(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.secretKey) {
                    throw new Error('secretKey must be set to use the export method');
                }
                if (!options.start || !options.end) {
                    throw new Error('`start` and `end` are required options');
                }
                const res = yield axios_1.default.get(`${AMPLITUDE_DASHBOARD_ENDPOINT}/export`, {
                    auth: {
                        username: this.token,
                        password: this.secretKey
                    },
                    params: {
                        start: options.start,
                        end: options.end
                    }
                });
                return res;
            }
            catch (err) {
                if (err.response) {
                    throw new errors_1.AmplitudeErrorResponse(err);
                }
                throw err;
            }
        });
    }
    userSearch(userSearchId) {
        if (!this.secretKey) {
            throw new Error('secretKey must be set to use the userSearch method');
        }
        if (!userSearchId) {
            throw new Error('value to search for must be passed');
        }
        return errors_1.axiosErrorCatcher(axios_1.default
            .get(`${AMPLITUDE_DASHBOARD_ENDPOINT}/usersearch`, {
            auth: {
                username: this.token,
                password: this.secretKey
            },
            params: {
                user: userSearchId
            }
        })
            .then(res => res.data));
    }
    userActivity(amplitudeId, params) {
        if (!params) {
            params = {
                user: amplitudeId
            };
        }
        else {
            params.user = amplitudeId;
        }
        if (!this.secretKey) {
            throw new Error('secretKey must be set to use the userActivity method');
        }
        if (!amplitudeId) {
            throw new Error('Amplitude ID must be passed');
        }
        return errors_1.axiosErrorCatcher(axios_1.default
            .get(`${AMPLITUDE_DASHBOARD_ENDPOINT}/useractivity`, {
            auth: {
                username: this.token,
                password: this.secretKey
            },
            params
        })
            .then(res => res.data));
    }
    eventSegmentation(params) {
        if (!this.secretKey) {
            throw new Error('secretKey must be set to use the eventSegmentation method');
        }
        if (!params || !params.e || !params.start || !params.end) {
            throw new Error('`e`, `start` and `end` are required data properties');
        }
        if (typeof params.e === 'object') {
            params.e = JSON.stringify(params.e);
        }
        return errors_1.axiosErrorCatcher(axios_1.default
            .get(`${AMPLITUDE_DASHBOARD_ENDPOINT}/events/segmentation`, {
            auth: {
                username: this.token,
                password: this.secretKey
            },
            params
        })
            .then(res => res.data));
    }
    eventList(params) {
        if (!this.secretKey) {
            throw new Error('secretKey must be set to use the eventList method');
        }
        return errors_1.axiosErrorCatcher(axios_1.default
            .get(`${AMPLITUDE_DASHBOARD_ENDPOINT}/events/list`, {
            auth: {
                username: this.token,
                password: this.secretKey
            },
        })
            .then(res => res.data));
    }
}
exports.default = Amplitude;
//# sourceMappingURL=amplitude.js.map