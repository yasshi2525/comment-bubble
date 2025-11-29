import fs from "node:fs";

/** @type {import("@akashic/game-configuration").GameConfiguration} */
const gameJSON = JSON.parse(fs.readFileSync("game.json", { encoding: "utf-8" }));
const fps = gameJSON.fps ?? 30;

/** @type {import("@akashic/sandbox-configuration").SandboxConfiguration["showMenu"]} */
export const showMenu = true;

/** @type {import("@akashic/sandbox-configuration").SandboxConfiguration["displayOptions"]} */
export const displayOptions = {
    // backgroundColor: "black"
};

/** @type {import("./lib/NamagameCommentConfig").NamagameCommentConfigComment[]} */
const comments = new Array(100).fill(undefined).map(() => ({}));
for (const [index, comment] of comments.entries()) {
    comment.comment = `コメント${index}`;
    if (Math.random() < 0.75) {
        comment.isAnonymous = true;
    }
    comment.frame = index * fps;
}

/** @type {import("./lib/NamagameCommentConfig").SandboxConfigExternalDefinition["external"]} */
export const external = {
    namagameComment: {
        templates: {
            debug: {
                comments,
                startBy: "pluginStart",
            },
        },
    },
};
