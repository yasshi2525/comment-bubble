import { MutableComponent, MutableComponentEntity, MutableComponentParameterObject } from "./componentMutable";

export interface BulletEntityParameterObject extends Omit<g.SpriteParameterObject, "src">, MutableComponentParameterObject {
    font: g.Font;
    character: string;
    isSelfComment: boolean;
    commentID?: string;
}

export class BulletEntity extends g.Sprite implements MutableComponentEntity {
    static readonly assets: string[] = ["bullet-self", "bullet-other"];
    readonly mutableComponent: MutableComponent;
    readonly _character: string;
    readonly _commentID?: string;

    constructor(param: BulletEntityParameterObject) {
        const assetName = param.isSelfComment ? "bullet-self" : "bullet-other";
        super({
            ...param,
            src: param.scene.asset.getImageById(assetName),
        });
        this.mutableComponent = new MutableComponent(param);
        this._commentID = param.commentID;
        this._character = param.character;
        const label = new g.Label({
            scene: this.scene,
            text: this._character,
            font: param.font,
            x: this.width / 2,
            y: this.height / 2,
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.append(label);
    }
}
