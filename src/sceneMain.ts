import { Box2DFactory } from "./factoryBox2D";
import { CommentListener } from "./listenerComment";
import { Constants } from "./style";
import { WorldHorizonFactory } from "./factoryWorldHorizon";
import { BulletFactory } from "./factoryBullet";
import { SnapshotParameterObject } from "./parameterSnapshot";
import { CannonFactory } from "./factoryCannon";
import { BulletQueue } from "./queueBullet";
import { connectFireEvent } from "./connectorFireEvent";
import { CannonEntity } from "./entityCannon";
import { Box2DSerializer, FrameSpriteParam, FrameSpriteSerializer, ImageAssetSerializer, ObjectDef, PlainMatrixSerializer } from "@yasshi2525/akashic-box2d-serializer";
import { CannonEntityParam, CannonEntitySerializer } from "./serializerEntityCannon";
import { BulletQueueParam, BulletQueueSerializer } from "./serializerQueueBullet";
import { BroadcasterResolver } from "./resolverBroadcaster";
import { Box2D } from "@akashic-extension/akashic-box2d";
import { HorizonController } from "./controllerHorizon";
import { BulletEntitySerializer } from "./serializerEntityBullet";
import { LayerEntitySerializer } from "./serializerEntityLayer";
import { ContantListenerFactory } from "./factoryListenerContact";
import { FlyFactory } from "./factoryFly";
import { KillController } from "./controllerKill";
import { FlyEntitySerializer } from "./serializerEntityFly";
import { isDeferrableComponentEBody } from "./componentdeferrable";
import { ExplosionEntity } from "./entityExplosion";
import { ExplosionFactory } from "./factoryExplosion";
import { ActiveUserNumLabel } from "./entityActiveUserNum";
import { ActiveUserNumSender } from "./senderActiveUserNum";
import { HeartbeatListener } from "./listenerHeartbeat";
import { ActiveUserNumListener } from "./listenerActiveUserNum";
import { HeartbeatSender } from "./senderHeartbeat";
import { CommentFilteringMapperParam, CommentFilteringMapperSerializer } from "./serializerMapperCommentFIltering";
import GraphemeSplitter = require("grapheme-splitter");
import { KuritaBulletFactory } from "./factoryBulletKurita";
import { SpecialBulletEntitySerializer } from "./serializerEntityBulletSpecial";
import { CommentFilteringMapper } from "./mapperCommentFiltering";
import { CommentMapper } from "./mapperComment";
import { EmbeddedCommentMapper } from "./mapperCommentEmbedded";
import { CommentEmbeddingMapper } from "./mapperCommentEmbedding";

export interface MainSceneParameterObject extends g.SceneParameterObject {
    snapshot?: SnapshotParameterObject;
    broadcasterResolver: BroadcasterResolver;
}

export class MainScene extends g.Scene {
    static readonly assets: string[] = [
        "numeric", "numeric-glyph",
        ...ActiveUserNumLabel.assets,
        ...BulletFactory.assets,
        ...KuritaBulletFactory.assets,
        ...CannonFactory.assets,
        ...FlyFactory.assets,
        ...ExplosionFactory.assets,
    ];

    readonly _broadcasterResolver: BroadcasterResolver;
    readonly _snapshot?: SnapshotParameterObject;
    private __tick?: number;
    private __characterFont?: g.Font;
    private __numericFont?: g.Font;
    private __backgroundLayer?: g.E;
    private __foregroundLayer?: g.E;
    private __grapheme?: GraphemeSplitter;
    private __box2d?: Box2D;
    private __horizonController?: HorizonController;
    private __killController?: KillController;
    private __box2dSerializer?: Box2DSerializer;
    private __cannon?: CannonEntity;
    private __bulletQueue?: BulletQueue;
    private __explosions?: ExplosionEntity[];
    private __bulletFactory?: BulletFactory;
    private __kuritaBulletFactory?: KuritaBulletFactory;
    private __flyFactory?: FlyFactory;
    private __explosionFactory?: ExplosionFactory;
    private __plainMatrixSerializer?: PlainMatrixSerializer;
    private __imageAssetSerializer?: ImageAssetSerializer;
    private __cannonSerializer?: CannonEntitySerializer;
    private __bulletQueueSerializer?: BulletQueueSerializer;
    private __commentFilteringMapperSerializer?: CommentFilteringMapperSerializer;
    private __bulletSerializer?: BulletEntitySerializer;
    private __specialBulletSerializer?: SpecialBulletEntitySerializer;
    private __flySerializer?: FlyEntitySerializer;
    private __explosionSerializer?: FrameSpriteSerializer;
    private __layerSerializer?: LayerEntitySerializer;
    private __activeUserNumSender?: ActiveUserNumSender;
    private __commentFilteringMapper?: CommentFilteringMapper;

