import { Box2DWeb } from "@akashic-extension/akashic-box2d";

let _sin: typeof Math.sin;
let _cos: typeof Math.cos;

/**
 * g.Math がまだ使えないので、patch の sin/cos を使う。
 * 必ず patchBox2DMath() を実行してから呼び出すこと
 */
export const initMath = () => {
    const _this = Box2DWeb.Common.Math.b2Mat22.prototype.__lutmath;
    _sin = Box2DWeb.Common.Math.b2Mat22.prototype.__lutmath.sin.bind(_this);
    _cos = Box2DWeb.Common.Math.b2Mat22.prototype.__lutmath.cos.bind(_this);
};

export const safeSin: typeof Math.sin = (...args) => _sin(...args);
export const safeCos: typeof Math.cos = (...args) => _cos(...args);
