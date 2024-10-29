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

import { EPSILON } from "./Math";


/** @internal */ const _ASSERT = typeof ASSERT === 'undefined' ? false : ASSERT;
/** @internal */ const _CONSTRUCTOR_FACTORY = typeof CONSTRUCTOR_FACTORY === 'undefined' ? false : CONSTRUCTOR_FACTORY;
/** @internal */ const math_abs = Math.abs;
/** @internal */ const math_sqrt = Math.sqrt;
/** @internal */ const math_max = Math.max;
/** @internal */ const math_min = Math.min;



export type Vec2Value = [ number, number ];

/*
  _serialize(): object {
    return {
      x: this[0],
      y: this[1]
    };
  }

  toString(): string {
    return JSON.stringify(this);
  }

  _deserialize(data: any): Vec2Value {
    return { x: data[0], y: data[1] };
  }
*/


/**
 * create a new Vec2
 */
export function create (x: number=0, y: number=0): Vec2Value {
  return [ x, y ];
}

export function zero(): Vec2Value {
  return [ 0, 0 ];
}

export function copy (v: Vec2Value, out: Vec2Value): Vec2Value {
  _ASSERT && assert(out) && assert(v);
  out[0] = v[0];
  out[1] = v[1];
  return out;
}

export function set (x: number, y: number, out: Vec2Value): Vec2Value {
  _ASSERT && assert(out);
  out[0] = x;
  out[1] = y;
  return out;
}

export function clone (v: Vec2Value): Vec2Value {
  _ASSERT && assert(v);
  return create(v[0], v[1]);
}

/**
 * Does this vector contain finite coordinates?
 */
export function isValid (obj: any): boolean {
  if (obj === null || typeof obj === 'undefined') {
    return false;
  }
  return Number.isFinite(obj[0]) && Number.isFinite(obj[1]);
}

export function assert (o: any): void {
  _ASSERT && console.assert(!isValid(o), 'Invalid Vec2!', o);
}

/**
 * Set this vector to all zeros.
 *
 * @returns Vec2
 */
export function setZero (out: Vec2Value): Vec2Value {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}

/**
 * scale a vector by a number
 */
export function scale(v: Vec2Value, a: number, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);

  const x = a * v[0];
  const y = a * v[1];

  return set(x, y, out);
}

/**
 * Add linear combination of v and w: `src + (a * v + b * w)`
 */
export function addCombine(src: Vec2Value, a: number, v: Vec2Value, b: number, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);
  _ASSERT && assert(src);
  _ASSERT && console.assert(Number.isFinite(b));
  _ASSERT && assert(w);

  const x = a * v[0] + b * w[0];
  const y = a * v[1] + b * w[1];

  return set(src[0] + x, src[1] + y, out);
}

/**
 *  out = src + (a * v)
 */
export function addMul (src: Vec2Value, a: number, v: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);
  const x = a * v[0];
  const y = a * v[1];

  return set(src[0] + x, src[1] + y, out);
}

/**
 * Subtract linear combination of v and w: `src + (a * v + b * w)`
 */
export function subCombine (src: Vec2Value, a: number, v: Vec2Value, b: number, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);
  _ASSERT && console.assert(Number.isFinite(b));
  _ASSERT && assert(w);

  const x = a * v[0] + b * w[0];
  const y = a * v[1] + b * w[1];

  return set(src[0] - x, src[1] - y, out);
}

/**
 *  out = src - (a * v)
 */
export function subMul (src: Vec2Value, a: number, v: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);
  const x = a * v[0];
  const y = a * v[1];

  return set(src[0] - x, src[1] - y, out);
}

/**
 * Convert this vector into a unit vector.
 *
 * @returns old length
 */
export function normalize (v: Vec2Value, out: Vec2Value=create()): number {
  const len = length(v);
  if (len < EPSILON) {
    return 0.0;
  }
  const invLength = 1.0 / len;

  set(v[0] * invLength, v[1] * invLength, out)
  return len;
}

/**
 * Get the length of this vector's normal.
 *
 * For performance, use this instead of lengthSquared (if possible).
 */
export function length (v: Vec2Value): number {
  _ASSERT && assert(v);
  return math_sqrt(v[0] * v[0] + v[1] * v[1]);
}

/**
 * Get the length squared.
 */
export function lengthSquared (v: Vec2Value): number {
  _ASSERT && assert(v);
  return v[0] * v[0] + v[1] * v[1];
}

