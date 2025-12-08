import { Box2D } from "@akashic-extension/akashic-box2d";
import { Dynamics } from "box2dweb";

export type AfterStepInvocation = () => void;

const afterStepInvocations: AfterStepInvocation[] = [];

Box2D.prototype.step = new Proxy(Box2D.prototype.step, {
    apply(target, thisArg, argArray: Parameters<Box2D["step"]>) {
        target.call(thisArg, ...argArray);
        let cb: AfterStepInvocation | undefined;
        while ((cb = afterStepInvocations.shift())) {
            cb();
        }
    },
});

export abstract class DeferrableController extends Dynamics.Controllers.b2Controller {
    constructor() {
        super();
        this.Step = new Proxy(this.Step, {
            apply: (target, thisArg, argArray: Parameters<DeferrableController["Step"]>) => {
                const result = target.call(thisArg, ...argArray);
                if (result) {
                    afterStepInvocations.push(result);
                }
            },
        });
    }
    abstract override Step(step: any): AfterStepInvocation | void;
}
