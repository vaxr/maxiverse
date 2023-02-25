import {TimestampMs} from "@/core/model/protocol";

export interface Clock {
    getTimestampMs(): TimestampMs
}

export class SystemClock implements Clock {
    getTimestampMs(): TimestampMs {
        return new Date().getTime()
    }
}

export class ServerClockEstimate implements Clock {
    getTimestampMs(): TimestampMs {
        throw 'NOT IMPLEMENTED' // TODO
    }
}
