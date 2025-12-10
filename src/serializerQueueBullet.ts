import { ObjectDef, ObjectSerializer } from "@yasshi2525/akashic-box2d-serializer";
import { BulletQueue } from "./queueBullet";
import { CannonEntity } from "./entityCannon";
import { FireEvent } from "./parameterEvent";

export const bulletQueueType = BulletQueue.name;

export interface BulletQueueParam {
    queue: (FireEvent | null)[];
}

export interface BulletQueueSerializerParameterObject {
    cannon: CannonEntity;
}

export class BulletQueueSerializer implements ObjectSerializer<BulletQueue, BulletQueueParam> {
    readonly cannon: CannonEntity;

    constructor(param: BulletQueueSerializerParameterObject) {
        this.cannon = param.cannon;
    }

    filter(objectType: string): boolean {
        return objectType === bulletQueueType;
    }

    serialize(object: BulletQueue): ObjectDef<BulletQueueParam> {
        return {
            type: bulletQueueType,
            param: {
                // 参照をエンジン側で持たれるっぽいのでディープコピー
                queue: [...object._queue],
            },
        };
    }

    deserialize(json: ObjectDef<BulletQueueParam>): BulletQueue {
        const queue = new BulletQueue({
            initialQueue: json.param.queue,
            cannon: this.cannon,
        });
        return queue;
    }
}
