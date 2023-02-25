import {arrayToMatrix} from "@/core/util/util";
import {GameMap} from "@/core/model/map";

class LDTK {
    json: any

    constructor(json: any) {
        this.json = json
    }
}

export class LdtkRoot extends LDTK {
    public level(i: number): LdtkLevel {
        return new LdtkLevel(this.json['levels'][i])
    }
}

export class LdtkLevel extends LDTK {
    public layer(name: string): LdtkLayerInstance {
        const matchesKey = (l: any) => l['__identifier'].toLowerCase() == name
        const branch = this.json['layerInstances'].find(matchesKey)
        return new LdtkLayerInstance(branch)
    }

    public toGameMap(mapId: string): GameMap {
        return {
            id: mapId,
            tileWidth: 32, // TODO
            tileHeight: 32, // TODO
            width: 24, // TODO
            height: 16, // TODO
            walkable: this.layer('collision').intGridCsv.map((row) => {
                return row.map((tile) => tile == 1)
            })
        }
    }
}

export class LdtkLayerInstance extends LDTK {
    public get tilesetName(): string {
        return this.json['__tilesetRelPath']
    }

    public get width(): number {
        return this.json['__cWid']
    }

    public get height(): number {
        return this.json['__cHei']
    }

    public get gridSize(): number {
        return this.json['__gridSize']
    }

    public get tileData(): number[][] {
        const w = this.width
        const h = this.height
        const g = this.gridSize
        const result: number[][] = []
        for (let col = 0; col < h; col++) {
            result[col] = Array(w).fill(0)
        }
        for (const tile of this.json['gridTiles']) {
            const row = tile.px[0] / g
            const col = tile.px[1] / g
            result[col][row] = tile.t
        }
        return result
    }

    public get intGridCsv(): number[][] {
        return arrayToMatrix(this.json['intGridCsv'], this.width)
    }
}
