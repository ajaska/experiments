// Based off of https://github.com/evanw/lightgl.js/blob/master/src/vector.js

const sumR = (total: number, current: number) => total + current;

export class Point {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z?: number) {
    if (isNaN(x) || isNaN(y) || isNaN(z || 0)) {
      throw new Error("Point cannot have NaN");
    }

    this.x = x;
    this.y = y;
    // this.z = z || 0;
    this.z = 0;
  }

  static averageOfPoints(points: Point[]) {
    const avgX = points.map((p) => p.x).reduce(sumR, 0) / points.length;
    const avgY = points.map((p) => p.y).reduce(sumR, 0) / points.length;
    const avgZ = points.map((p) => p.z).reduce(sumR, 0) / points.length;

    return new Point(avgX, avgY, avgZ);
  }

  toPoint(p: Point): Vector {
    const x = p.x - this.x;
    const y = p.y - this.y;
    return new Vector(Math.sqrt(x * x + y * y), Math.atan2(y, x));
  }

  add(v: Vector): Point {
    return new Point(
      this.x + v.r * Math.cos(v.theta),
      this.y + v.r * Math.sin(v.theta)
    );
  }

  // toPoint(p: Point): Vector {
  //   // return new Vector(p.x - this.x, p.y - this.y, p.z - this.z);
  //   return new Vector(p.x - this.x, p.y - this.y, p.z - this.z);
  // }

  // add(v: Vector) {
  //   return new Point(this.x + v.x, this.y + v.y, this.z + v.z);
  // }

  distance(p: Point): number {
    return this.toPoint(p).length();
  }
}

export class Vector {
  r: number;
  theta: number;

  constructor(r: number, theta: number) {
    this.r = r;

    while (theta > Math.PI) theta -= Math.PI * 2;
    while (theta < -Math.PI) theta += Math.PI * 2;
    this.theta = theta;
  }

  length() {
    return this.r;
  }

  angle() {
    return this.theta;
  }

  unit() {
    return new Vector(1, this.theta);
  }

  // https://math.stackexchange.com/questions/1365622/adding-two-polar-vectors
  static sumVectors(vs: Vector[]) {
    let x = 0;
    let y = 0;
    for (const v of vs) {
      x += v.r * Math.cos(v.theta);
      y += v.r * Math.sin(v.theta);
    }
    return new Vector(Math.sqrt(x * x + y * y), Math.atan2(y, x));
  }

  divide(n: number) {
    return new Vector(this.r / n, this.theta);
  }

  multiply(n: number) {
    return new Vector(this.r * n, this.theta);
  }

  limit(n: number) {
    if (this.r < n) {
      return this.clone();
    }
    return new Vector(n, this.theta);
  }

  clone() {
    return new Vector(this.r, this.theta);
  }
}

// Provides a simple 3D vector class. Vector operations can be done using member
// functions, which return new vectors, or static functions, which reuse
// existing vectors to avoid generating garbage.
export class Vector2D {
  x: number;
  y: number;
  z: number;

  _length?: number;
  _unit?: Vector2D;
  _angle?: number;

  constructor(x: number, y: number, z?: number) {
    if (isNaN(x) || isNaN(y) || isNaN(z || 0)) {
      throw new Error("Vector2D cannot have NaN");
    }

    this.x = x;
    this.y = y;
    // this.z = z || 0;
    this.z = 0;
  }

  // ### Instance Methods
  // The methods `add()`, `subtract()`, `multiply()`, and `divide()` can all
  // take either a vector or a number as an argument.
  negative() {
    return new Vector2D(-this.x, -this.y, -this.z);
  }

