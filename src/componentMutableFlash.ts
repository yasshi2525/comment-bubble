import { MutableComponent, MutableComponentParameterObject } from "./componentMutable";

export interface FlashMutableComponentParameterObject extends MutableComponentParameterObject {
    /**
     * frame
     */
    duration: number;
    /**
     * frame
     */
    initialTimeout: number;
    onUpdate: g.Trigger;
}

export interface FlashMutableComponentParam extends Omit<FlashMutableComponentParameterObject, "onUpdate"> {
};

/**
 * ダメージ時にエフェクトする性質
 */
export class FlashMutableComponent extends MutableComponent {
    readonly onEffect: g.Trigger<boolean> = new g.Trigger();
    readonly duration;
    remain: number;
    readonly _onUpdate: g.Trigger;

    constructor(param: FlashMutableComponentParameterObject) {
        super(param);
        if (!Number.isInteger(param.duration)) {
            throw new Error(`duration should be integer. (actual = ${param.duration})`);
        }
        if (param.duration <= 0) {
            throw new Error(`duration should be greater than 0. (expected ${param.duration} > 0)`);
        }
        if (!Number.isInteger(param.initialTimeout)) {
            throw new Error(`initialTimeout should be integer. (actual = ${param.initialTimeout})`);
        }
        if (param.initialTimeout < 0) {
            throw new Error(`initialTimeout should be greater than or equals 0. (expected ${param.initialTimeout} >= 0)`);
        }
        this.duration = param.duration;
        this.remain = param.initialTimeout;
        this._onUpdate = param.onUpdate;
        this.onAttack.add(this._start, this);
        this._onUpdate.add(this._handleFlash, this);
        if (this.remain > 0) {
            this._fireEffect();
        }
    }

    static override deserializeParameterObject(param: FlashMutableComponentParam): FlashMutableComponentParam {
        return {
            ...MutableComponent.deserializeParameterObject(param),
            duration: param.duration,
            initialTimeout: param.initialTimeout,
        };
    }

    isFlashing(): boolean {
        return (this.duration - this.remain) % 2 === 0;
    }

    _start(): void {
        this.remain = this.duration;
    }

    _handleFlash(): void {
        if (this.remain === 0) {
            return;
        }
        this._fireEffect();
        this.remain--;
    }

    _fireEffect(): void {
        this.onEffect.fire(this.isFlashing());
    }

    override serialize(): FlashMutableComponentParam {
        return {
            ...super.serialize(),
            duration: this.duration,
            initialTimeout: this.remain,
        };
    }
}
