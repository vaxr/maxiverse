export function arrayToMatrix<T>(arr: T[], width: number): T[][] {
    const matrix: T[][] = []
    const height = Math.ceil(arr.length / width)
    for (let i = 0; i < height; i++) {
        matrix[i] = arr.slice(i * width, i * width + width)
    }
    return matrix
}

export function compareSets<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set(
        Array.from(a).filter(element => !b.has(element))
    );
}

export function setsAreEqual<T>(a?: Set<T>, b?: Set<T>): boolean {
    if (!a) a = new Set([])
    if (!b) b = new Set([])
    if (a.size != b.size) return false
    return compareSets(a, b).size === 0
}
