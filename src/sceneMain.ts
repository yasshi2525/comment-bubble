import { Box2DFactory } from "./factoryBox2D";
import { CommentListener } from "./listenerComment";
import { style } from "./style";
import { WorldHorizonFactory } from "./factoryWorldHorizon";
import { BulletFactory } from "./factoryBullet";
import { SnapshotParameterObject } from "./parameterSnapshot";
import { CannonFactory } from "./factoryCannon";
import { BulletQueue } from "./queueBullet";
import { connectFireEvent } from "./connectorFireEvent";
import { CannonEntity } from "./entityCannon";
import { Box2DSerializer, ObjectDef, PlainMatrixSerializer } from "@yasshi2525/akashic-box2d-serializer";
import { CannonEntityParam, CannonEntitySerializer } from "./serializerEntityCannon";
import { BulletQueueParam, BulletQueueSerializer } from "./serializerQueueBullet";
import { BulletEntity } from "./entityBullet";
import { BroadcasterResolver } from "./resolverBroadcaster";
import { Box2D } from "@akashic-extension/akashic-box2d";
import { HorizonController } from "./controllerHorizon";
import { BulletEntitySerializer } from "./serializerEntityBullet";

export interface MainSceneParameterObject extends g.SceneParameterObject {
    snapshot?: SnapshotParameterObject;
    broadcasterResolver: BroadcasterResolver;
}

export class MainScene extends g.Scene {
    static readonly assets: string[] = [...BulletFactory.assets, ...CannonFactory.assets];
    readonly _broadcasterResolver: BroadcasterResolver;
    readonly _snapshot?: SnapshotParameterObject;
    private __tick?: number;
    private __characterFont?: g.Font;
    private __box2d?: Box2D;
    private __horizonController?: HorizonController;
    private __box2dSerializer?: Box2DSerializer;
    private __cannon?: CannonEntity;
    private __bulletQueue?: BulletQueue;
    private __bulletFactory?: BulletFactory;
    private __cannonSerializer?: CannonEntitySerializer;
    private __bulletQueueSerializer?: BulletQueueSerializer;
    private __bulletSerializer?: BulletEntitySerializer;

    constructor(param: MainSceneParameterObject) {
        super({
            ...param,
            assetIds: [...param.assetIds ?? [], ...MainScene.assets],
        });
        this._broadcasterResolver = param.broadcasterResolver;
        this._snapshot = param.snapshot;
        this.onLoad.add(this._handleLoad.bind(this));
    }

    _handleLoad(): void {
        this._initializeTickCounter();
        this._initializeCharacterFont();
        this._initializeBox2D();
        this._initializeBox2dSerializer();
        this._initializeBackground();
        this._restoreEBodies();
        this._initializeCommentReceptor();
        this._initializeSnapshotRequest();
    }

    _initializeTickCounter(): void {
        this.__tick = this._snapshot ? this._snapshot.tick : 0;
        this.onUpdate.add(() => {
            this._tick++;
        });
    }

    _initializeCharacterFont() {
        return this.__characterFont = new g.DynamicFont(style(this).character.font);
    }

    _initializeBox2D() {
        const box2dFactory = new Box2DFactory({ scene: this });
        const { box2d, horizonController } = box2dFactory.newInstance();
        this.__box2d = box2d;
        this.__horizonController = horizonController;
        this.onUpdate.add(() => {
            this._box2d.step(1 / g.game.fps);
        });

        return { box2d, horizonController };
    }

    _initializeBox2dSerializer() {
        this.__box2dSerializer = new Box2DSerializer({
            box2d: this._box2d,
            scene: this,
        });
        this.__bulletSerializer = new BulletEntitySerializer({
            scene: this,
            font: this._characterFont,
            entitySerializers: this.__box2dSerializer._entitySerializers,
            imageAssetSerializer: this._box2dSerializer._imageAssetSerializer,
            plainMatrixSerializer: this._box2dSerializer._plainMatrixSerializer,
        });
        this.__box2dSerializer._entitySerializers.push(this.__bulletSerializer);
        return this.__box2dSerializer;
    }

    _initializeBackground() {
        this._initializeWorldHorizon();
        const cannon = this._getCannon();
        const bulletQueue = this._getBulletQueue(cannon);
        this.__bulletFactory = new BulletFactory({
            scene: this,
            box2d: this._box2d,
            controllers: [this._horizonController],
            initialPower: style(this).cannon.fire.power,
            cannon,
            characterFont: this._characterFont,
        });
        return {
            cannon,
            bulletQueue,
            bulletFactory: this.__bulletFactory,
        };
    }

