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

import { EPSILON } from '../common/Math';
import { Vec2Value } from '../common/Vec2';
import * as Vec2 from '../common/Vec2';


/** @internal */ const _ASSERT = typeof ASSERT === 'undefined' ? false : ASSERT;
/** @internal */ const _CONSTRUCTOR_FACTORY = typeof CONSTRUCTOR_FACTORY === 'undefined' ? false : CONSTRUCTOR_FACTORY;
/** @internal */ const math_max = Math.max;
/** @internal */ const math_min = Math.min;

/**
 * Ray-cast input data. The ray extends from `p1` to `p1 + maxFraction * (p2 - p1)`.
 */
export interface RayCastInput {
  p1: Vec2Value;
  p2: Vec2Value;
  maxFraction: number;
}

export type RayCastCallback = (subInput: RayCastInput, id: number) => number;

/**
 * Ray-cast output data. The ray hits at `p1 + fraction * (p2 - p1)`,
 * where `p1` and `p2` come from RayCastInput.
 */
export interface RayCastOutput {
  normal: Vec2Value;
  fraction: number;
}

export interface AABBValue {
  lowerBound: Vec2Value;
  upperBound: Vec2Value;
}

export class AABB {
  lowerBound: Vec2Value;
  upperBound: Vec2Value;

  constructor(lower?: Vec2Value, upper?: Vec2Value) {
    if (_CONSTRUCTOR_FACTORY && !(this instanceof AABB)) {
      return new AABB(lower, upper);
    }

    this.lowerBound = Vec2.zero();
    this.upperBound = Vec2.zero();

    if (typeof lower === 'object') {
      Vec2.copy(lower, this.lowerBound);
    }
    if (typeof upper === 'object') {
      Vec2.copy(upper, this.upperBound);
    } else if (typeof lower === 'object') {
      Vec2.copy(lower, this.upperBound);
    }
  }

  /**
   * Verify that the bounds are sorted.
   */
  isValid(): boolean {
    return AABB.isValid(this);
  }

  static isValid(obj: any): boolean {
    if (obj === null || typeof obj === 'undefined') {
      return false;
    }
    return Vec2.isValid(obj.lowerBound) && Vec2.isValid(obj.upperBound) && Vec2.lengthSquared(Vec2.sub(obj.upperBound, obj.lowerBound)) >= 0;
  }

  static assert(o: any): void {
    _ASSERT && console.assert(!AABB.isValid(o), 'Invalid AABB!', o);
  }

  /**
   * Get the center of the AABB.
   */
  getCenter(): Vec2Value {
    return Vec2.create((this.lowerBound[0] + this.upperBound[0]) * 0.5, (this.lowerBound[1] + this.upperBound[1]) * 0.5);
  }

  /**
   * Get the extents of the AABB (half-widths).
   */
  getExtents(): Vec2Value {
    return Vec2.create((this.upperBound[0] - this.lowerBound[0]) * 0.5, (this.upperBound[1] - this.lowerBound[1]) * 0.5);
  }

  /**
   * Get the perimeter length.
   */
  getPerimeter(): number {
    return 2.0 * (this.upperBound[0] - this.lowerBound[0] + this.upperBound[1] - this.lowerBound[1]);
  }

  /**
   * Combine one or two AABB into this one.
   */
  combine(a: AABBValue, b?: AABBValue): void {
    b = b || this;

    const lowerA = a.lowerBound;
    const upperA = a.upperBound;
    const lowerB = b.lowerBound;
    const upperB = b.upperBound;

    const lowerX = math_min(lowerA[0], lowerB[0]);
    const lowerY = math_min(lowerA[1], lowerB[1]);
    const upperX = math_max(upperB[0], upperA[0]);
    const upperY = math_max(upperB[1], upperA[1]);

    Vec2.set(lowerX, lowerY, this.lowerBound);
    Vec2.set(upperX, upperY, this.upperBound);
  }

  combinePoints(a: Vec2Value, b: Vec2Value): void {
    Vec2.set(math_min(a[0], b[0]), math_min(a[1], b[1]), this.lowerBound);
    Vec2.set(math_max(a[0], b[0]), math_max(a[1], b[1]), this.upperBound);
  }

  set(aabb: AABBValue): void {
    Vec2.set(aabb.lowerBound[0], aabb.lowerBound[1], this.lowerBound);
    Vec2.set(aabb.upperBound[0], aabb.upperBound[1], this.upperBound);
  }

