import { GameClient } from "@akashic/headless-akashic";

export {};

declare global {
    const scene: g.Scene;
    const client: GameClient<3>;
    const step: () => Promise<void>;
}
