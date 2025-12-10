import GraphemeSplitter = require("grapheme-splitter");
import { Constants } from "./style";
import { CommentEvent } from "./parameterEvent";

export interface CommentFilteringMapperParameterObject {
    grapheme: GraphemeSplitter;
    /**
     * [hash, comment][]
     */
    initialLastAnonymousComment?: [string, string][];
    /**
     * [id, comment][]
     */
    initialLastIDComment?: [string, string][];
}

export class CommentFilteringMapper {
    readonly _grapheme: GraphemeSplitter;
    readonly _lastAnonymousComment: Map<string, string>;
    readonly _lastIDComment: Map<string, string>;

    constructor(param: CommentFilteringMapperParameterObject) {
        this._grapheme = param.grapheme;
        this._lastAnonymousComment = new Map(param.initialLastAnonymousComment);
        this._lastIDComment = new Map(param.initialLastIDComment);
    }

    /**
     * AA など実コメントと思われないものを除外する。改行のあるものを除外
     * 連投も除外
     */
    ignores(ev: CommentEvent): boolean {
        if (Constants.comment.reject.multiline && ev.comment.indexOf("\n") !== -1) {
            return true;
        }
        if (Constants.comment.reject.sameComment) {
            if (ev.senderHash && ev.comment === this._lastAnonymousComment.get(ev.senderHash)) {
                return true;
            }
            if (ev.senderID && ev.comment === this._lastIDComment.get(ev.senderID)) {
                return true;
            }
        }

        return false;
    }

    updateLastComment(ev: CommentEvent) {
        if (ev.senderHash) {
            this._lastAnonymousComment.set(ev.senderHash, ev.comment);
        }
        if (ev.senderID) {
            this._lastIDComment.set(ev.senderID, ev.comment);
        }
    }

    /**
     * 長過ぎるコメントは省略する
     */
    shorten(original: string): { comment: string; shorten: boolean } {
        const comment = original.substring(0, Constants.comment.accept.max.length);
        return { comment, shorten: original.length !== comment.length };
    }

    map(comment: string): string[] {
        const limit = Constants.comment.accept.max.sameCharacters;
        return this._grapheme.splitGraphemes(comment)
            .filter(c => !this._ignoresCharacter(c))
            .reduce((arr, char) => {
                // 連続した文字を拒否する
                if (arr.length < limit || !arr.slice(-limit).every(c => c === char)) {
                    arr.push(char);
                }
                return arr;
            }, [] as string[]);
    }

    /**
     * 空白文字が入っていると読みづらいので除外
     */
    _ignoresCharacter(character: string): boolean {
        return Constants.comment.reject.whitespace && character.trim().length === 0;
    }
}
