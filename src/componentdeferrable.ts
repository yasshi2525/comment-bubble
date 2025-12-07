import { TypedEBody } from "../typings/akashic-box2d";

export interface DeferrableComponentEntity extends g.E {
    handleAfterStep(): void;
}

export const isDeferrableComponentEBody = (obj: unknown): obj is TypedEBody<DeferrableComponentEntity> =>
    obj != null && typeof obj === "object"
    && "entity" in obj && typeof obj.entity === "object" && obj.entity != null
    && "handleAfterStep" in obj.entity && typeof obj.entity.handleAfterStep === "function";
