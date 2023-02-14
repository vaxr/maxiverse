import {GameMap, getXYDir, XY} from "@/core/model/map";
import {Player, playerMoveKeysToXYSpeed} from "@/core/model/player";
import {KeyBindings} from "@/core/model/input";

export default class GameClient {
    player?: Player
    players: Map<string, Player> = new Map([])
    map?: GameMap


    constructor() {
    }

    public updatePlayerMoveKeys(keys: KeyBindings) {
        const player = this.player!
        // TODO send keys to server
        player.speed = playerMoveKeysToXYSpeed(keys)
        player.facing = getXYDir(player.speed) || player.facing
    }

    public movePlayers(deltaMs: number) {
        for (const player of Array.from(this.players.values())) {
            this.movePlayer(player, deltaMs)
        }
    }

    private movePlayer(player: Player, deltaMs: number) {
        const th = this.map!.tileHeight
        const tw = this.map!.tileWidth
        const targetPx = {
            x: player.mapPosition.x + player.speed.x * deltaMs,
            y: player.mapPosition.y + player.speed.y * deltaMs,
        }
        const targetTile = {
            x: Math.floor(targetPx.x / tw),
            y: Math.floor(targetPx.y / th),
        }
        // TODO handle multiple tiles
        if (this.map!.walkable![targetTile.y][targetTile.x]) {
            player.mapPosition.x = targetPx.x
            player.mapPosition.y = targetPx.y
            if (!this.map!.walkable![targetTile.y][targetTile.x - 1]) {
                player.mapPosition.x = Math.max(player.mapPosition.x, targetTile.x * tw + 0.5 * tw)
            }
            if (!this.map!.walkable![targetTile.y][targetTile.x + 1]) {
                player.mapPosition.x = Math.min(player.mapPosition.x, targetTile.x * tw + 0.5 * tw)
            }
            if (!this.map!.walkable![targetTile.y - 1][targetTile.x]) {
                player.mapPosition.y = Math.max(player.mapPosition.y, targetTile.y * th + 0.25 * th)
            }
            if (!this.map!.walkable![targetTile.y + 1][targetTile.x]) {
                player.mapPosition.y = Math.min(player.mapPosition.y, targetTile.y * th + 0.75 * th)
            }
        } else {
            // TODO walk closest possible
        }
    }
}
