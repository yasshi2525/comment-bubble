import { ObjectDef, ObjectSerializer } from "@yasshi2525/akashic-box2d-serializer";
import { CommentFilteringMapper } from "./mapperCommentFiltering";
import GraphemeSplitter = require("grapheme-splitter");

export const commentFilteringMapperType = CommentFilteringMapper.name;

export interface CommentFilteringMapperParam {
    /**
     * [hash, comment][]
     */
    anonymous: [string, string][];
    /**
     * [id, comment][]
     */
    id: [string, string][];
}

export interface CommentFilteringMapperSerializerParameterObject {
    grapheme: GraphemeSplitter;
}

export class CommentFilteringMapperSerializer implements ObjectSerializer<CommentFilteringMapper, CommentFilteringMapperParam> {
    readonly _grapheme: GraphemeSplitter;

    constructor(param: CommentFilteringMapperSerializerParameterObject) {
        this._grapheme = param.grapheme;
    }

    filter(objectType: string): boolean {
        return objectType === commentFilteringMapperType;
    }

    serialize(object: CommentFilteringMapper): ObjectDef<CommentFilteringMapperParam> {
        return {
            type: commentFilteringMapperType,
            param: {
                // 参照をエンジン側で持たれるっぽいのでディープコピー
                anonymous: [...object._lastAnonymousComment.entries()],
                id: [...object._lastIDComment.entries()],
            },
        };
    }

    deserialize(json: ObjectDef<CommentFilteringMapperParam>): CommentFilteringMapper {
        const filter = new CommentFilteringMapper({
            grapheme: this._grapheme,
            initialLastAnonymousComment: json.param.anonymous,
            initialLastIDComment: json.param.id,
        });
        return filter;
    }
}
