import { HeartbeatEvent, HeartbeatMessageData, isHeartbeatMessageData } from "./parameterHeartbeat";
import { Constants } from "./style";

export interface HeartbeatListenerParameterObject {
    scene: g.Scene;
    preventAutoStart?: boolean;
    tick: () => number;
    active: () => number;
}

export class HeartbeatListener {
    /**
     * クライアントの認識しているアクティブ人数と異なる場合発火
     */
    readonly onDsync: g.Trigger = new g.Trigger();
    /**
     * クライアントから新たにハートビートを受信した場合発火
     */
    readonly onReceive: g.Trigger<HeartbeatEvent> = new g.Trigger();
    readonly _scene: g.Scene;
    readonly _lastHeartbeatTable: Map<string, number>;
    readonly _tick: () => number;
    readonly _active: () => number;
    _isStarted: boolean;

    constructor(param: HeartbeatListenerParameterObject) {
        this._scene = param.scene;
        this._lastHeartbeatTable = new Map();
        this._tick = param.tick;
        this._active = param.active;
        this._isStarted = false;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("heartbeat listener was already started.");
        }
        if (!g.game.isActiveInstance()) {
            throw new Error("passive instance cannot receive heartbeat.");
        }
        this._scene.onMessage.add(this._handleMessage, this);
        this._isStarted = true;
    }

    _handleMessage(ev: g.MessageEvent): void {
        if (isHeartbeatMessageData(ev.data)) {
            this._handleHeartbeatMessage(ev.data.data);
        }
    }

    _handleHeartbeatMessage(ev: HeartbeatMessageData["data"]): void {
        if (!this._isExpiredHeartbeat(ev.tick)) {
            const lastHeartbeat = this._lastHeartbeatTable.get(ev.senderID);
            if (lastHeartbeat === undefined) {
                this._lastHeartbeatTable.set(ev.senderID, ev.tick);
                this.onReceive.fire(ev);
            }
            // クライアントがF5したときは過去の時刻からのheartbeatが送られてきうるのでガードしている
            else if (ev.tick > lastHeartbeat) {
                this._lastHeartbeatTable.set(ev.senderID, ev.tick);
                this.onReceive.fire(ev);
            }
            else {
                this._fireIfDsync(ev.active);
            }
        }
        else {
            this._fireIfDsync(ev.active);
        }
    }

    _fireIfDsync(clientActiveNumber: HeartbeatMessageData["data"]["active"]): void {
        if (clientActiveNumber !== this._active()) {
            this.onDsync.fire();
        }
    }

    /**
     * あまりにも古い時刻の heartbeat は無効とする（クライアントがおっかけ再生をしているときに該当）
     * @param sendingTick 送信された時刻
     */
    _isExpiredHeartbeat(sendingTick: number): boolean {
        return this._tick() - sendingTick > Constants.game.active.heartbeat.expire / 1000 * g.game.fps;
    }
}
