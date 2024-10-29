/*
 * Planck.js
 * The MIT License
 * Copyright (c) 2021 Erin Catto, Ali Shakiba
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Vec2Value } from './Vec2';
import * as Vec2 from './Vec2';
import * as Vec3 from './Vec3';
import { Vec3Value } from './Vec3';


/** @internal */ const _ASSERT = typeof ASSERT === 'undefined' ? false : ASSERT;


/**
 * A 3-by-3 matrix. Stored in column-major order.
 */
export class Mat33 {
  ex: Vec3Value;
  ey: Vec3Value;
  ez: Vec3Value;

  constructor(a: Vec3Value, b: Vec3Value, c: Vec3Value);
  constructor();
  constructor(a?: Vec3Value, b?: Vec3Value, c?: Vec3Value) {
    if (typeof a === 'object' && a !== null) {
      this.ex = Vec3.clone(a);
      this.ey = Vec3.clone(b);
      this.ez = Vec3.clone(c);
    } else {
      this.ex = Vec3.zero();
      this.ey = Vec3.zero();
      this.ez = Vec3.zero();
    }
  }

  /** @hidden */
  toString(): string {
    return JSON.stringify(this);
  }

  static isValid(obj: any): boolean {
    if (obj === null || typeof obj === 'undefined') {
      return false;
    }
    return Vec3.isValid(obj.ex) && Vec3.isValid(obj.ey) && Vec3.isValid(obj.ez);
  }

  static assert(o: any): void {
    _ASSERT && console.assert(!Mat33.isValid(o), 'Invalid Mat33!', o);
  }

  /**
   * Set this matrix to all zeros.
   */
  setZero(): Mat33 {
    Vec3.setZero(this.ex);
    Vec3.setZero(this.ey);
    Vec3.setZero(this.ez);
    return this;
  }

  /**
   * Solve A * x = b, where b is a column vector. This is more efficient than
   * computing the inverse in one-shot cases.
   */
  solve33(v: Vec3Value): Vec3Value {
    // let det = matrix.dotVec3(this.ex, matrix.newCrossVec3(this.ey, this.ez));
    let cross_x = this.ey[1] * this.ez[2] - this.ey[2] * this.ez[1];
    let cross_y = this.ey[2] * this.ez[0] - this.ey[0] * this.ez[2];
    let cross_z = this.ey[0] * this.ez[1] - this.ey[1] * this.ez[0];
    let det = this.ex[0] * cross_x + this.ex[1] * cross_y + this.ex[2] * cross_z;
    if (det !== 0.0) {
      det = 1.0 / det;
    }
    const r = Vec3.create();
    // r.x = det * matrix.dotVec3(v, matrix.newCrossVec3(this.ey, this.ez));
    cross_x = this.ey[1] * this.ez[2] - this.ey[2] * this.ez[1];
    cross_y = this.ey[2] * this.ez[0] - this.ey[0] * this.ez[2];
    cross_z = this.ey[0] * this.ez[1] - this.ey[1] * this.ez[0];
    r[0] = det * (v[0] * cross_x + v[1] * cross_y + v[2] * cross_z);

    // r.y = det * matrix.dotVec3(this.ex, matrix.newCrossVec3(v, this.ez));
    cross_x = v[1] * this.ez[2] - v[2] * this.ez[1];
    cross_y = v[2] * this.ez[0] - v[0] * this.ez[2];
    cross_z = v[0] * this.ez[1] - v[1] * this.ez[0];
    r[1] = det * (this.ex[0] * cross_x + this.ex[1] * cross_y + this.ex[2] * cross_z);

    // r.z = det * matrix.dotVec3(this.ex, matrix.newCrossVec3(this.ey, v));
    cross_x = this.ey[1] * v[2] - this.ey[2] * v[1];
    cross_y = this.ey[2] * v[0] - this.ey[0] * v[2];
    cross_z = this.ey[0] * v[1] - this.ey[1] * v[0];
    r[2] = det * (this.ex[0] * cross_x + this.ex[1] * cross_y + this.ex[2] * cross_z);
    return r;
  }

  /**
   * Solve A * x = b, where b is a column vector. This is more efficient than
   * computing the inverse in one-shot cases. Solve only the upper 2-by-2 matrix
   * equation.
   */
  solve22(v: Vec2Value): Vec2Value {
    const a11 = this.ex[0];
    const a12 = this.ey[0];
    const a21 = this.ex[1];
    const a22 = this.ey[1];
    let det = a11 * a22 - a12 * a21;
    if (det !== 0.0) {
      det = 1.0 / det;
    }
    const r = Vec2.zero();
    r[0] = det * (a22 * v[0] - a12 * v[1]);
    r[1] = det * (a11 * v[1] - a21 * v[0]);
    return r;
  }

