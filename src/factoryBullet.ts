import { Constants } from "./style";
import { BulletEntity } from "./entityBullet";
import { BaseBulletFactory, BasicBaseBulletFactoryParameterObject, ExtraBaseBulletParameterObject, ExtraFactoryProvidedBaseBulletParameterObject } from "./factoryBulletBase";

export interface ExtraFactoryProvidedBulletParameterObject extends ExtraFactoryProvidedBaseBulletParameterObject {
    font: g.Font;
}

export interface ExtraBulletParameterObject extends ExtraBaseBulletParameterObject {
    character: string;
    commentID?: string;
    isSelfComment: boolean;
}

export interface BulletFactoryParameterObject extends BasicBaseBulletFactoryParameterObject {
    characterFont: g.Font;
}

export class BulletFactory extends BaseBulletFactory<
    BulletEntity,
    ExtraBulletParameterObject,
    ExtraFactoryProvidedBulletParameterObject,
    typeof BulletEntity
> {
    static readonly assets: string[] = [...BulletEntity.assets];
    readonly _characterFont: g.Font;

    constructor(param: BulletFactoryParameterObject) {
        super({
            ...param,
            bodyDef: Constants.bullet.body,
            fixtureDef: Constants.bullet.fixture,
            radius: Constants.bullet.radius,
            initialHP: Constants.bullet.maxHP.basic,
            clazz: BulletEntity,
        });
        this._characterFont = param.characterFont;
    }

    _provideExtraEntityParameterObject(): ExtraFactoryProvidedBulletParameterObject {
        return {
            font: this._characterFont,
        };
    }
}
