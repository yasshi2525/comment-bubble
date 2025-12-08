import { CannonEntity } from "./entityCannon";

export interface FireEvent {
    character: string;
    commentID?: string;
    isSelfComment: boolean;
}

export interface BulletQueueParameterObject {
    initialQueue: (FireEvent | null)[];
    cannon: CannonEntity;
}

/**
 * Queue を保存しとかないとスナップショット時に消えるため作成
 */
export class BulletQueue {
    readonly onFire: g.Trigger<FireEvent | null> = new g.Trigger();
    readonly cannon: CannonEntity;
    readonly _queue: (FireEvent | null)[];

    constructor(param: BulletQueueParameterObject) {
        this._queue = [...param.initialQueue];
        this.cannon = param.cannon;
        this.cannon.onFire.add(this._handleFire, this);
    }

    append(event: FireEvent | null): void {
        this._queue.push(event);
    }

    _handleFire(): void {
        const top = this._queue.shift();
        if (top) {
            this.onFire.fire(top);
        }
    }
}
