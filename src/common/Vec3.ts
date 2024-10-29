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


/** @internal */ const _ASSERT = typeof ASSERT === 'undefined' ? false : ASSERT;


export type Vec3Value = [ number, number, number ];

/**
 * create a new Vec3
 */
export function create (x: number=0, y: number=0, z: number=0): Vec3Value {
  return [ x, y, z ];
}


export function zero(): Vec3Value {
  return create();
}


export function clone (v: Vec3Value): Vec3Value {
  _ASSERT && assert(v);
  return create(v[0], v[1], v[2]);
}


/** Does this vector contain finite coordinates? */
export function isValid(obj: any): boolean {
  if (obj === null || typeof obj === 'undefined') {
    return false;
  }
  return Number.isFinite(obj.x) && Number.isFinite(obj.y) && Number.isFinite(obj.z);
}


export function assert (o: any): void {
  _ASSERT && console.assert(!isValid(o), 'Invalid Vec3!', o);
}


export function setZero(obj: Vec3Value): Vec3Value {
  obj[0] = 0.0;
  obj[1] = 0.0;
  obj[2] = 0.0;
  return obj;
}


/**
 * scale a vector by a number
 */
export function scale (v: Vec3Value, a: number, out: Vec3Value=create()): Vec3Value {
  _ASSERT && console.assert(Number.isFinite(a));
  _ASSERT && assert(v);

  const x = a * v[0];
  const y = a * v[1];
  const z = a * v[2];

  return set(x, y, z, out);
}


export function set (x: number, y: number, z: number, obj: Vec3Value): Vec3Value {
  obj[0] = x;
  obj[1] = y;
  obj[2] = z;
  return obj;
}


export function areEqual (v: Vec3Value, w: Vec3Value): boolean {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return v === w ||
    typeof v === 'object' && v !== null &&
    typeof w === 'object' && w !== null &&
    v[0] === w[0] && v[1] === w[1] && v[2] === w[2];
}


/** Dot product on two vectors */
export function dot (v: Vec3Value, w: Vec3Value): number {
  return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
}


/** Cross product on two vectors */
export function cross (v: Vec3Value, w: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(v[1] * w[2] - v[2] * w[1], v[2] * w[0] - v[0] * w[2], v[0] * w[1] - v[1] * w[0], out);
}


export function add (v: Vec3Value, w: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(v[0] + w[0], v[1] + w[1], v[2] + w[2], out);
}


export function sub (v: Vec3Value, w: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(v[0] - w[0], v[1] - w[1], v[2] - w[2], out);
}


export function mul (v: Vec3Value, m: number, out: Vec3Value=create()): Vec3Value {
  return set(m * v[0], m * v[1], m * v[2], out);
}

export function neg (v: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(-v[0], -v[1], -v[2], out);
}
