import { Box2D } from "@akashic-extension/akashic-box2d";
import { patchBox2D, patchBox2DMath } from "@akashic-extension/akashic-box2d/patch";
import { style } from "./style";
import { HorizonController } from "./controllerHorizon";

export interface Box2DFactoryParameterObject {
    scene: g.Scene;
}

export interface Box2DNewInstanceResult {
    box2d: Box2D;
    horizonController: HorizonController;
}

export class Box2DFactory {
    readonly scene: g.Scene;

    constructor(param: Box2DFactoryParameterObject) {
        this.scene = param.scene;
    }

    newInstance(): Box2DNewInstanceResult {
        const { gravity, scale } = style(this.scene).world;
        const box2d = new Box2D({
            gravity: [0, gravity],
            scale,
        });
        patchBox2D(box2d, { maxTOILoop: 10 });
        // TODO: g.Math 実装時は干渉しないよう削除
        patchBox2DMath();
        return {
            box2d,
            horizonController: this._newHorizonController(box2d),
        };
    }

    _newHorizonController(box2d: Box2D): HorizonController {
        const controller = new HorizonController({ box2d });
        box2d.world.AddController(controller);
        return controller;
    }
}
