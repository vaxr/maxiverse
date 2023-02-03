import React, {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

interface IMsg {
    user: string;
    msg: string;
}

const username = "Max" + `${Math.random()}`.substr(-6);

const Chat: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [chat, setChat] = useState<IMsg[]>([]);
    const [msg, setMsg] = useState<string>("");

    useEffect((): any => {
        const socket = io(process.env.BASE_URL!, {
            // TODO
            path: "/api/socketio",
        });
        socket.on("connect", () => {
            console.log("SOCKET CONNECTED!", socket.id);
            setConnected(true);
        });
        socket.on("message", (message: IMsg) => {
            chat.push(message);
            setChat([...chat].slice(-10));
        });
        if (socket) return () => socket.disconnect();
    }, []);

    const sendMessage = async () => {
        if (msg) {
            const message: IMsg = {
                user: username,
                msg,
            };
            const resp = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
            });
            if (resp.ok) setMsg("");
        }
        inputRef?.current?.focus();
    };

    return (
        <div style={{width: "20em"}}>
            <div>
                {chat.length ? (
                    chat.map((chat, i) => (
                        <p key={"msg_" + i}>
                            <b style={{color: chat.user === username ? 'red' : 'black'}}>
                                {chat.user}:
                            </b> {chat.msg}
                        </p>
                    ))
                ) : (
                    <p>No chat messages</p>
                )}
            </div>
            <div>
                <input
                    ref={inputRef}
                    type="text"
                    value={msg}
                    placeholder={connected ? "Type a message..." : "Connecting..."}
                    disabled={!connected}
                    onChange={(e) => {
                        setMsg(e.target.value);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            sendMessage();
                        }
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!connected}
                >
                    SEND
                </button>
            </div>
        </div>
    );
};

export default Chat;
