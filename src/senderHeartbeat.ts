import { Constants } from "./style";
import { HeartbeatMessageData, heartbeatMessageType } from "./parameterHeartbeat";

export interface HeartbeatSenderParameterObject {
    scene: g.Scene;
    preventAutoStart?: boolean;
    tick: () => number;
    active: () => number;
}

export class HeartbeatSender {
    readonly _scene: g.Scene;
    readonly _tick: () => number;
    readonly _active: () => number;
    _isStarted: boolean;

    constructor(param: HeartbeatSenderParameterObject) {
        this._scene = param.scene;
        this._tick = param.tick;
        this._active = param.active;
        this._isStarted = false;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("heartbeat sender was already started.");
        }
        if (g.game.isActiveInstance()) {
            throw new Error("active instance cannot send heartbeat.");
        }
        this._sendHeartbeat();
        this._scene.setInterval(this._sendHeartbeat, Constants.game.active.heartbeat.interval, this);
        this._isStarted = true;
    }

    _sendHeartbeat(): void {
        if (g.game.isSkipping) {
            return;
        }
        if (!g.game.selfId) {
            // クライアントは必ずIDを持つので非到達
            return;
        }
        g.game.raiseEvent(new g.MessageEvent({
            type: heartbeatMessageType,
            data: {
                senderID: g.game.selfId,
                tick: this._tick(),
                active: this._active(),
            },
        } satisfies HeartbeatMessageData));
    }
}
