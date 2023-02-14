import {NextApiRequest} from "next";
import {NextApiResponseServerIO} from "@/pages/api/types";
import {ServerState} from "@/core/server/state";

export default function handleRequest(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (req.method === "POST") {
        const mapServer = ServerState.getInstance().mapServer
        const pres = mapServer.handleRequest(req.body)
        res.status(pres.error ? 400 : 200).json(pres)
    }
};
