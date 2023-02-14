export enum KeyBinding {
    UNDEFINED,
    UP,
    DOWN,
    LEFT,
    RIGHT,
    RUN,
    ACTION,
    ESCAPE,
}

export type KeyBindings = Set<KeyBinding>

export const MoveKeyBindings = [KeyBinding.DOWN, KeyBinding.UP, KeyBinding.LEFT, KeyBinding.RIGHT, KeyBinding.RUN]
