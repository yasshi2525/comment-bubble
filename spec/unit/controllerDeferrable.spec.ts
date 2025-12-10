import { Box2D } from "@akashic-extension/akashic-box2d";
import { AfterStepInvocation, DeferrableController } from "../../src/controllerDeferrable";

describe("deferrableController", () => {
    it("defer時はworldがunlockされる", () => {
        const box2d = new Box2D({
            gravity: [0, 9.8],
            scale: 10,
        });
        let isLockingInStep: boolean | undefined = undefined;
        let isLockingAfterStep: boolean | undefined = undefined;
        const inst = new class extends DeferrableController {
            override Step(): AfterStepInvocation | void {
                isLockingInStep = this.GetWorld().IsLocked();
                return () => {
                    isLockingAfterStep = this.GetWorld().IsLocked();
                };
            }
        }();
        box2d.world.AddController(inst);
        box2d.step(1 / g.game.fps);
        expect(isLockingInStep).toBe(true);
        expect(isLockingAfterStep).toBe(false);
    });
});
