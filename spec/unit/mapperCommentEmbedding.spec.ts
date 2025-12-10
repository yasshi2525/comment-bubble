import { simpleConstants } from "./mockStyle";

jest.mock("../../src/style", () => ({
    Constants: simpleConstants,
}));

import { CommentEmbeddingMapper } from "../../src/mapperCommentEmbedding";

describe("CommentEmbeddingMapper", () => {
    let embed: CommentEmbeddingMapper;

    beforeEach(() => {
        embed = new CommentEmbeddingMapper();
    });

    it.each([
        ["", ""],
        ["\\", "\\\\"],
        ["\\\\", "\\\\\\\\"],
    ])("エスケープ文字はエスケープされる", (comment, expected) => {
        expect(embed.map(comment)).toBe(expected);
    });

    it.each([
        ["栗田", "\\a"],
        ["栗田栗田", "\\a\\a"],
        ["栗田穣崇はくりたしげたか", "\\aは\\a"],
        ["\\栗田", "\\\\\\a"],
        ["栗田\\", "\\a\\\\"],
        ["\\栗田\\", "\\\\\\a\\\\"],
        ["\\\\栗田\\\\", "\\\\\\\\\\a\\\\\\\\"],
    ])("特定の文字をコマンド記号に置き換える", (comment, expected) => {
        expect(embed.map(comment)).toBe(expected);
    });
});
