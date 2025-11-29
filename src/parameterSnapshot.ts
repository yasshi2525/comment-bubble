import { Box2DBodiesParam, ObjectDef } from "@yasshi2525/akashic-box2d-serializer";
import { CannonEntityParam } from "./serializerEntityCannon";
import { BulletQueueParam } from "./serializerQueueBullet";

export interface SnapshotParameterObject {
    tick: number;
    box2d: Box2DBodiesParam;
    cannon: ObjectDef<CannonEntityParam>;
    bulletQueue: ObjectDef<BulletQueueParam>;
}
