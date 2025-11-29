import { EntitySerializerParameterObject, FilledRectParam, FilledRectSerializer, ObjectDef, ObjectSerializer } from "@yasshi2525/akashic-box2d-serializer";
import { CannonEntity } from "./entityCannon";

export const cannonEntityType = CannonEntity.name;

export interface CannonEntityParam extends FilledRectParam {
    firingInterval: number;
    lowestAngle: number;
    highestAngle: number;
    rotationSpeed: number;
    angle: number;
    availableAfter: number;
    direction: "up" | "down";
    isStarted: boolean;
}

export interface CannonEntitySerializerParameterObject extends Omit<EntitySerializerParameterObject, "entitySerializers"> {

}

export class CannonEntitySerializer extends FilledRectSerializer implements ObjectSerializer<CannonEntity, CannonEntityParam> {
    constructor(param: CannonEntitySerializerParameterObject) {
        super({
            ...param,
            entitySerializers: [],
        });
    }

    override filter(objectType: string): boolean {
        return objectType === cannonEntityType;
    }

    override serialize(object: CannonEntity): ObjectDef<CannonEntityParam> {
        return {
            type: cannonEntityType,
            param: {
                ...super.serialize(object).param,
                children: undefined, // コンストラクタで初期化する g.Label までシリアライズしてしまう。
                firingInterval: object.firingInterval,
                lowestAngle: object.lowestAngle,
                highestAngle: object.highestAngle,
                rotationSpeed: object.rotationSpeed,
                angle: object._angle,
                availableAfter: object._availableAfter,
                direction: object._direction,
                isStarted: object._isStarted,
            },
        };
    }

    override deserialize(json: ObjectDef<CannonEntityParam>): CannonEntity {
        const cannon = new CannonEntity(this._deserializeParameterObject(json.param));
        return cannon;
    }

    override _deserializeParameterObject(param: CannonEntityParam) {
        return {
            ...super._deserializeParameterObject(param),
            firingInterval: param.firingInterval,
            initialDelay: param.availableAfter,
            lowestAngle: param.lowestAngle,
            highestAngle: param.highestAngle,
            initialAngle: param.angle,
            rotationSpeed: param.rotationSpeed,
            initialDirection: param.direction,
            preventAutoStart: !param.isStarted,
        };
    }
}
