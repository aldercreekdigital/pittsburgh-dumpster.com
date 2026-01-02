declare module 'robust-point-in-polygon' {
  /**
   * Test if a point is inside a polygon
   * @param polygon - Array of [x, y] coordinates forming the polygon
   * @param point - [x, y] coordinates of the point to test
   * @returns -1 if inside, 0 if on boundary, 1 if outside
   */
  function robustPointInPolygon(
    polygon: [number, number][],
    point: [number, number]
  ): -1 | 0 | 1

  export default robustPointInPolygon
}
