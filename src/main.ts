import { BroadcasterResolver } from "./resolverBroadcaster";
import { MainScene } from "./sceneMain";

export = (args: g.GameMainParameterObject) => {
    // TODO: g.Math は まだ akashic-cli, ニコ生本番環境に非対応
    g.game.external.namagameComment?.start();
    g.game.pushScene(new MainScene({
        game: g.game,
        snapshot: args.snapshot,
        broadcasterResolver: new BroadcasterResolver(),
    }));
};
