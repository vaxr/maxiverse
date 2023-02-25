import {TimestampMs} from "@/core/model/protocol";
import {injectable} from "inversify";

export interface Clock {
    getTimestampMs(): TimestampMs
}

@injectable()
export class SystemClock implements Clock {
    getTimestampMs(): TimestampMs {
        return new Date().getTime()
    }
}

@injectable()
export class ServerClockEstimate implements Clock {
    getTimestampMs(): TimestampMs {
        throw 'NOT IMPLEMENTED' // TODO
    }
}
