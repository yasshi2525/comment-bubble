export class BroadcasterResolver {
    readonly onResolve: g.Trigger<string> = new g.Trigger();
    _broadcasterID?: string;

    constructor() {
        g.game.onJoin.addOnce(({ player: { id } }) => {
            if (id === undefined) {
                throw new Error(`invalid joined player id was not defined.`);
            }
            this._broadcasterID = id;
            this.onResolve.fire(id);
        });
    }

    restoreBroadcasterID(id?: string): void {
        this._broadcasterID = id;
    }

    getResolvedBroadcasterID(): string | undefined {
        return this._broadcasterID;
    }

    isBroadcaster(requiresResolving: boolean = false): boolean {
        if (requiresResolving && this._broadcasterID === undefined) {
            throw new Error("broadcaster was not resolved");
        }
        return this._broadcasterID === g.game.selfId;
    }
}
