import { Box2D } from "@akashic-extension/akashic-box2d";
import { AfterStepInvocation, DeferrableController } from "./controllerDeferrable";
import { Collision, Common, Dynamics } from "box2dweb";

export interface HorizonControllerParameterObject {
    box2d: Box2D;
}

export class HorizonController extends DeferrableController {
    readonly box2d: Box2D;
    readonly horizion: Collision.b2AABB;
    constructor(param: HorizonControllerParameterObject) {
        super();
        this.box2d = param.box2d;
        this.horizion = new Collision.b2AABB();
        this.horizion.lowerBound = new Common.Math.b2Vec2(0, 0);
        this.horizion.lowerBound.Multiply(1 / this.box2d.scale);
        this.horizion.upperBound = new Common.Math.b2Vec2(g.game.width, g.game.height);
        this.horizion.upperBound.Multiply(1 / this.box2d.scale);
    }

    override Step(): AfterStepInvocation | void {
        const disposals: Set<Dynamics.b2Body> = new Set();
        for (let bi = this.GetBodyList(); bi; bi = bi.nextBody) {
            const body = bi.body;
            for (let f = body.GetFixtureList(); f; f = f.GetNext()) {
                if (!this.horizion.TestOverlap(f.GetAABB())) {
                    disposals.add(body);
                    break;
                }
            }
        }
        return () => {
            for (const body of disposals) {
                body.SetUserData("disposed");
                const ebody = this.box2d.getEBodyFromb2Body(body);
                if (ebody) {
                    ebody.entity.destroy();
                    this.box2d.removeBody(ebody);
                }
            }
        };
    }
}
