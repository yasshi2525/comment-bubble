import { Box2DWeb, EBody } from "@akashic-extension/akashic-box2d";

interface TypedEBody<T extends g.E> extends EBody {
    /**
      * Akashicのエンティティ。
      */
    entity: T;
}

interface SimpleMath {
    sin: typeof Math.sin;
    cos: typeof Math.cos;
}

declare module "@akashic-extension/akashic-box2d" {
    interface Box2D {
        createBody<T extends g.E>(
            entity: T,
            bodyDef: Box2DWeb.Dynamics.b2BodyDef,
            fixtureDef: Box2DWeb.Dynamics.b2FixtureDef | Box2DWeb.Dynamics.b2FixtureDef[]): TypedEBody<T> | null;
    }
    // patchBox2DMath適用必須
    declare module Box2DWeb.Common.Math {
        interface b2Mat22 {
            __lutmath: SimpleMath;
        }
    }
}

export { TypedEBody };
