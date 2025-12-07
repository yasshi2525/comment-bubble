import { Box2D } from "@akashic-extension/akashic-box2d";
import { Dynamics } from "box2dweb";
import { isMutableComponentEBody } from "./componentMutable";

export interface ContantListenerFactoryParameterObject {
    box2d: Box2D;
}

export class ContantListenerFactory {
    readonly box2d: Box2D;

    constructor(param: ContantListenerFactoryParameterObject) {
        this.box2d = param.box2d;
    }

    newInstance(): Dynamics.b2ContactListener {
        const contactListener = new Dynamics.b2ContactListener();
        contactListener.EndContact = (contact) => {
            const ebody1 = this.box2d.getEBodyFromb2Body(contact.GetFixtureA().GetBody());
            if (isMutableComponentEBody(ebody1)) {
                ebody1.entity.mutableComponent.attack();
            }
            const ebody2 = this.box2d.getEBodyFromb2Body(contact.GetFixtureB().GetBody());
            if (isMutableComponentEBody(ebody2)) {
                ebody2.entity.mutableComponent.attack();
            }
        };
        return contactListener;
    }
}
