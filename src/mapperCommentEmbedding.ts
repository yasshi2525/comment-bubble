import { CommandType } from "./parameterEvent";
import { Constants } from "./style";

export class CommentEmbeddingMapper {
    readonly _escapeRegExp: RegExp;
    readonly _escapedEscapeCharacter: string;
    readonly _matcher: Record<CommandType, RegExp[]>;
    readonly _mapper: Record<CommandType, string>;

    constructor() {
        const { escape, matcher, mapper } = Constants.comment.special;
        // escape = "\" のときだけ。正規表現中で "\" はエスケープしないとけいないため。
        this._escapeRegExp = new RegExp(escape + escape, "g");
        this._escapedEscapeCharacter = escape + escape;
        this._matcher = (Object.keys(matcher) as CommandType[]).reduce((obj, key) => {
            obj[key] = matcher[key].map(str => new RegExp(str, "g"));
            return obj;
        }, {} as Record<CommandType, RegExp[]>);
        this._mapper = (Object.keys(mapper) as (keyof typeof mapper)[]).reduce((obj, char) => {
            obj[mapper[char]] = escape + char;
            return obj;
        }, {} as Record<CommandType, string>);
    }

    map(comment: string): string {
        return this._embed(this._escape(comment));
    }

    _escape(comment: string): string {
        return comment.replace(this._escapeRegExp, this._escapedEscapeCharacter);
    }

    _embed(comment: string): string {
        return (Object.keys(this._matcher) as CommandType[]).reduce((prev, cmd) =>
            this._embedCmd(prev, cmd), comment);
    }

    _embedCmd(comment: string, cmd: CommandType): string {
        return this._matcher[cmd].reduce((prev, replacer) =>
            this._embedCmdEach(prev, replacer, this._mapper[cmd]), comment);
    }

    _embedCmdEach(comment: string, replacer: RegExp, replaced: string): string {
        return comment.replace(replacer, replaced);
    }
}
