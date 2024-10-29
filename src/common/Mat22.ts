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


/** @internal */ const _ASSERT = typeof ASSERT === 'undefined' ? false : ASSERT;


/**
 * A 2-by-2 matrix. Stored in column-major order.
 */
export class Mat22 {
  ex: Vec2Value;
  ey: Vec2Value;

  constructor(a: number, b: number, c: number, d: number);
  constructor(a: Vec2Value, b: Vec2Value);
  constructor();
  constructor(a?, b?, c?, d?) {
    if (typeof a === 'object' && a !== null) {
      this.ex = Vec2.clone(a);
      this.ey = Vec2.clone(b);
    } else if (typeof a === 'number') {
      this.ex = Vec2.create(a, c);
      this.ey = Vec2.create(b, d);
    } else {
      this.ex = Vec2.zero();
      this.ey = Vec2.zero();
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
    return Vec2.isValid(obj.ex) && Vec2.isValid(obj.ey);
  }

  static assert(o: any): void {
    _ASSERT && console.assert(!Mat22.isValid(o), 'Invalid Mat22!', o);
  }

  set(a: Mat22): void;
  set(a: Vec2Value, b: Vec2Value): void;
  set(a: number, b: number, c: number, d: number): void;
  set(a, b?, c?, d?): void {
    if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number'
      && typeof d === 'number') {
      Vec2.set(a, c, this.ex);
      Vec2.set(b, d, this.ey);

    } else if (typeof a === 'object' && typeof b === 'object') {
      Vec2.copy(a, this.ex);
      Vec2.copy(b, this.ey);

    } else if (typeof a === 'object') {
      _ASSERT && Mat22.assert(a);
      Vec2.copy(a.ex, this.ex);
      Vec2.copy(a.ey, this.ey);

    } else {
      _ASSERT && console.assert(false);
    }
  }

  setIdentity(): void {
    this.ex[0] = 1.0;
    this.ey[0] = 0.0;
    this.ex[1] = 0.0;
    this.ey[1] = 1.0;
  }

  setZero(): void {
    this.ex[0] = 0.0;
    this.ey[0] = 0.0;
    this.ex[1] = 0.0;
    this.ey[1] = 0.0;
  }

  getInverse(): Mat22 {
    const a = this.ex[0];
    const b = this.ey[0];
    const c = this.ex[1];
    const d = this.ey[1];
    let det = a * d - b * c;
    if (det !== 0.0) {
      det = 1.0 / det;
    }
    const imx = new Mat22();
    imx.ex[0] = det * d;
    imx.ey[0] = -det * b;
    imx.ex[1] = -det * c;
    imx.ey[1] = det * a;
    return imx;
  }

  /**
   * Solve A * x = b, where b is a column vector. This is more efficient than
   * computing the inverse in one-shot cases.
   */
  solve(v: Vec2Value): Vec2Value {
    _ASSERT && Vec2.assert(v);
    const a = this.ex[0];
    const b = this.ey[0];
    const c = this.ex[1];
    const d = this.ey[1];
    let det = a * d - b * c;
    if (det !== 0.0) {
      det = 1.0 / det;
    }
    const w = Vec2.zero();
    w[0] = det * (d * v[0] - b * v[1]);
    w[1] = det * (a * v[1] - c * v[0]);
    return w;
  }

  /**
   * Multiply a matrix times a vector. If a rotation matrix is provided, then this
   * transforms the vector from one frame to another.
   */
  static mul(mx: Mat22, my: Mat22): Mat22;
  static mul(mx: Mat22, v: Vec2Value): Vec2Value;
  static mul(mx, v) {
    if (v && 'x' in v && 'y' in v) {
      _ASSERT && Vec2.assert(v);
      const x = mx.ex.x * v.x + mx.ey.x * v.y;
      const y = mx.ex.y * v.x + mx.ey.y * v.y;
      return Vec2.create(x, y);

    } else if (v && 'ex' in v && 'ey' in v) { // Mat22
      _ASSERT && Mat22.assert(v);
      // return new Mat22(Vec2.scale(v.ex, mx), Vec2.scale(v.ey, mx));
      const a = mx.ex.x * v.ex.x + mx.ey.x * v.ex.y;
      const b = mx.ex.x * v.ey.x + mx.ey.x * v.ey.y;
      const c = mx.ex.y * v.ex.x + mx.ey.y * v.ex.y;
      const d = mx.ex.y * v.ey.x + mx.ey.y * v.ey.y;
      return new Mat22(a, b, c, d);
    }

    _ASSERT && console.assert(false);
  }

