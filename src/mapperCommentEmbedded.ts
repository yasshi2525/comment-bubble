import GraphemeSplitter = require("grapheme-splitter");
import { Constants } from "./style";
import { CommandType } from "./parameterEvent";

export interface EmbeddedCommentMapperParameterObject {
    grapheme: GraphemeSplitter;
}

export interface ParsedComment {
    type: "text" | "command";
    data: string;
}

export interface PlainTextParsedComment extends ParsedComment {
    type: "text";
    data: string;
}

export const isPlainTextParsedComment = (obj: ParsedComment): obj is PlainTextParsedComment => obj.type === "text";

export interface CommandParsedComment extends ParsedComment {
    type: "command";
    data: CommandType;
}

export const isCommandParsedComment = (obj: ParsedComment): obj is CommandParsedComment => obj.type === "command";

export class EmbeddedCommentMapper {
    readonly _escapeCharacter: string;
    readonly _grapheme: GraphemeSplitter;
    readonly _mapper: Record<string, CommandType>;

    constructor(param: EmbeddedCommentMapperParameterObject) {
        this._escapeCharacter = Constants.comment.special.escape;
        this._grapheme = param.grapheme;
        this._mapper = Constants.comment.special.mapper;
    }

    map(comment: string): ParsedComment[] {
        const result: ParsedComment[] = [];
        let inEscaping = false;
        const plainTextCache: string[] = [];
        const iterator = this._grapheme.iterateGraphemes(comment);
        let i: IteratorResult<string>;
        while (!(i = iterator.next()).done) {
            if (!inEscaping && i.value === this._escapeCharacter) {
                inEscaping = true;
                continue;
            }
            if (inEscaping) {
                if (i.value === this._escapeCharacter) {
                    plainTextCache.push(i.value);
                    inEscaping = false;
                    continue;
                }
                if (!(i.value in this._mapper)) {
                    throw new Error(`unknown embedded seqence: "${this._escapeCharacter}${i.value}"`);
                }
                if (plainTextCache.length > 0) {
                    result.push({ type: "text", data: plainTextCache.join("") });
                }
                plainTextCache.length = 0;
                result.push({ type: "command", data: this._mapper[i.value] });
                inEscaping = false;
                continue;
            }
            plainTextCache.push(i.value);
        }
        // debug
        if (inEscaping) {
            throw new Error(`embedded comment ended escape character (comment = ${comment})`);
        }
        if (plainTextCache.length > 0) {
            result.push({ type: "text", data: plainTextCache.join("") });
        }
        return result;
    }
}
