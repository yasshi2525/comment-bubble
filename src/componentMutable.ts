import { TypedEBody } from "../typings/akashic-box2d";

export interface MutableComponentEntity extends g.E {
    readonly mutableComponent: MutableComponent;
}

export const isMutableComponentEBody = (obj: unknown): obj is TypedEBody<MutableComponentEntity> =>
    obj != null && typeof obj === "object"
    && "entity" in obj && typeof obj.entity === "object" && obj.entity != null
    && "mutableComponent" in obj.entity && obj.entity.mutableComponent instanceof MutableComponent;

export interface MutableComponentParameterObject {
    maxHP: number;
    initialHP: number;
}

export interface MutableComponentParam extends MutableComponentParameterObject {

};

/**
 * 衝突する度にダメージを受けて、体力が尽きると消える性質
 */
export class MutableComponent {
    /**
     * Step のなかで発火するとエラーになるので、Step 後で発火
     */
    readonly onAttack: g.Trigger = new g.Trigger();
    readonly onKill: g.Trigger = new g.Trigger();
    readonly maxHP: number;
    hp: number;

    constructor(param: MutableComponentParameterObject) {
        if (!Number.isInteger(param.maxHP)) {
            throw new Error(`maxHP should be integer. (actual = ${param.maxHP})`);
        }
        if (param.maxHP <= 0) {
            throw new Error(`maxHP should be greater than 0. (expected ${param.maxHP} > 0)`);
        }
        if (!Number.isInteger(param.initialHP)) {
            throw new Error(`initialHP should be integer. (actual = ${param.initialHP})`);
        }
        if (param.initialHP <= 0) {
            throw new Error(`initialHP should be greater than 0. (expected ${param.initialHP} > 0)`);
        }
        if (param.initialHP > param.maxHP) {
            throw new Error(`maxHP should be greater than or equals initialHP. (${param.maxHP} >= ${param.initialHP})`);
        }
        this.maxHP = param.maxHP;
        this.hp = param.initialHP;
    }

    static deserializeParameterObject(param: MutableComponentParam): MutableComponentParam {
        return {
            initialHP: param.initialHP,
            maxHP: param.maxHP,
        };
    }

    attack(): void {
        if (this.hp === 0) {
            return;
        }
        this.hp--;
        this.onAttack.fire();
    }

    isAlive(): boolean {
        return this.hp > 0;
    }

    serialize(): MutableComponentParam {
        return {
            maxHP: this.maxHP,
            initialHP: this.hp,
        };
    }
}
