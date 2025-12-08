import { BodyType, Box2D } from "@akashic-extension/akashic-box2d";
import { Constants } from "./style";
import { TypedEBody } from "../typings/akashic-box2d";

export interface WorldHorizonFactoryParameterObject {
    scene: g.Scene;
    box2d: Box2D;
}

export interface WorldHorizon {
    top: TypedEBody<g.FilledRect>;
    right: TypedEBody<g.FilledRect>;
    bottom: TypedEBody<g.FilledRect>;
    left: TypedEBody<g.FilledRect>;
}

export class WorldHorizonFactory {
    readonly scene: g.Scene;
    readonly box2d: Box2D;

    constructor(param: WorldHorizonFactoryParameterObject) {
        this.scene = param.scene;
        this.box2d = param.box2d;
    }

    newInstarnce(): WorldHorizon {
        const size = Constants.boundary.size;
        return {
            top: this._newBoundary({ x: 0, y: -size, width: g.game.width, height: size }),
            right: this._newBoundary({ x: g.game.width + size, y: 0, width: size, height: g.game.height }),
            bottom: this._newBoundary({ x: 0, y: g.game.height + size / 2, width: g.game.width, height: size }),
            left: this._newBoundary({ x: -size, y: 0, width: size, height: g.game.height }),
        };
    }

    _newBoundary(rect: g.CommonArea): TypedEBody<g.FilledRect> {
        const entity = new g.FilledRect({
            scene: this.scene,
            parent: this.scene,
            ...rect,
            cssColor: "transparent",
        });
        const ebody = this.box2d.createBody(
            entity,
            this.box2d.createBodyDef({
                type: BodyType.Static,
            }),
            this.box2d.createFixtureDef({
                ...Constants.boundary.fixture,
                shape: this.box2d.createRectShape(entity.width, entity.height),
            })
        ) as TypedEBody<g.FilledRect>;
        return ebody;
    }
}
