import { ObjectDef, ObjectSerializer, SpriteParam, SpriteSerializer, SpriteSerializerParameterObject } from "@yasshi2525/akashic-box2d-serializer";
import { MutableComponent, MutableComponentParam } from "./componentMutable";
import { SpecialBulletEntity } from "./entityBulletSpecial";

export const specialBulletType = SpecialBulletEntity.name;

export interface SpecialBulletParam extends SpriteParam, MutableComponentParam {
}

export interface SpecialBulletEntitySerializerParameterObject extends SpriteSerializerParameterObject {
}

export class SpecialBulletEntitySerializer extends SpriteSerializer implements ObjectSerializer<SpecialBulletEntity, SpecialBulletParam> {
    override filter(objectType: string): boolean {
        return objectType === specialBulletType;
    }

    override serialize(object: SpecialBulletEntity): ObjectDef<SpecialBulletParam> {
        return {
            type: specialBulletType,
            param: {
                ...super.serialize(object).param,
                ...object.mutableComponent.serialize(),
            },
        };
    }

    override _serializeChildren(): undefined {
        // 今のところこれを定義しなくとも問題ないが、将来改造されることを想定して念の為
        return undefined;
    }

    override deserialize(json: ObjectDef<SpecialBulletParam>): SpecialBulletEntity {
        const bullet = new SpecialBulletEntity(this._deserializeParameterObject(json.param));
        return bullet;
    }

    override _deserializeParameterObject(param: SpecialBulletParam) {
        return {
            ...super._deserializeParameterObject(param),
            ...MutableComponent.deserializeParameterObject(param),
        };
    }
}
