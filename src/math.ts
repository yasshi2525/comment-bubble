import { Box2DWeb } from "@akashic-extension/akashic-box2d";
import { SimpleMath } from "../typings/akashic-box2d";

let _sin: typeof Math.sin;
let _cos: typeof Math.cos;
let _this: SimpleMath;

/**
 * g.Math がまだ使えないので、patch の sin/cos を使う。
 * 必ず patchBox2DMath() を実行してから呼び出すこと
 */
export const initMath = () => {
    _this = Box2DWeb.Common.Math.b2Mat22.prototype.__lutmath;
    _sin = Box2DWeb.Common.Math.b2Mat22.prototype.__lutmath.sin;
    _cos = Box2DWeb.Common.Math.b2Mat22.prototype.__lutmath.cos;
};

export const safeSin: typeof Math.sin = (...args) => _sin.call(_this, ...args);
export const safeCos: typeof Math.cos = (...args) => _cos.call(_this, ...args);
