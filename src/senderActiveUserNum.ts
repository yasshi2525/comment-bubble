import { ActiveUserNumMessageData, activeUserNumMessageType, HeartbeatEvent } from "./parameterHeartbeat";
import { Constants } from "./style";

export interface ActiveUserNumSenderParameterObject {
    scene: g.Scene;
    preventAutoStart?: boolean;
    tick: () => number;
}

interface HeartbeatData {
    /**
     * tick
     */
    lastReceived: number;
    active: boolean;
    expireTimer?: g.TimerIdentifier;
}

export class ActiveUserNumSender {
    readonly _scene: g.Scene;
    readonly _userTable: Map<string, HeartbeatData>;
    readonly _tick: () => number;
    _isStarted: boolean;
    constructor(param: ActiveUserNumSenderParameterObject) {
        this._scene = param.scene;
        this._tick = param.tick;
        this._userTable = new Map();
        this._isStarted = false;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("heartbeat sender was already started.");
        }
        if (!g.game.isActiveInstance()) {
            throw new Error("passive instance cannot send heartbeat.");
        }
    }

    accept(ev: HeartbeatEvent): void {
        const sleepTime = Constants.game.active.heartbeat.expire - Math.floor((this._tick() - ev.tick) / g.game.fps * 1000);
        if (sleepTime > 0) {
            const data = this._userTable.get(ev.senderID);
            if (!data) {
            // new user
                this._userTable.set(ev.senderID, {
                    lastReceived: ev.tick,
                    active: true,
                    expireTimer: this._createExpireTimer(ev.senderID, sleepTime),
                });
                this.send();
            }
            else {
                const oldActive = data.active;
                data.lastReceived = ev.tick;
                data.active = true;
                this._clearTimer(data.expireTimer);
                data.expireTimer = this._createExpireTimer(ev.senderID, sleepTime);
                // came back user
                if (!oldActive) {
                    this.send();
                }
            }
        }
    }

    send(): void {
        g.game.raiseEvent(new g.MessageEvent({
            type: activeUserNumMessageType,
            data: {
                active: this.activeNum(),
            },
        } satisfies ActiveUserNumMessageData));
    }

    activeNum(): number {
        return [...this._userTable.values()].filter(d => d.active).length;
    }

    /**
     * @param sleepTime 待機時間(ms)
     */
    _createExpireTimer(playerID: string, sleepTime: number): g.TimerIdentifier {
        return this._scene.setTimeout(() => this._handleExpire(playerID), sleepTime);
    }

    _handleExpire(playerID: string): void {
        const data = this._userTable.get(playerID);
        if (!data) {
            throw new Error(`no heart beat data (playerID = ${playerID})`);
        }
        if (data.expireTimer) {
            this._clearTimer(data.expireTimer);
        }
        data.active = false;
        data.expireTimer = undefined;
        // deactive
        this.send();
    }

    _clearTimer(timer?: g.TimerIdentifier): void {
        if (!timer) {
            return;
        }
        // 最新の Akashic Engine では削除済みタイマーを削除しても無視するが、古い Ver で動いている可能性を考えガードしている
        if (!timer.destroyed()) {
            this._scene.clearTimeout(timer);
        }
    }
}
