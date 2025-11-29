import { BodyType, Box2DBodyDef, Box2DFixtureDef } from "@akashic-extension/akashic-box2d";

const category = {
    boundary: 1,
    bullet: 1 << 1,
    enemy: 1 << 2,
};

export const style = (scene: g.Scene) => ({
    game: {
        snapshot: {
            /**
             * ms
             */
            interval: 5000,
        },
    },
    world: {
        scale: 100,
        gravity: 2,
    },
    boundary: {
        size: 10,
        fixture: {
            friction: 0.3,
            restitution: 0.3,
            density: 1,
            filter: {
                categoryBits: category.boundary,
                maskBits: category.enemy,
            },
        } satisfies Box2DFixtureDef,
    },
    bullet: {
        radius: scene.asset.getImageById("bullet-other").width / 2,
        body: {
            type: BodyType.Dynamic,
            bullet: true,
        } satisfies Box2DBodyDef,
        fixture: {
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
            x: 150,
            y: g.game.height - 150,
            width: 150,
            height: 150,
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
    enemy: {
        fixture: {
            friction: 0.3,
            restitution: 0.3,
            density: 1,
            filter: {
                categoryBits: category.enemy,
                maskBits: category.boundary | category.bullet | category.enemy,
            },
        } satisfies Box2DFixtureDef,
    },
});
