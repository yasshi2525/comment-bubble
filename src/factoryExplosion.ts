import { ExplosionEntity } from "./entityExplosion";
import { Constants } from "./style";

export interface ExplosionFactoryParameterObject {
    scene: g.Scene;
    layer: g.E;
}

export interface ExplosionEntityParameterObject {
    x: number;
    y: number;
}

export class ExplosionFactory {
    static readonly assets: string[] = [...ExplosionEntity.assets];
    readonly scene: g.Scene;
    readonly layer: g.E;
    constructor(param: ExplosionFactoryParameterObject) {
        this.scene = param.scene;
        this.layer = param.layer;
    }

    newInstance(param: ExplosionEntityParameterObject): ExplosionEntity {
        const entity = new ExplosionEntity({
            scene: this.scene,
            parent: this.layer,
            ...param,
            ...Constants.explosion.entity,
        });
        entity.start();
        return entity;
    }
}
