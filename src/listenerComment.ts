import type { NamagameCommentEventComment } from "@akashic/akashic-cli-serve/lib/module/common/types/NamagameCommentPlugin";
import { BulletQueue } from "./queueBullet";
import { BroadcasterResolver } from "./resolverBroadcaster";
import { CommentMapper } from "./mapperComment";

export interface CommentListenerParameterObject {
    scene: g.Scene;
    mapper: CommentMapper;
    bulletQueue: BulletQueue;
    broadcasterResolver: BroadcasterResolver;
    preventAutoStart?: boolean;
}

export class CommentListener {
    readonly _scene: g.Scene;
    readonly _mapper: CommentMapper;
    readonly _bulletQueue: BulletQueue;
    readonly _broadcasterResolver: BroadcasterResolver;
    _isStarted: boolean;

    constructor(param: CommentListenerParameterObject) {
        this._scene = param.scene;
        this._bulletQueue = param.bulletQueue;
        this._mapper = param.mapper;
        this._broadcasterResolver = param.broadcasterResolver;
        this._isStarted = false;
        if (!param.preventAutoStart) {
            this.start();
        }
    }

    start(): void {
        if (this._isStarted) {
            throw new Error("comment listener was already started.");
        }
        this._scene.onMessage.add(this._handleMessage, this);
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
        const evlist = this._mapper.map({
            comment: ev.comment,
            senderID: this._resolveSenderID(ev),
            senderHash: this._resolveSenderHash(ev),
            isSelfComment: this._isSelfComment(ev),
        });
        if (!evlist) {
            return;
        }
        for (const fireEv of evlist) {
            this._bulletQueue.append(fireEv);
        }
        // コメントが続くと切れ目がわからないのでスキマをあける
        this._bulletQueue.append(null);
    }

    _resolveSenderID(ev: NamagameCommentEventComment): string | undefined {
        if (ev.isAnonymous) {
            return undefined;
        }
        if (ev.userID === undefined) {
            return this._broadcasterResolver.getResolvedBroadcasterID();
        }
        return ev.userID;
    }

    _resolveSenderHash(ev: NamagameCommentEventComment): string | undefined {
        if (ev.isAnonymous) {
            return ev.userID;
        }
        return undefined;
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
