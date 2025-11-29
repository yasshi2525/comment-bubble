import { CannonEntity } from "./entityCannon";
import { style } from "./style";

export interface CannonFactoryParameterObject {
    scene: g.Scene;
}

export class CannonFactory {
    static readonly assets: string[] = [...CannonEntity.assets];
    readonly scene: g.Scene;
    constructor(param: CannonFactoryParameterObject) {
        this.scene = param.scene;
    }

    newInstance(preventAutoStart: boolean = false): CannonEntity {
        const entity = new CannonEntity({
            scene: this.scene,
            parent: this.scene,
            x: style(this.scene).cannon.entity.x,
            y: style(this.scene).cannon.entity.y,
            anchorX: 0.5,
            anchorY: 0.5,
            firingInterval: Math.ceil(style(this.scene).cannon.fire.interval / 1000 * g.game.fps),
            initialDelay: 0,
            lowestAngle: style(this.scene).cannon.angle.min / 180 * Math.PI,
            highestAngle: style(this.scene).cannon.angle.max / 180 * Math.PI,
            initialAngle: style(this.scene).cannon.angle.initial / 180 * Math.PI,
            rotationSpeed: style(this.scene).cannon.rotation.speed / 180 * Math.PI / g.game.fps,
            initialDirection: style(this.scene).cannon.rotation.direction,
            preventAutoStart,
        });
        return entity;
    }
}
