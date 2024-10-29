/*
 * Planck.js
 * The MIT License
 * Copyright (c) 2023 Ali Shakiba
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

/** @internal */ const math_sin = Math.sin;
/** @internal */ const math_cos = Math.cos;
/** @internal */ const math_sqrt = Math.sqrt;


import { RotValue } from "./Rot";
import { TransformValue } from "./Transform";
import { Vec2Value } from "./Vec2";
import { Vec3Value } from "./Vec3";

export function vec2 (x: number, y: number): Vec2Value {
  return [ x, y ];
}

export function vec3 (x: number, y: number, z: number): Vec3Value {
  return [ x, y, z ];
}

export function rotation(angle: number): RotValue {
  return { s: math_sin(angle), c: math_cos(angle) };
}

/**
 * @deprecated Use Vec2.set(out, x, y)
 */
export function setVec2(out: Vec2Value, x: number, y: number): Vec2Value {
  out[0] = x;
  out[1] = y;
  return out;
}

export function copyVec2(out: Vec2Value, w: Vec2Value): Vec2Value {
  out[0] = w[0];
  out[1] = w[1];
  return out;
}

export function zeroVec2(out: Vec2Value): Vec2Value {
  out[0] = 0;
  out[1] = 0;
  return out;
}

export function negVec2(out: Vec2Value): Vec2Value {
  out[0] = -out[0];
  out[1] = -out[1];
  return out;
}

export function plusVec2(out: Vec2Value, w: Vec2Value): Vec2Value {
  out[0] += w[0];
  out[1] += w[1];
  return out;
}

export function addVec2(out: Vec2Value, v: Vec2Value, w: Vec2Value): Vec2Value {
  out[0] = v[0] + w[0];
  out[1] = v[0] + w[1];
  return out;
}

export function minusVec2(out: Vec2Value, w: Vec2Value): Vec2Value {
  out[0] -= w[0];
  out[1] -= w[1];
  return out;
}

export function subVec2(out: Vec2Value, v: Vec2Value, w: Vec2Value): Vec2Value {
  out[0] = v[0] - w[0];
  out[1] = v[1] - w[1];
  return out;
}

export function mulVec2(out: Vec2Value, m: number): Vec2Value {
  out[0] *= m;
  out[1] *= m;
  return out;
}

export function scaleVec2(out: Vec2Value, m: number, w: Vec2Value): Vec2Value {
  out[0] = m * w[0];
  out[1] = m * w[1];
  return out;
}

export function plusScaleVec2(out: Vec2Value, m: number, w: Vec2Value): Vec2Value {
  out[0] += m * w[0];
  out[1] += m * w[1];
  return out;
}

export function minusScaleVec2(out: Vec2Value, m: number, w: Vec2Value): Vec2Value {
  out[0] -= m * w[0];
  out[1] -= m * w[1];
  return out;
}

export function combine2Vec2(out: Vec2Value, am: number, a: Vec2Value, bm: number, b: Vec2Value): Vec2Value {
  out[0] = am * a[0] + bm * b[0];
  out[1] = am * a[1] + bm * b[1];
  return out;
}

export function combine3Vec2(out: Vec2Value, am: number, a: Vec2Value, bm: number, b: Vec2Value, cm: number, c: Vec2Value): Vec2Value {
  out[0] = am * a[0] + bm * b[0] + cm * c[0];
  out[1] = am * a[1] + bm * b[1] + cm * c[1];
  return out;
}

export function normalizeVec2Length(out: Vec2Value): number {
  const length = math_sqrt(out[0] * out[0] + out[1] * out[1]);
  if (length !== 0) {
    const invLength = 1 / length;
    out[0] *= invLength;
    out[1] *= invLength;
  }
  return length;
}

export function normalizeVec2(out: Vec2Value): Vec2Value {
  const length = math_sqrt(out[0] * out[0] + out[1] * out[1]);
  if (length > 0) {
    const invLength = 1 / length;
    out[0] *= invLength;
    out[1] *= invLength;
  }
  return out;
}

export function crossVec2Num(out: Vec2Value, v: Vec2Value, w: number): Vec2Value {
  const x = w * v[1];
  const y = -w * v[0];
  out[0] = x;
  out[1] = y;
  return out;
}

