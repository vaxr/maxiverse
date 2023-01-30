export function arrayToMatrix<T>(arr: T[], width: number): T[][] {
    const matrix: T[][] = []
    const height = Math.ceil(arr.length / width)
    for (let i = 0; i < height; i++) {
        matrix[i] = arr.slice(i * width, i * width + width)
    }
    return matrix
}
