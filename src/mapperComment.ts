import { CommentEmbeddingMapper } from "./mapperCommentEmbedding";
import { CommentFilteringMapper } from "./mapperCommentFiltering";
import { EmbeddedCommentMapper, isCommandParsedComment, isPlainTextParsedComment } from "./mapperCommentEmbedded";
import GraphemeSplitter = require("grapheme-splitter");
import { CommentEvent, FireEvent, KuritaFireEvent, PlainFireEvent } from "./parameterEvent";

export interface CommentMapperarameterObject {
    filter: CommentFilteringMapper;
    embedding: CommentEmbeddingMapper;
    parser: EmbeddedCommentMapper;
    grapheme: GraphemeSplitter;
}

export class CommentMapper {
    readonly _filter: CommentFilteringMapper;
    readonly _embedding: CommentEmbeddingMapper;
    readonly _parser: EmbeddedCommentMapper;
    readonly _grapheme: GraphemeSplitter;

    constructor(param: CommentMapperarameterObject) {
        this._embedding = param.embedding;
        this._parser = param.parser;
        this._filter = param.filter;
        this._grapheme = param.grapheme;
    }

    /**
     * @returns 無視対象のコメントの場合、undefined
     */
    map(ev: CommentEvent): FireEvent[] | undefined {
        if (this._filter.ignores(ev)) {
            return undefined;
        }
        this._filter.updateLastComment(ev);
        const { comment, shorten } = this._filter.shorten(ev.comment);
        const evlist: FireEvent[] = this._parser.map(this._embedding.map(comment))
            .reduce((list, e) => {
                if (isPlainTextParsedComment(e)) {
                    list.push(...this._filter.map(e.data).map(c => ({
                        type: "plain",
                        data: {
                            character: c,
                            commentID: ev.senderID,
                            isSelfComment: ev.isSelfComment,
                        },
                    } satisfies PlainFireEvent)));
                }
                else if (isCommandParsedComment(e)) {
                    switch (e.data) {
                        case "kurita":
                            list.push({
                                type: "kurita",
                                data: {},
                            } satisfies KuritaFireEvent);
                            break;
                        default:
                            throw new Error(`unresolved command. (command = ${e.data})`);
                    }
                }
                else {
                    throw new Error(`unresolved parsed comment. (type = ${e.type}, data = ${e.data})`);
                }
                return list;
            }, [] as FireEvent[]);
        if (shorten) {
            evlist.push({
                type: "plain",
                data: {
                    character: "(ry",
                    commentID: ev.senderID,
                    isSelfComment: ev.isSelfComment,
                },
            } satisfies PlainFireEvent);
        }
        // 左側から順番に投射するので、逆順に装填することで見た目の並びを一致させる
        return evlist.reverse();
    }
}
