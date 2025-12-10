import { Box2DBodiesParam, EntityParam, FrameSpriteParam, ObjectDef } from "@yasshi2525/akashic-box2d-serializer";
import { CannonEntityParam } from "./serializerEntityCannon";
import { BulletQueueParam } from "./serializerQueueBullet";
import { CommentFilteringMapperParam } from "./serializerMapperCommentFIltering";

export interface SnapshotParameterObject {
    tick: number;
    box2d: Box2DBodiesParam;
    layers: {
        background: ObjectDef<EntityParam>;
        foreground: ObjectDef<EntityParam>;
    };
    cannon: ObjectDef<CannonEntityParam>;
    bulletQueue: ObjectDef<BulletQueueParam>;
    explosions: ObjectDef<FrameSpriteParam>[];
    broadcasterID?: string;
    activeUserNum: number;
    comment: {
        filter: ObjectDef<CommentFilteringMapperParam>;
    };
}
