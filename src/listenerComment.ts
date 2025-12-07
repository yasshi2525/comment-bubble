import type { NamagameCommentEventComment } from "@akashic/akashic-cli-serve/lib/module/common/types/NamagameCommentPlugin";
import GraphemeSplitter = require("grapheme-splitter");
import { BulletQueue } from "./queueBullet";
import { BroadcasterResolver } from "./resolverBroadcaster";

export interface CommentListenerParameterObject {
    scene: g.Scene;
    bulletQueue: BulletQueue;
    broadcasterResolver: BroadcasterResolver;
    preventAutoStart?: boolean;
}

export class CommentListener {
    readonly _scene: g.Scene;
    readonly _bulletQueue: BulletQueue;
    readonly _broadcasterResolver: BroadcasterResolver;
    readonly _splitter: GraphemeSplitter;
    _isStarted: boolean;

    constructor(param: CommentListenerParameterObject) {
        this._scene = param.scene;
        this._bulletQueue = param.bulletQueue;
        this._broadcasterResolver = param.broadcasterResolver;
        this._splitter = new GraphemeSplitter();
        this._isStarted = false;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("comment listener was already started.");
        }
        this._scene.onMessage.add(this._handleMessage.bind(this));
        this._isStarted = true;
    }

    _handleMessage(ev: g.MessageEvent): boolean | void {
        if (ev.player?.id === ":akashic" && ev.data?.type === "namagame:comment") {
            this._handleComments(ev.data.comments);
        }
    }

    _handleComments(evList: NamagameCommentEventComment[]): void {
        for (const ev of evList) {
            this._handleComment(ev);
        }
    }

    _handleComment(ev: NamagameCommentEventComment): void {
        if (this._ignoresComment(ev.comment)) {
            return;
        }
        // 左側から順番に投射するので、逆順に装填することで見た目の並びを一致させる
        for (const character of this._splitter.splitGraphemes(ev.comment).reverse()) {
            if (this._ignoresCharacter(character)) {
                continue;
            }
            this._bulletQueue.append({
                character,
                commentID: this._resolveCommentID(ev),
                isSelfComment: this._isSelfComment(ev),
            });
        }
        // コメントが続くと切れ目がわからないのでスキマをあける
        this._bulletQueue.append(null);
    }

    /**
     * AA など実コメントと思われないものを除外する。改行のあるものを除外
     */
    _ignoresComment(comment: string): boolean {
        return comment.indexOf("\n") !== -1;
    }

    /**
     * 空白文字が入っていると読みづらいので除外
     */
    _ignoresCharacter(character: string): boolean {
        return character.trim().length === 0;
    }

    _resolveCommentID(ev: NamagameCommentEventComment): string | undefined {
        if (ev.isAnonymous) {
            return undefined;
        }
        if (ev.userID === undefined) {
            return this._broadcasterResolver.getResolvedBroadcasterID();
        }
        return ev.userID;
    }

    _isSelfComment(ev: NamagameCommentEventComment): boolean {
        if (ev.isAnonymous) {
            return false;
        }
        // どうも放送者コメントでも userID が入っているような気がするので、先にID比較
        if (ev.userID === g.game.selfId) {
            return true;
        }
        if (ev.userID === undefined) {
            return this._broadcasterResolver.isBroadcaster();
        }
        return false;
    }
}
