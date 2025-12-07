import { DeferrableComponentEntity } from "./componentdeferrable";
import { MutableComponentEntity } from "./componentMutable";
import { FlashMutableComponent, FlashMutableComponentParameterObject } from "./componentMutableFlash";

export interface FlyEntityParameterObject extends g.FilledRectParameterObject, Omit<FlashMutableComponentParameterObject, "onUpdate"> {
    /**
     * 浮遊の維持の基準となるpx
     */
    standardY?: number;
    direction: "left" | "right";
    floating: "up" | "idle" | "down";
    rotating: "clockwise" | "idle" | "anticlockwise";
    deltaAngle: number;
}

export class FlyEntity extends g.FilledRect implements MutableComponentEntity, DeferrableComponentEntity {
    static readonly assets: string[] = [];
    readonly mutableComponent: FlashMutableComponent;
    readonly _standardY: number;
    direction: "left" | "right";
    floating: "up" | "idle" | "down";
    rotating: "clockwise" | "idle" | "anticlockwise";
    deltaAngle: number;
    _beforeAngle: number;

    constructor(param: FlyEntityParameterObject) {
        super(param);
        this.mutableComponent = new FlashMutableComponent({ ...param, onUpdate: this.onUpdate });
        this._standardY = param.standardY ?? this.y;
        this.direction = param.direction;
        this.floating = param.floating;
        this.rotating = param.rotating;
        this.deltaAngle = param.deltaAngle;
        this._beforeAngle = this.angle;
        this.append(new g.FilledRect({
            scene: this.scene,
            x: 2.5,
            y: 2.5,
            width: this.width - 5,
            height: this.height - 5,
            cssColor: "white",
        }));
    }

    handleAfterStep(): void {
        this.deltaAngle = this.angle - this._beforeAngle;
        this._beforeAngle = this.angle;
    }
}
