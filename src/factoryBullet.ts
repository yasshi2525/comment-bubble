import { Box2D, EBody } from "@akashic-extension/akashic-box2d";
import { style } from "./style";
import { Dynamics, Common } from "box2dweb";
import { BulletEntity } from "./entityBullet";
import { CannonEntity } from "./entityCannon";
import { TypedEBody } from "../typings/akashic-box2d";

export interface BulletFactoryParameterObject {
    scene: g.Scene;
    box2d: Box2D;
    controllers: ReadonlyArray<Dynamics.Controllers.b2Controller>;
    /**
     * N
     */
    initialPower: number;
    cannon: CannonEntity;
    characterFont: g.Font;
}

export interface BulletParameterObject {
    character: string;
    commentID?: string;
    isSelfComment: boolean;
}

export class BulletFactory {
    static readonly assets: string[] = [...BulletEntity.assets];
    readonly scene: g.Scene;
    readonly box2d: Box2D;
    readonly controllers: ReadonlyArray<Dynamics.Controllers.b2Controller>;
    readonly initialPower: number;
    readonly cannon: CannonEntity;
    readonly characterFont: g.Font;

    constructor(param: BulletFactoryParameterObject) {
        this.scene = param.scene;
        this.box2d = param.box2d;
        this.controllers = param.controllers;
        this.initialPower = param.initialPower;
        this.cannon = param.cannon;
        this.characterFont = param.characterFont;
    }

    newInstance(param: BulletParameterObject): TypedEBody<BulletEntity> {
        const ebody = this.box2d.createBody(
            new BulletEntity({
                scene: this.scene,
                parent: this.scene,
                font: this.characterFont,
                anchorX: 0.5,
                anchorY: 0.5,
                x: this.cannon.center.x,
                y: this.cannon.center.y,
                ...param,
            }),
            this.box2d.createBodyDef(style(this.scene).bullet.body),
            this.box2d.createFixtureDef({
                ...style(this.scene).bullet.fixture,
                userData: "bullet",
                shape: this.box2d.createCircleShape(style(this.scene).bullet.radius * 2),
            })
        )!;
        for (const controller of this.controllers) {
            controller.AddBody(ebody.b2Body);
        }
        ebody.b2Body.ApplyImpulse(
            // cannon の回転角は反時計回りを正としているため時計回りに補正
            new Common.Math.b2Vec2(
                Math.cos(-this.cannon._angle) * this.initialPower,
                Math.sin(-this.cannon._angle) * this.initialPower
            ),
            ebody.b2Body.GetWorldCenter());
        return ebody;
    }

    restoreController(ebodies: EBody[]): void {
        for (const ebody of ebodies.filter(ebody => ebody.entity instanceof BulletEntity)) {
            for (const controller of this.controllers) {
                controller.AddBody(ebody.b2Body);
            }
        }
    }
}
