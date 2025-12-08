import { Constants } from "./style";

export interface ActiveUserNumLabelParameterObject extends g.EParameterObject {
    initialNumber?: number;
    font: g.Font;
}

export class ActiveUserNumLabel extends g.E {
    static readonly assets: string[] = ["active-user-label"];
    _num: number;

    readonly _prefix: g.Sprite;
    readonly _body: g.Label;

    constructor(param: ActiveUserNumLabelParameterObject) {
        super(param);
        this._num = param.initialNumber ?? 0;
        this._body = new g.Label({
            scene: this.scene,
            parent: this,
            font: param.font,
            text: this._num.toString(),
            x: this.width - Constants.game.active.label.padding,
            y: this.height / 2,
            anchorX: 1,
            anchorY: 0.5,
            local: true,
        });
        this._prefix = new g.Sprite({
            scene: this.scene,
            parent: this,
            src: this.scene.asset.getImageById("active-user-label"),
            x: this.width - this._body.width - Constants.game.active.label.padding * 2,
            y: this.height / 2,
            anchorX: 1,
            anchorY: 0.5,
            local: true,
        });
    }

    get num(): number {
        return this._num;
    }

    set num(v: number) {
        const oldNum = this._num;
        const oldBodyWidth = this._body.width;
        this._num = v;
        this._body.text = this._num.toString();
        if (oldNum !== this._num) {
            this._body.invalidate();
        }
        if (oldBodyWidth !== this._body.width) {
            this._prefix.x = this.width - this._body.width - Constants.game.active.label.padding * 2;
            this._prefix.modified();
        }
    }
}
