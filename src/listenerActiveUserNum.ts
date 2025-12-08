import { ActiveUserNumMessageData, isActiveUserNumMessageData } from "./parameterHeartbeat";

export interface ActiveUserNumListenerParameterObject {
    scene: g.Scene;
    preventAutoStart?: boolean;
}

export class ActiveUserNumListener {
    readonly onReceive: g.Trigger<number> = new g.Trigger();
    readonly _scene: g.Scene;
    _isStarted: boolean;

    constructor(param: ActiveUserNumListenerParameterObject) {
        this._scene = param.scene;
        this._isStarted = false;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("active user num listener was already started.");
        }
        if (g.game.isActiveInstance()) {
            throw new Error("active instance cannot receive active user num.");
        }
        this._scene.onMessage.add(this._handleMessage, this);
        this._isStarted = true;
    }

    _handleMessage(ev: g.MessageEvent): void {
        if (isActiveUserNumMessageData(ev.data)) {
            this._handleActiveUserNumMessage(ev.data.data);
        }
    }

    _handleActiveUserNumMessage(ev: ActiveUserNumMessageData["data"]): void {
        this.onReceive.fire(ev.active);
    }
}