  contains(aabb: AABBValue): boolean {
    let result = true;
    result = result && this.lowerBound[0] <= aabb.lowerBound[0];
    result = result && this.lowerBound[1] <= aabb.lowerBound[1];
    result = result && aabb.upperBound[0] <= this.upperBound[0];
    result = result && aabb.upperBound[1] <= this.upperBound[1];
    return result;
  }

  extend(value: number): AABB {
    AABB.extend(this, value);
    return this;
  }

  static extend(out: AABBValue, value: number): AABBValue {
    out.lowerBound[0] -= value;
    out.lowerBound[1] -= value;
    out.upperBound[0] += value;
    out.upperBound[1] += value;
    return out;
  }

  static testOverlap(a: AABBValue, b: AABBValue): boolean {
    const d1x = b.lowerBound[0] - a.upperBound[0];
    const d2x = a.lowerBound[0] - b.upperBound[0];

    const d1y = b.lowerBound[1] - a.upperBound[1];
    const d2y = a.lowerBound[1] - b.upperBound[1];

    if (d1x > 0 || d1y > 0 || d2x > 0 || d2y > 0) {
      return false;
    }
    return true;
  }

  static areEqual(a: AABBValue, b: AABBValue): boolean {
    return Vec2.areEqual(a.lowerBound, b.lowerBound) && Vec2.areEqual(a.upperBound, b.upperBound);
  }

  static diff(a: AABBValue, b: AABBValue): number {
    const wD = math_max(0, math_min(a.upperBound[0], b.upperBound[0]) - math_max(b.lowerBound[0], a.lowerBound[0]));
    const hD = math_max(0, math_min(a.upperBound[1], b.upperBound[1]) - math_max(b.lowerBound[1], a.lowerBound[1]));

    const wA = a.upperBound[0] - a.lowerBound[0];
    const hA = a.upperBound[1] - a.lowerBound[1];

    const wB = b.upperBound[0] - b.lowerBound[0];
    const hB = b.upperBound[1] - b.lowerBound[1];

    return wA * hA + wB * hB - wD * hD;
  }

  rayCast(output: RayCastOutput, input: RayCastInput): boolean {
    // From Real-time Collision Detection, p179.

    let tmin = -Infinity;
    let tmax = Infinity;

    const p = input.p1;
    const d = Vec2.sub(input.p2, input.p1);
    const absD = Vec2.abs(d);

    const normal = Vec2.zero();

    for (let f: 'x' | 'y' = 'x'; f !== null; f = (f === 'x' ? 'y' : null)) {
      if (absD[0] < EPSILON) {
        // Parallel.
        if (p[f] < this.lowerBound[f] || this.upperBound[f] < p[f]) {
          return false;
        }
      } else {
        const inv_d = 1.0 / d[f];
        let t1 = (this.lowerBound[f] - p[f]) * inv_d;
        let t2 = (this.upperBound[f] - p[f]) * inv_d;

        // Sign of the normal vector.
        let s = -1.0;

        if (t1 > t2) {
          const temp = t1;
          t1 = t2;
          t2 = temp;
          s = 1.0;
        }

        // Push the min up
        if (t1 > tmin) {
          Vec2.setZero(normal);
          normal[f] = s;
          tmin = t1;
        }

        // Pull the max down
        tmax = math_min(tmax, t2);

        if (tmin > tmax) {
          return false;
        }
      }
    }

    // Does the ray start inside the box?
    // Does the ray intersect beyond the max fraction?
    if (tmin < 0.0 || input.maxFraction < tmin) {
      return false;
    }

    // Intersection.
    output.fraction = tmin;
    output.normal = normal;
    return true;
  }

  /** @hidden */
  toString(): string {
    return JSON.stringify(this);
  }

  static combinePoints(out: AABBValue, a: Vec2Value, b: Vec2Value): AABBValue {
    out.lowerBound[0] = math_min(a[0], b[0]);
    out.lowerBound[1] = math_min(a[1], b[1]);
    out.upperBound[0] = math_max(a[0], b[0]);
    out.upperBound[1] = math_max(a[1], b[1]);
    return out;
  }

  static combinedPerimeter(a: AABBValue, b: AABBValue) {
    const lx = math_min(a.lowerBound[0], b.lowerBound[0]);
    const ly = math_min(a.lowerBound[1], b.lowerBound[1]);
    const ux = math_max(a.upperBound[0], b.upperBound[0]);
    const uy = math_max(a.upperBound[1], b.upperBound[1]);
    return 2.0 * (ux - lx + uy - ly);  
  }
}
