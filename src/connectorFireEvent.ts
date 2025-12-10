import { BulletFactory } from "./factoryBullet";
import { KuritaBulletFactory } from "./factoryBulletKurita";
import { isKuritaFireEvent, isPlainFireEvent } from "./parameterEvent";
import { BulletQueue } from "./queueBullet";

export interface FactoryMapper {
    plain: BulletFactory;
    kurita: KuritaBulletFactory;
}

export const connectFireEvent = (queue: BulletQueue, factoryMapper: FactoryMapper): void => {
    queue.onFire.add((ev) => {
        if (ev) {
            if (isPlainFireEvent(ev)) {
                factoryMapper.plain.newInstance(ev.data);
            }
            else if (isKuritaFireEvent(ev)) {
                factoryMapper.kurita.newInstance(ev.data);
            }
            else {
                throw new Error(`unresolved evnet (type = ${ev.type}, data = ${ev.data})`);
            }
        }
    });
};