    constructor(param: MainSceneParameterObject) {
        super({
            ...param,
            assetIds: [...param.assetIds ?? [], ...MainScene.assets],
        });
        this._broadcasterResolver = param.broadcasterResolver;
        this._snapshot = param.snapshot;
        if (this._snapshot) {
            this._broadcasterResolver.restoreBroadcasterID(this._snapshot.broadcasterID);
        }
        this.onLoad.add(this._handleLoad, this);
    }

    _handleLoad(): void {
        Constants.init(this);
        this._initializeTickCounter();
        this._initializeFont();
        this._initializeLayer();
        this._initializeBox2D();
        this._initializeBox2dSerializer();
        this._initializeBackground();
        this._restoreEBodies();
        this._initializeActiveUserCounter();
        this._initializeCommentReceptor();
        this._initializeSnapshotRequest();
    }

    _initializeTickCounter(): void {
        this.__tick = this._snapshot ? this._snapshot.tick : 0;
        this.onUpdate.add(() => {
            this._tick++;
        });
    }

    _initializeFont() {
        const characterFont = this.__characterFont = new g.DynamicFont(Constants.character.font);
        const numericFont = this.__numericFont = new g.BitmapFont({
            src: this.asset.getImageById("numeric"),
            glyphInfo: this.asset.getJSONContentById("numeric-glyph"),
        });
        return { characterFont, numericFont };
    }

    _initializeLayer() {
        if (!this._snapshot) {
            this.__backgroundLayer = new g.E({
                scene: this,
                parent: this,
                width: g.game.width,
                height: g.game.height,
            });
            this.__foregroundLayer = new g.E({
                scene: this,
                parent: this,
                width: g.game.width,
                height: g.game.height,
            });
        }
        else {
            this.__backgroundLayer = this._layerSerializer.deserialize(this._snapshot.layers.background);
            this.__foregroundLayer = this._layerSerializer.deserialize(this._snapshot.layers.foreground);
        }
        // 万が一サーバーが skip するとスナップショットに影響するのでガード
        // ロードした瞬間は skipping でないので一瞬映るがそこには目を瞑る。
        if (!g.game.isActiveInstance()) {
            const skippingLabel = new g.Label({
                scene: this,
                parent: this,
                font: this._characterFont,
                text: "同期中（しばらくお待ち下さい）",
                x: g.game.width / 2,
                y: g.game.height / 2,
                anchorX: 0.5,
                anchorY: 0.5,
                hidden: true,
                local: true,
            });
            g.game.onSkipChange.add((skipping) => {
                if (skipping) {
                    this._backgroundLayer.hide();
                    this._foregroundLayer.hide();
                    skippingLabel.show();
                }
                else {
                    this._backgroundLayer.show();
                    this._foregroundLayer.show();
                    skippingLabel.hide();
                }
            });
        }
    }

