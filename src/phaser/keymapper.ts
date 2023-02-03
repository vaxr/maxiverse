import {KeyBinding} from "@/core/model/input";
import Key = Phaser.Input.Keyboard.Key;


type PhaserKeyCode = number | string | Key

export class KeyMapper {
    scene: Phaser.Scene
    keyBindings: Map<number, KeyBinding> = new Map([])
    keys: Map<number, Key> = new Map([])
    keysDown: Set<KeyBinding> = new Set()


    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    public bindDefaults() {
        this.bind(Phaser.Input.Keyboard.KeyCodes.SHIFT, KeyBinding.RUN)
        this.bind(Phaser.Input.Keyboard.KeyCodes.W, KeyBinding.UP)
        this.bind(Phaser.Input.Keyboard.KeyCodes.A, KeyBinding.LEFT)
        this.bind(Phaser.Input.Keyboard.KeyCodes.S, KeyBinding.DOWN)
        this.bind(Phaser.Input.Keyboard.KeyCodes.D, KeyBinding.RIGHT)
        this.bind(Phaser.Input.Keyboard.KeyCodes.UP, KeyBinding.UP)
        this.bind(Phaser.Input.Keyboard.KeyCodes.LEFT, KeyBinding.LEFT)
        this.bind(Phaser.Input.Keyboard.KeyCodes.DOWN, KeyBinding.DOWN)
        this.bind(Phaser.Input.Keyboard.KeyCodes.RIGHT, KeyBinding.RIGHT)
    }

    public bind(code: PhaserKeyCode, binding: KeyBinding) {
        const key = this.scene.input.keyboard.addKey(code, false)
        this.keyBindings.set(key.keyCode, binding)
        this.keys.set(key.keyCode, key)
    }

    public update() {
        this.keysDown.clear()
        for (let key of Array.from(this.keys.values())) {
            if (this.keyBindings.has(key.keyCode) && key.isDown) {
                this.keysDown.add(this.keyBindings.get(key.keyCode)!)
            }
        }
    }

    public isDown(binding: KeyBinding) {
        return this.keysDown.has(binding)
    }
}
