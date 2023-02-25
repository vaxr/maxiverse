import {setsAreEqual} from "@/core/util/util";
describe('core/util', () => {
    describe('setsAreEqual', () => {
        for (const tc of [
            {a: undefined, b: undefined, expected: true},
            {a: new Set([1, 2]), b: undefined, expected: false},
            {a: undefined, b: new Set([1, 2]), expected: false},
            {a: new Set([]), b: new Set([]), expected: true},
            {a: new Set([]), b: undefined, expected: true},
            {a: new Set([]), b: new Set([1]), expected: false},
            {a: new Set([1]), b: new Set([1]), expected: true},
            {a: new Set([1, 2]), b: new Set([2, 1]), expected: true},
            {a: new Set([1, 2]), b: new Set([2]), expected: false},
            {a: new Set([1, 2]), b: new Set([2, 3]), expected: false},
        ]) {
            test(`${tc.a}, ${tc.b} => ${tc.expected}`, () => {
                expect(setsAreEqual(tc.a, tc.b)).toBe(tc.expected)
            })
        }
    })
})