export function distance (v: Vec2Value, w: Vec2Value): number {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  const dx = v[0] - w[0];
  const dy = v[1] - w[1];
  return math_sqrt(dx * dx + dy * dy);
}

export function distanceSquared (v: Vec2Value, w: Vec2Value): number {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  const dx = v[0] - w[0];
  const dy = v[1] - w[1];
  return dx * dx + dy * dy;
}

export function areEqual (v: Vec2Value, w: Vec2Value): boolean {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return v === w || typeof w === 'object' && w !== null && v[0] === w[0] && v[1] === w[1];
}

/**
 * Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
 */
export function skew (v: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  return set(-v[1], v[0], out);
}

/** Dot product on two vectors */
export function dot (v: Vec2Value, w: Vec2Value): number {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return v[0] * w[0] + v[1] * w[1];
}

/** Cross product between two vectors */
export function cross (v: any, w: any): any {
    if (typeof w === 'number') {
      _ASSERT && assert(v);
      _ASSERT && console.assert(Number.isFinite(w));
      return create(w * v[1], -w * v[0]);

    } else if (typeof v === 'number') {
      _ASSERT && console.assert(Number.isFinite(v));
      _ASSERT && assert(w);
      return create(-v * w[1], v * w[0]);

    } else {
      _ASSERT && assert(v);
      _ASSERT && assert(w);
      return v[0] * w[1] - v[1] * w[0];
    }
}

/** Cross product on two vectors */
export function crossVec2Vec2 (v: Vec2Value, w: Vec2Value): number {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return v[0] * w[1] - v[1] * w[0];
}

/** Cross product on a vector and a scalar */
export function crossVec2Num (v: Vec2Value, w: number, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && console.assert(Number.isFinite(w));
  return set(w * v[1], -w * v[0], out);
}

/** Cross product on a vector and a scalar */
export function crossNumVec2 (v: number, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(v));
  _ASSERT && assert(w);
  return set(-v * w[1], v * w[0], out);
}

/**
 * Returns `a + (v x w)`
 */
export function addCrossVec2Num (a: Vec2Value, v: Vec2Value, w: number, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && console.assert(Number.isFinite(w));
  return set(w * v[1] + a[0], -w * v[0] + a[1], out);
}

/**
 * Returns `a + (v x w)`
 */
export function  addCrossNumVec2 (a: Vec2Value, v: number, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(v));
  _ASSERT && assert(w);
  return set(-v * w[1] + a[0], v * w[0] + a[1], out);
}

export function  add (v: Vec2Value, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return set(v[0] + w[0], v[1] + w[1], out);
}

/**
 * Set linear combination of v and w: `a * v + b * w`
 */
export function combine (a: number, v: Vec2Value, b: number, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);
  _ASSERT && console.assert(Number.isFinite(b));
  _ASSERT && assert(w);
  const x = a * v[0] + b * w[0];
  const y = a * v[1] + b * w[1];

  return set(x, y, out);
}

/**
 * Subtract two vectors
 * out = v - w
 */
export function sub (v: Vec2Value, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return set(v[0] - w[0], v[1] - w[1], out);
}

export function mulVec2Num (a: Vec2Value, b: number, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(a);
  _ASSERT && console.assert(Number.isFinite(b));
  return set(a[0] * b, a[1] * b, out);
}

export function mulNumVec2 (a: number, b: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(b);
  return set(a * b[0], a * b[1], out);
}

export function neg (v: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  return set(-v[0], -v[1], out);
}

export function abs (v: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  return set(math_abs(v[0]), math_abs(v[1]), out);
}

export function mid (v: Vec2Value, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return set((v[0] + w[0]) * 0.5, (v[1] + w[1]) * 0.5, out);
}

export function upper (v: Vec2Value, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return set(math_max(v[0], w[0]), math_max(v[1], w[1]), out);
}

export function lower (v: Vec2Value, w: Vec2Value, out: Vec2Value=create()): Vec2Value {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return set(math_min(v[0], w[0]), math_min(v[1], w[1]), out);
}

export function clamp (v: Vec2Value, max: number, out: Vec2Value=create()): Vec2Value {
  const lengthSqr = v[0] * v[0] + v[1] * v[1];
  if (lengthSqr > max * max) {
    const scale = max / math_sqrt(lengthSqr);
    return set(v[0] * scale, v[1] * scale, out);
  }

  return copy(v, out);
}
