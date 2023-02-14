import {ClientSocket as IClientSocket, Request as PRequest, Response as PResponse} from "@/core/model/protocol";
import {io, Socket} from "socket.io-client";

export class ClientSocket implements IClientSocket {
    socket: Socket
    connected: boolean = false

    constructor() {
        this.socket = this.createSocket()
    }

    private createSocket() {
        const socket = io(process.env.BASE_URL!, {
            // TODO
            path: "/api/socketio",
        });
        socket.on("connect", () => {
            this.connected = true
        });
        socket.on("message", (message: PResponse) => {
            // TODO
        });
        // TODO disconnect socket when done
        return socket
    }

    request(req: PRequest): Promise<PResponse> {
        return fetch("/api/map", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req),
        }).then((res) => {
            return res.json()
        });
    }
}
