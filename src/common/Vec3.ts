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
/** @internal */ const _CONSTRUCTOR_FACTORY = typeof CONSTRUCTOR_FACTORY === 'undefined' ? false : CONSTRUCTOR_FACTORY;


export interface Vec3Value {
  x: number;
  y: number;
  z: number;
}

/**
 * create a new Vec3
 */
export function create (x: number=0, y: number=0, z: number=0): Vec3Value {
  return { x, y, z };
}


export function zero(): Vec3Value {
  return create();
}


export function clone (v: Vec3Value): Vec3Value {
  _ASSERT && assert(v);
  return create(v.x, v.y, v.z);
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
  obj.x = 0.0;
  obj.y = 0.0;
  obj.z = 0.0;
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
  obj.x = x;
  obj.y = y;
  obj.z = z;
  return obj;
}


export function areEqual (v: Vec3Value, w: Vec3Value): boolean {
  _ASSERT && assert(v);
  _ASSERT && assert(w);
  return v === w ||
    typeof v === 'object' && v !== null &&
    typeof w === 'object' && w !== null &&
    v.x === w.x && v.y === w.y && v.z === w.z;
}


/** Dot product on two vectors */
export function dot (v: Vec3Value, w: Vec3Value): number {
  return v.x * w.x + v.y * w.y + v.z * w.z;
}


/** Cross product on two vectors */
export function cross (v: Vec3Value, w: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(v.y * w.z - v.z * w.y, v.z * w.x - v.x * w.z, v.x * w.y - v.y * w.x, out);
}


export function add (v: Vec3Value, w: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(v.x + w.x, v.y + w.y, v.z + w.z, out);
}


export function sub (v: Vec3Value, w: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(v.x - w.x, v.y - w.y, v.z - w.z, out);
}


export function mul (v: Vec3Value, m: number, out: Vec3Value=create()): Vec3Value {
  return set(m * v.x, m * v.y, m * v.z, out);
}

export function neg (v: Vec3Value, out: Vec3Value=create()): Vec3Value {
  return set(-v.x, -v.y, -v.z, out);
}
