export interface FlyEntityParameterObject extends Omit<g.FilledRectParameterObject, "cssColor" | "height" | "width"> {

}

export class FlyEntity extends g.FilledRect {
    constructor(param: FlyEntityParameterObject) {
        super({
            ...param,
            cssColor: "black",
            width: 250,
            height: 20,
        });
        this.append(new g.FilledRect({
            scene: this.scene,
            x: 2.5,
            y: 2.5,
            width: this.width - 5,
            height: this.height - 5,
            cssColor: "white",
        }));
    }
}