  static mulVec2(mx: Mat22, v: Vec2Value): Vec2Value {
    _ASSERT && Vec2.assert(v);
    const x = mx.ex[0] * v[0] + mx.ey[0] * v[1];
    const y = mx.ex[1] * v[0] + mx.ey[1] * v[1];
    return Vec2.create(x, y);
  }

  static mulMat22(mx: Mat22, v: Mat22): Mat22 {
    _ASSERT && Mat22.assert(v);
    // return new Mat22(Vec2.scale(v.ex, mx), Vec2.scale(v.ey, mx));
    const a = mx.ex[0] * v.ex[0] + mx.ey[0] * v.ex[1];
    const b = mx.ex[0] * v.ey[0] + mx.ey[0] * v.ey[1];
    const c = mx.ex[1] * v.ex[0] + mx.ey[1] * v.ex[1];
    const d = mx.ex[1] * v.ey[0] + mx.ey[1] * v.ey[1];
    return new Mat22(a, b, c, d);
  }

  /**
   * Multiply a matrix transpose times a vector. If a rotation matrix is provided,
   * then this transforms the vector from one frame to another (inverse
   * transform).
   */
  static mulT(mx: Mat22, my: Mat22): Mat22;
  static mulT(mx: Mat22, v: Vec2Value): Vec2Value;
  static mulT(mx, v) {
    if (v && 'x' in v && 'y' in v) { // Vec2
      _ASSERT && Vec2.assert(v);
      return Vec2.create(Vec2.dot(v, mx.ex), Vec2.dot(v, mx.ey));

    } else if (v && 'ex' in v && 'ey' in v) { // Mat22
      _ASSERT && Mat22.assert(v);
      const c1 = Vec2.create(Vec2.dot(mx.ex, v.ex), Vec2.dot(mx.ey, v.ex));
      const c2 = Vec2.create(Vec2.dot(mx.ex, v.ey), Vec2.dot(mx.ey, v.ey));
      return new Mat22(c1, c2);
    }

    _ASSERT && console.assert(false);
  }

  static mulTVec2(mx: Mat22, v: Vec2Value): Vec2Value {
    _ASSERT && Mat22.assert(mx);
    _ASSERT && Vec2.assert(v);
    return Vec2.create(Vec2.dot(v, mx.ex), Vec2.dot(v, mx.ey));
  }

  static mulTMat22(mx: Mat22, v: Mat22): Mat22 {
    _ASSERT && Mat22.assert(mx);
    _ASSERT && Mat22.assert(v);
    const c1 = Vec2.create(Vec2.dot(mx.ex, v.ex), Vec2.dot(mx.ey, v.ex));
    const c2 = Vec2.create(Vec2.dot(mx.ex, v.ey), Vec2.dot(mx.ey, v.ey));
    return new Mat22(c1, c2);
  }

  static abs(mx: Mat22): Mat22 {
    _ASSERT && Mat22.assert(mx);
    return new Mat22(Vec2.abs(mx.ex), Vec2.abs(mx.ey));
  }

  static add(mx1: Mat22, mx2: Mat22): Mat22 {
    _ASSERT && Mat22.assert(mx1);
    _ASSERT && Mat22.assert(mx2);
    return new Mat22(Vec2.add(mx1.ex, mx2.ex), Vec2.add(mx1.ey, mx2.ey));
  }
}
