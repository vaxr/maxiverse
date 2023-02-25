import {NextApiRequest} from "next";
import {Server as ServerIO} from "socket.io";
import {Server as NetServer} from "http";
import {NextApiResponseServerIO} from "@/pages/api/types";
import {ServerState} from "@/core/server/state";

export default async function handleRequest(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (!res.socket.server.io) {
        console.log("New Socket.io server ...");
        const httpServer: NetServer = res.socket.server as any;
        res.socket.server.io = new ServerIO(httpServer, {
            path: "/api/socketio",
        });
        ServerState.getInstance(res.socket.server.io)
    }
    res.end();
};
