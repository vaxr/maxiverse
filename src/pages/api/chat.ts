import {NextApiRequest} from "next";
import {NextApiResponseServerIO} from "@/pages/api/types";

export default function handleRequest(req: NextApiRequest, res: NextApiResponseServerIO) {
    if (req.method === "POST") {
        // TODO this just mirrors for nowa
        const message = req.body;
        res?.socket?.server?.io?.emit('chat', message);
        res.status(201).json(message);
    }
};
