import { EntitySerializer, EntitySerializerParameterObject } from "@yasshi2525/akashic-box2d-serializer";

export const layerEntityType = "layer";

export interface LayerEntitySerializerParameterObject extends Omit<EntitySerializerParameterObject, "entitySerializers"> {

}

export class LayerEntitySerializer extends EntitySerializer {
    constructor(param: LayerEntitySerializerParameterObject) {
        super({
            ...param,
            entitySerializers: [],
        });
    }

    override filter(objectType: string): boolean {
        return objectType === layerEntityType;
    }

    override _serializeChildren(): undefined {
        // 配下にある box2d 管理下のエンティティを除く
        return undefined;
    }
}
