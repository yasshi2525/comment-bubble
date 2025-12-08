import { DeferrableComponentEntity } from "./componentdeferrable";
import { MutableComponentEntity } from "./componentMutable";
import { FlashMutableComponent, FlashMutableComponentParameterObject } from "./componentMutableFlash";
import { safeCos, safeSin } from "./math";
import { Constants } from "./style";

export interface FlyEntityParameterObject extends Omit<g.SpriteParameterObject, "src">, Omit<FlashMutableComponentParameterObject, "onUpdate"> {
    /**
     * 浮遊の維持の基準となるpx
     */
    standardY?: number;
    direction: "left" | "right";
    floating: "up" | "idle" | "down";
    rotating: "clockwise" | "idle" | "anticlockwise";
    deltaAngle: number;
}

export class FlyEntity extends g.Sprite implements MutableComponentEntity, DeferrableComponentEntity {
    static readonly assets: string[] = ["ufo", "ufo-shape1", "ufo-shape2", "ufo-shape3"];
    readonly mutableComponent: FlashMutableComponent;
    readonly _standardY: number;
    direction: "left" | "right";
    floating: "up" | "idle" | "down";
    rotating: "clockwise" | "idle" | "anticlockwise";
    deltaAngle: number;
    _beforeAngle: number;

    constructor(param: FlyEntityParameterObject) {
        super({ ...param, src: param.scene.asset.getImageById("ufo") });
        this.mutableComponent = new FlashMutableComponent({ ...param, onUpdate: this.onUpdate });
        this._standardY = param.standardY ?? this.y;
        this.direction = param.direction;
        this.floating = param.floating;
        this.rotating = param.rotating;
        this.deltaAngle = param.deltaAngle;
        this._beforeAngle = this.angle;
        const effect = new g.Sprite({
            scene: this.scene,
            parent: this,
            src: this.src,
            opacity: 0.25,
            compositeOperation: "lighter",
            hidden: this.mutableComponent.isFlashing(),
            local: true,
        });
        const frame = new g.FilledRect({
            scene: this.scene,
            parent: this,
            x: this.width / 2 - this.width / 2.5 * safeSin(-this.angle / 180 * Math.PI),
            y: this.height / 2 + this.width / 2.5 * safeCos(-this.angle / 180 * Math.PI),
            width: this.width,
            height: Constants.fly.statusBar.frame.height,
            cssColor: Constants.fly.statusBar.color.frame,
            anchorX: 0.5,
            anchorY: 0.5,
            angle: -this.angle,
            local: true,
        });
        frame.append(new g.FilledRect({
            scene: this.scene,
            x: Constants.fly.statusBar.frame.padding,
            y: Constants.fly.statusBar.frame.padding,
            width: frame.width - Constants.fly.statusBar.frame.padding * 2,
            height: frame.height - Constants.fly.statusBar.frame.padding * 2,
            cssColor: Constants.fly.statusBar.color.background,
            local: true,
        }));
        const power = new g.FilledRect({
            scene: this.scene,
            parent: frame,
            x: Constants.fly.statusBar.frame.padding,
            y: Constants.fly.statusBar.frame.padding,
            width: (frame.width - Constants.fly.statusBar.frame.padding * 2)
                * this.mutableComponent.hp / this.mutableComponent.maxHP,
            height: frame.height - Constants.fly.statusBar.frame.padding * 2,
            cssColor: Constants.fly.statusBar.color.power,
            local: true,
        });
        this.mutableComponent.onEffect.add((v) => {
            if (v) {
                effect.show();
            }
            else {
                effect.hide();
            }
        });
        this.mutableComponent.onAttack.add(() => {
            power.width = (frame.width - Constants.fly.statusBar.frame.padding * 2)
                * this.mutableComponent.hp / this.mutableComponent.maxHP;
            power.modified();
        });
        this.onUpdate.add(() => {
            const oldFrameAngle = frame.angle;
            frame.angle = -this.angle;
            frame.x = this.width / 2 - this.width / 2.5 * safeSin(-this.angle / 180 * Math.PI);
            frame.y = this.height / 2 + this.width / 2.5 * safeCos(-this.angle / 180 * Math.PI);
            if (oldFrameAngle !== frame.angle) {
                frame.modified();
            }
        });
        // fadein
        if (this.opacity < 1) {
            this.onUpdate.add(() => {
                this.opacity += 1 / (Constants.fly.effect.fadeIn.interval / 1000) / g.game.fps;
                if (this.opacity > 1) {
                    this.opacity = 1;
                }
                this.modified();
                return this.opacity === 1;
            });
        }
    }

    handleAfterStep(): void {
        this.deltaAngle = this.angle - this._beforeAngle;
        this._beforeAngle = this.angle;
    }
}
