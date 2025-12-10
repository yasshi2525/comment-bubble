import type { CommandType } from "../../src/parameterEvent";
import type { Constants } from "../../src/style";

export const simpleConstants = {
    comment: {
        accept: {
            max: {
                sameCharacters: 3,
                length: 15,
            },
        },
        reject: {
            whitespace: true,
            multiline: true,
            sameComment: true,
        },
        special: {
            escape: "\\",
            mapper: {
                // key は本当は数字にしたいが、TypesSriptが number と解釈するため英字1文字で
                a: "kurita",
            } as const satisfies Record<string, CommandType>,
            matcher: {
                kurita: ["栗田穣崇", "栗田しげたか", "栗田", "くりたしげたか"],
            } satisfies Record<CommandType, string[]>,
        },
    } satisfies typeof Constants.comment,
};
