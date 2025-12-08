export const safePlay = (scene: g.Scene, asset: string): void => {
    const context = g.game.audio.create(scene.asset.getAudioById(asset));
    context.play();
    scene.setTimeout(() => {
        context.stop();
    }, context.asset.duration);
};
