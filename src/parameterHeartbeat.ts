export interface UserMessageData {
    type: string;
    data: {};
}

const isUserMessageData = (obj: unknown): obj is UserMessageData =>
    !!obj && typeof obj === "object"
    && "type" in obj && typeof obj.type === "string" && !!obj.type
    && "data" in obj && typeof obj.data === "object" && !!obj.data;

export const heartbeatMessageType = "heartbeat" as const;

export interface HeartbeatMessageData extends UserMessageData {
    type: typeof heartbeatMessageType;
    data: {
        senderID: string;
        /**
         * クライアントにおける時刻。これによりF5・おっかけ再生時のハートビートをサーバー側で除外できるようにする
         */
        tick: number;
        /**
         * クライアント画面におけるアクティブ人数。これにより当該ユーザーにアクティブユーザー更新イベントを通知すべきか判断できるようにする
         */
        active: number;
    };
};

export const isHeartbeatMessageData = (obj: unknown): obj is HeartbeatMessageData =>
    isUserMessageData(obj) && obj.type === heartbeatMessageType && "senderID" in obj.data && typeof obj.data.senderID === "string" && !!obj.data.senderID;

export const activeUserNumMessageType = "activeUserNum" as const;

export interface ActiveUserNumMessageData extends UserMessageData {
    type: typeof activeUserNumMessageType;
    data: {
        active: number;
    };
}

export interface HeartbeatEvent {
    senderID: string;
    /**
     * 送信者の環境における時刻
     */
    tick: number;
    /**
     * 送信者が認識しているアクティブ人数
     */
    active: number;
}

export const isActiveUserNumMessageData = (obj: unknown): obj is ActiveUserNumMessageData =>
    isUserMessageData(obj) && obj.type === activeUserNumMessageType && "active" in obj.data && typeof obj.data.active === "number" && !!obj.data.active;
