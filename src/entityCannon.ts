import { style } from "./style";

export interface CanonnEntityParameterObject extends Omit<g.FilledRectParameterObject, "cssColor" | "width" | "height"> {
    /**
     * frame
     */
    firingInterval: number;
    /**
     * frame
     */
    initialDelay: number;
    /**
     * rad (反時計回り正、x軸方向0)
     */
    lowestAngle: number;
    /**
     * rad (反時計回り正、x軸方向0)
     */
    highestAngle: number;
    /**
     * rad (反時計回り正、x軸方向0)
     */
    initialAngle: number;
    /**
     * rad/frame (反時計回り正）
     */
    rotationSpeed: number;
    initialDirection: "up" | "down";
    preventAutoStart: boolean;
}

/**
 * 弾がなかったら即時発射はめんどくさそうなので定期発射（特にスナップショット復帰時の扱いが怖い）
 */
export class CannonEntity extends g.E {
    static readonly assets: string[] = ["cannon-base", "cannon-body"];
    readonly onFire: g.Trigger = new g.Trigger();
    readonly firingInterval: number;
    readonly lowestAngle: number;
    readonly highestAngle: number;
    readonly rotationSpeed: number;
    readonly _body: g.Sprite;
    readonly _base: g.Sprite;
    _cachedCenter?: g.CommonOffset;
    _angle: number;
    _availableAfter: number;
    _direction: "up" | "down";
    _isStarted: boolean;

    constructor(param: CanonnEntityParameterObject) {
        super({
            ...param,
            width: style(param.scene).cannon.entity.width,
            height: style(param.scene).cannon.entity.height,
        });
        if (!Number.isInteger(param.firingInterval)) {
            throw new Error(`firingInterval should be integer. (actual = ${param.firingInterval})`);
        }
        if (param.firingInterval <= 0) {
            throw new Error(`firingInterval should be greater than 0. (expected ${param.firingInterval} > 0)`);
        }
        this.firingInterval = param.firingInterval;
        if (!Number.isInteger(param.initialDelay)) {
            throw new Error(`initialDelay should be integer. (actual = ${param.initialDelay})`);
        }
        if (param.initialDelay < 0) {
            throw new Error(`initialDelay should be greater than or equals 0. (expected ${param.initialDelay} >= 0)`);
        }
        if (param.initialDelay >= param.firingInterval) {
            throw new Error(`initialDelay should be less than firingInterval. (expected ${param.initialDelay} < ${param.firingInterval})`);
        }
        this._availableAfter = param.initialDelay;
        if (param.lowestAngle >= param.highestAngle) {
            throw new Error(`lowestAngle should be less than highestAngle. (expected ${param.lowestAngle} < ${param.highestAngle})`);
        }
        this.lowestAngle = param.lowestAngle;
        this.highestAngle = param.highestAngle;
        if (param.initialAngle < param.lowestAngle) {
            throw new Error(`initialAngle should be greater than or equals lowestAngle. (expected ${param.initialAngle} >= ${param.lowestAngle})`);
        }
        if (param.initialAngle > param.highestAngle) {
            throw new Error(`initialAngle should be less than or equals lowestAngle. (expected ${param.initialAngle} <= ${param.highestAngle})`);
        }
        this._angle = param.initialAngle;
        if (param.rotationSpeed < 0) {
            throw new Error(`rotataionSpeed should be greater than or equals 0. (expected ${param.rotationSpeed} >= 0)`);
        }
        this.rotationSpeed = param.rotationSpeed;
        this._direction = param.initialDirection;

        this._body = new g.Sprite({
            scene: this.scene,
            parent: this,
            src: this.scene.asset.getImageById("cannon-body"),
            x: this.width / 2,
            y: this.height / 2,
            angle: this._toBodyAngle(),
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this._base = new g.Sprite({
            scene: this.scene,
            parent: this,
            src: this.scene.asset.getImageById("cannon-base"),
            x: this.width / 2,
            y: this.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
        });

        this._isStarted = false;
        // キャッシュをあらかじめ作成
        this.center;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    override modified(_isBubbling?: boolean): void {
        super.modified(_isBubbling);
        this._cachedCenter = undefined;
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("cannon is already started.");
        }
        this.onUpdate.add(this._handleTick.bind(this));
        this._isStarted = true;
    }

    /**
     * 描画上の中心座標を返します
     */
    get center(): g.CommonOffset {
        if (!this._cachedCenter) {
            this._cachedCenter = this._calcCenter();
        }
        return this._cachedCenter;
    }

    _calcCenter(): g.CommonOffset {
        return this.getMatrix().multiplyPoint({ x: this.width / 2, y: this.height / 2 });
    }

    _handleTick(): void {
        this._rotate();
        this._prepareFire();
    }

    _rotate(): void {
        this._angle += ((this._direction === "up") ? 1 : -1) * this.rotationSpeed;
        if (this._shouldTurnDown()) {
            this._turnDown();
        }
        if (this._shouldTurnUp()) {
            this._turnUp();
        }
        this._adjustAngleRange();
        const oldAngle = this._body.angle;
        this._body.angle = this._toBodyAngle();
        if (this._body.angle !== oldAngle) {
            this._body.modified();
        }
    }

    _shouldTurnDown(): boolean {
        return this._direction === "up" && this._angle >= this.highestAngle;
    }

    _turnDown(): void {
        this._direction = "down";
    }

    _shouldTurnUp(): boolean {
        return this._direction === "down" && this._angle <= this.lowestAngle;
    }

    _turnUp(): void {
        this._direction = "up";
    }

    _adjustAngleRange(): void {
        if (this._angle > this.highestAngle) {
            this._angle = this.highestAngle;
        }
        if (this._angle < this.lowestAngle) {
            this._angle = this.lowestAngle;
        }
    }

    _toBodyAngle(): number {
        return -this._angle / Math.PI * 180;
    }

    _prepareFire(): void {
        if (this._availableAfter === 0) {
            this.onFire.fire();
            this._availableAfter = this.firingInterval;
        }
        this._availableAfter--;
    }
}
