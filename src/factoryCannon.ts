import { CannonEntity } from "./entityCannon";
import { Constants } from "./style";

export interface CannonFactoryParameterObject {
    scene: g.Scene;
    layer: g.E;
}

export class CannonFactory {
    static readonly assets: string[] = [...CannonEntity.assets];
    readonly scene: g.Scene;
    readonly layer: g.E;
    constructor(param: CannonFactoryParameterObject) {
        this.scene = param.scene;
        this.layer = param.layer;
    }

    newInstance(preventAutoStart: boolean = false): CannonEntity {
        const entity = new CannonEntity({
            scene: this.scene,
            parent: this.layer,
            ...Constants.cannon.entity,
            firingInterval: Math.ceil(Constants.cannon.fire.interval / 1000 * g.game.fps),
            initialDelay: 0,
            lowestAngle: Constants.cannon.angle.min / 180 * Math.PI,
            highestAngle: Constants.cannon.angle.max / 180 * Math.PI,
            initialAngle: Constants.cannon.angle.initial / 180 * Math.PI,
            rotationSpeed: Constants.cannon.rotation.speed / 180 * Math.PI / g.game.fps,
            initialDirection: Constants.cannon.rotation.direction,
            preventAutoStart,
        });
        return entity;
    }
}
