import { MutableComponent, MutableComponentEntity, MutableComponentParameterObject } from "./componentMutable";

export interface SpecialBulletEntityParameterObject extends g.SpriteParameterObject, MutableComponentParameterObject {
}

export class SpecialBulletEntity extends g.Sprite implements MutableComponentEntity {
    readonly mutableComponent: MutableComponent;

    constructor(param: SpecialBulletEntityParameterObject) {
        super(param);
        this.mutableComponent = new MutableComponent(param);
    }
}
