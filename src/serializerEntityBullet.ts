import { EntityParam, ObjectDef, ObjectSerializer, SpriteParam, SpriteSerializer, SpriteSerializerParameterObject } from "@yasshi2525/akashic-box2d-serializer";
import { BulletEntity } from "./entityBullet";

export const bulletType = BulletEntity.name;

export interface BulletParam extends SpriteParam {
    character: string;
    commentID?: string;
}

export interface BulletEntitySerializerParameterObject extends SpriteSerializerParameterObject {
    font: g.Font;
}

export class BulletEntitySerializer extends SpriteSerializer implements ObjectSerializer<BulletEntity, BulletParam> {
    readonly _font: g.Font;

    constructor(param: BulletEntitySerializerParameterObject) {
        super(param);
        this._font = param.font;
    }

    override filter(objectType: string): boolean {
        return objectType === bulletType;
    }

    override serialize(object: BulletEntity): ObjectDef<BulletParam> {
        return {
            type: bulletType,
            param: {
                ...super.serialize(object).param,
                character: object._character,
                commentID: object._commentID,
            },
        };
    }

    override _serializeChildren(children: g.E["children"]): undefined {
        // label の serialize を防ぐ
        return undefined;
    }

    override deserialize(json: ObjectDef<BulletParam>): BulletEntity {
        const bullet = new BulletEntity(this._deserializeParameterObject(json.param));
        return bullet;
    }

    override _deserializeParameterObject(param: BulletParam) {
        return {
            ...super._deserializeParameterObject(param),
            character: param.character,
            commentID: param.commentID,
            isSelfComment: param.commentID === g.game.selfId,
            font: this._font,
        };
    }
}
