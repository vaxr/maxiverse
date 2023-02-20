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
    const [hasFocus, setHasFocus] = useState<boolean>(false)
    const inputHasFocus = () => {
        const hasFocusNow = inputRef.current === inputRef.current?.ownerDocument.activeElement
        if (hasFocusNow != hasFocus) {
            setHasFocus(hasFocusNow)
        }
        return hasFocusNow
    }

    useEffect((): any => {
        const focusInputOnMKey = (e: KeyboardEvent) => {
            if (e.key === "m" && !inputHasFocus()) {
                inputRef.current?.focus()
                e.preventDefault()
            }
        }
        document.addEventListener('keydown', focusInputOnMKey)
        const socket = io(process.env.BASE_URL!, {
            // TODO
            path: "/api/socketio",
        });
        socket.on("connect", () => {
            setConnected(true);
        });
        socket.on('chat', (message: IMsg) => {
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
                    <div>
                        No chat messages<br/><br/>
                    </div>
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
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            sendMessage();
                        } else if (e.key === "Escape") {
                            setMsg('')
                            inputRef.current?.blur()
                        }
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!connected}
                >
                    SEND
                </button>
                <>
                    <br/>
                    <small>Press {inputHasFocus() ? 'ESC to return to game' : 'M to write a message'}</small>
                </>
            </div>
        </div>
    );
};

export default Chat;
