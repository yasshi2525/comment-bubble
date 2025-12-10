const process = require("node:process");
const path = require("node:path");

const { GameContext } = require("@akashic/headless-akashic");

/** @type {import("@akashic/headless-akashic").GameContext} */
let context;

const setup = async () => {
    const ctx = new GameContext({});
    const client = await ctx.getGameClient();
    client.g.game = client.game;
    await ctx.step();
    const scene = new client.g.Scene({ game: client.game, name: "__test__" });
    client.game.pushScene(scene);
    await client.advanceUntil(() => client.game.scene() === scene);
    const step = async () => ctx.step();
    return { ctx, client, g: client.g, scene, step };
};

beforeEach(async () => {
    const { ctx, client, g, scene, step } = await setup();
    context = ctx;
    global.g = g;
    global.scene = scene;
    global.client = client;
    global.step = async () => {
        await step();
    };
});

afterEach(async () => {
    if (context) {
        await context.destroy();
    }
});
