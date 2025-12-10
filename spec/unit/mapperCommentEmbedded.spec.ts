import { simpleConstants } from "./mockStyle";

jest.mock("../../src/style", () => ({
    Constants: simpleConstants,
}));

import GraphemeSplitter = require("grapheme-splitter");
import { EmbeddedCommentMapper } from "../../src/mapperCommentEmbedded";

describe("CommentFilteringMapper", () => {
    let parser: EmbeddedCommentMapper;

    beforeEach(() => {
        parser = new EmbeddedCommentMapper({
            grapheme: new GraphemeSplitter(),
        });
    });

    it.each(["\\", "\\\\\\"])("エスケープ文字で終了は不正", (comment) => {
        expect(() => parser.map(comment)).toThrow();
    });

    it.each([
        ["\\\\", "\\"],
        ["\\\\\\\\", "\\\\"],
    ])("エスケープされたエスケープ文字は復元される", (comment, expected) => {
        expect(parser.map(comment)).toEqual([{
            type: "text",
            data: expected,
        }]);
    });

    it.each([
        ["", []],
        ["\\a", [["command", "kurita"]]],
        ["\\ahoge", [["command", "kurita"], ["text", "hoge"]]],
        ["hoge\\ahoge", [["text", "hoge"], ["command", "kurita"], ["text", "hoge"]]],
        ["hoge\\ahoge\\ahoge", [["text", "hoge"], ["command", "kurita"], ["text", "hoge"], ["command", "kurita"], ["text", "hoge"]]],
        ["\\aa", [["command", "kurita"], ["text", "a"]]],
    ] as [string, ["command" | "text", string][]][]
    )("コマンドとテキストを分離する", (comment, expected) => {
        expect(parser.map(comment)).toEqual(expected.map(([type, data]) => ({ type, data })));
    });

    it("未登録のコマンドだとエラー", () => {
        expect(() => parser.map("\\x")).toThrow();
    });
});
