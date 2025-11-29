import { EBody } from "@akashic-extension/akashic-box2d";

interface TypedEBody<T extends g.E> extends EBody {
    /**
      * Akashicのエンティティ。
      */
    entity: T;
}

declare module "@akashic-extension/akashic-box2d" {
    interface Box2D {
        createBody<T extends g.E>(
            entity: T,
            bodyDef: Box2DWeb.Dynamics.b2BodyDef,
            fixtureDef: Box2DWeb.Dynamics.b2FixtureDef | Box2DWeb.Dynamics.b2FixtureDef[]): TypedEBody<T> | null;
    }
}

export { TypedEBody };