  /**
   * Get the inverse of this matrix as a 2-by-2. Returns the zero matrix if
   * singular.
   */
  getInverse22(M: Mat33): void {
    const a = this.ex[0];
    const b = this.ey[0];
    const c = this.ex[1];
    const d = this.ey[1];
    let det = a * d - b * c;
    if (det !== 0.0) {
      det = 1.0 / det;
    }
    M.ex[0] = det * d;
    M.ey[0] = -det * b;
    M.ex[2] = 0.0;
    M.ex[1] = -det * c;
    M.ey[1] = det * a;
    M.ey[2] = 0.0;
    M.ez[0] = 0.0;
    M.ez[1] = 0.0;
    M.ez[2] = 0.0;
  }

  /**
   * Get the symmetric inverse of this matrix as a 3-by-3. Returns the zero matrix
   * if singular.
   */
  getSymInverse33(M: Mat33): void {
    let det = Vec3.dot(this.ex, Vec3.cross(this.ey, this.ez));
    if (det !== 0.0) {
      det = 1.0 / det;
    }
    const a11 = this.ex[0];
    const a12 = this.ey[0];
    const a13 = this.ez[0];
    const a22 = this.ey[1];
    const a23 = this.ez[1];
    const a33 = this.ez[2];

    M.ex[0] = det * (a22 * a33 - a23 * a23);
    M.ex[1] = det * (a13 * a23 - a12 * a33);
    M.ex[2] = det * (a12 * a23 - a13 * a22);

    M.ey[0] = M.ex[1];
    M.ey[1] = det * (a11 * a33 - a13 * a13);
    M.ey[2] = det * (a13 * a12 - a11 * a23);

    M.ez[0] = M.ex[2];
    M.ez[1] = M.ey[2];
    M.ez[2] = det * (a11 * a22 - a12 * a12);
  }

  /**
   * Multiply a matrix times a vector.
   */
  static mul(a: Mat33, b: Vec2Value): Vec2Value;
  static mul(a: Mat33, b: Vec3Value): Vec3Value;
  static mul(a, b) {
    _ASSERT && Mat33.assert(a);
    if (b && 'z' in b && 'y' in b && 'x' in b) {
      _ASSERT && Vec3.assert(b);
      const x = a.ex.x * b.x + a.ey.x * b.y + a.ez.x * b.z;
      const y = a.ex.y * b.x + a.ey.y * b.y + a.ez.y * b.z;
      const z = a.ex.z * b.x + a.ey.z * b.y + a.ez.z * b.z;
      return Vec3.create(x, y, z);

    } else if (b && 'y' in b && 'x' in b) {
      _ASSERT && Vec2.assert(b);
      const x = a.ex.x * b.x + a.ey.x * b.y;
      const y = a.ex.y * b.x + a.ey.y * b.y;
      return Vec2.create(x, y);
    }

    _ASSERT && console.assert(false);
  }

  static mulVec3(a: Mat33, b: Vec3Value): Vec3Value {
    _ASSERT && Mat33.assert(a);
    _ASSERT && Vec3.assert(b);
    const x = a.ex[0] * b[0] + a.ey[0] * b[1] + a.ez[0] * b[2];
    const y = a.ex[1] * b[0] + a.ey[1] * b[1] + a.ez[1] * b[2];
    const z = a.ex[2] * b[0] + a.ey[2] * b[1] + a.ez[2] * b[2];
    return Vec3.create(x, y, z);
  }

  static mulVec2(a: Mat33, b: Vec2Value): Vec2Value {
    _ASSERT && Mat33.assert(a);
    _ASSERT && Vec2.assert(b);
    const x = a.ex[0] * b[0] + a.ey[0] * b[1];
    const y = a.ex[1] * b[0] + a.ey[1] * b[1];
    return Vec2.create(x, y);
  }

  static add(a: Mat33, b: Mat33): Mat33 {
    _ASSERT && Mat33.assert(a);
    _ASSERT && Mat33.assert(b);
    return new Mat33(
      Vec3.add(a.ex, b.ex),
      Vec3.add(a.ey, b.ey),
      Vec3.add(a.ez, b.ez)
    );
  }
}
