import { Box2D } from "@akashic-extension/akashic-box2d";
import { AfterStepInvocation, DeferrableController } from "./controllerDeferrable";
import { isMutableComponentEBody, MutableComponentEntity } from "./componentMutable";
import { TypedEBody } from "../typings/akashic-box2d";

export interface KillControllerParameterObject {
    box2d: Box2D;
}

export class KillController extends DeferrableController {
    readonly box2d: Box2D;

    constructor(param: KillControllerParameterObject) {
        super();
        this.box2d = param.box2d;
    }

    override Step(): AfterStepInvocation | void {
        const disposals: Set<TypedEBody<MutableComponentEntity>> = new Set();
        for (let bi = this.GetBodyList(); bi; bi = bi.nextBody) {
            const body = bi.body;
            const ebody = this.box2d.getEBodyFromb2Body(body);
            if (isMutableComponentEBody(ebody)) {
                if (!ebody.entity.mutableComponent.isAlive()) {
                    disposals.add(ebody);
                }
            }
        }
        return () => {
            for (const ebody of disposals) {
                ebody.entity.destroy();
                this.box2d.removeBody(ebody);
                // step 後に fire しないと新インスタンスを作れない
                ebody.entity.mutableComponent.onKill.fire();
            }
        };
    }
}