export function crossNumVec2(out: Vec2Value, w: number, v: Vec2Value): Vec2Value {
  const x = -w * v[1];
  const y = w * v[0];
  out[0] = x;
  out[1] = y;
  return out;
}

export function crossVec2Vec2(a: Vec2Value, b: Vec2Value): number {
  return a[0] * b[1] - a[1] * b[0];
}

export function dotVec2(a: Vec2Value, b: Vec2Value): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function lengthVec2(a: Vec2Value): number {
  return math_sqrt(a[0] * a[0] + a[1] * a[1]);
}

export function lengthSqrVec2(a: Vec2Value): number {
  return a[0] * a[0] + a[1] * a[1];
}

export function distVec2(a: Vec2Value, b: Vec2Value): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return math_sqrt(dx * dx + dy * dy);
}

export function distSqrVec2(a: Vec2Value, b: Vec2Value): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

export function dotVec3(v: Vec3Value, w: Vec3Value): number {
  return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
}

export function setRotAngle(out: RotValue, a: number): RotValue {
  out.c = math_cos(a);
  out.s = math_sin(a);
  return out;
}

export function rotVec2(out: Vec2Value, q: RotValue, v: Vec2Value): Vec2Value {
  out[0] = q.c * v[0] - q.s * v[1];
  out[1] = q.s * v[0] + q.c * v[1];
  return out;
}

export function derotVec2(out: Vec2Value, q: RotValue, v: Vec2Value): Vec2Value {
  const x = q.c * v[0] + q.s * v[1];
  const y = -q.s * v[0] + q.c * v[1];
  out[0] = x;
  out[1] = y;
  return out;
}

export function rerotVec2(out: Vec2Value, before: RotValue, after: RotValue, v: Vec2Value): Vec2Value {
  const x0 = before.c * v[0] + before.s * v[1];
  const y0 = -before.s * v[0] + before.c * v[1];
  const x = after.c * x0 - after.s * y0;
  const y = after.s * x0 + after.c * y0;
  out[0] = x;
  out[1] = y;
  return out;
}

export function transform(x: number, y: number, a: number): TransformValue {
  return { p: vec2(x, y), q: rotation(a) };
}

export function copyTransform(out: TransformValue, transform: TransformValue): TransformValue {
  out.p[0] = transform.p[0];
  out.p[1] = transform.p[1];
  out.q.s = transform.q.s;
  out.q.c = transform.q.c;
  return out;
}

export function transformVec2(out: Vec2Value, xf: TransformValue, v: Vec2Value): Vec2Value {
  const x = xf.q.c * v[0] - xf.q.s * v[1] + xf.p[0];
  const y = xf.q.s * v[0] + xf.q.c * v[1] + xf.p[1];
  out[0] = x;
  out[1] = y;
  return out;
}

export function detransformVec2(out: Vec2Value, xf: TransformValue, v: Vec2Value): Vec2Value {
  const px = v[0] - xf.p[0];
  const py = v[1] - xf.p[1];
  const x = (xf.q.c * px + xf.q.s * py);
  const y = (-xf.q.s * px + xf.q.c * py);
  out[0] = x;
  out[1] = y;
  return out;
}

export function retransformVec2(out: Vec2Value, from: TransformValue, to: TransformValue, v: Vec2Value): Vec2Value {
  const x0 = from.q.c * v[0] - from.q.s * v[1] + from.p[0];
  const y0 = from.q.s * v[0] + from.q.c * v[1] + from.p[1];
  const px = x0 - to.p[0];
  const py = y0 - to.p[1];
  const x = to.q.c * px + to.q.s * py;
  const y = -to.q.s * px + to.q.c * py;
  out[0] = x;
  out[1] = y;
  return out;
}

export function detransformTransform(out: TransformValue, a: TransformValue, b: TransformValue): TransformValue {
  const c = a.q.c * b.q.c + a.q.s * b.q.s;
  const s = a.q.c * b.q.s - a.q.s * b.q.c;
  const x = a.q.c * (b.p[0] - a.p[0]) + a.q.s * (b.p[1] - a.p[1]);
  const y = -a.q.s * (b.p[0] - a.p[0]) + a.q.c * (b.p[1] - a.p[1]);
  out.q.c = c;
  out.q.s = s;
  out.p[0] = x;
  out.p[1] = y;
  return out;
}
