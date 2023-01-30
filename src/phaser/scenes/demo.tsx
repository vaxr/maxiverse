import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";

export default class DemoScene extends Scene {
    constructor() {
        super('demo');
    }

    private static SpriteSheets = [
        'assets/stock/modern-tiles/char.png',
        'assets/stock/modern-tiles/interior.png',
        'assets/stock/modern-tiles/rooms.png',
    ]

    preload() {
        for (const path of DemoScene.SpriteSheets) {
            this.load.image(path, path);
        }
        this.load.json('ldtk', 'demo.ldtk');
    }

    create() {
        const ldtk = new LdtkRoot(this.cache.json.get('ldtk'))
        const map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: 24,
            height: 16,
        })
        this.addLdtkLayer(map, ldtk, 'bg0')
        this.addLdtkLayer(map, ldtk, 'bg1')
        this.addLdtkLayer(map, ldtk, 'bg2')
    }

    private addLdtkLayer(map: Phaser.Tilemaps.Tilemap, ldtk: LdtkRoot, name: string) {
        const layerData = ldtk.level(0).layer(name)
        const tileSet = map.addTilesetImage(layerData.tilesetName)
        const mapLayer = map.createBlankLayer(name, tileSet)
        mapLayer.putTilesAt(layerData.tileData, 0, 0)
    }
}
