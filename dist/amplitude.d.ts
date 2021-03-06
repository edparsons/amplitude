import { AxiosResponse } from 'axios';
import { AmplitudeOptions, AmplitudeRequestData, AmplitudeUserActivityOptions, AmplitudeExportOptions, AmplitudeRequestDataOptions, AmplitudeSegmentationOptions, AmplitudeEventListOptions } from './public';
import { AmplitudeTrackResponse, AmplitudeIdentifyResponse, AmplitudeUserSearchResponse, AmplitudeUserActivityResponse, AmplitudeResponseBody } from './responses';
export default class Amplitude {
    private readonly token;
    private readonly tokenEndpoint;
    private readonly secretKey?;
    private readonly userId?;
    private readonly deviceId?;
    private readonly sessionId?;
    constructor(token: string, options?: AmplitudeOptions);
    private _generateRequestData;
    identify(data: AmplitudeRequestData | [AmplitudeRequestData]): Promise<AmplitudeIdentifyResponse>;
    track(data: AmplitudeRequestData | Array<AmplitudeRequestData>, options?: AmplitudeRequestDataOptions): Promise<AmplitudeTrackResponse>;
    export(options: AmplitudeExportOptions): Promise<AxiosResponse>;
    userSearch(userSearchId: string): Promise<AmplitudeUserSearchResponse>;
    userActivity(amplitudeId: string | number, params?: AmplitudeUserActivityOptions): Promise<AmplitudeUserActivityResponse>;
    eventSegmentation(params: AmplitudeSegmentationOptions): Promise<AmplitudeResponseBody>;
    eventList(params: AmplitudeEventListOptions): Promise<AmplitudeResponseBody>;
}
