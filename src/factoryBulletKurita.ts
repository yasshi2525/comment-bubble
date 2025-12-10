import { BaseBulletFactory, BasicBaseBulletFactoryParameterObject, ExtraBaseBulletParameterObject, ExtraFactoryProvidedBaseBulletParameterObject } from "./factoryBulletBase";
import { SpecialBulletEntity } from "./entityBulletSpecial";
import { Constants } from "./style";

export interface KuritaBulletFactoryParameterObject extends BasicBaseBulletFactoryParameterObject {
}

export interface ExtraKuritaFactoryProvidedBulletParameterObject extends ExtraFactoryProvidedBaseBulletParameterObject {
    src: g.ImageAsset;
}

export interface ExtraKuritaBulletParameterObject extends ExtraBaseBulletParameterObject {
}

export class KuritaBulletFactory extends BaseBulletFactory<
    SpecialBulletEntity,
    ExtraKuritaBulletParameterObject,
    ExtraKuritaFactoryProvidedBulletParameterObject,
    typeof SpecialBulletEntity
> {
    static readonly assets: string[] = ["kurita-bullet"];
    constructor(param: KuritaBulletFactoryParameterObject) {
        super({
            ...param,
            bodyDef: Constants.bullet.body,
            fixtureDef: Constants.bullet.fixture,
            radius: Constants.bullet.radius,
            initialHP: Constants.bullet.maxHP.kurita,
            clazz: SpecialBulletEntity,
        });
    }

    override _provideExtraEntityParameterObject(): ExtraKuritaFactoryProvidedBulletParameterObject {
        return {
            src: this._scene.asset.getImageById("kurita-bullet"),
        };
    }
}
