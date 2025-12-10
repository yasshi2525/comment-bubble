export interface CommentEvent {
    comment: string;
    /**
     * 匿名時のみ
     */
    senderHash?: string;
    /**
     * 投稿者コメ、名札コメ
     */
    senderID?: string;
    isSelfComment: boolean;
}

export const commandTypes = [
    "kurita",
] as const;
export type CommandType = typeof commandTypes[number];

export const fireEventTypes = [
    "plain",
    ...commandTypes,
] as const;
export type FireEventType = typeof fireEventTypes[number];

export interface FireEvent {
    type: FireEventType;
    data?: any;
}

export interface PlainFireEvent extends FireEvent {
    type: "plain";
    data: {
        character: string;
        commentID?: string;
        isSelfComment: boolean;
    };
}

export const isPlainFireEvent = (obj: FireEvent): obj is PlainFireEvent => obj.type === "plain";

export interface KuritaFireEvent extends FireEvent {
    type: "kurita";
    data: {};
}

export const isKuritaFireEvent = (obj: FireEvent): obj is KuritaFireEvent => obj.type === "kurita";
