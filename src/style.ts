import { BodyType, Box2DBodyDef, Box2DFixtureDef } from "@akashic-extension/akashic-box2d";

const category = {
    boundary: 1,
    bullet: 1 << 1,
    enemy: 1 << 2,
};

export class Constants {
    private static _: Constants;

    static init(scene: g.Scene) {
        this._ = new Constants(scene);
    }

    private _;

    private constructor(private readonly scene: g.Scene) {
        this._ = {
            game: {
                snapshot: {
                    /**
                     * ms
                     */
                    interval: 15000,
                },
                active: {
                    heartbeat: {
                        /**
                         * ms
                         */
                        interval: 5000,
                        /**
                         * ms
                         */
                        expire: 15000,
                    },
                    entity: {
                        x: g.game.width,
                        y: Math.max(scene.asset.getImageById("active-user-label").height, scene.asset.getImageById("numeric").height) / 2,
                        local: true,
                    } satisfies Omit<g.EParameterObject, "scene">,
                    label: {
                        padding: 10,
                    },
                },
            },
            comment: {
                accept: {
                    max: {
                        sameCharacters: 3,
                        length: 15,
                    },
                },
                reject: {
                    whitespace: true,
                    multiline: true,
                },
            },
            world: {
                scale: 100,
                gravity: 2,
                /**
                 * N/(m/s) 空気抵抗定数
                 * ないと速度がどんどんあがり、どんどん浮遊の振れ幅が大きくなるから
                 */
                resistance: {
                    x: 0,
                    y: 0.01,
                    /**
                     * N(度/s)
                     */
                    rotate: 0.0002,
                },
            },
            boundary: {
                size: 10,
                fixture: {
                    friction: 0,
                    restitution: 0.5,
                    density: 1,
                    filter: {
                        categoryBits: category.boundary,
                        maskBits: category.enemy,
                    },
                } satisfies Box2DFixtureDef,
            },
            bullet: {
                maxHP: 1,
                radius: scene.asset.getImageById("bullet-other").width / 2,
                body: {
                    type: BodyType.Dynamic,
                    bullet: true,
                } satisfies Box2DBodyDef,
                fixture: {
                    friction: 0,
                    restitution: 0,
                    density: 1,
                    filter: {
                        categoryBits: category.bullet,
                        maskBits: category.enemy,
                    },
                } satisfies Box2DFixtureDef,
            },
            character: {
                font: {
                    game: scene.game,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    size: Math.floor(scene.asset.getImageById("bullet-other").width * 0.5),
                    fontColor: "black",
                    strokeWidth: 2,
                    strokeColor: "white",
                } satisfies g.DynamicFontParameterObject,
            },
            cannon: {
                entity: {
                    x: scene.asset.getImageById("cannon-body").width / 2,
                    y: g.game.height - scene.asset.getImageById("cannon-body").height / 2,
                    width: scene.asset.getImageById("cannon-body").width,
                    height: scene.asset.getImageById("cannon-body").height,
                    anchorX: 0.5,
                    anchorY: 0.5,
                } satisfies Omit<g.EParameterObject, "scene">,
                fire: {
                    /**
                     * ms
                     */
                    interval: 200,
                    /**
                     * N
                     */
                    power: 2,
                },
                /**
                 * 度数
                 */
                angle: {
                    max: 85,
                    initial: 30,
                    min: 20,
                },
                rotation: {
                    /**
                     * 度数/s
                     */
                    speed: 3,
                    direction: "up" as "up" | "down",
                },
            },
            fly: {
                maxHP: 25,
                /**
                 * px
                 */
                spawn: {
                    left: g.game.width / 4 + 125,
                    top: g.game.height / 4,
                    right: g.game.width * 7 / 8 - 125,
                    bottom: g.game.height * 3 / 4,
                } satisfies g.CommonRect,
                effect: {
                    fadeIn: {
                        /**
                         * ms
                         */
                        interval: 2000,
                    },
                },
                flash: {
                    frame: 8,
                },
                /**
                 * ズレ許容
                 */
                offset: {
                    /**
                     * これを超えたら impluse
                     */
                    required: {
                        /**
                         * px
                         */
                        y: 100,
                        /**
                         * 度
                         */
                        angle: 15,
                    },
                    /**
                     * これを下回ったら impluse 停止
                     */
                    desired: {
                        /**
                         * px
                         */
                        y: 50,
                        /**
                         * 度
                         */
                        angle: 10,
                    },
                },
                /**
                 * 最低維持速度 (px/s)
                 */
                speed: {
                    x: 10,
                },
                engine: {
                    /**
                     * N
                     */
                    x: 0.1,
                    /**
                     * N
                     */
                    y: 0.125,
                    /**
                     * N
                     */
                    rotate: 0.01,
                },
                entity: {
                    // fade in
                    opacity: 0,
                    width: scene.asset.getImageById("ufo").width,
                    height: scene.asset.getImageById("ufo").height,
                } satisfies Omit<g.SpriteParameterObject, "scene" | "src">,
                statusBar: {
                    frame: {
                        height: 25,
                        padding: 5,
                    },
                    color: {
                        frame: "#bcaaa4",
                        power: "#b71c1c",
                        background: "#3e2723",
                    },
                },
                body: {
                    type: BodyType.Dynamic,
                } satisfies Box2DBodyDef,
                fixture: {
                    friction: 0,
                    restitution: 0,
                    density: 1,
                    filter: {
                        categoryBits: category.enemy,
                        maskBits: category.boundary | category.bullet | category.enemy,
                    },
                } satisfies Box2DFixtureDef,
            },
            explosion: {
                entity: {
                    frames: new Array(15).fill(undefined).map((_, i) => i),
                    width: scene.asset.getImageById("explosion").width / 15,
                    height: scene.asset.getImageById("explosion").height,
                    anchorX: 0.5,
                    anchorY: 0.5,
                    interval: 2000 / g.game.fps,
                    loop: false,
                } satisfies Omit<g.FrameSpriteParameterObject, "scene" | "src">,
            },
        };
    }

    static get game() {
        return Constants._._.game;
    }

    static get comment() {
        return Constants._._.comment;
    }

    static get world() {
        return Constants._._.world;
    }

    static get boundary() {
        return Constants._._.boundary;
    }

    static get bullet() {
        return Constants._._.bullet;
    }

    static get character() {
        return Constants._._.character;
    }

    static get cannon() {
        return Constants._._.cannon;
    }

    static get fly() {
        return Constants._._.fly;
    }

    static get explosion() {
        return Constants._._.explosion;
    }
}