    _initializeCommentReceptor(): void {
        connectFireEvent(this._bulletQueue, this._bulletFactory);
        new CommentListener({
            scene: this,
            bulletQueue: this._bulletQueue,
            broadcasterResolver: this._broadcasterResolver,
        });
    }

    _initializeWorldHorizon(): void {
        if (!this._snapshot) {
            const boundaryFactory = new WorldHorizonFactory({
                scene: this,
                box2d: this._box2d,
            });
            boundaryFactory.newInstarnce();
        }
    }

    _getCannon(): CannonEntity {
        return this.__cannon = this._snapshot
            ? this._restoreCannon(this._snapshot.cannon)
            : this._createNewCannon();
    }

    _createNewCannon(): CannonEntity {
        const cannonFactory = new CannonFactory({
            scene: this,
        });
        return cannonFactory.newInstance();
    }

    _restoreCannon(json: ObjectDef<CannonEntityParam>): CannonEntity {
        return this._cannonSerializer.deserialize(json);
    }

    _getBulletQueue(cannon: CannonEntity): BulletQueue {
        return this.__bulletQueue = this._snapshot
            ? this._restoreNewBulletQueue(this._snapshot.bulletQueue)
            : this._createNewBulletQueue(cannon);
    }

    _createNewBulletQueue(cannon: CannonEntity): BulletQueue {
        return new BulletQueue({ cannon, initialQueue: [] });
    }

    _restoreNewBulletQueue(json: ObjectDef<BulletQueueParam>): BulletQueue {
        return this._bulletQueueSerializer.deserialize(json);
    }

    _restoreEBodies(): void {
        if (this._snapshot) {
            const ebodies = this._box2dSerializer.desrializeBodies(this._snapshot.box2d);
            this._bulletFactory.restoreController(ebodies);
        }
    }

    _initializeSnapshotRequest(): void {
        if (g.game.isActiveInstance()) {
            this.setInterval(() => {
                g.game.requestSaveSnapshot(() => {
                    const snapshot = {
                        tick: this._tick,
                        box2d: this._box2dSerializer.serializeBodies(),
                        cannon: this._cannonSerializer.serialize(this._cannon),
                        bulletQueue: this._bulletQueueSerializer.serialize(this._bulletQueue),
                    } satisfies SnapshotParameterObject;
                    return { snapshot };
                });
            }, style(this).game.snapshot.interval);
        }
    }

    get _tick(): number {
        if (this.__tick === undefined) {
            throw new Error("tick isn't defined.");
        }
        return this.__tick;
    }

    set _tick(v: number) {
        if (this.__tick === undefined) {
            throw new Error("tick isn't defined.");
        }
        this.__tick = v;
    }

    get _characterFont(): g.Font {
        if (!this.__characterFont) {
            throw new Error("characterFont isn't defined.");
        }
        return this.__characterFont;
    }

    get _box2d(): Box2D {
        if (!this.__box2d) {
            throw new Error("box2d isn't defined.");
        }
        return this.__box2d;
    }

    get _horizonController(): HorizonController {
        if (!this.__horizonController) {
            throw new Error("horizonController isn't defined.");
        }
        return this.__horizonController;
    }

    get _box2dSerializer(): Box2DSerializer {
        if (!this.__box2dSerializer) {
            throw new Error("box2dSerializer isn't defined.");
        }
        return this.__box2dSerializer;
    }

    get _cannon(): CannonEntity {
        if (!this.__cannon) {
            throw new Error("cannon isn't defined.");
        }
        return this.__cannon;
    }

    get _bulletQueue(): BulletQueue {
        if (!this.__bulletQueue) {
            throw new Error("bulletQueue isn't defined.");
        }
        return this.__bulletQueue;
    }

    get _bulletFactory(): BulletFactory {
        if (!this.__bulletFactory) {
            throw new Error("bulletFactory isn't defined.");
        }
        return this.__bulletFactory;
    }

    get _cannonSerializer(): CannonEntitySerializer {
        if (!this.__cannonSerializer) {
            this.__cannonSerializer = new CannonEntitySerializer({
                scene: this,
                plainMatrixSerializer: new PlainMatrixSerializer(),
            });
        }
        return this.__cannonSerializer;
    }

    get _bulletQueueSerializer(): BulletQueueSerializer {
        if (!this.__bulletQueueSerializer) {
            this.__bulletQueueSerializer = new BulletQueueSerializer({
                cannon: this._cannon,
            });
        }
        return this.__bulletQueueSerializer;
    }

    get _bulletSerializer(): BulletEntitySerializer {
        if (!this.__bulletSerializer) {
            throw new Error("bulletSerializer isn't defined.");
        }
        return this.__bulletSerializer;
    }
}
