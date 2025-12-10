import { Box2D, Box2DBodyDef, Box2DFixtureDef, Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";
import { CannonEntity } from "./entityCannon";
import { TypedEBody } from "../typings/akashic-box2d";
import { safeCos, safeSin } from "./math";
import { MutableComponentEntity } from "./componentMutable";
import { Constants } from "./style";

export interface BasicBaseBulletFactoryParameterObject {
    scene: g.Scene;
    box2d: Box2D;
    controllers: ReadonlyArray<Box2DWeb.Dynamics.Controllers.b2Controller>;
    cannon: CannonEntity;
    layer: g.E;
}

export interface ExtraFactoryProvidedBaseBulletParameterObject {
}

export interface FactoryProvidedBaseBulletParameterObject {
    scene: g.Scene;
    parent: g.E;
    anchorX: number;
    anchorY: number;
    x: number;
    y: number;
    maxHP: number;
    initialHP: number;
}

type ConstructorOf<T, P extends any[]> = new (...args: P) => T;
type EntityConstructorOf<T extends g.E, P extends g.EParameterObject> = ConstructorOf<T, [P]>;
type EntityParam<XI, XF> = XI & FactoryProvidedBaseBulletParameterObject & XF;
type BulletEntityConstructorOf<T extends g.E, XI, XF> = EntityConstructorOf<T, EntityParam<XI, XF>>;

export interface ExtraBaseBulletParameterObject {
}

export interface BaseBulletFactoryParameterObject<
    T extends MutableComponentEntity,
    XI extends ExtraBaseBulletParameterObject = ExtraBaseBulletParameterObject,
    XF extends ExtraFactoryProvidedBaseBulletParameterObject = ExtraFactoryProvidedBaseBulletParameterObject,
    C extends BulletEntityConstructorOf<T, XI, XF> = BulletEntityConstructorOf<T, XI, XF>,
> extends BasicBaseBulletFactoryParameterObject {
    bodyDef: Box2DBodyDef;
    /**
     * shape 定義不要
     */
    fixtureDef: Box2DFixtureDef;
    radius: number;
    /**
     * @default 1
     */
    initialPowerBoostRate?: number;
    initialHP: number;
    clazz: C;
}

export abstract class BaseBulletFactory<
    T extends MutableComponentEntity,
    XI extends ExtraBaseBulletParameterObject = ExtraBaseBulletParameterObject,
    XF extends ExtraFactoryProvidedBaseBulletParameterObject = ExtraFactoryProvidedBaseBulletParameterObject,
    C extends BulletEntityConstructorOf<T, XI, XF> = BulletEntityConstructorOf<T, XI, XF>,
> {
    readonly _scene: g.Scene;
    readonly _box2d: Box2D;
    readonly _controllers: ReadonlyArray<Box2DWeb.Dynamics.Controllers.b2Controller>;
    readonly _cannon: CannonEntity;
    readonly _layer: g.E;
    readonly _bodyDef: Box2DWeb.Dynamics.b2BodyDef;
    readonly _fixtureDef: Box2DWeb.Dynamics.b2FixtureDef;
    readonly _initialPower: number;
    readonly _initialHP: number;
    readonly _clazz: C;
    readonly _isInstance: (obj: EBody) => obj is TypedEBody<T>;

    protected constructor(param: BaseBulletFactoryParameterObject<T, XI, XF, C>) {
        this._scene = param.scene;
        this._box2d = param.box2d;
        this._controllers = param.controllers;
        this._cannon = param.cannon;
        this._layer = param.layer;
        this._bodyDef = this._box2d.createBodyDef(param.bodyDef);
        param.fixtureDef.shape = this._box2d.createCircleShape(param.radius * 2);
        this._fixtureDef = this._box2d.createFixtureDef(param.fixtureDef);
        this._initialPower = (param.initialPowerBoostRate ?? 1) * Constants.cannon.fire.power;
        this._initialHP = param.initialHP;
        this._clazz = param.clazz;
        this._isInstance = (e): e is TypedEBody<T> => e.entity instanceof this._clazz;
    }

    newInstance(param: XI): TypedEBody<T> {
        const ebody = this._box2d.createBody(
            this._createEntity(this._createEntityParameterObject(param)),
            this._bodyDef,
            this._fixtureDef
        )!;
        for (const controller of this._controllers) {
            controller.AddBody(ebody.b2Body);
        }
        ebody.b2Body.ApplyImpulse(
            // cannon の回転角は反時計回りを正としているため時計回りに補正
            new Box2DWeb.Common.Math.b2Vec2(
                safeCos(-this._cannon._angle) * this._initialPower,
                safeSin(-this._cannon._angle) * this._initialPower,
            ),
            ebody.b2Body.GetWorldCenter());
        return ebody;
    }

    restore(ebodies: EBody[]): void {
        for (const ebody of ebodies.filter(this._isInstance)) {
            this._restoreEach(ebody);
        }
    }

    _restoreEach(ebody: TypedEBody<T>): void {
        this._restoreController(ebody);
    }

    _restoreController(ebody: TypedEBody<T>) {
        for (const controller of this._controllers) {
            controller.AddBody(ebody.b2Body);
        }
    }

    abstract _provideExtraEntityParameterObject(): XF;

    _createEntityParameterObject(param: XI): EntityParam<XI, XF> {
        return {
            scene: this._scene,
            parent: this._layer,
            anchorX: 0.5,
            anchorY: 0.5,
            x: this._cannon.center.x,
            y: this._cannon.center.y,
            maxHP: this._initialHP,
            initialHP: this._initialHP,
            ...this._provideExtraEntityParameterObject(),
            ...param,
        };
    }

    _createEntity(param: EntityParam<XI, XF>): T {
        return new this._clazz(param);
    }
}
