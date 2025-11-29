import { BulletFactory } from "./factoryBullet";
import { BulletQueue } from "./queueBullet";

export const connectFireEvent = (queue: BulletQueue, factory: BulletFactory): void => {
    queue.onFire.add((ev) => {
        if (ev !== null) {
            factory.newInstance(ev);
        }
    });
};
