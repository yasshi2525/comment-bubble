import { Box2D, Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";
import { Constants } from "./style";
import { TypedEBody } from "../typings/akashic-box2d";
import { FlyEntity } from "./entityFly";
import { Dynamics } from "box2dweb";
import { safeCos, safeSin } from "./math";
import { safePlay } from "./playAudio";

export interface FlyFactoryParameterObject {
    scene: g.Scene;
    box2d: Box2D;
    layer: g.E;
    controllers: ReadonlyArray<Dynamics.Controllers.b2Controller>;
    flyNoFont: g.Font;
}

export interface FlyParameterObject {
    flyNo: number;
}

export class FlyFactory {
    static readonly assets: string[] = [...FlyEntity.assets, "ufo-spawn"];
    readonly onCreate: g.Trigger<FlyEntity> = new g.Trigger();
    readonly controllers: ReadonlyArray<Dynamics.Controllers.b2Controller>;
    readonly scene: g.Scene;
    readonly box2d: Box2D;
    readonly layer: g.E;
    readonly desiredSpeed: number;
    readonly flyNoFont: g.Font;

    constructor(param: FlyFactoryParameterObject) {
        this.scene = param.scene;
        this.box2d = param.box2d;
        this.controllers = param.controllers;
        this.layer = param.layer;
        this.flyNoFont = param.flyNoFont;
        this.desiredSpeed = Constants.fly.speed.x / g.game.fps / this.box2d.scale;
    }

    newInstance(param: FlyParameterObject): TypedEBody<FlyEntity> {
        const hp = Math.ceil(Constants.fly.hp.initialMax * Math.pow(Constants.fly.hp.poewerUpRate, param.flyNo - 1));
        const ebody = this.box2d.createBody(
            new FlyEntity({
                scene: this.scene,
                parent: this.layer,
                anchorX: 0.5,
                anchorY: 0.5,
                ...this._spawn(),
                ...Constants.fly.entity,
                maxHP: hp,
                initialHP: hp,
                duration: Constants.fly.flash.frame,
                initialTimeout: 0,
                direction: "left",
                floating: "idle",
                rotating: "idle",
                deltaAngle: 0,
                flyNoFont: this.flyNoFont,
                ...param,
            }),
            this.box2d.createBodyDef(Constants.fly.body),
            [
                this.box2d.createFixtureDef({
                    ...Constants.fly.fixture,
                    shape: this.box2d.createPolygonShape(
                        (this.scene.asset.getJSONContentById("ufo-shape1") as g.CommonOffset[])
                            .map(({ x, y }) => this.box2d.vec2(x, y))
                            .map((v) => {
                                v.Subtract(this.box2d.vec2(Constants.fly.entity.width / 2, Constants.fly.entity.height / 2));
                                return v;
                            })
                    ),
                }),
                this.box2d.createFixtureDef({
                    ...Constants.fly.fixture,
                    shape: this.box2d.createPolygonShape(
                        (this.scene.asset.getJSONContentById("ufo-shape2") as g.CommonOffset[])
                            .map(({ x, y }) => this.box2d.vec2(x, y))
                            .map((v) => {
                                v.Subtract(this.box2d.vec2(Constants.fly.entity.width / 2, Constants.fly.entity.height / 2));
                                return v;
                            })
                    ),
                }),
                this.box2d.createFixtureDef({
                    ...Constants.fly.fixture,
                    shape: this.box2d.createPolygonShape(
                        (this.scene.asset.getJSONContentById("ufo-shape3") as g.CommonOffset[])
                            .map(({ x, y }) => this.box2d.vec2(x, y))
                            .map((v) => {
                                v.Subtract(this.box2d.vec2(Constants.fly.entity.width / 2, Constants.fly.entity.height / 2));
                                return v;
                            })
                    ),
                }),
            ]
        )!;
        this._initMovability(ebody);
        safePlay(this.scene, "ufo-spawn");
        this.onCreate.fire(ebody.entity);
        return ebody;
    }

    restore(ebodies: EBody[]): void {
        for (const ebody of ebodies.filter(ebody => ebody.entity instanceof FlyEntity) as TypedEBody<FlyEntity>[]) {
            this._restoreMovability(ebody);
        }
    }

    _initMovability(ebody: TypedEBody<FlyEntity>): void {
        // 初期移動
        ebody.b2Body.ApplyImpulse(
            new Box2DWeb.Common.Math.b2Vec2(Constants.fly.engine.x * (ebody.entity.direction === "left" ? -1 : 1), 0),
            ebody.b2Body.GetWorldCenter()
        );
        // 初期浮上
        ebody.b2Body.ApplyImpulse(
            new Box2DWeb.Common.Math.b2Vec2(0, -Constants.fly.engine.y),
            ebody.b2Body.GetWorldCenter()
        );
        // 初期回転
        this._rotate(ebody, true);
        this._restoreMovability(ebody);
    }

    _restoreMovability(ebody: TypedEBody<FlyEntity>): void {
        for (const controller of this.controllers) {
            controller.AddBody(ebody.b2Body);
        }
        ebody.entity.onUpdate.add(() => {
            // 止まったら移動再開
            this._keepMoving(ebody);
            // 左右移動
            this._shift(ebody);
            // ふよふよさせる
            this._keepFloating(ebody);
            // 空気抵抗(垂直方向) (ないと速度がどんどんあがり、どんどん浮遊の振れ幅が大きくなるから)
            ebody.b2Body.ApplyImpulse(
                new Box2DWeb.Common.Math.b2Vec2(0, -Constants.world.resistance.y * ebody.b2Body.GetLinearVelocity().y),
                ebody.b2Body.GetWorldCenter()
            );
            // 水平を保つ
            this._keepHorizontal(ebody);
            // 空気抵抗(回転方向) (ないと速度がどんどんあがり、どんどんぐらぐらの振れ幅が大きくなるから)
            this._rotate(ebody, false, ebody.entity.deltaAngle * Constants.world.resistance.rotate);
        });
        ebody.entity.mutableComponent.onKill.addOnce(() => {
            this.newInstance({ flyNo: ebody.entity._flyNo + 1 });
        });
    }

    _shift(ebody: TypedEBody<FlyEntity>): void {
        if (this._shouldTurnRight(ebody)) {
            this._turnRight(ebody);
        }
        if (this._shouldTurnLeft(ebody)) {
            this._turnLeft(ebody);
        }
    }

    _shouldTurn(ebody: TypedEBody<FlyEntity>): boolean {
        return (ebody.entity.direction === "left" && this._shouldTurnRight(ebody))
            || (ebody.entity.direction === "right" && this._shouldTurnLeft(ebody));
    }

    _shouldTurnRight(ebody: EBody): boolean {
        return ebody.entity.x < Constants.fly.spawn.left;
    }

    _shouldTurnLeft(ebody: EBody): boolean {
        return ebody.entity.x > Constants.fly.spawn.right;
    }

    _turnRight(ebody: TypedEBody<FlyEntity>): void {
        ebody.b2Body.ApplyImpulse(
            new Box2DWeb.Common.Math.b2Vec2(Constants.fly.engine.x / 2, 0),
            ebody.b2Body.GetWorldCenter()
        );
        ebody.entity.direction = "right";
    }

    _turnLeft(ebody: TypedEBody<FlyEntity>): void {
        ebody.b2Body.ApplyImpulse(
            new Box2DWeb.Common.Math.b2Vec2(-Constants.fly.engine.x / 2, 0),
            ebody.b2Body.GetWorldCenter()
        );
        ebody.entity.direction = "left";
    }

    _keepMoving(ebody: TypedEBody<FlyEntity>): void {
        if (this._shouldImpluseForMoving(ebody)) {
            ebody.b2Body.ApplyImpulse(
                new Box2DWeb.Common.Math.b2Vec2(Constants.fly.engine.x * (ebody.entity.direction === "left" ? -1 : 1), 0),
                ebody.b2Body.GetWorldCenter()
            );
        }
    }

    _shouldImpluseForMoving(ebody: TypedEBody<FlyEntity>): boolean {
        if (this._shouldTurn(ebody)) {
            return false;
        }
        return (ebody.entity.direction === "left")
            ? ebody.b2Body.GetLinearVelocity().x > -this.desiredSpeed
            : ebody.b2Body.GetLinearVelocity().x < this.desiredSpeed;
    }

    _keepFloating(ebody: TypedEBody<FlyEntity>): void {
        // ふよふよさせるため、ラッチにしている
        if (this._shouldFloatUp(ebody)) {
            ebody.entity.floating = "up";
        }
        if (this._shouldKeepFloatingUp(ebody)) {
            this._floatUp(ebody);
        }
        else if (ebody.entity.floating === "up") {
            ebody.entity.floating = "idle";
        }
        if (this._shouldFloatDown(ebody)) {
            ebody.entity.floating = "down";
        }
        if (this._shouldKeepFloatingDown(ebody)) {
            this._floatDown(ebody);
        }
        else if (ebody.entity.floating === "down") {
            ebody.entity.floating = "idle";
        }
    }

    _shouldFloatUp(ebody: TypedEBody<FlyEntity>): boolean {
        return ebody.entity.y > ebody.entity._standardY + Constants.fly.offset.required.y
            || ebody.entity.y > Constants.fly.spawn.bottom;
    }

    _shouldKeepFloatingUp(ebody: TypedEBody<FlyEntity>): boolean {
        // 低すぎ
        if (this._shouldFloatUp(ebody)) {
            return true;
        }
        // まだ低い
        if (ebody.entity.floating === "up" && ebody.entity.y > ebody.entity._standardY + Constants.fly.offset.desired.y) {
            return true;
        }
        return false;
    }

    _shouldFloatDown(ebody: TypedEBody<FlyEntity>): boolean {
        return ebody.entity.y < ebody.entity._standardY - Constants.fly.offset.required.y
            || ebody.entity.y < Constants.fly.spawn.top;
    }

    _shouldKeepFloatingDown(ebody: TypedEBody<FlyEntity>): boolean {
        // 高すぎ
        if (this._shouldFloatDown(ebody)) {
            return true;
        }
        // まだ高い
        if (ebody.entity.floating === "down" && ebody.entity.y < ebody.entity._standardY - Constants.fly.offset.desired.y) {
            return true;
        }
        return false;
    }

    _floatUp(ebody: EBody): void {
        ebody.b2Body.ApplyImpulse(
            new Box2DWeb.Common.Math.b2Vec2(0, -Constants.fly.engine.y),
            ebody.b2Body.GetWorldCenter()
        );
    }

    _floatDown(ebody: EBody): void {
        ebody.b2Body.ApplyImpulse(
            new Box2DWeb.Common.Math.b2Vec2(0, Constants.fly.engine.y),
            ebody.b2Body.GetWorldCenter()
        );
    }

    _keepHorizontal(ebody: TypedEBody<FlyEntity>): void {
        // ぐらぐらさせるため、ラッチにしている
        if (this._shouldRotateClockwise(ebody)) {
            ebody.entity.rotating = "clockwise";
        }
        if (this._shouldKeepRotatingClockwise(ebody)) {
            this._rotate(ebody, true);
        }
        else if (ebody.entity.rotating === "clockwise") {
            ebody.entity.rotating = "idle";
        }
        if (this._shouldRotateAnticlockwise(ebody)) {
            ebody.entity.rotating = "anticlockwise";
        }
        if (this._shouldKeepRotatingAnticlockwise(ebody)) {
            this._rotate(ebody, false);
        }
        else if (ebody.entity.rotating === "anticlockwise") {
            ebody.entity.rotating = "idle";
        }
    }

    _rotate(ebody: EBody, clockwise: boolean, power: number = Constants.fly.engine.rotate): void {
        ebody.b2Body.ApplyImpulse(
            this._getRotatePower(ebody, power, "left", clockwise),
            this._getEdgeWorldPoint(ebody, "left")
        );
        ebody.b2Body.ApplyImpulse(
            this._getRotatePower(ebody, power, "right", clockwise),
            this._getEdgeWorldPoint(ebody, "right")
        );
    }

    _shouldRotateAnticlockwise(ebody: EBody): boolean {
        // 注：数学の座標系と画面の座標系で上下方向が変わる。ここでは数学的に時計回りに回るべきか調べ、画面上は反時計回りすべきと判定している
        // required < angle < 90
        // -> sin(required) < sin(angle) when sin(angle) > 0, cos(angle) > 0
        if (safeSin(Constants.fly.offset.required.angle / 180 * Math.PI) < safeSin(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) > 0 && safeSin(ebody.b2Body.GetAngle()) > 0
        ) {
            return true;
        }
        // 180 + required < angle < 270
        // -> sin(180 + required) > sin(angle) when sin(angle) < 0, cos(angle) < 0
        if (
            -safeSin(Constants.fly.offset.required.angle / 180 * Math.PI) > safeSin(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) < 0 && safeSin(ebody.b2Body.GetAngle()) < 0
        ) {
            return true;
        }
        return false;
    }

    _shouldKeepRotatingAnticlockwise(ebody: TypedEBody<FlyEntity>): boolean {
        // 注：数学の座標系と画面の座標系で上下方向が変わる。ここでは数学的に時計回りに回るべきか調べ、画面上は反時計回りすべきと判定している
        if (this._shouldRotateAnticlockwise(ebody)) {
            return true;
        }
        // desired < angle < 90
        // -> sin(desired) < sin(angle) when sin(angle) > 0, cos(angle) > 0
        if (
            ebody.entity.rotating === "anticlockwise"
            && safeSin(Constants.fly.offset.desired.angle / 180 * Math.PI) < safeSin(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) > 0 && safeSin(ebody.b2Body.GetAngle()) > 0
        ) {
            return true;
        }
        // 180 + desired < angle < 270
        // -> sin(180 + desired) > sin(angle) when sin(angle) < 0, cos(angle) < 0
        if (
            ebody.entity.rotating === "anticlockwise"
            && -safeSin(Constants.fly.offset.desired.angle / 180 * Math.PI) > safeSin(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) < 0 && safeSin(ebody.b2Body.GetAngle()) < 0
        ) {
            return true;
        }
        return false;
    }

    _shouldRotateClockwise(ebody: EBody): boolean {
        // 注：数学の座標系と画面の座標系で上下方向が変わる。ここでは数学的に反時計回りに回るべきか調べ、画面上は時計回りすべきと判定している
        // 90 < angle < 180 - required
        // -> sin(180 - required) < sin(angle) when sin(angle) > 0, cos(angle) < 0
        // -> cos(180 - required) < cos(angle) when sin(angle) > 0, cos(angle) < 0
        if (-safeCos(Constants.fly.offset.required.angle / 180 * Math.PI) < safeCos(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) > 0 && safeSin(ebody.b2Body.GetAngle()) < 0
        ) {
            return true;
        }
        // 270 < angle < 360 - required
        // -> sin(360 - required) > sin(angle) when sin(angle) < 0, cos(angle) > 0
        // -> cos(360 - required) > cos(angle) when sin(angle) > 0, cos(angle) < 0
        if (
            safeCos(Constants.fly.offset.required.angle / 180 * Math.PI) > safeCos(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) < 0 && safeSin(ebody.b2Body.GetAngle()) > 0
        ) {
            return true;
        }
        return false;
    }

    _shouldKeepRotatingClockwise(ebody: TypedEBody<FlyEntity>): boolean {
        // 注：数学の座標系と画面の座標系で上下方向が変わる。ここでは数学的に反時計回りに回るべきか調べ、画面上は時計回りすべきと判定している
        if (this._shouldRotateClockwise(ebody)) {
            return true;
        }
        // 90 < angle < 180 - desired
        // -> sin(180 - desired) < sin(angle) when sin(angle) > 0, cos(angle) < 0
        // -> cos(180 - desired) < cos(angle) when sin(angle) > 0, cos(angle) < 0
        if (ebody.entity.rotating === "clockwise"
            && -safeCos(Constants.fly.offset.desired.angle / 180 * Math.PI) < safeCos(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) > 0 && safeSin(ebody.b2Body.GetAngle()) < 0
        ) {
            return true;
        }
        // 270 < angle < 360 - desired
        // -> sin(360 - desired) > sin(angle) when sin(angle) < 0, cos(angle) > 0
        // -> cos(360 - desired) > cos(angle) when sin(angle) > 0, cos(angle) < 0
        if (
            ebody.entity.rotating === "clockwise"
            && safeCos(Constants.fly.offset.desired.angle / 180 * Math.PI) > safeCos(ebody.b2Body.GetAngle())
            && safeCos(ebody.b2Body.GetAngle()) < 0 && safeSin(ebody.b2Body.GetAngle()) > 0
        ) {
            return true;
        }
        return false;
    }

    _getEdgeWorldPoint(ebody: EBody, side: "left" | "right"): Box2DWeb.Common.Math.b2Vec2 {
        const halfWidth = ebody.entity.width / 2 / this.box2d.scale;
        const angle = ebody.b2Body.GetAngle() + (side === "right" ? 0 : Math.PI);
        return ebody.b2Body.GetWorldPoint(new Box2DWeb.Common.Math.b2Vec2(
            safeCos(angle) * halfWidth,
            safeSin(angle) * halfWidth
        ));
    }

    _getRotatePower(ebody: EBody, power: number, side: "left" | "right", clockwise: boolean): Box2DWeb.Common.Math.b2Vec2 {
        const angle = ebody.b2Body.GetAngle() + Math.PI / 2 * (clockwise ? 1 : -1) * (side === "right" ? 1 : -1);
        return new Box2DWeb.Common.Math.b2Vec2(
            safeCos(angle) * power,
            safeSin(angle) * power
        );
    }

    _spawn(): g.CommonOffset {
        const rect = Constants.fly.spawn;
        return {
            x: rect.left + g.game.random.generate() * (rect.right - rect.left),
            y: rect.top + g.game.random.generate() * (rect.bottom - rect.top),
        };
    }
}