    _initializeBox2D() {
        const box2dFactory = new Box2DFactory({ scene: this });
        const { box2d, horizonController, killController } = box2dFactory.newInstance();
        const contactListenerFactory = new ContantListenerFactory({ box2d });
        box2d.world.SetContactListener(contactListenerFactory.newInstance());
        this.__box2d = box2d;
        this.__horizonController = horizonController;
        this.__killController = killController;
        this.onUpdate.add(() => {
            this._box2d.step(1 / g.game.fps);
            for (const ebody of this._box2d.bodies.filter(isDeferrableComponentEBody)) {
                ebody.entity.handleAfterStep();
            }
        });

        return { box2d, horizonController, killController };
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
        this.__specialBulletSerializer = new SpecialBulletEntitySerializer({
            scene: this,
            entitySerializers: this.__box2dSerializer._entitySerializers,
            imageAssetSerializer: this._box2dSerializer._imageAssetSerializer,
            plainMatrixSerializer: this._box2dSerializer._plainMatrixSerializer,
        });
        this.__box2dSerializer._entitySerializers.push(this.__specialBulletSerializer);
        this.__flySerializer = new FlyEntitySerializer({
            scene: this,
            plainMatrixSerializer: this._box2dSerializer._plainMatrixSerializer,
            imageAssetSerializer: this._box2dSerializer._imageAssetSerializer,
            flyNoFont: this._numericFont,
        });
        this.__box2dSerializer._entitySerializers.push(this.__flySerializer);
        return this.__box2dSerializer;
    }

    _initializeBackground() {
        this._initializeWorldHorizon();
        const cannon = this._getCannon();
        const bulletQueue = this._getBulletQueue(cannon);
        const explosions = this._getExplosions();
        this.__bulletFactory = new BulletFactory({
            scene: this,
            box2d: this._box2d,
            controllers: [this._killController, this._horizonController],
            cannon,
            layer: this._backgroundLayer,
            characterFont: this._characterFont,
        });
        this.__kuritaBulletFactory = new KuritaBulletFactory({
            scene: this,
            box2d: this._box2d,
            controllers: [this._killController, this._horizonController],
            cannon,
            layer: this._backgroundLayer,
        });
        this.__flyFactory = new FlyFactory({
            scene: this,
            box2d: this._box2d,
            controllers: [this._killController],
            layer: this._backgroundLayer,
            flyNoFont: this._numericFont,
        });
        this.__explosionFactory = new ExplosionFactory({
            scene: this,
            layer: this._foregroundLayer,
        });
        this._flyFactory.onCreate.add((f) => {
            f.mutableComponent.onKill.add(() => {
                const obj = this._explosionFactory.newInstance({ x: f.x, y: f.y });
                obj.onFinish.add(() => {
                    explosions.splice(explosions.indexOf(obj), 1);
                });
                explosions.push(obj);
            });
        });
        return {
            cannon,
            bulletQueue,
            bulletFactory: this.__bulletFactory,
            kuritaBulletFactory: this.__kuritaBulletFactory,
        };
    }

    _initializeActiveUserCounter(): void {
        if (g.game.isActiveInstance()) {
            const activeUserNumSender = this.__activeUserNumSender = new ActiveUserNumSender({
                scene: this,
                tick: () => this._tick,
            });
            const heartbeatListener = new HeartbeatListener({
                scene: this,
                tick: () => this._tick,
                active: () => activeUserNumSender.activeNum(),
            });
            heartbeatListener.onDsync.add(() => activeUserNumSender.send());
            heartbeatListener.onReceive.add(ev => activeUserNumSender.accept(ev));
        }
        else {
            const activeUserNumLabel = new ActiveUserNumLabel({
                scene: this,
                parent: this._foregroundLayer,
                initialNumber: this._snapshot?.activeUserNum,
                font: this._numericFont,
                ...Constants.game.active.entity,
            });
            const activeUserListener = new ActiveUserNumListener({
                scene: this,
            });
            activeUserListener.onReceive.add((num) => {
                activeUserNumLabel.num = num;
            });
            new HeartbeatSender({
                scene: this,
                tick: () => this._tick,
                active: () => activeUserNumLabel.num,
            });
        }
    }

