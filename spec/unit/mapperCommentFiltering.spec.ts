import { simpleConstants } from "./mockStyle";

jest.mock("../../src/style", () => ({
    Constants: simpleConstants,
}));

import GraphemeSplitter = require("grapheme-splitter");
import { CommentFilteringMapper } from "../../src/mapperCommentFiltering";
import { Constants } from "../../src/style";

describe("CommentFilteringMapper", () => {
    let filter: CommentFilteringMapper;
    let grapheme: GraphemeSplitter;

    beforeEach(() => {
        grapheme = new GraphemeSplitter();
        filter = new CommentFilteringMapper({
            grapheme,
        });
    });

    it("直列化したデータを復元できる", () => {
        const recovery = new CommentFilteringMapper({
            grapheme,
            initialLastAnonymousComment: [["myHash", "myAnonymousComment"]],
            initialLastIDComment: [["myID", "myIDComment"]],
        });
        expect(recovery._lastAnonymousComment.get("myHash")).toBe("myAnonymousComment");
        expect(recovery._lastIDComment.get("myID")).toBe("myIDComment");
    });

    it.each(["\n", "\na", "a\na", "\na"])("改行を含むコメントは無視", (comment) => {
        expect(filter.ignores({
            comment,
            isSelfComment: false,
        })).toBe(true);
    });

    it("連続したコメントは無視", () => {
        filter.updateLastComment({
            comment: "same",
            isSelfComment: false,
            senderHash: "myHash",
        });
        expect(filter.ignores({
            comment: "same",
            isSelfComment: false,
            senderHash: "myHash",
        })).toBe(true);
        filter.updateLastComment({
            comment: "same",
            isSelfComment: false,
            senderID: "myID",
        });
        expect(filter.ignores({
            comment: "same",
            isSelfComment: false,
            senderID: "myID",
        })).toBe(true);
    });

    it.each([
        [0, false],
        [1, false],
        [Constants.comment.accept.max.length - 1, false],
        [Constants.comment.accept.max.length, false],
        [Constants.comment.accept.max.length + 1, true],
    ])("長いコメントは省略", (length, shorten) => {
        const comment = new Array(length).fill("a").join("");
        const actual = filter.shorten(comment);
        expect(actual.shorten).toBe(shorten);
        if (shorten) {
            expect(actual.comment).toHaveLength(Constants.comment.accept.max.length);
            expect(actual.comment).not.toBe(comment);
        }
        else {
            expect(actual.comment).toBe(comment);
        }
    });

    it.each([
        ["", []],
        [" a", ["a"]],
        ["  a", ["a"]],
        ["a ", ["a"]],
        ["a  ", ["a"]],
        ["  a  ", ["a"]],
        [" a b ", ["a", "b"]],
        [" a b  c  ", ["a", "b", "c"]],
    ])("空白文字は除外", (comment, expected) => {
        expect(filter.map(comment)).toEqual(expected);
    });

    it.each([
        ["aa", ["a", "a"]],
        ["aaa", ["a", "a", "a"]],
        ["aaaa", ["a", "a", "a"]],
        ["aaaaa", ["a", "a", "a"]],
        ["aa aa", ["a", "a", "a"]],
    ])("同一文字の過剰な繰り返しは省略", (comment, expected) => {
        expect(filter.map(comment)).toEqual(expected);
    });
});
