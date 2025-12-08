import { ObjectDef, ObjectSerializer, SpriteParam, SpriteSerializer, SpriteSerializerParameterObject } from "@yasshi2525/akashic-box2d-serializer";
import { FlyEntity } from "./entityFly";
import { FlashMutableComponent, FlashMutableComponentParam } from "./componentMutableFlash";

export const flyType = FlyEntity.name;

export interface FlyEntityParam extends SpriteParam, FlashMutableComponentParam {
    standardY: number;
    direction: "left" | "right";
    floating: "up" | "idle" | "down";
    rotating: "clockwise" | "idle" | "anticlockwise";
    deltaAngle: number;
}

export interface FlyEntitySerializerParameterObject extends Omit<SpriteSerializerParameterObject, "entitySerializers"> {
}

export class FlyEntitySerializer extends SpriteSerializer implements ObjectSerializer<FlyEntity, FlyEntityParam> {
    constructor(param: FlyEntitySerializerParameterObject) {
        super({
            ...param,
            entitySerializers: [],
        });
    }

    override filter(objectType: string): boolean {
        return objectType === flyType;
    }

    override serialize(object: FlyEntity): ObjectDef<FlyEntityParam> {
        return {
            type: flyType,
            param: {
                ...super.serialize(object).param,
                ...object.mutableComponent.serialize(),
                standardY: object._standardY,
                direction: object.direction,
                floating: object.floating,
                rotating: object.rotating,
                deltaAngle: object.deltaAngle,
            },
        };
    }

    override _serializeChildren(): undefined {
        // children の serialize を防ぐ
        return undefined;
    }

    override deserialize(json: ObjectDef<FlyEntityParam>): FlyEntity {
        const fly = new FlyEntity(this._deserializeParameterObject(json.param));
        return fly;
    }

    override _deserializeParameterObject(param: FlyEntityParam) {
        return {
            ...super._deserializeParameterObject(param),
            ...FlashMutableComponent.deserializeParameterObject(param),
            standardY: param.standardY,
            direction: param.direction,
            floating: param.floating,
            rotating: param.rotating,
            deltaAngle: param.deltaAngle,
        };
    }
}