    _initializeCommentReceptor(): void {
        connectFireEvent(this._bulletQueue, {
            plain: this._bulletFactory,
            kurita: this._kuritaBulletFactory,
        });
        const filter = this._getCommentFilteringMapper();
        new CommentListener({
            scene: this,
            bulletQueue: this._bulletQueue,
            broadcasterResolver: this._broadcasterResolver,
            mapper: new CommentMapper({
                filter,
                embedding: new CommentEmbeddingMapper(),
                parser: new EmbeddedCommentMapper({ grapheme: this._grapheme }),
                grapheme: this._grapheme,
            }),
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
            layer: this._foregroundLayer,
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

    _getCommentFilteringMapper(): CommentFilteringMapper {
        return this.__commentFilteringMapper = this._snapshot
            ? this._restoreNewCommentFilteringMapper(this._snapshot.comment.filter)
            : this._createNewCommentFilteringMapper();
    }

    _createNewCommentFilteringMapper(): CommentFilteringMapper {
        return new CommentFilteringMapper({ grapheme: this._grapheme });
    }

    _restoreNewCommentFilteringMapper(json: ObjectDef<CommentFilteringMapperParam>): CommentFilteringMapper {
        return this._commentFilteringMapperSerializer.deserialize(json);
    }

    _getExplosions(): ExplosionEntity[] {
        return this.__explosions = this._snapshot
            ? this._restoreExplisions(this._snapshot.explosions)
            : [];
    }

    _restoreExplisions(json: ObjectDef<FrameSpriteParam>[]): ExplosionEntity[] {
        return json.map(p => this._explosionSerializer.deserialize(p)).map((e) => {
            e.onFinish.add(() => {
                this._explosions.splice(this._explosions.indexOf(e), 1);
            });
            return e;
        });
    }

    _restoreEBodies(): void {
        if (this._snapshot) {
            const ebodies = this._box2dSerializer.desrializeBodies(this._snapshot.box2d);
            this._bulletFactory.restore(ebodies);
            this._flyFactory.restore(ebodies);
        }
        else {
            this._flyFactory.newInstance({ flyNo: 1 });
        }
    }

    _initializeSnapshotRequest(): void {
        if (g.game.isActiveInstance()) {
            this.setInterval(() => {
                g.game.requestSaveSnapshot(() => {
                    const snapshot = {
                        tick: this._tick,
                        box2d: this._box2dSerializer.serializeBodies(),
                        layers: {
                            background: this._layerSerializer.serialize(this._backgroundLayer),
                            foreground: this._layerSerializer.serialize(this._foregroundLayer),
                        },
                        cannon: this._cannonSerializer.serialize(this._cannon),
                        bulletQueue: this._bulletQueueSerializer.serialize(this._bulletQueue),
                        broadcasterID: this._broadcasterResolver.getResolvedBroadcasterID(),
                        explosions: this._explosions.map(e => this._explosionSerializer.serialize(e)),
                        activeUserNum: this._activeUserNum,
                        comment: {
                            filter: this._commentFilteringMapperSerializer.serialize(this._commentFilteringMapper),
                        },
                    } satisfies SnapshotParameterObject;
                    return { snapshot };
                });
            }, Constants.game.snapshot.interval);
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

    get _numericFont(): g.Font {
        if (!this.__numericFont) {
            throw new Error("numericFont isn't defined.");
        }
        return this.__numericFont;
    }

    get _backgroundLayer(): g.E {
        if (!this.__backgroundLayer) {
            throw new Error("backgroundLayer isn't defined.");
        }
        return this.__backgroundLayer;
    }

    get _foregroundLayer(): g.E {
        if (!this.__foregroundLayer) {
            throw new Error("foregroundLayer isn't defined.");
        }
        return this.__foregroundLayer;
    }

    get _grapheme(): GraphemeSplitter {
        if (!this.__grapheme) {
            this.__grapheme = new GraphemeSplitter();
        }
        return this.__grapheme;
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

    get _killController(): KillController {
        if (!this.__killController) {
            throw new Error("killController isn't defined.");
        }
        return this.__killController;
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

    get _explosions(): ExplosionEntity[] {
        if (!this.__explosions) {
            throw new Error("explosions aren't defined");
        }
        return this.__explosions;
    }

    get _flyFactory(): FlyFactory {
        if (!this.__flyFactory) {
            throw new Error("flyFactory isn't defined.");
        }
        return this.__flyFactory;
    }

    get _bulletFactory(): BulletFactory {
        if (!this.__bulletFactory) {
            throw new Error("bulletFactory isn't defined.");
        }
        return this.__bulletFactory;
    }

    get _kuritaBulletFactory(): KuritaBulletFactory {
        if (!this.__kuritaBulletFactory) {
            throw new Error("kuritaBulletFactory isn't defined.");
        }
        return this.__kuritaBulletFactory;
    }

    get _explosionFactory(): ExplosionFactory {
        if (!this.__explosionFactory) {
            throw new Error("explosionFactory isn't defined.");
        }
        return this.__explosionFactory;
    }

    get _plainMatrixSerializer(): PlainMatrixSerializer {
        if (!this.__plainMatrixSerializer) {
            this.__plainMatrixSerializer = new PlainMatrixSerializer();
        }
        return this.__plainMatrixSerializer;
    }

    get _imageAssetSerializer(): ImageAssetSerializer {
        if (!this.__imageAssetSerializer) {
            this.__imageAssetSerializer = new ImageAssetSerializer({
                scene: this,
            });
        }
        return this.__imageAssetSerializer;
    }

    get _cannonSerializer(): CannonEntitySerializer {
        if (!this.__cannonSerializer) {
            this.__cannonSerializer = new CannonEntitySerializer({
                scene: this,
                plainMatrixSerializer: this._plainMatrixSerializer,
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

    get _commentFilteringMapperSerializer(): CommentFilteringMapperSerializer {
        if (!this.__commentFilteringMapperSerializer) {
            this.__commentFilteringMapperSerializer = new CommentFilteringMapperSerializer({
                grapheme: this._grapheme,
            });
        }
        return this.__commentFilteringMapperSerializer;
    }

    get _bulletSerializer(): BulletEntitySerializer {
        if (!this.__bulletSerializer) {
            throw new Error("bulletSerializer isn't defined.");
        }
        return this.__bulletSerializer;
    }

    get _specialBulletSerializer(): SpecialBulletEntitySerializer {
        if (!this.__specialBulletSerializer) {
            throw new Error("specialBulletSerializer isn't defined.");
        }
        return this.__specialBulletSerializer;
    }

    get _flySerializer(): FlyEntitySerializer {
        if (!this.__flySerializer) {
            throw new Error("flySerializer isn't defined.");
        }
        return this.__flySerializer;
    }

    get _explosionSerializer(): FrameSpriteSerializer {
        if (!this.__explosionSerializer) {
            this.__explosionSerializer = new class extends FrameSpriteSerializer {
                override filter(objectType: string): boolean {
                    return objectType === ExplosionEntity.name;
                }

                override deserialize(json: ObjectDef<FrameSpriteParam>): ExplosionEntity {
                    const explosion = new ExplosionEntity(this._deserializeParameterObject(json.param));
                    if (json.param.hasTimer) {
                        explosion.start();
                    }
                    return explosion;
                }
            }({
                scene: this,
                entitySerializers: [],
                imageAssetSerializer: this._imageAssetSerializer,
                plainMatrixSerializer: this._plainMatrixSerializer,
            });
        }
        return this.__explosionSerializer;
    }

    get _layerSerializer(): LayerEntitySerializer {
        if (!this.__layerSerializer) {
            this.__layerSerializer = new LayerEntitySerializer({
                scene: this,
                plainMatrixSerializer: this._plainMatrixSerializer,
            });
        }
        return this.__layerSerializer;
    }

    get _activeUserNum(): number {
        if (!this.__activeUserNumSender) {
            throw new Error("activeUserNumSender isn't defined.");
        }
        return this.__activeUserNumSender.activeNum();
    }

    get _commentFilteringMapper(): CommentFilteringMapper {
        if (!this.__commentFilteringMapper) {
            throw new Error("commentFilteringMapper isn't defined.");
        }
        return this.__commentFilteringMapper;
    }
}
