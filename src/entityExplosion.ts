export interface ExplosionParameterObject extends Omit<g.FrameSpriteParameterObject, "src"> {
}

export class ExplosionEntity extends g.FrameSprite {
    static assets: string[] = ["explosion"];
    constructor(param: ExplosionParameterObject) {
        super({ ...param, src: param.scene.asset.getImageById("explosion") });
        this.onFinish.add(() => {
            this.destroy();
        });
    }
}