  add(v: Vector2D | number) {
    if (v instanceof Vector2D)
      return new Vector2D(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector2D(this.x + v, this.y + v, this.z + v);
  }

  subtract(v: Vector2D | number) {
    if (v instanceof Vector2D)
      return new Vector2D(this.x - v.x, this.y - v.y, this.z - v.z);
    else return new Vector2D(this.x - v, this.y - v, this.z - v);
  }

  multiply(v: Vector2D | number) {
    if (v instanceof Vector2D)
      return new Vector2D(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector2D(this.x * v, this.y * v, this.z * v);
  }

  divide(v: Vector2D | number) {
    if (v instanceof Vector2D)
      return new Vector2D(this.x / v.x, this.y / v.y, this.z / v.z);
    else return new Vector2D(this.x / v, this.y / v, this.z / v);
  }

  equals(v: Vector2D) {
    return this.x == v.x && this.y == v.y && this.z == v.z;
  }

  dot(v: Vector2D) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v: Vector2D) {
    return new Vector2D(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length() {
    return this._length || (this._length = Math.sqrt(this.dot(this)));
  }

  unit() {
    return this._unit || (this._unit = this.divide(this.length()));
  }

  // 2d-angle
  angle() {
    return this._angle || (this._angle = Math.atan2(this.y, this.x));
  }

  limit(n: number) {
    if (this.length() > n) {
      return this.unit().multiply(n);
    }
    return this.clone();
  }

  min() {
    return Math.min(Math.min(this.x, this.y), this.z);
  }

  max() {
    return Math.max(Math.max(this.x, this.y), this.z);
  }

  toAngles() {
    return {
      theta: Math.atan2(this.z, this.x),
      phi: Math.asin(this.y / this.length()),
    };
  }

  angleTo(a: Vector2D) {
    return Math.acos(this.dot(a) / (this.length() * a.length()));
  }

  toArray(n: number) {
    return [this.x, this.y, this.z].slice(0, n || 3);
  }

  clone() {
    return new Vector2D(this.x, this.y, this.z);
  }

  static fromAngles(theta: number, phi: number) {
    return new Vector2D(
      Math.cos(theta) * Math.cos(phi),
      Math.sin(phi),
      Math.sin(theta) * Math.cos(phi)
    );
  }

  static averageOfVector2Ds(vectors: Vector2D[]) {
    const avgX = vectors.map((p) => p.x).reduce(sumR, 0) / vectors.length;
    const avgY = vectors.map((p) => p.y).reduce(sumR, 0) / vectors.length;
    const avgZ = vectors.map((p) => p.z).reduce(sumR, 0) / vectors.length;

    return new Vector2D(avgX, avgY, avgZ);
  }
}

// ### Static Methods
// `Vector.randomDirection()` returns a vector with a length of 1 and a
// statistically uniform direction. `Vector.lerp()` performs linear
// interpolation between two vectors.

// Vector.negative = function (a, b) {
//   b.x = -a.x;
//   b.y = -a.y;
//   b.z = -a.z;
//   return b;
// };
// Vector.add = function (a, b, c) {
//   if (b instanceof Vector) {
//     c.x = a.x + b.x;
//     c.y = a.y + b.y;
//     c.z = a.z + b.z;
//   } else {
//     c.x = a.x + b;
//     c.y = a.y + b;
//     c.z = a.z + b;
//   }
//   return c;
// };
// Vector.subtract = function (a, b, c) {
//   if (b instanceof Vector) {
//     c.x = a.x - b.x;
//     c.y = a.y - b.y;
//     c.z = a.z - b.z;
//   } else {
//     c.x = a.x - b;
//     c.y = a.y - b;
//     c.z = a.z - b;
//   }
//   return c;
// };
// Vector.multiply = function (a, b, c) {
//   if (b instanceof Vector) {
//     c.x = a.x * b.x;
//     c.y = a.y * b.y;
//     c.z = a.z * b.z;
//   } else {
//     c.x = a.x * b;
//     c.y = a.y * b;
//     c.z = a.z * b;
//   }
//   return c;
// };
// Vector.divide = function (a, b, c) {
//   if (b instanceof Vector) {
//     c.x = a.x / b.x;
//     c.y = a.y / b.y;
//     c.z = a.z / b.z;
//   } else {
//     c.x = a.x / b;
//     c.y = a.y / b;
//     c.z = a.z / b;
//   }
//   return c;
// };
// Vector.cross = function (a, b, c) {
//   c.x = a.y * b.z - a.z * b.y;
//   c.y = a.z * b.x - a.x * b.z;
//   c.z = a.x * b.y - a.y * b.x;
//   return c;
// };
// Vector.unit = function (a, b) {
//   var length = a.length();
//   b.x = a.x / length;
//   b.y = a.y / length;
//   b.z = a.z / length;
//   return b;
// };
// Vector.fromAngles = function (theta, phi) {
//   return new Vector(
//     Math.cos(theta) * Math.cos(phi),
//     Math.sin(phi),
//     Math.sin(theta) * Math.cos(phi)
//   );
// };
// Vector.randomDirection = function () {
//   return Vector.fromAngles(
//     Math.random() * Math.PI * 2,
//     Math.asin(Math.random() * 2 - 1)
//   );
// };
// Vector.min = function (a, b) {
//   return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
// };
// Vector.max = function (a, b) {
//   return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
// };
// Vector.lerp = function (a, b, fraction) {
//   return b.subtract(a).multiply(fraction).add(a);
// };
// Vector.fromArray = function (a) {
//   return new Vector(a[0], a[1], a[2]);
// };
// Vector.angleBetween = function (a, b) {
//   return a.angleTo(b);
// };
