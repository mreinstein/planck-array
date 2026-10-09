/**
 * Planck.js v0.3.0
 * @license The MIT license
 * @copyright Copyright (c) 2023 Erin Catto, Ali Shakiba
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

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.planck = {}));
})(this, (function (exports) { 'use strict';

  class Testbed {
      constructor() {
          /** World viewbox width. */
          this.width = 80;
          /** World viewbox height. */
          this.height = 60;
          /** World viewbox center vertical offset. */
          this.x = 0;
          /** World viewbox center horizontal offset. */
          this.y = -10;
          this.scaleY = -1;
          /** World simulation step frequency */
          this.hz = 60;
          /** World simulation speed, default is 1 */
          this.speed = 1;
          this.background = '#222222';
          this.activeKeys = {};
          /** callback, to be implemented by user */
          this.step = (dt, t) => {
              return;
          };
          /** callback, to be implemented by user */
          this.keydown = (keyCode, label) => {
              return;
          };
          /** callback, to be implemented by user */
          this.keyup = (keyCode, label) => {
              return;
          };
          this.statusText = '';
          this.statusMap = {};
      }
      /**
       * Mounts testbed. Call start with a world to start simulation and rendering.
       */
      static mount(options) {
          throw new Error('Not implemented');
      }
      /**
       * Mounts testbed if needed, then starts simulation and rendering.
       *
       * If you need to customize testbed before starting, first run `const testbed = Testbed.mount()` and then `testbed.start()`.
       */
      static start(world) {
          const testbed = Testbed.mount();
          testbed.start(world);
          return testbed;
      }
      status(a, b) {
          if (typeof b !== 'undefined') {
              const key = a;
              const value = b;
              if (typeof value !== 'function' && typeof value !== 'object') {
                  this.statusMap[key] = value;
              }
          }
          else if (a && typeof a === 'object') {
              // tslint:disable-next-line:no-for-in
              for (const key in a) {
                  const value = a[key];
                  if (typeof value !== 'function' && typeof value !== 'object') {
                      this.statusMap[key] = value;
                  }
              }
          }
          else if (typeof a === 'string') {
              this.statusText = a;
          }
          var newline = '\n';
          var text = this.statusText || '';
          for (var key in this.statusMap) {
              var value = this.statusMap[key];
              if (typeof value === 'function')
                  continue;
              text += (text && newline) + key + ': ' + value;
          }
          this._status(text);
      }
      info(text) {
          this._info(text);
      }
      color(r, g, b) {
          r = r * 256 | 0;
          g = g * 256 | 0;
          b = b * 256 | 0;
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
      }
  }
  /** @internal */
  function testbed(a, b) {
      let callback;
      let options;
      if (typeof a === 'function') {
          callback = a;
          options = b;
      }
      else if (typeof b === 'function') {
          callback = b;
          options = a;
      }
      else {
          options = a !== null && a !== void 0 ? a : b;
      }
      const testbed = Testbed.mount(options);
      if (callback) {
          // this is for backwards compatibility
          const world = callback(testbed) || testbed.world;
          testbed.start(world);
      }
      else {
          return testbed;
      }
  }

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
  /** @internal */ const math_random$1 = Math.random;
  const EPSILON = 1e-9;
  /** @internal @deprecated */
  const isFinite = Number.isFinite;
  /**
   * @deprecated
   * Next Largest Power of 2 Given a binary integer value x, the next largest
   * power of 2 can be computed by a SWAR algorithm that recursively "folds" the
   * upper bits into the lower bits. This process yields a bit vector with the
   * same most significant 1 as x, but all 1's below it. Adding 1 to that value
   * yields the next largest power of 2. For a 32-bit value:
   */
  function nextPowerOfTwo(x) {
      x |= (x >> 1);
      x |= (x >> 2);
      x |= (x >> 4);
      x |= (x >> 8);
      x |= (x >> 16);
      return x + 1;
  }
  /** @deprecated */
  function isPowerOfTwo(x) {
      return x > 0 && (x & (x - 1)) === 0;
  }
  /** @deprecated */
  function mod(num, min, max) {
      if (typeof min === 'undefined') {
          max = 1;
          min = 0;
      }
      else if (typeof max === 'undefined') {
          max = min;
          min = 0;
      }
      if (max > min) {
          num = (num - min) % (max - min);
          return num + (num < 0 ? max : min);
      }
      else {
          num = (num - max) % (min - max);
          return num + (num <= 0 ? min : max);
      }
  }
  /**
   * @deprecated
   * Returns a min if num is less than min, and max if more than max, otherwise returns num.
   */
  function clamp$2(num, min, max) {
      if (num < min) {
          return min;
      }
      else if (num > max) {
          return max;
      }
      else {
          return num;
      }
  }
  /**
   * @deprecated
   * Returns a random number between min and max when two arguments are provided.
   * If one arg is provided between 0 to max.
   * If one arg is passed between 0 to 1.
   */
  function random$1(min, max) {
      if (typeof min === 'undefined') {
          max = 1;
          min = 0;
      }
      else if (typeof max === 'undefined') {
          max = min;
          min = 0;
      }
      return min === max ? min : math_random$1() * (max - min) + min;
  }
  /** @ignore */
  const math$1 = Object.create(Math);
  math$1.EPSILON = EPSILON;
  math$1.isFinite = isFinite;
  math$1.nextPowerOfTwo = nextPowerOfTwo;
  math$1.isPowerOfTwo = isPowerOfTwo;
  math$1.mod = mod;
  math$1.clamp = clamp$2;
  math$1.random = random$1;

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
  /** @internal */ const math_abs$a = Math.abs;
  /** @internal */ const math_sqrt$7 = Math.sqrt;
  /** @internal */ const math_max$9 = Math.max;
  /** @internal */ const math_min$9 = Math.min;
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
  function create$2(x = 0, y = 0) {
      return [x, y];
  }
  function zero$1() {
      return [0, 0];
  }
  function copy(v, out) {
      out[0] = v[0];
      out[1] = v[1];
      return out;
  }
  function set$1(x, y, out) {
      out[0] = x;
      out[1] = y;
      return out;
  }
  function clone$1(v) {
      return create$2(v[0], v[1]);
  }
  /**
   * Does this vector contain finite coordinates?
   */
  function isValid$1(obj) {
      if (obj === null || typeof obj === 'undefined') {
          return false;
      }
      return Number.isFinite(obj[0]) && Number.isFinite(obj[1]);
  }
  function assert$1(o) {
  }
  /**
   * Set this vector to all zeros.
   *
   * @returns Vec2
   */
  function setZero$1(out) {
      out[0] = 0.0;
      out[1] = 0.0;
      return out;
  }
  /**
   * scale a vector by a number
   */
  function scale$1(v, a, out = create$2()) {
      const x = a * v[0];
      const y = a * v[1];
      return set$1(x, y, out);
  }
  /**
   * Add linear combination of v and w: `src + (a * v + b * w)`
   */
  function addCombine(src, a, v, b, w, out = create$2()) {
      const x = a * v[0] + b * w[0];
      const y = a * v[1] + b * w[1];
      return set$1(src[0] + x, src[1] + y, out);
  }
  /**
   *  out = src + (a * v)
   */
  function addMul(src, a, v, out = create$2()) {
      const x = a * v[0];
      const y = a * v[1];
      return set$1(src[0] + x, src[1] + y, out);
  }
  /**
   * Subtract linear combination of v and w: `src + (a * v + b * w)`
   */
  function subCombine(src, a, v, b, w, out = create$2()) {
      const x = a * v[0] + b * w[0];
      const y = a * v[1] + b * w[1];
      return set$1(src[0] - x, src[1] - y, out);
  }
  /**
   *  out = src - (a * v)
   */
  function subMul(src, a, v, out = create$2()) {
      const x = a * v[0];
      const y = a * v[1];
      return set$1(src[0] - x, src[1] - y, out);
  }
  /**
   * Convert this vector into a unit vector.
   *
   * @returns old length
   */
  function normalize(v, out = create$2()) {
      const len = length$1(v);
      if (len < EPSILON) {
          return 0.0;
      }
      const invLength = 1.0 / len;
      set$1(v[0] * invLength, v[1] * invLength, out);
      return len;
  }
  /**
   * Get the length of this vector's normal.
   *
   * For performance, use this instead of lengthSquared (if possible).
   */
  function length$1(v) {
      return math_sqrt$7(v[0] * v[0] + v[1] * v[1]);
  }
  /**
   * Get the length squared.
   */
  function lengthSquared(v) {
      return v[0] * v[0] + v[1] * v[1];
  }
  function distance(v, w) {
      const dx = v[0] - w[0];
      const dy = v[1] - w[1];
      return math_sqrt$7(dx * dx + dy * dy);
  }
  function distanceSquared(v, w) {
      const dx = v[0] - w[0];
      const dy = v[1] - w[1];
      return dx * dx + dy * dy;
  }
  function areEqual$1(v, w) {
      return v === w || typeof w === 'object' && w !== null && v[0] === w[0] && v[1] === w[1];
  }
  /**
   * Get the skew vector such that dot(skew_vec, other) == cross(vec, other)
   */
  function skew(v, out = create$2()) {
      return set$1(-v[1], v[0], out);
  }
  /** Dot product on two vectors */
  function dot$1(v, w) {
      return v[0] * w[0] + v[1] * w[1];
  }
  /** Cross product between two vectors */
  function cross$1(v, w) {
      if (typeof w === 'number') {
          return create$2(w * v[1], -w * v[0]);
      }
      else if (typeof v === 'number') {
          return create$2(-v * w[1], v * w[0]);
      }
      else {
          return v[0] * w[1] - v[1] * w[0];
      }
  }
  /** Cross product on two vectors */
  function crossVec2Vec2$1(v, w) {
      return v[0] * w[1] - v[1] * w[0];
  }
  /** Cross product on a vector and a scalar */
  function crossVec2Num$1(v, w, out = create$2()) {
      return set$1(w * v[1], -w * v[0], out);
  }
  /** Cross product on a vector and a scalar */
  function crossNumVec2$1(v, w, out = create$2()) {
      return set$1(-v * w[1], v * w[0], out);
  }
  /**
   * Returns `a + (v x w)`
   */
  function addCrossVec2Num(a, v, w, out = create$2()) {
      return set$1(w * v[1] + a[0], -w * v[0] + a[1], out);
  }
  /**
   * Returns `a + (v x w)`
   */
  function addCrossNumVec2(a, v, w, out = create$2()) {
      return set$1(-v * w[1] + a[0], v * w[0] + a[1], out);
  }
  function add$1(v, w, out = create$2()) {
      return set$1(v[0] + w[0], v[1] + w[1], out);
  }
  /**
   * Set linear combination of v and w: `a * v + b * w`
   */
  function combine(a, v, b, w, out = create$2()) {
      const x = a * v[0] + b * w[0];
      const y = a * v[1] + b * w[1];
      return set$1(x, y, out);
  }
  /**
   * Subtract two vectors
   * out = v - w
   */
  function sub$1(v, w, out = create$2()) {
      return set$1(v[0] - w[0], v[1] - w[1], out);
  }
  function mulVec2Num(a, b, out = create$2()) {
      return set$1(a[0] * b, a[1] * b, out);
  }
  function mulNumVec2(a, b, out = create$2()) {
      return set$1(a * b[0], a * b[1], out);
  }
  function neg$1(v, out = create$2()) {
      return set$1(-v[0], -v[1], out);
  }
  function abs(v, out = create$2()) {
      return set$1(math_abs$a(v[0]), math_abs$a(v[1]), out);
  }
  function mid(v, w, out = create$2()) {
      return set$1((v[0] + w[0]) * 0.5, (v[1] + w[1]) * 0.5, out);
  }
  function upper(v, w, out = create$2()) {
      return set$1(math_max$9(v[0], w[0]), math_max$9(v[1], w[1]), out);
  }
  function lower(v, w, out = create$2()) {
      return set$1(math_min$9(v[0], w[0]), math_min$9(v[1], w[1]), out);
  }
  function clamp$1(v, max, out = create$2()) {
      const lengthSqr = v[0] * v[0] + v[1] * v[1];
      if (lengthSqr > max * max) {
          const scale = max / math_sqrt$7(lengthSqr);
          return set$1(v[0] * scale, v[1] * scale, out);
      }
      return copy(v, out);
  }

  var Vec2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$2,
    zero: zero$1,
    copy: copy,
    set: set$1,
    clone: clone$1,
    isValid: isValid$1,
    assert: assert$1,
    setZero: setZero$1,
    scale: scale$1,
    addCombine: addCombine,
    addMul: addMul,
    subCombine: subCombine,
    subMul: subMul,
    normalize: normalize,
    length: length$1,
    lengthSquared: lengthSquared,
    distance: distance,
    distanceSquared: distanceSquared,
    areEqual: areEqual$1,
    skew: skew,
    dot: dot$1,
    cross: cross$1,
    crossVec2Vec2: crossVec2Vec2$1,
    crossVec2Num: crossVec2Num$1,
    crossNumVec2: crossNumVec2$1,
    addCrossVec2Num: addCrossVec2Num,
    addCrossNumVec2: addCrossNumVec2,
    add: add$1,
    combine: combine,
    sub: sub$1,
    mulVec2Num: mulVec2Num,
    mulNumVec2: mulNumVec2,
    neg: neg$1,
    abs: abs,
    mid: mid,
    upper: upper,
    lower: lower,
    clamp: clamp$1
  });

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
  /**
   * create a new Vec3
   */
  function create$1(x = 0, y = 0, z = 0) {
      return [x, y, z];
  }
  function zero() {
      return create$1();
  }
  function clone(v) {
      return create$1(v[0], v[1], v[2]);
  }
  /** Does this vector contain finite coordinates? */
  function isValid(obj) {
      if (obj === null || typeof obj === 'undefined') {
          return false;
      }
      return Number.isFinite(obj.x) && Number.isFinite(obj.y) && Number.isFinite(obj.z);
  }
  function assert(o) {
  }
  function setZero(obj) {
      obj[0] = 0.0;
      obj[1] = 0.0;
      obj[2] = 0.0;
      return obj;
  }
  /**
   * scale a vector by a number
   */
  function scale(v, a, out = create$1()) {
      const x = a * v[0];
      const y = a * v[1];
      const z = a * v[2];
      return set(x, y, z, out);
  }
  function set(x, y, z, obj) {
      obj[0] = x;
      obj[1] = y;
      obj[2] = z;
      return obj;
  }
  function areEqual(v, w) {
      return v === w ||
          typeof v === 'object' && v !== null &&
              typeof w === 'object' && w !== null &&
              v[0] === w[0] && v[1] === w[1] && v[2] === w[2];
  }
  /** Dot product on two vectors */
  function dot(v, w) {
      return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
  }
  /** Cross product on two vectors */
  function cross(v, w, out = create$1()) {
      return set(v[1] * w[2] - v[2] * w[1], v[2] * w[0] - v[0] * w[2], v[0] * w[1] - v[1] * w[0], out);
  }
  function add(v, w, out = create$1()) {
      return set(v[0] + w[0], v[1] + w[1], v[2] + w[2], out);
  }
  function sub(v, w, out = create$1()) {
      return set(v[0] - w[0], v[1] - w[1], v[2] - w[2], out);
  }
  function mul(v, m, out = create$1()) {
      return set(m * v[0], m * v[1], m * v[2], out);
  }
  function neg(v, out = create$1()) {
      return set(-v[0], -v[1], -v[2], out);
  }

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
  /**
   * A 2-by-2 matrix. Stored in column-major order.
   */
  class Mat22 {
      constructor(a, b, c, d) {
          if (typeof a === 'object' && a !== null) {
              this.ex = clone$1(a);
              this.ey = clone$1(b);
          }
          else if (typeof a === 'number') {
              this.ex = create$2(a, c);
              this.ey = create$2(b, d);
          }
          else {
              this.ex = zero$1();
              this.ey = zero$1();
          }
      }
      /** @hidden */
      toString() {
          return JSON.stringify(this);
      }
      static isValid(obj) {
          if (obj === null || typeof obj === 'undefined') {
              return false;
          }
          return isValid$1(obj.ex) && isValid$1(obj.ey);
      }
      static assert(o) {
      }
      set(a, b, c, d) {
          if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number'
              && typeof d === 'number') {
              set$1(a, c, this.ex);
              set$1(b, d, this.ey);
          }
          else if (typeof a === 'object' && typeof b === 'object') {
              copy(a, this.ex);
              copy(b, this.ey);
          }
          else if (typeof a === 'object') {
              copy(a.ex, this.ex);
              copy(a.ey, this.ey);
          }
          else ;
      }
      setIdentity() {
          this.ex[0] = 1.0;
          this.ey[0] = 0.0;
          this.ex[1] = 0.0;
          this.ey[1] = 1.0;
      }
      setZero() {
          this.ex[0] = 0.0;
          this.ey[0] = 0.0;
          this.ex[1] = 0.0;
          this.ey[1] = 0.0;
      }
      getInverse() {
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
      solve(v) {
          const a = this.ex[0];
          const b = this.ey[0];
          const c = this.ex[1];
          const d = this.ey[1];
          let det = a * d - b * c;
          if (det !== 0.0) {
              det = 1.0 / det;
          }
          const w = zero$1();
          w[0] = det * (d * v[0] - b * v[1]);
          w[1] = det * (a * v[1] - c * v[0]);
          return w;
      }
      static mul(mx, v) {
          if (v && 'x' in v && 'y' in v) {
              const x = mx.ex.x * v.x + mx.ey.x * v.y;
              const y = mx.ex.y * v.x + mx.ey.y * v.y;
              return create$2(x, y);
          }
          else if (v && 'ex' in v && 'ey' in v) { // Mat22
              // return new Mat22(Vec2.scale(v.ex, mx), Vec2.scale(v.ey, mx));
              const a = mx.ex.x * v.ex.x + mx.ey.x * v.ex.y;
              const b = mx.ex.x * v.ey.x + mx.ey.x * v.ey.y;
              const c = mx.ex.y * v.ex.x + mx.ey.y * v.ex.y;
              const d = mx.ex.y * v.ey.x + mx.ey.y * v.ey.y;
              return new Mat22(a, b, c, d);
          }
      }
      static mulVec2(mx, v) {
          const x = mx.ex[0] * v[0] + mx.ey[0] * v[1];
          const y = mx.ex[1] * v[0] + mx.ey[1] * v[1];
          return create$2(x, y);
      }
      static mulMat22(mx, v) {
          // return new Mat22(Vec2.scale(v.ex, mx), Vec2.scale(v.ey, mx));
          const a = mx.ex[0] * v.ex[0] + mx.ey[0] * v.ex[1];
          const b = mx.ex[0] * v.ey[0] + mx.ey[0] * v.ey[1];
          const c = mx.ex[1] * v.ex[0] + mx.ey[1] * v.ex[1];
          const d = mx.ex[1] * v.ey[0] + mx.ey[1] * v.ey[1];
          return new Mat22(a, b, c, d);
      }
      static mulT(mx, v) {
          if (v && 'x' in v && 'y' in v) { // Vec2
              return create$2(dot$1(v, mx.ex), dot$1(v, mx.ey));
          }
          else if (v && 'ex' in v && 'ey' in v) { // Mat22
              const c1 = create$2(dot$1(mx.ex, v.ex), dot$1(mx.ey, v.ex));
              const c2 = create$2(dot$1(mx.ex, v.ey), dot$1(mx.ey, v.ey));
              return new Mat22(c1, c2);
          }
      }
      static mulTVec2(mx, v) {
          return create$2(dot$1(v, mx.ex), dot$1(v, mx.ey));
      }
      static mulTMat22(mx, v) {
          const c1 = create$2(dot$1(mx.ex, v.ex), dot$1(mx.ey, v.ex));
          const c2 = create$2(dot$1(mx.ex, v.ey), dot$1(mx.ey, v.ey));
          return new Mat22(c1, c2);
      }
      static abs(mx) {
          return new Mat22(abs(mx.ex), abs(mx.ey));
      }
      static add(mx1, mx2) {
          return new Mat22(add$1(mx1.ex, mx2.ex), add$1(mx1.ey, mx2.ey));
      }
  }

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
  /**
   * A 3-by-3 matrix. Stored in column-major order.
   */
  class Mat33 {
      constructor(a, b, c) {
          if (typeof a === 'object' && a !== null) {
              this.ex = clone(a);
              this.ey = clone(b);
              this.ez = clone(c);
          }
          else {
              this.ex = zero();
              this.ey = zero();
              this.ez = zero();
          }
      }
      /** @hidden */
      toString() {
          return JSON.stringify(this);
      }
      static isValid(obj) {
          if (obj === null || typeof obj === 'undefined') {
              return false;
          }
          return isValid(obj.ex) && isValid(obj.ey) && isValid(obj.ez);
      }
      static assert(o) {
      }
      /**
       * Set this matrix to all zeros.
       */
      setZero() {
          setZero(this.ex);
          setZero(this.ey);
          setZero(this.ez);
          return this;
      }
      /**
       * Solve A * x = b, where b is a column vector. This is more efficient than
       * computing the inverse in one-shot cases.
       */
      solve33(v) {
          // let det = matrix.dotVec3(this.ex, matrix.newCrossVec3(this.ey, this.ez));
          let cross_x = this.ey[1] * this.ez[2] - this.ey[2] * this.ez[1];
          let cross_y = this.ey[2] * this.ez[0] - this.ey[0] * this.ez[2];
          let cross_z = this.ey[0] * this.ez[1] - this.ey[1] * this.ez[0];
          let det = this.ex[0] * cross_x + this.ex[1] * cross_y + this.ex[2] * cross_z;
          if (det !== 0.0) {
              det = 1.0 / det;
          }
          const r = create$1();
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
      solve22(v) {
          const a11 = this.ex[0];
          const a12 = this.ey[0];
          const a21 = this.ex[1];
          const a22 = this.ey[1];
          let det = a11 * a22 - a12 * a21;
          if (det !== 0.0) {
              det = 1.0 / det;
          }
          const r = zero$1();
          r[0] = det * (a22 * v[0] - a12 * v[1]);
          r[1] = det * (a11 * v[1] - a21 * v[0]);
          return r;
      }
      /**
       * Get the inverse of this matrix as a 2-by-2. Returns the zero matrix if
       * singular.
       */
      getInverse22(M) {
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
      getSymInverse33(M) {
          let det = dot(this.ex, cross(this.ey, this.ez));
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
      static mul(a, b) {
          if (b && 'z' in b && 'y' in b && 'x' in b) {
              const x = a.ex.x * b.x + a.ey.x * b.y + a.ez.x * b.z;
              const y = a.ex.y * b.x + a.ey.y * b.y + a.ez.y * b.z;
              const z = a.ex.z * b.x + a.ey.z * b.y + a.ez.z * b.z;
              return create$1(x, y, z);
          }
          else if (b && 'y' in b && 'x' in b) {
              const x = a.ex.x * b.x + a.ey.x * b.y;
              const y = a.ex.y * b.x + a.ey.y * b.y;
              return create$2(x, y);
          }
      }
      static mulVec3(a, b) {
          const x = a.ex[0] * b[0] + a.ey[0] * b[1] + a.ez[0] * b[2];
          const y = a.ex[1] * b[0] + a.ey[1] * b[1] + a.ez[1] * b[2];
          const z = a.ex[2] * b[0] + a.ey[2] * b[1] + a.ez[2] * b[2];
          return create$1(x, y, z);
      }
      static mulVec2(a, b) {
          const x = a.ex[0] * b[0] + a.ey[0] * b[1];
          const y = a.ex[1] * b[0] + a.ey[1] * b[1];
          return create$2(x, y);
      }
      static add(a, b) {
          return new Mat33(add(a.ex, b.ex), add(a.ey, b.ey), add(a.ez, b.ez));
      }
  }

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
  /** @internal */ const math_sin$2 = Math.sin;
  /** @internal */ const math_cos$2 = Math.cos;
  /** @internal */ const math_atan2$2 = Math.atan2;
  class Rot {
      /** Initialize from an angle in radians. */
      constructor(angle) {
          if (typeof angle === 'number') {
              this.setAngle(angle);
          }
          else if (typeof angle === 'object') {
              this.setRot(angle);
          }
          else {
              this.setIdentity();
          }
      }
      /** @hidden */
      static neo(angle) {
          const obj = Object.create(Rot.prototype);
          obj.setAngle(angle);
          return obj;
      }
      static clone(rot) {
          const obj = Object.create(Rot.prototype);
          obj.s = rot.s;
          obj.c = rot.c;
          return obj;
      }
      static identity() {
          const obj = Object.create(Rot.prototype);
          obj.s = 0.0;
          obj.c = 1.0;
          return obj;
      }
      static isValid(obj) {
          if (obj === null || typeof obj === 'undefined') {
              return false;
          }
          return Number.isFinite(obj.s) && Number.isFinite(obj.c);
      }
      static assert(o) {
      }
      /** Set to the identity rotation. */
      setIdentity() {
          this.s = 0.0;
          this.c = 1.0;
      }
      set(angle) {
          if (typeof angle === 'object') {
              this.s = angle.s;
              this.c = angle.c;
          }
          else {
              // TODO_ERIN optimize
              this.s = math_sin$2(angle);
              this.c = math_cos$2(angle);
          }
      }
      setRot(angle) {
          this.s = angle.s;
          this.c = angle.c;
      }
      /** Set using an angle in radians. */
      setAngle(angle) {
          // TODO_ERIN optimize
          this.s = math_sin$2(angle);
          this.c = math_cos$2(angle);
      }
      /** Get the angle in radians. */
      getAngle() {
          return math_atan2$2(this.s, this.c);
      }
      /** Get the x-axis. */
      getXAxis() {
          return create$2(this.c, this.s);
      }
      /** Get the y-axis. */
      getYAxis() {
          return create$2(-this.s, this.c);
      }
      static mul(rot, m) {
          if ('c' in m && 's' in m) {
              // [qc -qs] * [rc -rs] = [qc*rc-qs*rs -qc*rs-qs*rc]
              // [qs qc] [rs rc] [qs*rc+qc*rs -qs*rs+qc*rc]
              // s = qs * rc + qc * rs
              // c = qc * rc - qs * rs
              const qr = Rot.identity();
              qr.s = rot.s * m.c + rot.c * m.s;
              qr.c = rot.c * m.c - rot.s * m.s;
              return qr;
          }
          else if ('x' in m && 'y' in m) {
              return create$2(rot.c * m.x - rot.s * m.y, rot.s * m.x + rot.c * m.y);
          }
      }
      /** Multiply two rotations: q * r */
      static mulRot(rot, m) {
          // [qc -qs] * [rc -rs] = [qc*rc-qs*rs -qc*rs-qs*rc]
          // [qs qc] [rs rc] [qs*rc+qc*rs -qs*rs+qc*rc]
          // s = qs * rc + qc * rs
          // c = qc * rc - qs * rs
          const qr = Rot.identity();
          qr.s = rot.s * m.c + rot.c * m.s;
          qr.c = rot.c * m.c - rot.s * m.s;
          return qr;
      }
      /** Rotate a vector */
      static mulVec2(rot, m) {
          return create$2(rot.c * m[0] - rot.s * m[1], rot.s * m[0] + rot.c * m[1]);
      }
      static mulSub(rot, v, w) {
          const x = rot.c * (v[0] - w[0]) - rot.s * (v[1] - w[1]);
          const y = rot.s * (v[0] - w[0]) + rot.c * (v[1] - w[1]);
          return create$2(x, y);
      }
      static mulT(rot, m) {
          if ('c' in m && 's' in m) {
              // [ qc qs] * [rc -rs] = [qc*rc+qs*rs -qc*rs+qs*rc]
              // [-qs qc] [rs rc] [-qs*rc+qc*rs qs*rs+qc*rc]
              // s = qc * rs - qs * rc
              // c = qc * rc + qs * rs
              const qr = Rot.identity();
              qr.s = rot.c * m.s - rot.s * m.c;
              qr.c = rot.c * m.c + rot.s * m.s;
              return qr;
          }
          else if ('x' in m && 'y' in m) {
              return create$2(rot.c * m.x + rot.s * m.y, -rot.s * m.x + rot.c * m.y);
          }
      }
      /** Transpose multiply two rotations: qT * r */
      static mulTRot(rot, m) {
          // [ qc qs] * [rc -rs] = [qc*rc+qs*rs -qc*rs+qs*rc]
          // [-qs qc] [rs rc] [-qs*rc+qc*rs qs*rs+qc*rc]
          // s = qc * rs - qs * rc
          // c = qc * rc + qs * rs
          const qr = Rot.identity();
          qr.s = rot.c * m.s - rot.s * m.c;
          qr.c = rot.c * m.c + rot.s * m.s;
          return qr;
      }
      /** Inverse rotate a vector */
      static mulTVec2(rot, m) {
          return create$2(rot.c * m[0] + rot.s * m[1], -rot.s * m[0] + rot.c * m[1]);
      }
  }

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
  /**
   * A transform contains translation and rotation. It is used to represent the
   * position and orientation of rigid frames. Initialize using a position vector
   * and a rotation.
   */
  class Transform {
      constructor(position, rotation) {
          this.p = zero$1();
          this.q = Rot.identity();
          if (typeof position !== 'undefined') {
              copy(position, this.p);
          }
          if (typeof rotation !== 'undefined') {
              this.q.setAngle(rotation);
          }
      }
      static clone(xf) {
          const obj = Object.create(Transform.prototype);
          obj.p = clone$1(xf.p);
          obj.q = Rot.clone(xf.q);
          return obj;
      }
      /** @hidden */
      static neo(position, rotation) {
          const obj = Object.create(Transform.prototype);
          obj.p = clone$1(position);
          obj.q = Rot.clone(rotation);
          return obj;
      }
      static identity() {
          const obj = Object.create(Transform.prototype);
          obj.p = zero$1();
          obj.q = Rot.identity();
          return obj;
      }
      /** Set this to the identity transform */
      setIdentity() {
          setZero$1(this.p);
          this.q.setIdentity();
      }
      set(a, b) {
          if (typeof b === 'undefined') {
              copy(a.p, this.p);
              this.q.set(a.q);
          }
          else {
              copy(a, this.p);
              this.q.set(b);
          }
      }
      /** Set position and angle */
      setNum(position, rotation) {
          copy(position, this.p);
          this.q.setAngle(rotation);
      }
      setTransform(xf) {
          copy(xf.p, this.p);
          this.q.setRot(xf.q);
      }
      static isValid(obj) {
          if (obj === null || typeof obj === 'undefined') {
              return false;
          }
          return isValid$1(obj.p) && Rot.isValid(obj.q);
      }
      static assert(o) {
      }
      //static mul(a: TransformValue, b: TransformValue): Transform;
      // static mul(a: Transform, b: Vec2Value[]): Vec2Value[];
      // static mul(a: Transform, b: Transform[]): Transform[];
      static mul(a, b) {
          /*
          if (Array.isArray(b)) {
              // todo: this was used in examples, remove in the future
            false && Transform.assert(a);
            const arr = [];
            for (let i = 0; i < b.length; i++) {
              arr[i] = Transform.mul(a, b[i]);
            }
            return arr;
      
          }
          else if ('x' in b && 'y' in b) {
            */
          return Transform.mulVec2(a, b);
          /*
        }
        else if ('p' in b && 'q' in b) {
          return Transform.mulXf(a, b);
        }
        */
      }
      // MR: seems to be totally unused
      /*
      static mulAll(a: Transform, b: Vec2Value[]): Vec2Value[];
      static mulAll(a: Transform, b: Transform[]): Transform[];
      static mulAll(a: TransformValue, b) {
        false && Transform.assert(a);
        const arr = [];
        for (let i = 0; i < b.length; i++) {
          arr[i] = Transform.mul(a, b[i]);
        }
        return arr;
      }
      */
      /** @hidden @deprecated */
      static mulFn(a) {
          return function (b) {
              return Transform.mul(a, b);
          };
      }
      static mulVec2(a, b) {
          const x = (a.q.c * b[0] - a.q.s * b[1]) + a.p[0];
          const y = (a.q.s * b[0] + a.q.c * b[1]) + a.p[1];
          return create$2(x, y);
      }
      static mulXf(a, b) {
          // v2 = A.q.Rot(B.q.Rot(v1) + B.p) + A.p
          // = (A.q * B.q).Rot(v1) + A.q.Rot(B.p) + A.p
          const xf = Transform.identity();
          xf.q = Rot.mulRot(a.q, b.q);
          xf.p = add$1(Rot.mulVec2(a.q, b.p), a.p);
          return xf;
      }
      static mulT(a, b) {
          if ('x' in b && 'y' in b) {
              return Transform.mulTVec2(a, b);
          }
          else if ('p' in b && 'q' in b) {
              return Transform.mulTXf(a, b);
          }
      }
      static mulTVec2(a, b) {
          const px = b[0] - a.p[0];
          const py = b[1] - a.p[1];
          const x = (a.q.c * px + a.q.s * py);
          const y = (-a.q.s * px + a.q.c * py);
          return create$2(x, y);
      }
      static mulTXf(a, b) {
          // v2 = A.q' * (B.q * v1 + B.p - A.p)
          // = A.q' * B.q * v1 + A.q' * (B.p - A.p)
          const xf = Transform.identity();
          xf.q.setRot(Rot.mulTRot(a.q, b.q));
          copy(Rot.mulTVec2(a.q, sub$1(b.p, a.p)), xf.p);
          return xf;
      }
  }

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
  /** @internal */ const math_max$8 = Math.max;
  /** @internal */ const math_min$8 = Math.min;
  class AABB {
      constructor(lower, upper) {
          this.lowerBound = zero$1();
          this.upperBound = zero$1();
          if (typeof lower === 'object') {
              copy(lower, this.lowerBound);
          }
          if (typeof upper === 'object') {
              copy(upper, this.upperBound);
          }
          else if (typeof lower === 'object') {
              copy(lower, this.upperBound);
          }
      }
      /**
       * Verify that the bounds are sorted.
       */
      isValid() {
          return AABB.isValid(this);
      }
      static isValid(obj) {
          if (obj === null || typeof obj === 'undefined') {
              return false;
          }
          return isValid$1(obj.lowerBound) && isValid$1(obj.upperBound) && lengthSquared(sub$1(obj.upperBound, obj.lowerBound)) >= 0;
      }
      static assert(o) {
      }
      /**
       * Get the center of the AABB.
       */
      getCenter() {
          return create$2((this.lowerBound[0] + this.upperBound[0]) * 0.5, (this.lowerBound[1] + this.upperBound[1]) * 0.5);
      }
      /**
       * Get the extents of the AABB (half-widths).
       */
      getExtents() {
          return create$2((this.upperBound[0] - this.lowerBound[0]) * 0.5, (this.upperBound[1] - this.lowerBound[1]) * 0.5);
      }
      /**
       * Get the perimeter length.
       */
      getPerimeter() {
          return 2.0 * (this.upperBound[0] - this.lowerBound[0] + this.upperBound[1] - this.lowerBound[1]);
      }
      /**
       * Combine one or two AABB into this one.
       */
      combine(a, b) {
          b = b || this;
          const lowerA = a.lowerBound;
          const upperA = a.upperBound;
          const lowerB = b.lowerBound;
          const upperB = b.upperBound;
          const lowerX = math_min$8(lowerA[0], lowerB[0]);
          const lowerY = math_min$8(lowerA[1], lowerB[1]);
          const upperX = math_max$8(upperB[0], upperA[0]);
          const upperY = math_max$8(upperB[1], upperA[1]);
          set$1(lowerX, lowerY, this.lowerBound);
          set$1(upperX, upperY, this.upperBound);
      }
      combinePoints(a, b) {
          set$1(math_min$8(a[0], b[0]), math_min$8(a[1], b[1]), this.lowerBound);
          set$1(math_max$8(a[0], b[0]), math_max$8(a[1], b[1]), this.upperBound);
      }
      set(aabb) {
          set$1(aabb.lowerBound[0], aabb.lowerBound[1], this.lowerBound);
          set$1(aabb.upperBound[0], aabb.upperBound[1], this.upperBound);
      }
      contains(aabb) {
          let result = true;
          result = result && this.lowerBound[0] <= aabb.lowerBound[0];
          result = result && this.lowerBound[1] <= aabb.lowerBound[1];
          result = result && aabb.upperBound[0] <= this.upperBound[0];
          result = result && aabb.upperBound[1] <= this.upperBound[1];
          return result;
      }
      extend(value) {
          AABB.extend(this, value);
          return this;
      }
      static extend(out, value) {
          out.lowerBound[0] -= value;
          out.lowerBound[1] -= value;
          out.upperBound[0] += value;
          out.upperBound[1] += value;
          return out;
      }
      static testOverlap(a, b) {
          const d1x = b.lowerBound[0] - a.upperBound[0];
          const d2x = a.lowerBound[0] - b.upperBound[0];
          const d1y = b.lowerBound[1] - a.upperBound[1];
          const d2y = a.lowerBound[1] - b.upperBound[1];
          if (d1x > 0 || d1y > 0 || d2x > 0 || d2y > 0) {
              return false;
          }
          return true;
      }
      static areEqual(a, b) {
          return areEqual$1(a.lowerBound, b.lowerBound) && areEqual$1(a.upperBound, b.upperBound);
      }
      static diff(a, b) {
          const wD = math_max$8(0, math_min$8(a.upperBound[0], b.upperBound[0]) - math_max$8(b.lowerBound[0], a.lowerBound[0]));
          const hD = math_max$8(0, math_min$8(a.upperBound[1], b.upperBound[1]) - math_max$8(b.lowerBound[1], a.lowerBound[1]));
          const wA = a.upperBound[0] - a.lowerBound[0];
          const hA = a.upperBound[1] - a.lowerBound[1];
          const wB = b.upperBound[0] - b.lowerBound[0];
          const hB = b.upperBound[1] - b.lowerBound[1];
          return wA * hA + wB * hB - wD * hD;
      }
      rayCast(output, input) {
          // From Real-time Collision Detection, p179.
          let tmin = -Infinity;
          let tmax = Infinity;
          const p = input.p1;
          const d = sub$1(input.p2, input.p1);
          const absD = abs(d);
          const normal = zero$1();
          {
              if (absD[0] < EPSILON) {
                  // Parallel.
                  if (p[0] < this.lowerBound[0] || this.upperBound[0] < p[0]) {
                      return false;
                  }
              }
              else {
                  const inv_d = 1.0 / d[0];
                  let t1 = (this.lowerBound[0] - p[0]) * inv_d;
                  let t2 = (this.upperBound[0] - p[0]) * inv_d;
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
                      setZero$1(normal);
                      normal[0] = s;
                      tmin = t1;
                  }
                  // Pull the max down
                  tmax = math_min$8(tmax, t2);
                  if (tmin > tmax) {
                      return false;
                  }
              }
          }
          {
              if (absD[1] < EPSILON) {
                  // Parallel.
                  if (p[1] < this.lowerBound[1] || this.upperBound[1] < p[1]) {
                      return false;
                  }
              }
              else {
                  const inv_d = 1.0 / d[1];
                  let t1 = (this.lowerBound[1] - p[1]) * inv_d;
                  let t2 = (this.upperBound[1] - p[1]) * inv_d;
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
                      setZero$1(normal);
                      normal[1] = s;
                      tmin = t1;
                  }
                  // Pull the max down
                  tmax = math_min$8(tmax, t2);
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
      toString() {
          return JSON.stringify(this);
      }
      static combinePoints(out, a, b) {
          out.lowerBound[0] = math_min$8(a[0], b[0]);
          out.lowerBound[1] = math_min$8(a[1], b[1]);
          out.upperBound[0] = math_max$8(a[0], b[0]);
          out.upperBound[1] = math_max$8(a[1], b[1]);
          return out;
      }
      static combinedPerimeter(a, b) {
          const lx = math_min$8(a.lowerBound[0], b.lowerBound[0]);
          const ly = math_min$8(a.lowerBound[1], b.lowerBound[1]);
          const ux = math_max$8(a.upperBound[0], b.upperBound[0]);
          const uy = math_max$8(a.upperBound[1], b.upperBound[1]);
          return 2.0 * (ux - lx + uy - ly);
      }
  }

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
  // todo make shape an interface
  /**
   * A shape is used for collision detection. You can create a shape however you
   * like. Shapes used for simulation in World are created automatically when a
   * Fixture is created. Shapes may encapsulate one or more child shapes.
   */
  class Shape {
      constructor() {
          /** @hidden @experimental Similar to userData, but used by dev-tools or runtime environment. */
          this.appData = {};
      }
      static isValid(obj) {
          if (obj === null || typeof obj === 'undefined') {
              return false;
          }
          return typeof obj.m_type === 'string' && typeof obj.m_radius === 'number';
      }
  }

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
  /** @internal */ const math_sin$1 = Math.sin;
  /** @internal */ const math_cos$1 = Math.cos;
  /** @internal */ const math_sqrt$6 = Math.sqrt;
  function vec2(x, y) {
      return [x, y];
  }
  function rotation(angle) {
      return { s: math_sin$1(angle), c: math_cos$1(angle) };
  }
  function copyVec2(out, w) {
      out[0] = w[0];
      out[1] = w[1];
      return out;
  }
  function zeroVec2(out) {
      out[0] = 0;
      out[1] = 0;
      return out;
  }
  function negVec2(out) {
      out[0] = -out[0];
      out[1] = -out[1];
      return out;
  }
  function plusVec2(out, w) {
      out[0] += w[0];
      out[1] += w[1];
      return out;
  }
  function addVec2(out, v, w) {
      out[0] = v[0] + w[0];
      out[1] = v[1] + w[1];
      return out;
  }
  function minusVec2(out, w) {
      out[0] -= w[0];
      out[1] -= w[1];
      return out;
  }
  function subVec2(out, v, w) {
      out[0] = v[0] - w[0];
      out[1] = v[1] - w[1];
      return out;
  }
  function mulVec2(out, m) {
      out[0] *= m;
      out[1] *= m;
      return out;
  }
  function scaleVec2(out, m, w) {
      out[0] = m * w[0];
      out[1] = m * w[1];
      return out;
  }
  function plusScaleVec2(out, m, w) {
      out[0] += m * w[0];
      out[1] += m * w[1];
      return out;
  }
  function minusScaleVec2(out, m, w) {
      out[0] -= m * w[0];
      out[1] -= m * w[1];
      return out;
  }
  function combine2Vec2(out, am, a, bm, b) {
      out[0] = am * a[0] + bm * b[0];
      out[1] = am * a[1] + bm * b[1];
      return out;
  }
  function combine3Vec2(out, am, a, bm, b, cm, c) {
      out[0] = am * a[0] + bm * b[0] + cm * c[0];
      out[1] = am * a[1] + bm * b[1] + cm * c[1];
      return out;
  }
  function normalizeVec2Length(out) {
      const length = math_sqrt$6(out[0] * out[0] + out[1] * out[1]);
      if (length !== 0) {
          const invLength = 1 / length;
          out[0] *= invLength;
          out[1] *= invLength;
      }
      return length;
  }
  function normalizeVec2(out) {
      const length = math_sqrt$6(out[0] * out[0] + out[1] * out[1]);
      if (length > 0) {
          const invLength = 1 / length;
          out[0] *= invLength;
          out[1] *= invLength;
      }
      return out;
  }
  function crossVec2Num(out, v, w) {
      const x = w * v[1];
      const y = -w * v[0];
      out[0] = x;
      out[1] = y;
      return out;
  }
  function crossNumVec2(out, w, v) {
      const x = -w * v[1];
      const y = w * v[0];
      out[0] = x;
      out[1] = y;
      return out;
  }
  function crossVec2Vec2(a, b) {
      return a[0] * b[1] - a[1] * b[0];
  }
  function dotVec2(a, b) {
      return a[0] * b[0] + a[1] * b[1];
  }
  function lengthSqrVec2(a) {
      return a[0] * a[0] + a[1] * a[1];
  }
  function distVec2(a, b) {
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      return math_sqrt$6(dx * dx + dy * dy);
  }
  function distSqrVec2(a, b) {
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      return dx * dx + dy * dy;
  }
  function setRotAngle(out, a) {
      out.c = math_cos$1(a);
      out.s = math_sin$1(a);
      return out;
  }
  function rotVec2(out, q, v) {
      out[0] = q.c * v[0] - q.s * v[1];
      out[1] = q.s * v[0] + q.c * v[1];
      return out;
  }
  function derotVec2(out, q, v) {
      const x = q.c * v[0] + q.s * v[1];
      const y = -q.s * v[0] + q.c * v[1];
      out[0] = x;
      out[1] = y;
      return out;
  }
  function rerotVec2(out, before, after, v) {
      const x0 = before.c * v[0] + before.s * v[1];
      const y0 = -before.s * v[0] + before.c * v[1];
      const x = after.c * x0 - after.s * y0;
      const y = after.s * x0 + after.c * y0;
      out[0] = x;
      out[1] = y;
      return out;
  }
  function transform(x, y, a) {
      return { p: vec2(x, y), q: rotation(a) };
  }
  function copyTransform(out, transform) {
      out.p[0] = transform.p[0];
      out.p[1] = transform.p[1];
      out.q.s = transform.q.s;
      out.q.c = transform.q.c;
      return out;
  }
  function transformVec2(out, xf, v) {
      const x = xf.q.c * v[0] - xf.q.s * v[1] + xf.p[0];
      const y = xf.q.s * v[0] + xf.q.c * v[1] + xf.p[1];
      out[0] = x;
      out[1] = y;
      return out;
  }
  function detransformVec2(out, xf, v) {
      const px = v[0] - xf.p[0];
      const py = v[1] - xf.p[1];
      const x = (xf.q.c * px + xf.q.s * py);
      const y = (-xf.q.s * px + xf.q.c * py);
      out[0] = x;
      out[1] = y;
      return out;
  }
  function retransformVec2(out, from, to, v) {
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
  function detransformTransform(out, a, b) {
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

  /** @internal */
  const options = function (input, defaults) {
      if (input === null || typeof input === 'undefined') {
          // tslint:disable-next-line:no-object-literal-type-assertion
          input = {};
      }
      const output = Object.assign({}, input);
      // tslint:disable-next-line:no-for-in
      for (const key in defaults) {
          if (defaults.hasOwnProperty(key) && typeof input[key] === 'undefined') {
              output[key] = defaults[key];
          }
      }
      if (typeof Object.getOwnPropertySymbols === 'function') {
          const symbols = Object.getOwnPropertySymbols(defaults);
          for (let i = 0; i < symbols.length; i++) {
              const symbol = symbols[i];
              if (defaults.propertyIsEnumerable(symbol) && typeof input[symbol] === 'undefined') {
                  output[symbol] = defaults[symbol];
              }
          }
      }
      return output;
  };

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
  /** @internal */ const synchronize_aabb1 = new AABB();
  /** @internal */ const synchronize_aabb2 = new AABB();
  /** @internal */ const displacement = vec2(0, 0);
  /** @internal */ const FixtureDefDefault = {
      userData: null,
      friction: 0.2,
      restitution: 0.0,
      density: 0.0,
      isSensor: false,
      filterGroupIndex: 0,
      filterCategoryBits: 0x0001,
      filterMaskBits: 0xFFFF
  };
  /**
   * This proxy is used internally to connect shape children to the broad-phase.
   */
  class FixtureProxy {
      constructor(fixture, childIndex) {
          this.aabb = new AABB();
          this.fixture = fixture;
          this.childIndex = childIndex;
          this.proxyId;
      }
  }
  /**
   * A fixture is used to attach a shape to a body for collision detection. A
   * fixture inherits its transform from its parent. Fixtures hold additional
   * non-geometric data such as friction, collision filters, etc.
   *
   * To create a new Fixture use {@link Body.createFixture}.
   */
  class Fixture {
      /** @internal */
      constructor(body, shape, def) {
          /** @hidden @experimental Similar to userData, but used by dev-tools or runtime environment. */
          this.appData = {};
          if (shape.shape) {
              def = shape;
              shape = shape.shape;
          }
          else if (typeof def === 'number') {
              def = { density: def };
          }
          def = options(def, FixtureDefDefault);
          this.m_body = body;
          this.m_friction = def.friction;
          this.m_restitution = def.restitution;
          this.m_density = def.density;
          this.m_isSensor = def.isSensor;
          this.m_filterGroupIndex = def.filterGroupIndex;
          this.m_filterCategoryBits = def.filterCategoryBits;
          this.m_filterMaskBits = def.filterMaskBits;
          // TODO validate shape
          this.m_shape = shape; // .clone();
          this.m_next = null;
          this.m_proxies = [];
          this.m_proxyCount = 0;
          // fixture proxies are created here,
          // but they are activate in when a fixture is added to body
          const childCount = this.m_shape.getChildCount();
          for (let i = 0; i < childCount; ++i) {
              this.m_proxies[i] = new FixtureProxy(this, i);
          }
          this.m_userData = def.userData;
      }
      /** @hidden Re-setup fixture. */
      _reset() {
          const body = this.getBody();
          const broadPhase = body.m_world.m_broadPhase;
          this.destroyProxies(broadPhase);
          if (this.m_shape._reset) {
              this.m_shape._reset();
          }
          const childCount = this.m_shape.getChildCount();
          for (let i = 0; i < childCount; ++i) {
              this.m_proxies[i] = new FixtureProxy(this, i);
          }
          this.createProxies(broadPhase, body.m_xf);
          body.resetMassData();
      }
      /** @internal */
      _serialize() {
          return {
              friction: this.m_friction,
              restitution: this.m_restitution,
              density: this.m_density,
              isSensor: this.m_isSensor,
              filterGroupIndex: this.m_filterGroupIndex,
              filterCategoryBits: this.m_filterCategoryBits,
              filterMaskBits: this.m_filterMaskBits,
              shape: this.m_shape,
          };
      }
      /** @internal */
      static _deserialize(data, body, restore) {
          const shape = restore(Shape, data.shape);
          const fixture = shape && new Fixture(body, shape, data);
          return fixture;
      }
      /**
       * Get the type of the child shape. You can use this to down cast to the
       * concrete shape.
       */
      getType() {
          return this.m_shape.m_type;
      }
      /**
       * Get the child shape. You can modify the child shape, however you should not
       * change the number of vertices because this will crash some collision caching
       * mechanisms. Manipulating the shape may lead to non-physical behavior.
       */
      getShape() {
          return this.m_shape;
      }
      /**
       * A sensor shape collects contact information but never generates a collision
       * response.
       */
      isSensor() {
          return this.m_isSensor;
      }
      /**
       * Set if this fixture is a sensor.
       */
      setSensor(sensor) {
          if (sensor != this.m_isSensor) {
              this.m_body.setAwake(true);
              this.m_isSensor = sensor;
          }
      }
      // /**
      //  * Get the contact filtering data.
      //  */
      // getFilterData() {
      //   return this.m_filter;
      // }
      /**
       * Get the user data that was assigned in the fixture definition. Use this to
       * store your application specific data.
       */
      getUserData() {
          return this.m_userData;
      }
      /**
       * Set the user data. Use this to store your application specific data.
       */
      setUserData(data) {
          this.m_userData = data;
      }
      /**
       * Get the parent body of this fixture. This is null if the fixture is not
       * attached.
       */
      getBody() {
          return this.m_body;
      }
      /**
       * Get the next fixture in the parent body's fixture list.
       */
      getNext() {
          return this.m_next;
      }
      /**
       * Get the density of this fixture.
       */
      getDensity() {
          return this.m_density;
      }
      /**
       * Set the density of this fixture. This will _not_ automatically adjust the
       * mass of the body. You must call Body.resetMassData to update the body's mass.
       */
      setDensity(density) {
          this.m_density = density;
      }
      /**
       * Get the coefficient of friction, usually in the range [0,1].
       */
      getFriction() {
          return this.m_friction;
      }
      /**
       * Set the coefficient of friction. This will not change the friction of
       * existing contacts.
       */
      setFriction(friction) {
          this.m_friction = friction;
      }
      /**
       * Get the coefficient of restitution.
       */
      getRestitution() {
          return this.m_restitution;
      }
      /**
       * Set the coefficient of restitution. This will not change the restitution of
       * existing contacts.
       */
      setRestitution(restitution) {
          this.m_restitution = restitution;
      }
      /**
       * Test a point in world coordinates for containment in this fixture.
       */
      testPoint(p) {
          return this.m_shape.testPoint(this.m_body.getTransform(), p);
      }
      /**
       * Cast a ray against this shape.
       */
      rayCast(output, input, childIndex) {
          return this.m_shape.rayCast(output, input, this.m_body.getTransform(), childIndex);
      }
      /**
       * Get the mass data for this fixture. The mass data is based on the density and
       * the shape. The rotational inertia is about the shape's origin. This operation
       * may be expensive.
       */
      getMassData(massData) {
          this.m_shape.computeMass(massData, this.m_density);
      }
      /**
       * Get the fixture's AABB. This AABB may be enlarge and/or stale. If you need a
       * more accurate AABB, compute it using the shape and the body transform.
       */
      getAABB(childIndex) {
          return this.m_proxies[childIndex].aabb;
      }
      /**
       * These support body activation/deactivation.
       */
      createProxies(broadPhase, xf) {
          // Create proxies in the broad-phase.
          this.m_proxyCount = this.m_shape.getChildCount();
          for (let i = 0; i < this.m_proxyCount; ++i) {
              const proxy = this.m_proxies[i];
              this.m_shape.computeAABB(proxy.aabb, xf, i);
              proxy.proxyId = broadPhase.createProxy(proxy.aabb, proxy);
          }
      }
      destroyProxies(broadPhase) {
          // Destroy proxies in the broad-phase.
          for (let i = 0; i < this.m_proxyCount; ++i) {
              const proxy = this.m_proxies[i];
              broadPhase.destroyProxy(proxy.proxyId);
              proxy.proxyId = null;
          }
          this.m_proxyCount = 0;
      }
      /**
       * Updates this fixture proxy in broad-phase (with combined AABB of current and
       * next transformation).
       */
      synchronize(broadPhase, xf1, xf2) {
          for (let i = 0; i < this.m_proxyCount; ++i) {
              const proxy = this.m_proxies[i];
              // Compute an AABB that covers the swept shape (may miss some rotation
              // effect).
              this.m_shape.computeAABB(synchronize_aabb1, xf1, proxy.childIndex);
              this.m_shape.computeAABB(synchronize_aabb2, xf2, proxy.childIndex);
              proxy.aabb.combine(synchronize_aabb1, synchronize_aabb2);
              subVec2(displacement, xf2.p, xf1.p);
              broadPhase.moveProxy(proxy.proxyId, proxy.aabb, displacement);
          }
      }
      /**
       * Set the contact filtering data. This will not update contacts until the next
       * time step when either parent body is active and awake. This automatically
       * calls refilter.
       */
      setFilterData(filter) {
          this.m_filterGroupIndex = filter.groupIndex;
          this.m_filterCategoryBits = filter.categoryBits;
          this.m_filterMaskBits = filter.maskBits;
          this.refilter();
      }
      getFilterGroupIndex() {
          return this.m_filterGroupIndex;
      }
      setFilterGroupIndex(groupIndex) {
          this.m_filterGroupIndex = groupIndex;
          this.refilter();
      }
      getFilterCategoryBits() {
          return this.m_filterCategoryBits;
      }
      setFilterCategoryBits(categoryBits) {
          this.m_filterCategoryBits = categoryBits;
          this.refilter();
      }
      getFilterMaskBits() {
          return this.m_filterMaskBits;
      }
      setFilterMaskBits(maskBits) {
          this.m_filterMaskBits = maskBits;
          this.refilter();
      }
      /**
       * Call this if you want to establish collision that was previously disabled by
       * ContactFilter.
       */
      refilter() {
          if (this.m_body == null) {
              return;
          }
          // Flag associated contacts for filtering.
          let edge = this.m_body.getContactList();
          while (edge) {
              const contact = edge.contact;
              const fixtureA = contact.getFixtureA();
              const fixtureB = contact.getFixtureB();
              if (fixtureA == this || fixtureB == this) {
                  contact.flagForFiltering();
              }
              edge = edge.next;
          }
          const world = this.m_body.getWorld();
          if (world == null) {
              return;
          }
          // Touch each proxy so that new pairs may be created
          const broadPhase = world.m_broadPhase;
          for (let i = 0; i < this.m_proxyCount; ++i) {
              broadPhase.touchProxy(this.m_proxies[i].proxyId);
          }
      }
      /**
       * Implement this method to provide collision filtering, if you want finer
       * control over contact creation.
       *
       * Return true if contact calculations should be performed between these two
       * fixtures.
       *
       * Warning: for performance reasons this is only called when the AABBs begin to
       * overlap.
       */
      shouldCollide(that) {
          if (that.m_filterGroupIndex === this.m_filterGroupIndex && that.m_filterGroupIndex !== 0) {
              return that.m_filterGroupIndex > 0;
          }
          const collideA = (that.m_filterMaskBits & this.m_filterCategoryBits) !== 0;
          const collideB = (that.m_filterCategoryBits & this.m_filterMaskBits) !== 0;
          const collide = collideA && collideB;
          return collide;
      }
  }

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
  /** @internal */ const math_atan2$1 = Math.atan2;
  /** @internal */ const math_PI$7 = Math.PI;
  /** @internal */ const temp$7 = vec2(0, 0);
  /**
   * This describes the motion of a body/shape for TOI computation. Shapes are
   * defined with respect to the body origin, which may not coincide with the
   * center of mass. However, to support dynamics we must interpolate the center
   * of mass position.
   */
  class Sweep {
      constructor() {
          /** Local center of mass position */
          this.localCenter = zero$1();
          /** World center position */
          this.c = zero$1();
          /** World angle */
          this.a = 0;
          /** Fraction of the current time step in the range [0,1], c0 and a0 are c and a at alpha0. */
          this.alpha0 = 0;
          this.c0 = zero$1();
          this.a0 = 0;
      }
      /** @internal */
      recycle() {
          zeroVec2(this.localCenter);
          zeroVec2(this.c);
          this.a = 0;
          this.alpha0 = 0;
          zeroVec2(this.c0);
          this.a0 = 0;
      }
      setTransform(xf) {
          transformVec2(temp$7, xf, this.localCenter);
          copyVec2(this.c, temp$7);
          copyVec2(this.c0, temp$7);
          this.a = this.a0 = math_atan2$1(xf.q.s, xf.q.c);
      }
      setLocalCenter(localCenter, xf) {
          copyVec2(this.localCenter, localCenter);
          transformVec2(temp$7, xf, this.localCenter);
          copyVec2(this.c, temp$7);
          copyVec2(this.c0, temp$7);
      }
      /**
       * Get the interpolated transform at a specific time.
       *
       * @param xf
       * @param beta A factor in [0,1], where 0 indicates alpha0
       */
      getTransform(xf, beta = 0) {
          setRotAngle(xf.q, (1.0 - beta) * this.a0 + beta * this.a);
          combine2Vec2(xf.p, (1.0 - beta), this.c0, beta, this.c);
          // shift to origin
          minusVec2(xf.p, rotVec2(temp$7, xf.q, this.localCenter));
      }
      /**
       * Advance the sweep forward, yielding a new initial state.
       *
       * @param alpha The new initial time
       */
      advance(alpha) {
          const beta = (alpha - this.alpha0) / (1.0 - this.alpha0);
          combine2Vec2(this.c0, beta, this.c, 1 - beta, this.c0);
          this.a0 = beta * this.a + (1 - beta) * this.a0;
          this.alpha0 = alpha;
      }
      forward() {
          this.a0 = this.a;
          copyVec2(this.c0, this.c);
      }
      /**
       * normalize the angles in radians to be between -pi and pi.
       */
      normalize() {
          const a0 = mod(this.a0, -math_PI$7, +math_PI$7);
          this.a -= this.a0 - a0;
          this.a0 = a0;
      }
      set(that) {
          copyVec2(this.localCenter, that.localCenter);
          copyVec2(this.c, that.c);
          this.a = that.a;
          this.alpha0 = that.alpha0;
          copyVec2(this.c0, that.c0);
          this.a0 = that.a0;
      }
  }

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
  class Velocity {
      constructor() {
          /** linear */
          this.v = zero$1();
          /** angular */
          this.w = 0;
      }
  }

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
  /** @internal */ const math_sin = Math.sin;
  /** @internal */ const math_cos = Math.cos;
  class Position {
      constructor() {
          /** location */
          this.c = zero$1();
          /** angle */
          this.a = 0;
      }
      // todo: cache sin/cos
      getTransform(xf, p) {
          // xf.q = rotation(this.a);
          // xf.p = this.c - xf.q * p
          xf.q.c = math_cos(this.a);
          xf.q.s = math_sin(this.a);
          xf.p[0] = this.c[0] - (xf.q.c * p[0] - xf.q.s * p[1]);
          xf.p[1] = this.c[1] - (xf.q.s * p[0] + xf.q.c * p[1]);
          return xf;
      }
  }
  function getTransform(xf, p, c, a) {
      // xf.q = rotation(a);
      // xf.p = this.c - xf.q * p
      xf.q.c = math_cos(a);
      xf.q.s = math_sin(a);
      xf.p[0] = c[0] - (xf.q.c * p[0] - xf.q.s * p[1]);
      xf.p[1] = c[1] - (xf.q.s * p[0] + xf.q.c * p[1]);
      return xf;
  }

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
  /** @internal */ const STATIC = 'static';
  /** @internal */ const KINEMATIC = 'kinematic';
  /** @internal */ const DYNAMIC = 'dynamic';
  /** @internal */ const oldCenter = vec2(0, 0);
  /** @internal */ const localCenter = vec2(0, 0);
  /** @internal */ const shift = vec2(0, 0);
  /** @internal */ const temp$6 = vec2(0, 0);
  /** @internal */ const xf$2 = transform(0, 0, 0);
  /** @internal */ const BodyDefDefault = {
      type: STATIC,
      position: zero$1(),
      angle: 0.0,
      linearVelocity: zero$1(),
      angularVelocity: 0.0,
      linearDamping: 0.0,
      angularDamping: 0.0,
      fixedRotation: false,
      bullet: false,
      gravityScale: 1.0,
      allowSleep: true,
      awake: true,
      active: true,
      userData: null
  };
  /**
   * A rigid body composed of one or more fixtures.
   *
   * To create a new Body use {@link World.createBody}.
   */
  class Body {
      /** @internal */
      constructor(world, def) {
          /** @hidden @experimental Similar to userData, but used by dev-tools or runtime environment. */
          this.appData = {};
          def = options(def, BodyDefDefault);
          this.m_world = world;
          this.m_awakeFlag = def.awake;
          this.m_autoSleepFlag = def.allowSleep;
          this.m_bulletFlag = def.bullet;
          this.m_fixedRotationFlag = def.fixedRotation;
          this.m_activeFlag = def.active;
          this.m_islandFlag = false;
          this.m_toiFlag = false;
          this.m_userData = def.userData;
          this.m_type = def.type;
          if (this.m_type == DYNAMIC) {
              this.m_mass = 1.0;
              this.m_invMass = 1.0;
          }
          else {
              this.m_mass = 0.0;
              this.m_invMass = 0.0;
          }
          // Rotational inertia about the center of mass.
          this.m_I = 0.0;
          this.m_invI = 0.0;
          // the body origin transform
          this.m_xf = Transform.identity();
          copy(def.position, this.m_xf.p);
          this.m_xf.q.setAngle(def.angle);
          // the swept motion for CCD
          this.m_sweep = new Sweep();
          this.m_sweep.setTransform(this.m_xf);
          // position and velocity correction
          this.c_velocity = new Velocity();
          this.c_position = new Position();
          this.m_force = zero$1();
          this.m_torque = 0.0;
          this.m_linearVelocity = clone$1(def.linearVelocity);
          this.m_angularVelocity = def.angularVelocity;
          this.m_linearDamping = def.linearDamping;
          this.m_angularDamping = def.angularDamping;
          this.m_gravityScale = def.gravityScale;
          this.m_sleepTime = 0.0;
          this.m_jointList = null;
          this.m_contactList = null;
          this.m_fixtureList = null;
          this.m_prev = null;
          this.m_next = null;
          this.m_destroyed = false;
      }
      /** @internal */
      _serialize() {
          const fixtures = [];
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              fixtures.push(f);
          }
          return {
              type: this.m_type,
              bullet: this.m_bulletFlag,
              position: this.m_xf.p,
              angle: this.m_xf.q.getAngle(),
              linearVelocity: this.m_linearVelocity,
              angularVelocity: this.m_angularVelocity,
              fixtures,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          const body = new Body(world, data);
          if (data.fixtures) {
              for (let i = data.fixtures.length - 1; i >= 0; i--) {
                  const fixture = restore(Fixture, data.fixtures[i], body);
                  body._addFixture(fixture);
              }
          }
          return body;
      }
      isWorldLocked() {
          return this.m_world && this.m_world.isLocked() ? true : false;
      }
      getWorld() {
          return this.m_world;
      }
      getNext() {
          return this.m_next;
      }
      setUserData(data) {
          this.m_userData = data;
      }
      getUserData() {
          return this.m_userData;
      }
      getFixtureList() {
          return this.m_fixtureList;
      }
      getJointList() {
          return this.m_jointList;
      }
      /**
       * Warning: this list changes during the time step and you may miss some
       * collisions if you don't use ContactListener.
       */
      getContactList() {
          return this.m_contactList;
      }
      isStatic() {
          return this.m_type == STATIC;
      }
      isDynamic() {
          return this.m_type == DYNAMIC;
      }
      isKinematic() {
          return this.m_type == KINEMATIC;
      }
      /**
       * This will alter the mass and velocity.
       */
      setStatic() {
          this.setType(STATIC);
          return this;
      }
      setDynamic() {
          this.setType(DYNAMIC);
          return this;
      }
      setKinematic() {
          this.setType(KINEMATIC);
          return this;
      }
      /**
       * Get the type of the body.
       */
      getType() {
          return this.m_type;
      }
      /**
       * Set the type of the body to "static", "kinematic" or "dynamic".
       * @param type The type of the body.
       */
      setType(type) {
          if (this.isWorldLocked() == true) {
              return;
          }
          if (this.m_type == type) {
              return;
          }
          this.m_type = type;
          this.resetMassData();
          if (this.m_type == STATIC) {
              setZero$1(this.m_linearVelocity);
              this.m_angularVelocity = 0.0;
              this.m_sweep.forward();
              this.synchronizeFixtures();
          }
          this.setAwake(true);
          setZero$1(this.m_force);
          this.m_torque = 0.0;
          // Delete the attached contacts.
          let ce = this.m_contactList;
          while (ce) {
              const ce0 = ce;
              ce = ce.next;
              this.m_world.destroyContact(ce0.contact);
          }
          this.m_contactList = null;
          // Touch the proxies so that new contacts will be created (when appropriate)
          const broadPhase = this.m_world.m_broadPhase;
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              for (let i = 0; i < f.m_proxyCount; ++i) {
                  broadPhase.touchProxy(f.m_proxies[i].proxyId);
              }
          }
      }
      isBullet() {
          return this.m_bulletFlag;
      }
      /**
       * Should this body be treated like a bullet for continuous collision detection?
       */
      setBullet(flag) {
          this.m_bulletFlag = !!flag;
      }
      isSleepingAllowed() {
          return this.m_autoSleepFlag;
      }
      setSleepingAllowed(flag) {
          this.m_autoSleepFlag = !!flag;
          if (this.m_autoSleepFlag == false) {
              this.setAwake(true);
          }
      }
      isAwake() {
          return this.m_awakeFlag;
      }
      /**
       * Set the sleep state of the body. A sleeping body has very low CPU cost.
       *
       * @param flag Set to true to wake the body, false to put it to sleep.
       */
      setAwake(flag) {
          if (flag) {
              this.m_awakeFlag = true;
              this.m_sleepTime = 0.0;
          }
          else {
              this.m_awakeFlag = false;
              this.m_sleepTime = 0.0;
              setZero$1(this.m_linearVelocity);
              this.m_angularVelocity = 0.0;
              setZero$1(this.m_force);
              this.m_torque = 0.0;
          }
      }
      isActive() {
          return this.m_activeFlag;
      }
      /**
       * Set the active state of the body. An inactive body is not simulated and
       * cannot be collided with or woken up. If you pass a flag of true, all fixtures
       * will be added to the broad-phase. If you pass a flag of false, all fixtures
       * will be removed from the broad-phase and all contacts will be destroyed.
       * Fixtures and joints are otherwise unaffected.
       *
       * You may continue to create/destroy fixtures and joints on inactive bodies.
       * Fixtures on an inactive body are implicitly inactive and will not participate
       * in collisions, ray-casts, or queries. Joints connected to an inactive body
       * are implicitly inactive. An inactive body is still owned by a World object
       * and remains
       */
      setActive(flag) {
          if (flag == this.m_activeFlag) {
              return;
          }
          this.m_activeFlag = !!flag;
          if (this.m_activeFlag) {
              // Create all proxies.
              const broadPhase = this.m_world.m_broadPhase;
              for (let f = this.m_fixtureList; f; f = f.m_next) {
                  f.createProxies(broadPhase, this.m_xf);
              }
              // Contacts are created at the beginning of the next
              this.m_world.m_newFixture = true;
          }
          else {
              // Destroy all proxies.
              const broadPhase = this.m_world.m_broadPhase;
              for (let f = this.m_fixtureList; f; f = f.m_next) {
                  f.destroyProxies(broadPhase);
              }
              // Destroy the attached contacts.
              let ce = this.m_contactList;
              while (ce) {
                  const ce0 = ce;
                  ce = ce.next;
                  this.m_world.destroyContact(ce0.contact);
              }
              this.m_contactList = null;
          }
      }
      isFixedRotation() {
          return this.m_fixedRotationFlag;
      }
      /**
       * Set this body to have fixed rotation. This causes the mass to be reset.
       */
      setFixedRotation(flag) {
          if (this.m_fixedRotationFlag == flag) {
              return;
          }
          this.m_fixedRotationFlag = !!flag;
          this.m_angularVelocity = 0.0;
          this.resetMassData();
      }
      /**
       * Get the world transform for the body's origin.
       */
      getTransform() {
          return this.m_xf;
      }
      setTransform(a, b) {
          if (this.isWorldLocked() == true) {
              return;
          }
          if (typeof b === 'number') {
              this.m_xf.setNum(a, b);
          }
          else {
              this.m_xf.setTransform(a);
          }
          this.m_sweep.setTransform(this.m_xf);
          const broadPhase = this.m_world.m_broadPhase;
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              f.synchronize(broadPhase, this.m_xf, this.m_xf);
          }
          this.setAwake(true);
      }
      synchronizeTransform() {
          this.m_sweep.getTransform(this.m_xf, 1);
      }
      /**
       * Update fixtures in broad-phase.
       */
      synchronizeFixtures() {
          this.m_sweep.getTransform(xf$2, 0);
          const broadPhase = this.m_world.m_broadPhase;
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              f.synchronize(broadPhase, xf$2, this.m_xf);
          }
      }
      /**
       * Used in TOI.
       */
      advance(alpha) {
          // Advance to the new safe time. This doesn't sync the broad-phase.
          this.m_sweep.advance(alpha);
          copyVec2(this.m_sweep.c, this.m_sweep.c0);
          this.m_sweep.a = this.m_sweep.a0;
          this.m_sweep.getTransform(this.m_xf, 1);
      }
      /**
       * Get the world position for the body's origin.
       */
      getPosition() {
          return this.m_xf.p;
      }
      setPosition(p) {
          this.setTransform(p, this.m_sweep.a);
      }
      /**
       * Get the current world rotation angle in radians.
       */
      getAngle() {
          return this.m_sweep.a;
      }
      setAngle(angle) {
          this.setTransform(this.m_xf.p, angle);
      }
      /**
       * Get the world position of the center of mass.
       */
      getWorldCenter() {
          return this.m_sweep.c;
      }
      /**
       * Get the local position of the center of mass.
       */
      getLocalCenter() {
          return this.m_sweep.localCenter;
      }
      /**
       * Get the linear velocity of the center of mass.
       *
       * @return the linear velocity of the center of mass.
       */
      getLinearVelocity() {
          return this.m_linearVelocity;
      }
      /**
       * Get the world linear velocity of a world point attached to this body.
       *
       * @param worldPoint A point in world coordinates.
       */
      getLinearVelocityFromWorldPoint(worldPoint) {
          const localCenter = sub$1(worldPoint, this.m_sweep.c);
          return add$1(this.m_linearVelocity, crossNumVec2$1(this.m_angularVelocity, localCenter));
      }
      /**
       * Get the world velocity of a local point.
       *
       * @param localPoint A point in local coordinates.
       */
      getLinearVelocityFromLocalPoint(localPoint) {
          return this.getLinearVelocityFromWorldPoint(this.getWorldPoint(localPoint));
      }
      /**
       * Set the linear velocity of the center of mass.
       *
       * @param v The new linear velocity of the center of mass.
       */
      setLinearVelocity(v) {
          if (this.m_type == STATIC) {
              return;
          }
          if (dot$1(v, v) > 0.0) {
              this.setAwake(true);
          }
          copy(v, this.m_linearVelocity);
      }
      /**
       * Get the angular velocity.
       *
       * @returns the angular velocity in radians/second.
       */
      getAngularVelocity() {
          return this.m_angularVelocity;
      }
      /**
       * Set the angular velocity.
       *
       * @param omega The new angular velocity in radians/second.
       */
      setAngularVelocity(w) {
          if (this.m_type == STATIC) {
              return;
          }
          if (w * w > 0.0) {
              this.setAwake(true);
          }
          this.m_angularVelocity = w;
      }
      getLinearDamping() {
          return this.m_linearDamping;
      }
      setLinearDamping(linearDamping) {
          this.m_linearDamping = linearDamping;
      }
      getAngularDamping() {
          return this.m_angularDamping;
      }
      setAngularDamping(angularDamping) {
          this.m_angularDamping = angularDamping;
      }
      getGravityScale() {
          return this.m_gravityScale;
      }
      /**
       * Scale the gravity applied to this body.
       */
      setGravityScale(scale) {
          this.m_gravityScale = scale;
      }
      /**
       * Get the total mass of the body.
       *
       * @returns The mass, usually in kilograms (kg).
       */
      getMass() {
          return this.m_mass;
      }
      /**
       * Get the rotational inertia of the body about the local origin.
       *
       * @return the rotational inertia, usually in kg-m^2.
       */
      getInertia() {
          return this.m_I + this.m_mass
              * dot$1(this.m_sweep.localCenter, this.m_sweep.localCenter);
      }
      /**
       * Copy the mass data of the body to data.
       */
      getMassData(data) {
          data.mass = this.m_mass;
          data.I = this.getInertia();
          copyVec2(data.center, this.m_sweep.localCenter);
      }
      /**
       * This resets the mass properties to the sum of the mass properties of the
       * fixtures. This normally does not need to be called unless you called
       * SetMassData to override the mass and you later want to reset the mass.
       */
      resetMassData() {
          // Compute mass data from shapes. Each shape has its own density.
          this.m_mass = 0.0;
          this.m_invMass = 0.0;
          this.m_I = 0.0;
          this.m_invI = 0.0;
          zeroVec2(this.m_sweep.localCenter);
          // Static and kinematic bodies have zero mass.
          if (this.isStatic() || this.isKinematic()) {
              copyVec2(this.m_sweep.c0, this.m_xf.p);
              copyVec2(this.m_sweep.c, this.m_xf.p);
              this.m_sweep.a0 = this.m_sweep.a;
              return;
          }
          // Accumulate mass over all fixtures.
          zeroVec2(localCenter);
          for (let f = this.m_fixtureList; f; f = f.m_next) {
              if (f.m_density == 0.0) {
                  continue;
              }
              const massData = {
                  mass: 0,
                  center: vec2(0, 0),
                  I: 0
              };
              f.getMassData(massData);
              this.m_mass += massData.mass;
              plusScaleVec2(localCenter, massData.mass, massData.center);
              this.m_I += massData.I;
          }
          // Compute center of mass.
          if (this.m_mass > 0.0) {
              this.m_invMass = 1.0 / this.m_mass;
              scaleVec2(localCenter, this.m_invMass, localCenter);
          }
          else {
              // Force all dynamic bodies to have a positive mass.
              this.m_mass = 1.0;
              this.m_invMass = 1.0;
          }
          if (this.m_I > 0.0 && this.m_fixedRotationFlag == false) {
              // Center the inertia about the center of mass.
              this.m_I -= this.m_mass * dotVec2(localCenter, localCenter);
              this.m_invI = 1.0 / this.m_I;
          }
          else {
              this.m_I = 0.0;
              this.m_invI = 0.0;
          }
          // Move center of mass.
          copyVec2(oldCenter, this.m_sweep.c);
          this.m_sweep.setLocalCenter(localCenter, this.m_xf);
          // Update center of mass velocity.
          subVec2(shift, this.m_sweep.c, oldCenter);
          crossNumVec2(temp$6, this.m_angularVelocity, shift);
          plusVec2(this.m_linearVelocity, temp$6);
      }
      /**
       * Set the mass properties to override the mass properties of the fixtures. Note
       * that this changes the center of mass position. Note that creating or
       * destroying fixtures can also alter the mass. This function has no effect if
       * the body isn't dynamic.
       *
       * @param massData The mass properties.
       */
      setMassData(massData) {
          if (this.isWorldLocked() == true) {
              return;
          }
          if (this.m_type != DYNAMIC) {
              return;
          }
          this.m_invMass = 0.0;
          this.m_I = 0.0;
          this.m_invI = 0.0;
          this.m_mass = massData.mass;
          if (this.m_mass <= 0.0) {
              this.m_mass = 1.0;
          }
          this.m_invMass = 1.0 / this.m_mass;
          if (massData.I > 0.0 && this.m_fixedRotationFlag == false) {
              this.m_I = massData.I - this.m_mass * dotVec2(massData.center, massData.center);
              this.m_invI = 1.0 / this.m_I;
          }
          // Move center of mass.
          copyVec2(oldCenter, this.m_sweep.c);
          this.m_sweep.setLocalCenter(massData.center, this.m_xf);
          // Update center of mass velocity.
          subVec2(shift, this.m_sweep.c, oldCenter);
          crossNumVec2(temp$6, this.m_angularVelocity, shift);
          plusVec2(this.m_linearVelocity, temp$6);
      }
      /**
       * Apply a force at a world point. If the force is not applied at the center of
       * mass, it will generate a torque and affect the angular velocity. This wakes
       * up the body.
       *
       * @param force The world force vector, usually in Newtons (N).
       * @param point The world position of the point of application.
       * @param wake Also wake up the body
       */
      applyForce(force, point, wake = true) {
          if (this.m_type != DYNAMIC) {
              return;
          }
          if (wake && this.m_awakeFlag == false) {
              this.setAwake(true);
          }
          // Don't accumulate a force if the body is sleeping.
          if (this.m_awakeFlag) {
              add$1(this.m_force, force, this.m_force);
              this.m_torque += crossVec2Vec2$1(sub$1(point, this.m_sweep.c), force);
          }
      }
      /**
       * Apply a force to the center of mass. This wakes up the body.
       *
       * @param force The world force vector, usually in Newtons (N).
       * @param wake Also wake up the body
       */
      applyForceToCenter(force, wake = true) {
          if (this.m_type != DYNAMIC) {
              return;
          }
          if (wake && this.m_awakeFlag == false) {
              this.setAwake(true);
          }
          // Don't accumulate a force if the body is sleeping
          if (this.m_awakeFlag) {
              add$1(this.m_force, force, this.m_force);
          }
      }
      /**
       * Apply a torque. This affects the angular velocity without affecting the
       * linear velocity of the center of mass. This wakes up the body.
       *
       * @param torque About the z-axis (out of the screen), usually in N-m.
       * @param wake Also wake up the body
       */
      applyTorque(torque, wake = true) {
          if (this.m_type != DYNAMIC) {
              return;
          }
          if (wake && this.m_awakeFlag == false) {
              this.setAwake(true);
          }
          // Don't accumulate a force if the body is sleeping
          if (this.m_awakeFlag) {
              this.m_torque += torque;
          }
      }
      /**
       * Apply an impulse at a point. This immediately modifies the velocity. It also
       * modifies the angular velocity if the point of application is not at the
       * center of mass. This wakes up the body.
       *
       * @param impulse The world impulse vector, usually in N-seconds or kg-m/s.
       * @param point The world position of the point of application.
       * @param wake Also wake up the body
       */
      applyLinearImpulse(impulse, point, wake = true) {
          if (this.m_type != DYNAMIC) {
              return;
          }
          if (wake && this.m_awakeFlag == false) {
              this.setAwake(true);
          }
          // Don't accumulate velocity if the body is sleeping
          if (this.m_awakeFlag) {
              addMul(this.m_linearVelocity, this.m_invMass, impulse, this.m_linearVelocity);
              this.m_angularVelocity += this.m_invI * crossVec2Vec2$1(sub$1(point, this.m_sweep.c), impulse);
          }
      }
      /**
       * Apply an angular impulse.
       *
       * @param impulse The angular impulse in units of kg*m*m/s
       * @param wake Also wake up the body
       */
      applyAngularImpulse(impulse, wake = true) {
          if (this.m_type != DYNAMIC) {
              return;
          }
          if (wake && this.m_awakeFlag == false) {
              this.setAwake(true);
          }
          // Don't accumulate velocity if the body is sleeping
          if (this.m_awakeFlag) {
              this.m_angularVelocity += this.m_invI * impulse;
          }
      }
      /**
       * This is used to test if two bodies should collide.
       *
       * Bodies do not collide when:
       * - Neither of them is dynamic
       * - They are connected by a joint with collideConnected == false
       */
      shouldCollide(that) {
          // At least one body should be dynamic.
          if (this.m_type != DYNAMIC && that.m_type != DYNAMIC) {
              return false;
          }
          // Does a joint prevent collision?
          for (let jn = this.m_jointList; jn; jn = jn.next) {
              if (jn.other == that) {
                  if (jn.joint.m_collideConnected == false) {
                      return false;
                  }
              }
          }
          return true;
      }
      /** @internal Used for deserialize. */
      _addFixture(fixture) {
          if (this.isWorldLocked() == true) {
              return null;
          }
          if (this.m_activeFlag) {
              const broadPhase = this.m_world.m_broadPhase;
              fixture.createProxies(broadPhase, this.m_xf);
          }
          fixture.m_next = this.m_fixtureList;
          this.m_fixtureList = fixture;
          // Adjust mass properties if needed.
          if (fixture.m_density > 0.0) {
              this.resetMassData();
          }
          // Let the world know we have a new fixture. This will cause new contacts
          // to be created at the beginning of the next time step.
          this.m_world.m_newFixture = true;
          return fixture;
      }
      // tslint:disable-next-line:typedef
      createFixture(shape, fixdef) {
          if (this.isWorldLocked() == true) {
              return null;
          }
          const fixture = new Fixture(this, shape, fixdef);
          this._addFixture(fixture);
          this.m_world.publish('add-fixture', fixture);
          return fixture;
      }
      /**
       * Destroy a fixture. This removes the fixture from the broad-phase and destroys
       * all contacts associated with this fixture. This will automatically adjust the
       * mass of the body if the body is dynamic and the fixture has positive density.
       * All fixtures attached to a body are implicitly destroyed when the body is
       * destroyed.
       *
       * Warning: This function is locked when a world simulation step is in progress. Use queueUpdate to schedule a function to be called after the step.
       *
       * @param fixture The fixture to be removed.
       */
      destroyFixture(fixture) {
          if (this.isWorldLocked() == true) {
              return;
          }
          if (this.m_fixtureList === fixture) {
              this.m_fixtureList = fixture.m_next;
          }
          else {
              let node = this.m_fixtureList;
              while (node != null) {
                  if (node.m_next === fixture) {
                      node.m_next = fixture.m_next;
                      break;
                  }
                  node = node.m_next;
              }
          }
          // Destroy any contacts associated with the fixture.
          let edge = this.m_contactList;
          while (edge) {
              const c = edge.contact;
              edge = edge.next;
              const fixtureA = c.getFixtureA();
              const fixtureB = c.getFixtureB();
              if (fixture == fixtureA || fixture == fixtureB) {
                  // This destroys the contact and removes it from
                  // this body's contact list.
                  this.m_world.destroyContact(c);
              }
          }
          if (this.m_activeFlag) {
              const broadPhase = this.m_world.m_broadPhase;
              fixture.destroyProxies(broadPhase);
          }
          fixture.m_body = null;
          fixture.m_next = null;
          this.m_world.publish('remove-fixture', fixture);
          // Reset the mass data.
          this.resetMassData();
      }
      /**
       * Get the corresponding world point of a local point.
       */
      getWorldPoint(localPoint) {
          return Transform.mulVec2(this.m_xf, localPoint);
      }
      /**
       * Get the corresponding world vector of a local vector.
       */
      getWorldVector(localVector) {
          return Rot.mulVec2(this.m_xf.q, localVector);
      }
      /**
       * Gets the corresponding local point of a world point.
       */
      getLocalPoint(worldPoint) {
          return Transform.mulTVec2(this.m_xf, worldPoint);
      }
      /**
       * Gets the corresponding local vector of a world vector.
       */
      getLocalVector(worldVector) {
          return Rot.mulTVec2(this.m_xf.q, worldVector);
      }
  }
  /**
   * A static body does not move under simulation and behaves as if it has infinite mass.
   * Internally, zero is stored for the mass and the inverse mass.
   * Static bodies can be moved manually by the user.
   * A static body has zero velocity.
   * Static bodies do not collide with other static or kinematic bodies.
   */
  Body.STATIC = 'static';
  /**
   * A kinematic body moves under simulation according to its velocity.
   * Kinematic bodies do not respond to forces.
   * They can be moved manually by the user, but normally a kinematic body is moved by setting its velocity.
   * A kinematic body behaves as if it has infinite mass, however, zero is stored for the mass and the inverse mass.
   * Kinematic bodies do not collide with other kinematic or static bodies.
   */
  Body.KINEMATIC = 'kinematic';
  /**
   * A dynamic body is fully simulated.
   * They can be moved manually by the user, but normally they move according to forces.
   * A dynamic body can collide with all body types.
   * A dynamic body always has finite, non-zero mass.
   * If you try to set the mass of a dynamic body to zero, it will automatically acquire a mass of one kilogram and it won't rotate.
   */
  Body.DYNAMIC = 'dynamic';

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
  /** @internal */ const math_PI$6 = Math.PI;
  /**
   * Tuning constants based on meters-kilograms-seconds (MKS) units.
   *
   * Some tolerances are absolute and some are relative. Absolute tolerances use MKS units.
   */
  class Settings {
      /**
       * The radius of the polygon/edge shape skin. This should not be modified.
       * Making this smaller means polygons will have an insufficient buffer for
       * continuous collision. Making it larger may create artifacts for vertex
       * collision.
       */
      static get polygonRadius() { return 2.0 * Settings.linearSlop; }
  }
  /**
   * You can use this to change the length scale used by your game.
   *
   * For example for inches you could use 39.4.
   */
  Settings.lengthUnitsPerMeter = 1.0;
  // Collision
  /**
   * The maximum number of contact points between two convex shapes. Do not change
   * this value.
   */
  Settings.maxManifoldPoints = 2;
  /**
   * The maximum number of vertices on a convex polygon. You cannot increase this
   * too much because BlockAllocator has a maximum object size.
   */
  Settings.maxPolygonVertices = 12;
  /**
   * This is used to fatten AABBs in the dynamic tree. This allows proxies to move
   * by a small amount without triggering a tree adjustment. This is in meters.
   */
  Settings.aabbExtension = 0.1;
  /**
   * This is used to fatten AABBs in the dynamic tree. This is used to predict the
   * future position based on the current displacement. This is a dimensionless
   * multiplier.
   */
  Settings.aabbMultiplier = 2.0;
  /**
   * A small length used as a collision and constraint tolerance. Usually it is
   * chosen to be numerically significant, but visually insignificant.
   */
  Settings.linearSlop = 0.005;
  /**
   * A small angle used as a collision and constraint tolerance. Usually it is
   * chosen to be numerically significant, but visually insignificant.
   */
  Settings.angularSlop = (2.0 / 180.0 * math_PI$6);
  /**
   * Maximum number of sub-steps per contact in continuous physics simulation.
   */
  Settings.maxSubSteps = 8;
  // Dynamics
  /**
   * Maximum number of contacts to be handled to solve a TOI impact.
   */
  Settings.maxTOIContacts = 32;
  /**
   * Maximum iterations to solve a TOI.
   */
  Settings.maxTOIIterations = 20;
  /**
   * Maximum iterations to find Distance.
   */
  Settings.maxDistanceIterations = 20;
  /**
   * A velocity threshold for elastic collisions. Any collision with a relative
   * linear velocity below this threshold will be treated as inelastic.
   */
  Settings.velocityThreshold = 1.0;
  /**
   * The maximum linear position correction used when solving constraints. This
   * helps to prevent overshoot.
   */
  Settings.maxLinearCorrection = 0.2;
  /**
   * The maximum angular position correction used when solving constraints. This
   * helps to prevent overshoot.
   */
  Settings.maxAngularCorrection = (8.0 / 180.0 * math_PI$6);
  /**
   * The maximum linear velocity of a body. This limit is very large and is used
   * to prevent numerical problems. You shouldn't need to adjust Settings.
   */
  Settings.maxTranslation = 2.0;
  /**
   * The maximum angular velocity of a body. This limit is very large and is used
   * to prevent numerical problems. You shouldn't need to adjust Settings.
   */
  Settings.maxRotation = (0.5 * math_PI$6);
  /**
   * This scale factor controls how fast overlap is resolved. Ideally this would
   * be 1 so that overlap is removed in one time step. However using values close
   * to 1 often lead to overshoot.
   */
  Settings.baumgarte = 0.2;
  Settings.toiBaugarte = 0.75;
  // Sleep
  /**
   * The time that a body must be still before it will go to sleep.
   */
  Settings.timeToSleep = 0.5;
  /**
   * A body cannot sleep if its linear velocity is above this tolerance.
   */
  Settings.linearSleepTolerance = 0.01;
  /**
   * A body cannot sleep if its angular velocity is above this tolerance.
   */
  Settings.angularSleepTolerance = (2.0 / 180.0 * math_PI$6);
  /** @internal */
  class SettingsInternal {
      static get maxManifoldPoints() {
          return Settings.maxManifoldPoints;
      }
      static get maxPolygonVertices() {
          return Settings.maxPolygonVertices;
      }
      static get aabbExtension() {
          return Settings.aabbExtension * Settings.lengthUnitsPerMeter;
      }
      static get aabbMultiplier() {
          return Settings.aabbMultiplier;
      }
      static get linearSlop() {
          return Settings.linearSlop * Settings.lengthUnitsPerMeter;
      }
      static get linearSlopSquared() {
          return Settings.linearSlop * Settings.lengthUnitsPerMeter * Settings.linearSlop * Settings.lengthUnitsPerMeter;
      }
      static get angularSlop() {
          return Settings.angularSlop;
      }
      static get polygonRadius() {
          return 2.0 * Settings.linearSlop;
      }
      static get maxSubSteps() {
          return Settings.maxSubSteps;
      }
      static get maxTOIContacts() {
          return Settings.maxTOIContacts;
      }
      static get maxTOIIterations() {
          return Settings.maxTOIIterations;
      }
      static get maxDistanceIterations() {
          return Settings.maxDistanceIterations;
      }
      static get velocityThreshold() {
          return Settings.velocityThreshold * Settings.lengthUnitsPerMeter;
      }
      static get maxLinearCorrection() {
          return Settings.maxLinearCorrection * Settings.lengthUnitsPerMeter;
      }
      static get maxAngularCorrection() {
          return Settings.maxAngularCorrection;
      }
      static get maxTranslation() {
          return Settings.maxTranslation * Settings.lengthUnitsPerMeter;
      }
      static get maxTranslationSquared() {
          return Settings.maxTranslation * Settings.lengthUnitsPerMeter * Settings.maxTranslation * Settings.lengthUnitsPerMeter;
      }
      static get maxRotation() {
          return Settings.maxRotation;
      }
      static get maxRotationSquared() {
          return Settings.maxRotation * Settings.maxRotation;
      }
      static get baumgarte() {
          return Settings.baumgarte;
      }
      static get toiBaugarte() {
          return Settings.toiBaugarte;
      }
      static get timeToSleep() {
          return Settings.timeToSleep;
      }
      static get linearSleepTolerance() {
          return Settings.linearSleepTolerance * Settings.lengthUnitsPerMeter;
      }
      static get linearSleepToleranceSqr() {
          return Settings.linearSleepTolerance * Settings.lengthUnitsPerMeter * Settings.linearSleepTolerance * Settings.lengthUnitsPerMeter;
      }
      static get angularSleepTolerance() {
          return Settings.angularSleepTolerance;
      }
      static get angularSleepToleranceSqr() {
          return Settings.angularSleepTolerance * Settings.angularSleepTolerance;
      }
  }

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
  /** @internal */ const math_sqrt$5 = Math.sqrt;
  /** @internal */ const pointA$2 = vec2(0, 0);
  /** @internal */ const pointB$2 = vec2(0, 0);
  /** @internal */ const temp$5 = vec2(0, 0);
  /** @internal */ const cA$1 = vec2(0, 0);
  /** @internal */ const cB$1 = vec2(0, 0);
  /** @internal */ const dist = vec2(0, 0);
  /** @internal */ const planePoint$2 = vec2(0, 0);
  /** @internal */ const clipPoint$1 = vec2(0, 0);
  exports.ManifoldType = void 0;
  (function (ManifoldType) {
      ManifoldType[ManifoldType["e_unset"] = -1] = "e_unset";
      ManifoldType[ManifoldType["e_circles"] = 0] = "e_circles";
      ManifoldType[ManifoldType["e_faceA"] = 1] = "e_faceA";
      ManifoldType[ManifoldType["e_faceB"] = 2] = "e_faceB";
  })(exports.ManifoldType || (exports.ManifoldType = {}));
  exports.ContactFeatureType = void 0;
  (function (ContactFeatureType) {
      ContactFeatureType[ContactFeatureType["e_unset"] = -1] = "e_unset";
      ContactFeatureType[ContactFeatureType["e_vertex"] = 0] = "e_vertex";
      ContactFeatureType[ContactFeatureType["e_face"] = 1] = "e_face";
  })(exports.ContactFeatureType || (exports.ContactFeatureType = {}));
  /**
   * This is used for determining the state of contact points.
   */
  exports.PointState = void 0;
  (function (PointState) {
      /** Point does not exist */
      PointState[PointState["nullState"] = 0] = "nullState";
      /** Point was added in the update */
      PointState[PointState["addState"] = 1] = "addState";
      /** Point persisted across the update */
      PointState[PointState["persistState"] = 2] = "persistState";
      /** Point was removed in the update */
      PointState[PointState["removeState"] = 3] = "removeState";
  })(exports.PointState || (exports.PointState = {}));
  /**
   * Used for computing contact manifolds.
   */
  class ClipVertex {
      constructor() {
          this.v = vec2(0, 0);
          this.id = new ContactID();
      }
      set(o) {
          copyVec2(this.v, o.v);
          this.id.set(o.id);
      }
      recycle() {
          zeroVec2(this.v);
          this.id.recycle();
      }
  }
  /**
   * A manifold for two touching convex shapes. Manifolds are created in `evaluate`
   * method of Contact subclasses.
   *
   * Supported manifold types are e_faceA or e_faceB for clip point versus plane
   * with radius and e_circles point versus point with radius.
   *
   * We store contacts in this way so that position correction can account for
   * movement, which is critical for continuous physics. All contact scenarios
   * must be expressed in one of these types. This structure is stored across time
   * steps, so we keep it small.
   */
  class Manifold {
      constructor() {
          /**
           * Usage depends on manifold type:
           * - circles: not used
           * - faceA: the normal on polygonA
           * - faceB: the normal on polygonB
           */
          this.localNormal = vec2(0, 0);
          /**
           * Usage depends on manifold type:
           * - circles: the local center of circleA
           * - faceA: the center of faceA
           * - faceB: the center of faceB
           */
          this.localPoint = vec2(0, 0);
          /** The points of contact */
          this.points = [new ManifoldPoint(), new ManifoldPoint()];
          /** The number of manifold points */
          this.pointCount = 0;
      }
      set(that) {
          this.type = that.type;
          copyVec2(this.localNormal, that.localNormal);
          copyVec2(this.localPoint, that.localPoint);
          this.pointCount = that.pointCount;
          this.points[0].set(that.points[0]);
          this.points[1].set(that.points[1]);
      }
      recycle() {
          this.type = exports.ManifoldType.e_unset;
          zeroVec2(this.localNormal);
          zeroVec2(this.localPoint);
          this.pointCount = 0;
          this.points[0].recycle();
          this.points[1].recycle();
      }
      /**
       * Evaluate the manifold with supplied transforms. This assumes modest motion
       * from the original state. This does not change the point count, impulses, etc.
       * The radii must come from the shapes that generated the manifold.
       */
      getWorldManifold(wm, xfA, radiusA, xfB, radiusB) {
          if (this.pointCount == 0) {
              return wm;
          }
          wm = wm || new WorldManifold();
          wm.pointCount = this.pointCount;
          const normal = wm.normal;
          const points = wm.points;
          const separations = wm.separations;
          switch (this.type) {
              case exports.ManifoldType.e_circles: {
                  set$1(1.0, 0.0, normal);
                  const manifoldPoint = this.points[0];
                  transformVec2(pointA$2, xfA, this.localPoint);
                  transformVec2(pointB$2, xfB, manifoldPoint.localPoint);
                  subVec2(dist, pointB$2, pointA$2);
                  const lengthSqr = lengthSqrVec2(dist);
                  if (lengthSqr > EPSILON * EPSILON) {
                      const length = math_sqrt$5(lengthSqr);
                      scaleVec2(normal, 1 / length, dist);
                  }
                  combine2Vec2(cA$1, 1, pointA$2, radiusA, normal);
                  combine2Vec2(cB$1, 1, pointB$2, -radiusB, normal);
                  combine2Vec2(points[0], 0.5, cA$1, 0.5, cB$1);
                  separations[0] = dotVec2(subVec2(temp$5, cB$1, cA$1), normal);
                  break;
              }
              case exports.ManifoldType.e_faceA: {
                  rotVec2(normal, xfA.q, this.localNormal);
                  transformVec2(planePoint$2, xfA, this.localPoint);
                  for (let i = 0; i < this.pointCount; ++i) {
                      const manifoldPoint = this.points[i];
                      transformVec2(clipPoint$1, xfB, manifoldPoint.localPoint);
                      combine2Vec2(cA$1, 1, clipPoint$1, radiusA - dotVec2(subVec2(temp$5, clipPoint$1, planePoint$2), normal), normal);
                      combine2Vec2(cB$1, 1, clipPoint$1, -radiusB, normal);
                      combine2Vec2(points[i], 0.5, cA$1, 0.5, cB$1);
                      separations[i] = dotVec2(subVec2(temp$5, cB$1, cA$1), normal);
                  }
                  break;
              }
              case exports.ManifoldType.e_faceB: {
                  rotVec2(normal, xfB.q, this.localNormal);
                  transformVec2(planePoint$2, xfB, this.localPoint);
                  for (let i = 0; i < this.pointCount; ++i) {
                      const manifoldPoint = this.points[i];
                      transformVec2(clipPoint$1, xfA, manifoldPoint.localPoint);
                      combine2Vec2(cB$1, 1, clipPoint$1, radiusB - dotVec2(subVec2(temp$5, clipPoint$1, planePoint$2), normal), normal);
                      combine2Vec2(cA$1, 1, clipPoint$1, -radiusA, normal);
                      combine2Vec2(points[i], 0.5, cA$1, 0.5, cB$1);
                      separations[i] = dotVec2(subVec2(temp$5, cA$1, cB$1), normal);
                  }
                  // Ensure normal points from A to B.
                  negVec2(normal);
                  break;
              }
          }
          return wm;
      }
  }
  Manifold.clipSegmentToLine = clipSegmentToLine;
  Manifold.ClipVertex = ClipVertex;
  Manifold.getPointStates = getPointStates;
  Manifold.PointState = exports.PointState;
  /**
   * A manifold point is a contact point belonging to a contact manifold. It holds
   * details related to the geometry and dynamics of the contact points.
   *
   * This structure is stored across time steps, so we keep it small.
   *
   * Note: impulses are used for internal caching and may not provide reliable
   * contact forces, especially for high speed collisions.
   */
  class ManifoldPoint {
      constructor() {
          /**
           * Usage depends on manifold type:
           * - circles: the local center of circleB
           * - faceA: the local center of circleB or the clip point of polygonB
           * - faceB: the clip point of polygonA
           */
          this.localPoint = vec2(0, 0);
          /**
           * The non-penetration impulse
           */
          this.normalImpulse = 0;
          /**
           * The friction impulse
           */
          this.tangentImpulse = 0;
          /**
           * Uniquely identifies a contact point between two shapes to facilitate warm starting
           */
          this.id = new ContactID();
      }
      set(that) {
          copyVec2(this.localPoint, that.localPoint);
          this.normalImpulse = that.normalImpulse;
          this.tangentImpulse = that.tangentImpulse;
          this.id.set(that.id);
      }
      recycle() {
          zeroVec2(this.localPoint);
          this.normalImpulse = 0;
          this.tangentImpulse = 0;
          this.id.recycle();
      }
  }
  /**
   * Contact ids to facilitate warm starting.
   *
   * ContactFeature: The features that intersect to form the contact point.
   */
  class ContactID {
      constructor() {
          /**
           * Used to quickly compare contact ids.
           */
          this.key = -1;
          /** ContactFeature index on shapeA */
          this.indexA = -1;
          /** ContactFeature index on shapeB */
          this.indexB = -1;
          /** ContactFeature type on shapeA */
          this.typeA = exports.ContactFeatureType.e_unset;
          /** ContactFeature type on shapeB */
          this.typeB = exports.ContactFeatureType.e_unset;
      }
      setFeatures(indexA, typeA, indexB, typeB) {
          this.indexA = indexA;
          this.indexB = indexB;
          this.typeA = typeA;
          this.typeB = typeB;
          this.key = this.indexA + this.indexB * 4 + this.typeA * 16 + this.typeB * 64;
      }
      set(that) {
          this.indexA = that.indexA;
          this.indexB = that.indexB;
          this.typeA = that.typeA;
          this.typeB = that.typeB;
          this.key = this.indexA + this.indexB * 4 + this.typeA * 16 + this.typeB * 64;
      }
      swapFeatures() {
          const indexA = this.indexA;
          const indexB = this.indexB;
          const typeA = this.typeA;
          const typeB = this.typeB;
          this.indexA = indexB;
          this.indexB = indexA;
          this.typeA = typeB;
          this.typeB = typeA;
          this.key = this.indexA + this.indexB * 4 + this.typeA * 16 + this.typeB * 64;
      }
      recycle() {
          this.indexA = 0;
          this.indexB = 0;
          this.typeA = exports.ContactFeatureType.e_unset;
          this.typeB = exports.ContactFeatureType.e_unset;
          this.key = -1;
      }
  }
  /**
   * This is used to compute the current state of a contact manifold.
   */
  class WorldManifold {
      constructor() {
          /** World vector pointing from A to B */
          this.normal = vec2(0, 0);
          /** World contact point (point of intersection) */
          this.points = [vec2(0, 0), vec2(0, 0)]; // [maxManifoldPoints]
          /** A negative value indicates overlap, in meters */
          this.separations = [0, 0]; // [maxManifoldPoints]
          /** The number of manifold points */
          this.pointCount = 0;
      }
      recycle() {
          zeroVec2(this.normal);
          zeroVec2(this.points[0]);
          zeroVec2(this.points[1]);
          this.separations[0] = 0;
          this.separations[1] = 0;
          this.pointCount = 0;
      }
  }
  /**
   * Compute the point states given two manifolds. The states pertain to the
   * transition from manifold1 to manifold2. So state1 is either persist or remove
   * while state2 is either add or persist.
   */
  function getPointStates(state1, state2, manifold1, manifold2) {
      // state1, state2: PointState[Settings.maxManifoldPoints]
      // for (var i = 0; i < Settings.maxManifoldPoints; ++i) {
      // state1[i] = PointState.nullState;
      // state2[i] = PointState.nullState;
      // }
      // Detect persists and removes.
      for (let i = 0; i < manifold1.pointCount; ++i) {
          const id = manifold1.points[i].id;
          state1[i] = exports.PointState.removeState;
          for (let j = 0; j < manifold2.pointCount; ++j) {
              if (manifold2.points[j].id.key === id.key) {
                  state1[i] = exports.PointState.persistState;
                  break;
              }
          }
      }
      // Detect persists and adds.
      for (let i = 0; i < manifold2.pointCount; ++i) {
          const id = manifold2.points[i].id;
          state2[i] = exports.PointState.addState;
          for (let j = 0; j < manifold1.pointCount; ++j) {
              if (manifold1.points[j].id.key === id.key) {
                  state2[i] = exports.PointState.persistState;
                  break;
              }
          }
      }
  }
  /**
   * Clipping for contact manifolds. Sutherland-Hodgman clipping.
   */
  function clipSegmentToLine(vOut, vIn, normal, offset, vertexIndexA) {
      // Start with no output points
      let numOut = 0;
      // Calculate the distance of end points to the line
      const distance0 = dotVec2(normal, vIn[0].v) - offset;
      const distance1 = dotVec2(normal, vIn[1].v) - offset;
      // If the points are behind the plane
      if (distance0 <= 0.0)
          vOut[numOut++].set(vIn[0]);
      if (distance1 <= 0.0)
          vOut[numOut++].set(vIn[1]);
      // If the points are on different sides of the plane
      if (distance0 * distance1 < 0.0) {
          // Find intersection point of edge and plane
          const interp = distance0 / (distance0 - distance1);
          combine2Vec2(vOut[numOut].v, 1 - interp, vIn[0].v, interp, vIn[1].v);
          // VertexA is hitting edgeB.
          vOut[numOut].id.setFeatures(vertexIndexA, exports.ContactFeatureType.e_vertex, vIn[0].id.indexB, exports.ContactFeatureType.e_face);
          ++numOut;
      }
      return numOut;
  }

  const stats$1 = {
      gjkCalls: 0,
      gjkIters: 0,
      gjkMaxIters: 0,
      toiTime: 0,
      toiMaxTime: 0,
      toiCalls: 0,
      toiIters: 0,
      toiMaxIters: 0,
      toiRootIters: 0,
      toiMaxRootIters: 0,
      toString(newline) {
          newline = typeof newline === 'string' ? newline : '\n';
          let string = "";
          // tslint:disable-next-line:no-for-in
          for (const name in this) {
              if (typeof this[name] !== 'function' && typeof this[name] !== 'object') {
                  string += name + ': ' + this[name] + newline;
              }
          }
          return string;
      }
  };

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
  /** @internal */ const math_max$7 = Math.max;
  /** @internal */ const temp$4 = vec2(0, 0);
  /** @internal */ const normal$4 = vec2(0, 0);
  /** @internal */ const e12 = vec2(0, 0);
  /** @internal */ const e13 = vec2(0, 0);
  /** @internal */ const e23 = vec2(0, 0);
  /** @internal */ const temp1 = vec2(0, 0);
  /** @internal */ const temp2 = vec2(0, 0);
  /**
   * GJK using Voronoi regions (Christer Ericson) and Barycentric coordinates.
   */
  stats$1.gjkCalls = 0;
  stats$1.gjkIters = 0;
  stats$1.gjkMaxIters = 0;
  /**
   * Input for Distance. You have to option to use the shape radii in the
   * computation. Even
   */
  class DistanceInput {
      constructor() {
          this.proxyA = new DistanceProxy();
          this.proxyB = new DistanceProxy();
          this.transformA = Transform.identity();
          this.transformB = Transform.identity();
          this.useRadii = false;
      }
      recycle() {
          this.proxyA.recycle();
          this.proxyB.recycle();
          this.transformA.setIdentity();
          this.transformB.setIdentity();
          this.useRadii = false;
      }
  }
  /**
   * Output for Distance.
   */
  class DistanceOutput {
      constructor() {
          /** closest point on shapeA */
          this.pointA = vec2(0, 0);
          /** closest point on shapeB */
          this.pointB = vec2(0, 0);
          this.distance = 0;
          /** iterations number of GJK iterations used */
          this.iterations = 0;
      }
      recycle() {
          zeroVec2(this.pointA);
          zeroVec2(this.pointB);
          this.distance = 0;
          this.iterations = 0;
      }
  }
  /**
   * Used to warm start Distance. Set count to zero on first call.
   */
  class SimplexCache {
      constructor() {
          /** length or area */
          this.metric = 0;
          /** vertices on shape A */
          this.indexA = [];
          /** vertices on shape B */
          this.indexB = [];
          this.count = 0;
      }
      recycle() {
          this.metric = 0;
          this.indexA.length = 0;
          this.indexB.length = 0;
          this.count = 0;
      }
  }
  /**
   * Compute the closest points between two shapes. Supports any combination of:
   * CircleShape, PolygonShape, EdgeShape. The simplex cache is input/output. On
   * the first call set SimplexCache.count to zero.
   */
  const Distance = function (output, cache, input) {
      ++stats$1.gjkCalls;
      const proxyA = input.proxyA;
      const proxyB = input.proxyB;
      const xfA = input.transformA;
      const xfB = input.transformB;
      // Initialize the simplex.
      // const simplex = new Simplex();
      simplex.recycle();
      simplex.readCache(cache, proxyA, xfA, proxyB, xfB);
      // Get simplex vertices as an array.
      const vertices = simplex.m_v;
      const k_maxIters = SettingsInternal.maxDistanceIterations;
      // These store the vertices of the last simplex so that we
      // can check for duplicates and prevent cycling.
      const saveA = [];
      const saveB = []; // int[3]
      let saveCount = 0;
      // Main iteration loop.
      let iter = 0;
      while (iter < k_maxIters) {
          // Copy simplex so we can identify duplicates.
          saveCount = simplex.m_count;
          for (let i = 0; i < saveCount; ++i) {
              saveA[i] = vertices[i].indexA;
              saveB[i] = vertices[i].indexB;
          }
          simplex.solve();
          // If we have 3 points, then the origin is in the corresponding triangle.
          if (simplex.m_count === 3) {
              break;
          }
          // Get search direction.
          const d = simplex.getSearchDirection();
          // Ensure the search direction is numerically fit.
          if (lengthSqrVec2(d) < EPSILON * EPSILON) {
              // The origin is probably contained by a line segment
              // or triangle. Thus the shapes are overlapped.
              // We can't return zero here even though there may be overlap.
              // In case the simplex is a point, segment, or triangle it is difficult
              // to determine if the origin is contained in the CSO or very close to it.
              break;
          }
          // Compute a tentative new simplex vertex using support points.
          const vertex = vertices[simplex.m_count]; // SimplexVertex
          vertex.indexA = proxyA.getSupport(derotVec2(temp$4, xfA.q, scaleVec2(temp$4, -1, d)));
          transformVec2(vertex.wA, xfA, proxyA.getVertex(vertex.indexA));
          vertex.indexB = proxyB.getSupport(derotVec2(temp$4, xfB.q, d));
          transformVec2(vertex.wB, xfB, proxyB.getVertex(vertex.indexB));
          subVec2(vertex.w, vertex.wB, vertex.wA);
          // Iteration count is equated to the number of support point calls.
          ++iter;
          ++stats$1.gjkIters;
          // Check for duplicate support points. This is the main termination
          // criteria.
          let duplicate = false;
          for (let i = 0; i < saveCount; ++i) {
              if (vertex.indexA === saveA[i] && vertex.indexB === saveB[i]) {
                  duplicate = true;
                  break;
              }
          }
          // If we found a duplicate support point we must exit to avoid cycling.
          if (duplicate) {
              break;
          }
          // New vertex is ok and needed.
          ++simplex.m_count;
      }
      stats$1.gjkMaxIters = math_max$7(stats$1.gjkMaxIters, iter);
      // Prepare output.
      simplex.getWitnessPoints(output.pointA, output.pointB);
      output.distance = distVec2(output.pointA, output.pointB);
      output.iterations = iter;
      // Cache the simplex.
      simplex.writeCache(cache);
      // Apply radii if requested.
      if (input.useRadii) {
          const rA = proxyA.m_radius;
          const rB = proxyB.m_radius;
          if (output.distance > rA + rB && output.distance > EPSILON) {
              // Shapes are still no overlapped.
              // Move the witness points to the outer surface.
              output.distance -= rA + rB;
              subVec2(normal$4, output.pointB, output.pointA);
              normalizeVec2(normal$4);
              plusScaleVec2(output.pointA, rA, normal$4);
              minusScaleVec2(output.pointB, rB, normal$4);
          }
          else {
              // Shapes are overlapped when radii are considered.
              // Move the witness points to the middle.
              const p = subVec2(temp$4, output.pointA, output.pointB);
              copyVec2(output.pointA, p);
              copyVec2(output.pointB, p);
              output.distance = 0.0;
          }
      }
  };
  /**
   * A distance proxy is used by the GJK algorithm. It encapsulates any shape.
   */
  class DistanceProxy {
      constructor() {
          /** @internal */ this.m_vertices = [];
          // todo: remove this?
          /** @internal */ this.m_count = 0;
          /** @internal */ this.m_radius = 0;
      }
      recycle() {
          this.m_vertices.length = 0;
          this.m_count = 0;
          this.m_radius = 0;
      }
      /**
       * Get the vertex count.
       */
      getVertexCount() {
          return this.m_count;
      }
      /**
       * Get a vertex by index. Used by Distance.
       */
      getVertex(index) {
          return this.m_vertices[index];
      }
      /**
       * Get the supporting vertex index in the given direction.
       */
      getSupport(d) {
          let bestIndex = -1;
          let bestValue = -Infinity;
          for (let i = 0; i < this.m_count; ++i) {
              const value = dotVec2(this.m_vertices[i], d);
              if (value > bestValue) {
                  bestIndex = i;
                  bestValue = value;
              }
          }
          return bestIndex;
      }
      /**
       * Get the supporting vertex in the given direction.
       */
      getSupportVertex(d) {
          return this.m_vertices[this.getSupport(d)];
      }
      /**
       * Initialize the proxy using the given shape. The shape must remain in scope
       * while the proxy is in use.
       */
      set(shape, index) {
          shape.computeDistanceProxy(this, index);
      }
      /**
       * Initialize the proxy using a vertex cloud and radius. The vertices
       * must remain in scope while the proxy is in use.
       */
      setVertices(vertices, count, radius) {
          this.m_vertices = vertices;
          this.m_count = count;
          this.m_radius = radius;
      }
  }
  class SimplexVertex {
      constructor() {
          /** support point in proxyA */
          this.wA = vec2(0, 0);
          /** wA index */
          this.indexA = 0;
          /** support point in proxyB */
          this.wB = vec2(0, 0);
          /** wB index */
          this.indexB = 0;
          /** wB - wA; */
          this.w = vec2(0, 0);
          /** barycentric coordinate for closest point */
          this.a = 0;
      }
      recycle() {
          this.indexA = 0;
          this.indexB = 0;
          zeroVec2(this.wA);
          zeroVec2(this.wB);
          zeroVec2(this.w);
          this.a = 0;
      }
      set(v) {
          this.indexA = v.indexA;
          this.indexB = v.indexB;
          copyVec2(this.wA, v.wA);
          copyVec2(this.wB, v.wB);
          copyVec2(this.w, v.w);
          this.a = v.a;
      }
  }
  /** @internal */ const searchDirection_reuse = vec2(0, 0);
  /** @internal */ const closestPoint_reuse = vec2(0, 0);
  class Simplex {
      constructor() {
          this.m_v1 = new SimplexVertex();
          this.m_v2 = new SimplexVertex();
          this.m_v3 = new SimplexVertex();
          this.m_v = [this.m_v1, this.m_v2, this.m_v3];
      }
      recycle() {
          this.m_v1.recycle();
          this.m_v2.recycle();
          this.m_v3.recycle();
          this.m_count = 0;
      }
      /** @internal */ toString() {
          if (this.m_count === 3) {
              return ["+" + this.m_count,
                  this.m_v1.a, this.m_v1.wA[0], this.m_v1.wA[1], this.m_v1.wB[0], this.m_v1.wB[1],
                  this.m_v2.a, this.m_v2.wA[0], this.m_v2.wA[1], this.m_v2.wB[0], this.m_v2.wB[1],
                  this.m_v3.a, this.m_v3.wA[0], this.m_v3.wA[1], this.m_v3.wB[0], this.m_v3.wB[1]
              ].toString();
          }
          else if (this.m_count === 2) {
              return ["+" + this.m_count,
                  this.m_v1.a, this.m_v1.wA[0], this.m_v1.wA[1], this.m_v1.wB[0], this.m_v1.wB[1],
                  this.m_v2.a, this.m_v2.wA[0], this.m_v2.wA[1], this.m_v2.wB[0], this.m_v2.wB[1]
              ].toString();
          }
          else if (this.m_count === 1) {
              return ["+" + this.m_count,
                  this.m_v1.a, this.m_v1.wA[0], this.m_v1.wA[1], this.m_v1.wB[0], this.m_v1.wB[1]
              ].toString();
          }
          else {
              return "+" + this.m_count;
          }
      }
      readCache(cache, proxyA, transformA, proxyB, transformB) {
          // Copy data from cache.
          this.m_count = cache.count;
          for (let i = 0; i < this.m_count; ++i) {
              const v = this.m_v[i];
              v.indexA = cache.indexA[i];
              v.indexB = cache.indexB[i];
              const wALocal = proxyA.getVertex(v.indexA);
              const wBLocal = proxyB.getVertex(v.indexB);
              transformVec2(v.wA, transformA, wALocal);
              transformVec2(v.wB, transformB, wBLocal);
              subVec2(v.w, v.wB, v.wA);
              v.a = 0.0;
          }
          // Compute the new simplex metric, if it is substantially different than
          // old metric then flush the simplex.
          if (this.m_count > 1) {
              const metric1 = cache.metric;
              const metric2 = this.getMetric();
              if (metric2 < 0.5 * metric1 || 2.0 * metric1 < metric2 || metric2 < EPSILON) {
                  // Reset the simplex.
                  this.m_count = 0;
              }
          }
          // If the cache is empty or invalid...
          if (this.m_count === 0) {
              const v = this.m_v[0];
              v.indexA = 0;
              v.indexB = 0;
              const wALocal = proxyA.getVertex(0);
              const wBLocal = proxyB.getVertex(0);
              transformVec2(v.wA, transformA, wALocal);
              transformVec2(v.wB, transformB, wBLocal);
              subVec2(v.w, v.wB, v.wA);
              v.a = 1.0;
              this.m_count = 1;
          }
      }
      writeCache(cache) {
          cache.metric = this.getMetric();
          cache.count = this.m_count;
          for (let i = 0; i < this.m_count; ++i) {
              cache.indexA[i] = this.m_v[i].indexA;
              cache.indexB[i] = this.m_v[i].indexB;
          }
      }
      getSearchDirection() {
          const v1 = this.m_v1;
          const v2 = this.m_v2;
          this.m_v3;
          switch (this.m_count) {
              case 1:
                  return set$1(-v1.w[0], -v1.w[1], searchDirection_reuse);
              case 2: {
                  subVec2(e12, v2.w, v1.w);
                  const sgn = -crossVec2Vec2(e12, v1.w);
                  if (sgn > 0.0) {
                      // Origin is left of e12.
                      return set$1(-e12[1], e12[0], searchDirection_reuse);
                  }
                  else {
                      // Origin is right of e12.
                      return set$1(e12[1], -e12[0], searchDirection_reuse);
                  }
              }
              default:
                  return zeroVec2(searchDirection_reuse);
          }
      }
      getClosestPoint() {
          const v1 = this.m_v1;
          const v2 = this.m_v2;
          this.m_v3;
          switch (this.m_count) {
              case 0:
                  return zeroVec2(closestPoint_reuse);
              case 1:
                  return copyVec2(closestPoint_reuse, v1.w);
              case 2:
                  return combine2Vec2(closestPoint_reuse, v1.a, v1.w, v2.a, v2.w);
              case 3:
                  return zeroVec2(closestPoint_reuse);
              default:
                  return zeroVec2(closestPoint_reuse);
          }
      }
      getWitnessPoints(pA, pB) {
          const v1 = this.m_v1;
          const v2 = this.m_v2;
          const v3 = this.m_v3;
          switch (this.m_count) {
              case 0:
                  break;
              case 1:
                  copyVec2(pA, v1.wA);
                  copyVec2(pB, v1.wB);
                  break;
              case 2:
                  combine2Vec2(pA, v1.a, v1.wA, v2.a, v2.wA);
                  combine2Vec2(pB, v1.a, v1.wB, v2.a, v2.wB);
                  break;
              case 3:
                  combine3Vec2(pA, v1.a, v1.wA, v2.a, v2.wA, v3.a, v3.wA);
                  copyVec2(pB, pA);
                  break;
          }
      }
      getMetric() {
          switch (this.m_count) {
              case 0:
                  return 0.0;
              case 1:
                  return 0.0;
              case 2:
                  return distVec2(this.m_v1.w, this.m_v2.w);
              case 3:
                  return crossVec2Vec2(subVec2(temp1, this.m_v2.w, this.m_v1.w), subVec2(temp2, this.m_v3.w, this.m_v1.w));
              default:
                  return 0.0;
          }
      }
      solve() {
          switch (this.m_count) {
              case 1:
                  break;
              case 2:
                  this.solve2();
                  break;
              case 3:
                  this.solve3();
                  break;
          }
      }
      // Solve a line segment using barycentric coordinates.
      //
      // p = a1 * w1 + a2 * w2
      // a1 + a2 = 1
      //
      // The vector from the origin to the closest point on the line is
      // perpendicular to the line.
      // e12 = w2 - w1
      // dot(p, e) = 0
      // a1 * dot(w1, e) + a2 * dot(w2, e) = 0
      //
      // 2-by-2 linear system
      // [1 1 ][a1] = [1]
      // [w1.e12 w2.e12][a2] = [0]
      //
      // Define
      // d12_1 = dot(w2, e12)
      // d12_2 = -dot(w1, e12)
      // d12 = d12_1 + d12_2
      //
      // Solution
      // a1 = d12_1 / d12
      // a2 = d12_2 / d12
      solve2() {
          const w1 = this.m_v1.w;
          const w2 = this.m_v2.w;
          subVec2(e12, w2, w1);
          // w1 region
          const d12_2 = -dotVec2(w1, e12);
          if (d12_2 <= 0.0) {
              // a2 <= 0, so we clamp it to 0
              this.m_v1.a = 1.0;
              this.m_count = 1;
              return;
          }
          // w2 region
          const d12_1 = dotVec2(w2, e12);
          if (d12_1 <= 0.0) {
              // a1 <= 0, so we clamp it to 0
              this.m_v2.a = 1.0;
              this.m_count = 1;
              this.m_v1.set(this.m_v2);
              return;
          }
          // Must be in e12 region.
          const inv_d12 = 1.0 / (d12_1 + d12_2);
          this.m_v1.a = d12_1 * inv_d12;
          this.m_v2.a = d12_2 * inv_d12;
          this.m_count = 2;
      }
      // Possible regions:
      // - points[2]
      // - edge points[0]-points[2]
      // - edge points[1]-points[2]
      // - inside the triangle
      solve3() {
          const w1 = this.m_v1.w;
          const w2 = this.m_v2.w;
          const w3 = this.m_v3.w;
          // Edge12
          // [1 1 ][a1] = [1]
          // [w1.e12 w2.e12][a2] = [0]
          // a3 = 0
          subVec2(e12, w2, w1);
          const w1e12 = dotVec2(w1, e12);
          const w2e12 = dotVec2(w2, e12);
          const d12_1 = w2e12;
          const d12_2 = -w1e12;
          // Edge13
          // [1 1 ][a1] = [1]
          // [w1.e13 w3.e13][a3] = [0]
          // a2 = 0
          subVec2(e13, w3, w1);
          const w1e13 = dotVec2(w1, e13);
          const w3e13 = dotVec2(w3, e13);
          const d13_1 = w3e13;
          const d13_2 = -w1e13;
          // Edge23
          // [1 1 ][a2] = [1]
          // [w2.e23 w3.e23][a3] = [0]
          // a1 = 0
          subVec2(e23, w3, w2);
          const w2e23 = dotVec2(w2, e23);
          const w3e23 = dotVec2(w3, e23);
          const d23_1 = w3e23;
          const d23_2 = -w2e23;
          // Triangle123
          const n123 = crossVec2Vec2(e12, e13);
          const d123_1 = n123 * crossVec2Vec2(w2, w3);
          const d123_2 = n123 * crossVec2Vec2(w3, w1);
          const d123_3 = n123 * crossVec2Vec2(w1, w2);
          // w1 region
          if (d12_2 <= 0.0 && d13_2 <= 0.0) {
              this.m_v1.a = 1.0;
              this.m_count = 1;
              return;
          }
          // e12
          if (d12_1 > 0.0 && d12_2 > 0.0 && d123_3 <= 0.0) {
              const inv_d12 = 1.0 / (d12_1 + d12_2);
              this.m_v1.a = d12_1 * inv_d12;
              this.m_v2.a = d12_2 * inv_d12;
              this.m_count = 2;
              return;
          }
          // e13
          if (d13_1 > 0.0 && d13_2 > 0.0 && d123_2 <= 0.0) {
              const inv_d13 = 1.0 / (d13_1 + d13_2);
              this.m_v1.a = d13_1 * inv_d13;
              this.m_v3.a = d13_2 * inv_d13;
              this.m_count = 2;
              this.m_v2.set(this.m_v3);
              return;
          }
          // w2 region
          if (d12_1 <= 0.0 && d23_2 <= 0.0) {
              this.m_v2.a = 1.0;
              this.m_count = 1;
              this.m_v1.set(this.m_v2);
              return;
          }
          // w3 region
          if (d13_1 <= 0.0 && d23_1 <= 0.0) {
              this.m_v3.a = 1.0;
              this.m_count = 1;
              this.m_v1.set(this.m_v3);
              return;
          }
          // e23
          if (d23_1 > 0.0 && d23_2 > 0.0 && d123_1 <= 0.0) {
              const inv_d23 = 1.0 / (d23_1 + d23_2);
              this.m_v2.a = d23_1 * inv_d23;
              this.m_v3.a = d23_2 * inv_d23;
              this.m_count = 2;
              this.m_v1.set(this.m_v3);
              return;
          }
          // Must be in triangle123
          const inv_d123 = 1.0 / (d123_1 + d123_2 + d123_3);
          this.m_v1.a = d123_1 * inv_d123;
          this.m_v2.a = d123_2 * inv_d123;
          this.m_v3.a = d123_3 * inv_d123;
          this.m_count = 3;
      }
  }
  /** @internal */ const simplex = new Simplex();
  /** @internal */ const input$1 = new DistanceInput();
  /** @internal */ const cache$1 = new SimplexCache();
  /** @internal */ const output$1 = new DistanceOutput();
  /**
   * Determine if two generic shapes overlap.
   */
  const testOverlap = function (shapeA, indexA, shapeB, indexB, xfA, xfB) {
      input$1.recycle();
      input$1.proxyA.set(shapeA, indexA);
      input$1.proxyB.set(shapeB, indexB);
      copyTransform(input$1.transformA, xfA);
      copyTransform(input$1.transformB, xfB);
      input$1.useRadii = true;
      output$1.recycle();
      cache$1.recycle();
      Distance(output$1, cache$1, input$1);
      return output$1.distance < 10.0 * EPSILON;
  };
  // legacy exports
  Distance.testOverlap = testOverlap;
  Distance.Input = DistanceInput;
  Distance.Output = DistanceOutput;
  Distance.Proxy = DistanceProxy;
  Distance.Cache = SimplexCache;
  /**
   * Input parameters for ShapeCast
   */
  class ShapeCastInput {
      constructor() {
          this.proxyA = new DistanceProxy();
          this.proxyB = new DistanceProxy();
          this.transformA = Transform.identity();
          this.transformB = Transform.identity();
          this.translationB = zero$1();
      }
      recycle() {
          this.proxyA.recycle();
          this.proxyB.recycle();
          this.transformA.setIdentity();
          this.transformB.setIdentity();
          zeroVec2(this.translationB);
      }
  }
  /**
   * Output results for b2ShapeCast
   */
  class ShapeCastOutput {
      constructor() {
          this.point = zero$1();
          this.normal = zero$1();
          this.lambda = 1.0;
          this.iterations = 0;
      }
  }
  /**
   * Perform a linear shape cast of shape B moving and shape A fixed. Determines
   * the hit point, normal, and translation fraction.
   *
   * @returns true if hit, false if there is no hit or an initial overlap
   */
  //
  // GJK-raycast
  // Algorithm by Gino van den Bergen.
  // "Smooth Mesh Contacts with GJK" in Game Physics Pearls. 2010
  const ShapeCast = function (output, input) {
      output.iterations = 0;
      output.lambda = 1.0;
      setZero$1(output.normal);
      setZero$1(output.point);
      const proxyA = input.proxyA;
      const proxyB = input.proxyB;
      const radiusA = math_max$7(proxyA.m_radius, SettingsInternal.polygonRadius);
      const radiusB = math_max$7(proxyB.m_radius, SettingsInternal.polygonRadius);
      const radius = radiusA + radiusB;
      const xfA = input.transformA;
      const xfB = input.transformB;
      const r = input.translationB;
      const n = zero$1();
      let lambda = 0.0;
      // Initial simplex
      const simplex = new Simplex();
      simplex.m_count = 0;
      // Get simplex vertices as an array.
      const vertices = simplex.m_v;
      // Get support point in -r direction
      let indexA = proxyA.getSupport(Rot.mulTVec2(xfA.q, neg$1(r)));
      let wA = Transform.mulVec2(xfA, proxyA.getVertex(indexA));
      let indexB = proxyB.getSupport(Rot.mulTVec2(xfB.q, r));
      let wB = Transform.mulVec2(xfB, proxyB.getVertex(indexB));
      const v = sub$1(wA, wB);
      // Sigma is the target distance between polygons
      const sigma = math_max$7(SettingsInternal.polygonRadius, radius - SettingsInternal.polygonRadius);
      const tolerance = 0.5 * SettingsInternal.linearSlop;
      // Main iteration loop.
      const k_maxIters = 20;
      let iter = 0;
      while (iter < k_maxIters && length$1(v) - sigma > tolerance) {
          output.iterations += 1;
          // Support in direction -v (A - B)
          indexA = proxyA.getSupport(Rot.mulTVec2(xfA.q, neg$1(v)));
          wA = Transform.mulVec2(xfA, proxyA.getVertex(indexA));
          indexB = proxyB.getSupport(Rot.mulTVec2(xfB.q, v));
          wB = Transform.mulVec2(xfB, proxyB.getVertex(indexB));
          const p = sub$1(wA, wB);
          // -v is a normal at p
          normalize(v, v);
          // Intersect ray with plane
          const vp = dot$1(v, p);
          const vr = dot$1(v, r);
          if (vp - sigma > lambda * vr) {
              if (vr <= 0.0) {
                  return false;
              }
              lambda = (vp - sigma) / vr;
              if (lambda > 1.0) {
                  return false;
              }
              scale$1(v, -1, n);
              simplex.m_count = 0;
          }
          // Reverse simplex since it works with B - A.
          // Shift by lambda * r because we want the closest point to the current clip point.
          // Note that the support point p is not shifted because we want the plane equation
          // to be formed in unshifted space.
          const vertex = vertices[simplex.m_count];
          vertex.indexA = indexB;
          vertex.wA = combine(1, wB, lambda, r);
          vertex.indexB = indexA;
          vertex.wB = wA;
          vertex.w = sub$1(vertex.wB, vertex.wA);
          vertex.a = 1.0;
          simplex.m_count += 1;
          switch (simplex.m_count) {
              case 1:
                  break;
              case 2:
                  simplex.solve2();
                  break;
              case 3:
                  simplex.solve3();
                  break;
          }
          // If we have 3 points, then the origin is in the corresponding triangle.
          if (simplex.m_count == 3) {
              // Overlap
              return false;
          }
          // Get search direction.
          copy(simplex.getClosestPoint(), v);
          // Iteration count is equated to the number of support point calls.
          ++iter;
      }
      if (iter == 0) {
          // Initial overlap
          return false;
      }
      // Prepare output.
      const pointA = zero$1();
      const pointB = zero$1();
      simplex.getWitnessPoints(pointB, pointA);
      if (lengthSquared(v) > 0.0) {
          scale$1(v, -1, n);
          normalize(n, n);
      }
      output.point = combine(1, pointA, radiusA, n);
      output.normal = n;
      output.lambda = lambda;
      output.iterations = iter;
      return true;
  };

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
  /**
   * A joint edge is used to connect bodies and joints together in a joint graph
   * where each body is a node and each joint is an edge. A joint edge belongs to
   * a doubly linked list maintained in each attached body. Each joint has two
   * joint nodes, one for each attached body.
   */
  class JointEdge {
      constructor() {
          /**
           * provides quick access to the other body attached.
           */
          this.other = null;
          /**
           * the joint
           */
          this.joint = null;
          /**
           * prev the previous joint edge in the body's joint list
           */
          this.prev = null;
          /**
           * the next joint edge in the body's joint list
           */
          this.next = null;
      }
  }
  /**
   * The base joint class. Joints are used to constraint two bodies together in
   * various fashions. Some joints also feature limits and motors.
   */
  class Joint {
      constructor(def, bodyA, bodyB) {
          /** @internal */ this.m_type = 'unknown-joint';
          /** @internal */ this.m_prev = null;
          /** @internal */ this.m_next = null;
          /** @internal */ this.m_edgeA = new JointEdge();
          /** @internal */ this.m_edgeB = new JointEdge();
          /** @internal */ this.m_islandFlag = false;
          /** @hidden @experimental Similar to userData, but used by dev-tools or runtime environment. */
          this.appData = {};
          bodyA = 'bodyA' in def ? def.bodyA : bodyA;
          bodyB = 'bodyB' in def ? def.bodyB : bodyB;
          this.m_bodyA = bodyA;
          this.m_bodyB = bodyB;
          this.m_collideConnected = !!def.collideConnected;
          this.m_userData = def.userData;
      }
      /**
       * Short-cut function to determine if either body is inactive.
       */
      isActive() {
          return this.m_bodyA.isActive() && this.m_bodyB.isActive();
      }
      /**
       * Get the type of the concrete joint.
       */
      getType() {
          return this.m_type;
      }
      /**
       * Get the first body attached to this joint.
       */
      getBodyA() {
          return this.m_bodyA;
      }
      /**
       * Get the second body attached to this joint.
       */
      getBodyB() {
          return this.m_bodyB;
      }
      /**
       * Get the next joint the world joint list.
       */
      getNext() {
          return this.m_next;
      }
      getUserData() {
          return this.m_userData;
      }
      setUserData(data) {
          this.m_userData = data;
      }
      /**
       * Get collide connected. Note: modifying the collide connect flag won't work
       * correctly because the flag is only checked when fixture AABBs begin to
       * overlap.
       */
      getCollideConnected() {
          return this.m_collideConnected;
      }
      /**
       * Shift the origin for any points stored in world coordinates.
       */
      shiftOrigin(newOrigin) { }
      /**
       * @internal @deprecated
       * Temporary for backward compatibility, will be removed.
       */
      _resetAnchors(def) {
          return this._reset(def);
      }
  }

  /** @internal */
  const now = function () {
      return Date.now();
  };
  /** @internal */
  const diff = function (time) {
      return Date.now() - time;
  };
  /** @internal */
  var Timer = {
      now,
      diff,
  };

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
  /** @internal */ const math_abs$9 = Math.abs;
  /** @internal */ const math_max$6 = Math.max;
  /**
   * Input parameters for TimeOfImpact.
   */
  class TOIInput {
      constructor() {
          this.proxyA = new DistanceProxy();
          this.proxyB = new DistanceProxy();
          this.sweepA = new Sweep();
          this.sweepB = new Sweep();
      }
      recycle() {
          this.proxyA.recycle();
          this.proxyB.recycle();
          this.sweepA.recycle();
          this.sweepB.recycle();
          this.tMax = -1;
      }
  }
  exports.TOIOutputState = void 0;
  (function (TOIOutputState) {
      TOIOutputState[TOIOutputState["e_unset"] = -1] = "e_unset";
      TOIOutputState[TOIOutputState["e_unknown"] = 0] = "e_unknown";
      TOIOutputState[TOIOutputState["e_failed"] = 1] = "e_failed";
      TOIOutputState[TOIOutputState["e_overlapped"] = 2] = "e_overlapped";
      TOIOutputState[TOIOutputState["e_touching"] = 3] = "e_touching";
      TOIOutputState[TOIOutputState["e_separated"] = 4] = "e_separated";
  })(exports.TOIOutputState || (exports.TOIOutputState = {}));
  /**
   * Output parameters for TimeOfImpact.
   */
  class TOIOutput {
      constructor() {
          this.state = exports.TOIOutputState.e_unset;
          this.t = -1;
      }
      recycle() {
          this.state = exports.TOIOutputState.e_unset;
          this.t = -1;
      }
  }
  stats$1.toiTime = 0;
  stats$1.toiMaxTime = 0;
  stats$1.toiCalls = 0;
  stats$1.toiIters = 0;
  stats$1.toiMaxIters = 0;
  stats$1.toiRootIters = 0;
  stats$1.toiMaxRootIters = 0;
  /** @internal */ const distanceInput = new DistanceInput();
  /** @internal */ const distanceOutput = new DistanceOutput();
  // this is passed to Distance and SeparationFunction
  /** @internal */ const cache = new SimplexCache();
  /** @internal */ const xfA$1 = transform(0, 0, 0);
  /** @internal */ const xfB$1 = transform(0, 0, 0);
  /** @internal */ const temp$3 = vec2(0, 0);
  /** @internal */ const pointA$1 = vec2(0, 0);
  /** @internal */ const pointB$1 = vec2(0, 0);
  /** @internal */ const normal$3 = vec2(0, 0);
  /** @internal */ const axisA = vec2(0, 0);
  /** @internal */ const axisB = vec2(0, 0);
  /** @internal */ const localPointA = vec2(0, 0);
  /** @internal */ const localPointB = vec2(0, 0);
  /**
   * Compute the upper bound on time before two shapes penetrate. Time is
   * represented as a fraction between [0,tMax]. This uses a swept separating axis
   * and may miss some intermediate, non-tunneling collisions. If you change the
   * time interval, you should call this function again.
   *
   * Note: use Distance to compute the contact point and normal at the time of
   * impact.
   *
   * CCD via the local separating axis method. This seeks progression by computing
   * the largest time at which separation is maintained.
   */
  const TimeOfImpact = function (output, input) {
      const timer = Timer.now();
      ++stats$1.toiCalls;
      output.state = exports.TOIOutputState.e_unknown;
      output.t = input.tMax;
      const proxyA = input.proxyA; // DistanceProxy
      const proxyB = input.proxyB; // DistanceProxy
      const sweepA = input.sweepA; // Sweep
      const sweepB = input.sweepB; // Sweep
      // Large rotations can make the root finder fail, so we normalize the
      // sweep angles.
      sweepA.normalize();
      sweepB.normalize();
      const tMax = input.tMax;
      const totalRadius = proxyA.m_radius + proxyB.m_radius;
      const target = math_max$6(SettingsInternal.linearSlop, totalRadius - 3.0 * SettingsInternal.linearSlop);
      const tolerance = 0.25 * SettingsInternal.linearSlop;
      let t1 = 0.0;
      const k_maxIterations = SettingsInternal.maxTOIIterations;
      let iter = 0;
      // Prepare input for distance query.
      // const cache = new SimplexCache();
      cache.recycle();
      distanceInput.proxyA.setVertices(proxyA.m_vertices, proxyA.m_count, proxyA.m_radius);
      distanceInput.proxyB.setVertices(proxyB.m_vertices, proxyB.m_count, proxyB.m_radius);
      distanceInput.useRadii = false;
      // The outer loop progressively attempts to compute new separating axes.
      // This loop terminates when an axis is repeated (no progress is made).
      while (true) {
          sweepA.getTransform(xfA$1, t1);
          sweepB.getTransform(xfB$1, t1);
          // Get the distance between shapes. We can also use the results
          // to get a separating axis.
          copyTransform(distanceInput.transformA, xfA$1);
          copyTransform(distanceInput.transformB, xfB$1);
          Distance(distanceOutput, cache, distanceInput);
          // If the shapes are overlapped, we give up on continuous collision.
          if (distanceOutput.distance <= 0.0) {
              // Failure!
              output.state = exports.TOIOutputState.e_overlapped;
              output.t = 0.0;
              break;
          }
          if (distanceOutput.distance < target + tolerance) {
              // Victory!
              output.state = exports.TOIOutputState.e_touching;
              output.t = t1;
              break;
          }
          // Initialize the separating axis.
          separationFunction.initialize(cache, proxyA, sweepA, proxyB, sweepB, t1);
          // if (false) {
          //   // Dump the curve seen by the root finder
          //   const N = 100;
          //   const dx = 1.0 / N;
          //   const xs = []; // [ N + 1 ];
          //   const fs = []; // [ N + 1 ];
          //   const x = 0.0;
          //   for (const i = 0; i <= N; ++i) {
          //     sweepA.getTransform(xfA, x);
          //     sweepB.getTransform(xfB, x);
          //     const f = fcn.evaluate(xfA, xfB) - target;
          //     printf("%g %g\n", x, f);
          //     xs[i] = x;
          //     fs[i] = f;
          //     x += dx;
          //   }
          // }
          // Compute the TOI on the separating axis. We do this by successively
          // resolving the deepest point. This loop is bounded by the number of
          // vertices.
          let done = false;
          let t2 = tMax;
          let pushBackIter = 0;
          while (true) {
              // Find the deepest point at t2. Store the witness point indices.
              let s2 = separationFunction.findMinSeparation(t2);
              // Is the final configuration separated?
              if (s2 > target + tolerance) {
                  // Victory!
                  output.state = exports.TOIOutputState.e_separated;
                  output.t = tMax;
                  done = true;
                  break;
              }
              // Has the separation reached tolerance?
              if (s2 > target - tolerance) {
                  // Advance the sweeps
                  t1 = t2;
                  break;
              }
              // Compute the initial separation of the witness points.
              let s1 = separationFunction.evaluate(t1);
              // Check for initial overlap. This might happen if the root finder
              // runs out of iterations.
              if (s1 < target - tolerance) {
                  output.state = exports.TOIOutputState.e_failed;
                  output.t = t1;
                  done = true;
                  break;
              }
              // Check for touching
              if (s1 <= target + tolerance) {
                  // Victory! t1 should hold the TOI (could be 0.0).
                  output.state = exports.TOIOutputState.e_touching;
                  output.t = t1;
                  done = true;
                  break;
              }
              // Compute 1D root of: f(x) - target = 0
              let rootIterCount = 0;
              let a1 = t1;
              let a2 = t2;
              while (true) {
                  // Use a mix of the secant rule and bisection.
                  let t;
                  if (rootIterCount & 1) {
                      // Secant rule to improve convergence.
                      t = a1 + (target - s1) * (a2 - a1) / (s2 - s1);
                  }
                  else {
                      // Bisection to guarantee progress.
                      t = 0.5 * (a1 + a2);
                  }
                  ++rootIterCount;
                  ++stats$1.toiRootIters;
                  const s = separationFunction.evaluate(t);
                  if (math_abs$9(s - target) < tolerance) {
                      // t2 holds a tentative value for t1
                      t2 = t;
                      break;
                  }
                  // Ensure we continue to bracket the root.
                  if (s > target) {
                      a1 = t;
                      s1 = s;
                  }
                  else {
                      a2 = t;
                      s2 = s;
                  }
                  if (rootIterCount === 50) {
                      break;
                  }
              }
              stats$1.toiMaxRootIters = math_max$6(stats$1.toiMaxRootIters, rootIterCount);
              ++pushBackIter;
              if (pushBackIter === SettingsInternal.maxPolygonVertices) {
                  break;
              }
          }
          ++iter;
          ++stats$1.toiIters;
          if (done) {
              break;
          }
          if (iter === k_maxIterations) {
              // Root finder got stuck. Semi-victory.
              output.state = exports.TOIOutputState.e_failed;
              output.t = t1;
              break;
          }
      }
      stats$1.toiMaxIters = math_max$6(stats$1.toiMaxIters, iter);
      const time = Timer.diff(timer);
      stats$1.toiMaxTime = math_max$6(stats$1.toiMaxTime, time);
      stats$1.toiTime += time;
      separationFunction.recycle();
  };
  var SeparationFunctionType;
  (function (SeparationFunctionType) {
      SeparationFunctionType[SeparationFunctionType["e_unset"] = -1] = "e_unset";
      SeparationFunctionType[SeparationFunctionType["e_points"] = 1] = "e_points";
      SeparationFunctionType[SeparationFunctionType["e_faceA"] = 2] = "e_faceA";
      SeparationFunctionType[SeparationFunctionType["e_faceB"] = 3] = "e_faceB";
  })(SeparationFunctionType || (SeparationFunctionType = {}));
  class SeparationFunction {
      constructor() {
          // input cache
          // todo: maybe assign by copy instead of reference?
          this.m_proxyA = null;
          this.m_proxyB = null;
          this.m_sweepA = null;
          this.m_sweepB = null;
          // initialize cache
          this.m_type = SeparationFunctionType.e_unset;
          this.m_localPoint = vec2(0, 0);
          this.m_axis = vec2(0, 0);
          // compute output
          this.indexA = -1;
          this.indexB = -1;
      }
      recycle() {
          this.m_proxyA = null;
          this.m_proxyB = null;
          this.m_sweepA = null;
          this.m_sweepB = null;
          this.m_type = SeparationFunctionType.e_unset;
          zeroVec2(this.m_localPoint);
          zeroVec2(this.m_axis);
          this.indexA = -1;
          this.indexB = -1;
      }
      // TODO_ERIN might not need to return the separation
      initialize(cache, proxyA, sweepA, proxyB, sweepB, t1) {
          const count = cache.count;
          this.m_proxyA = proxyA;
          this.m_proxyB = proxyB;
          this.m_sweepA = sweepA;
          this.m_sweepB = sweepB;
          this.m_sweepA.getTransform(xfA$1, t1);
          this.m_sweepB.getTransform(xfB$1, t1);
          if (count === 1) {
              this.m_type = SeparationFunctionType.e_points;
              const localPointA = this.m_proxyA.getVertex(cache.indexA[0]);
              const localPointB = this.m_proxyB.getVertex(cache.indexB[0]);
              transformVec2(pointA$1, xfA$1, localPointA);
              transformVec2(pointB$1, xfB$1, localPointB);
              subVec2(this.m_axis, pointB$1, pointA$1);
              const s = normalizeVec2Length(this.m_axis);
              return s;
          }
          else if (cache.indexA[0] === cache.indexA[1]) {
              // Two points on B and one on A.
              this.m_type = SeparationFunctionType.e_faceB;
              const localPointB1 = proxyB.getVertex(cache.indexB[0]);
              const localPointB2 = proxyB.getVertex(cache.indexB[1]);
              crossVec2Num(this.m_axis, subVec2(temp$3, localPointB2, localPointB1), 1.0);
              normalizeVec2(this.m_axis);
              rotVec2(normal$3, xfB$1.q, this.m_axis);
              combine2Vec2(this.m_localPoint, 0.5, localPointB1, 0.5, localPointB2);
              transformVec2(pointB$1, xfB$1, this.m_localPoint);
              const localPointA = proxyA.getVertex(cache.indexA[0]);
              const pointA = Transform.mulVec2(xfA$1, localPointA);
              let s = dotVec2(pointA, normal$3) - dotVec2(pointB$1, normal$3);
              if (s < 0.0) {
                  negVec2(this.m_axis);
                  s = -s;
              }
              return s;
          }
          else {
              // Two points on A and one or two points on B.
              this.m_type = SeparationFunctionType.e_faceA;
              const localPointA1 = this.m_proxyA.getVertex(cache.indexA[0]);
              const localPointA2 = this.m_proxyA.getVertex(cache.indexA[1]);
              crossVec2Num(this.m_axis, subVec2(temp$3, localPointA2, localPointA1), 1.0);
              normalizeVec2(this.m_axis);
              rotVec2(normal$3, xfA$1.q, this.m_axis);
              combine2Vec2(this.m_localPoint, 0.5, localPointA1, 0.5, localPointA2);
              transformVec2(pointA$1, xfA$1, this.m_localPoint);
              const localPointB = this.m_proxyB.getVertex(cache.indexB[0]);
              transformVec2(pointB$1, xfB$1, localPointB);
              let s = dotVec2(pointB$1, normal$3) - dotVec2(pointA$1, normal$3);
              if (s < 0.0) {
                  negVec2(this.m_axis);
                  s = -s;
              }
              return s;
          }
      }
      compute(find, t) {
          // It was findMinSeparation and evaluate
          this.m_sweepA.getTransform(xfA$1, t);
          this.m_sweepB.getTransform(xfB$1, t);
          switch (this.m_type) {
              case SeparationFunctionType.e_points: {
                  if (find) {
                      derotVec2(axisA, xfA$1.q, this.m_axis);
                      derotVec2(axisB, xfB$1.q, scaleVec2(temp$3, -1, this.m_axis));
                      this.indexA = this.m_proxyA.getSupport(axisA);
                      this.indexB = this.m_proxyB.getSupport(axisB);
                  }
                  copyVec2(localPointA, this.m_proxyA.getVertex(this.indexA));
                  copyVec2(localPointB, this.m_proxyB.getVertex(this.indexB));
                  transformVec2(pointA$1, xfA$1, localPointA);
                  transformVec2(pointB$1, xfB$1, localPointB);
                  const sep = dotVec2(pointB$1, this.m_axis) - dotVec2(pointA$1, this.m_axis);
                  return sep;
              }
              case SeparationFunctionType.e_faceA: {
                  rotVec2(normal$3, xfA$1.q, this.m_axis);
                  transformVec2(pointA$1, xfA$1, this.m_localPoint);
                  if (find) {
                      derotVec2(axisB, xfB$1.q, scaleVec2(temp$3, -1, normal$3));
                      this.indexA = -1;
                      this.indexB = this.m_proxyB.getSupport(axisB);
                  }
                  copyVec2(localPointB, this.m_proxyB.getVertex(this.indexB));
                  transformVec2(pointB$1, xfB$1, localPointB);
                  const sep = dotVec2(pointB$1, normal$3) - dotVec2(pointA$1, normal$3);
                  return sep;
              }
              case SeparationFunctionType.e_faceB: {
                  rotVec2(normal$3, xfB$1.q, this.m_axis);
                  transformVec2(pointB$1, xfB$1, this.m_localPoint);
                  if (find) {
                      derotVec2(axisA, xfA$1.q, scaleVec2(temp$3, -1, normal$3));
                      this.indexB = -1;
                      this.indexA = this.m_proxyA.getSupport(axisA);
                  }
                  copyVec2(localPointA, this.m_proxyA.getVertex(this.indexA));
                  transformVec2(pointA$1, xfA$1, localPointA);
                  const sep = dotVec2(pointA$1, normal$3) - dotVec2(pointB$1, normal$3);
                  return sep;
              }
              default:
                  if (find) {
                      this.indexA = -1;
                      this.indexB = -1;
                  }
                  return 0.0;
          }
      }
      findMinSeparation(t) {
          return this.compute(true, t);
      }
      evaluate(t) {
          return this.compute(false, t);
      }
  }
  /** @internal */ const separationFunction = new SeparationFunction();
  // legacy exports
  TimeOfImpact.Input = TOIInput;
  TimeOfImpact.Output = TOIOutput;

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
  /** @internal */ const math_abs$8 = Math.abs;
  /** @internal */ const math_sqrt$4 = Math.sqrt;
  /** @internal */ const math_min$7 = Math.min;
  class TimeStep {
      constructor() {
          /** time step */
          this.dt = 0;
          /** inverse time step (0 if dt == 0) */
          this.inv_dt = 0;
          this.velocityIterations = 0;
          this.positionIterations = 0;
          this.warmStarting = false;
          this.blockSolve = true;
          /** timestep ratio for variable timestep */
          this.inv_dt0 = 0.0;
          /** dt * inv_dt0 */
          this.dtRatio = 1;
      }
      reset(dt) {
          if (this.dt > 0.0) {
              this.inv_dt0 = this.inv_dt;
          }
          this.dt = dt;
          this.inv_dt = dt == 0 ? 0 : 1 / dt;
          this.dtRatio = dt * this.inv_dt0;
      }
  }
  // reuse
  /** @internal */ const s_subStep = new TimeStep();
  /** @internal */ const c = vec2(0, 0);
  /** @internal */ const v = vec2(0, 0);
  /** @internal */ const translation = vec2(0, 0);
  /** @internal */ const input = new TOIInput();
  /** @internal */ const output = new TOIOutput();
  /** @internal */ const backup = new Sweep();
  /** @internal */ const backup1 = new Sweep();
  /** @internal */ const backup2 = new Sweep();
  /**
   * Contact impulses for reporting. Impulses are used instead of forces because
   * sub-step forces may approach infinity for rigid body collisions. These match
   * up one-to-one with the contact points in Manifold.
   */
  class ContactImpulse {
      constructor(contact) {
          this.contact = contact;
          this.normals = [];
          this.tangents = [];
      }
      recycle() {
          this.normals.length = 0;
          this.tangents.length = 0;
      }
      get normalImpulses() {
          const contact = this.contact;
          const normals = this.normals;
          normals.length = 0;
          for (let p = 0; p < contact.v_points.length; ++p) {
              normals.push(contact.v_points[p].normalImpulse);
          }
          return normals;
      }
      get tangentImpulses() {
          const contact = this.contact;
          const tangents = this.tangents;
          tangents.length = 0;
          for (let p = 0; p < contact.v_points.length; ++p) {
              tangents.push(contact.v_points[p].tangentImpulse);
          }
          return tangents;
      }
  }
  /**
   * Finds and solves islands. An island is a connected subset of the world.
   */
  class Solver {
      constructor(world) {
          this.m_world = world;
          this.m_stack = [];
          this.m_bodies = [];
          this.m_contacts = [];
          this.m_joints = [];
      }
      clear() {
          this.m_stack.length = 0;
          this.m_bodies.length = 0;
          this.m_contacts.length = 0;
          this.m_joints.length = 0;
      }
      addBody(body) {
          this.m_bodies.push(body);
          // why?
          // body.c_position.c.setZero();
          // body.c_position.a = 0;
          // body.c_velocity.v.setZero();
          // body.c_velocity.w = 0;
      }
      addContact(contact) {
          // false && console.assert(contact instanceof Contact, 'Not a Contact!', contact);
          this.m_contacts.push(contact);
      }
      addJoint(joint) {
          this.m_joints.push(joint);
      }
      solveWorld(step) {
          const world = this.m_world;
          // Clear all the island flags.
          for (let b = world.m_bodyList; b; b = b.m_next) {
              b.m_islandFlag = false;
          }
          for (let c = world.m_contactList; c; c = c.m_next) {
              c.m_islandFlag = false;
          }
          for (let j = world.m_jointList; j; j = j.m_next) {
              j.m_islandFlag = false;
          }
          // Build and simulate all awake islands.
          const stack = this.m_stack;
          for (let seed = world.m_bodyList; seed; seed = seed.m_next) {
              if (seed.m_islandFlag) {
                  continue;
              }
              if (seed.isAwake() == false || seed.isActive() == false) {
                  continue;
              }
              // The seed can be dynamic or kinematic.
              if (seed.isStatic()) {
                  continue;
              }
              // Reset island and stack.
              this.clear();
              stack.push(seed);
              seed.m_islandFlag = true;
              // Perform a depth first search (DFS) on the constraint graph.
              while (stack.length > 0) {
                  // Grab the next body off the stack and add it to the island.
                  const b = stack.pop();
                  this.addBody(b);
                  // Make sure the body is awake (without resetting sleep timer).
                  b.m_awakeFlag = true;
                  // To keep islands as small as possible, we don't
                  // propagate islands across static bodies.
                  if (b.isStatic()) {
                      continue;
                  }
                  // Search all contacts connected to this body.
                  for (let ce = b.m_contactList; ce; ce = ce.next) {
                      const contact = ce.contact;
                      // Has this contact already been added to an island?
                      if (contact.m_islandFlag) {
                          continue;
                      }
                      // Is this contact solid and touching?
                      if (contact.isEnabled() == false || contact.isTouching() == false) {
                          continue;
                      }
                      // Skip sensors.
                      const sensorA = contact.m_fixtureA.m_isSensor;
                      const sensorB = contact.m_fixtureB.m_isSensor;
                      if (sensorA || sensorB) {
                          continue;
                      }
                      this.addContact(contact);
                      contact.m_islandFlag = true;
                      const other = ce.other;
                      // Was the other body already added to this island?
                      if (other.m_islandFlag) {
                          continue;
                      }
                      // false && console.assert(stack.length < world.m_bodyCount);
                      stack.push(other);
                      other.m_islandFlag = true;
                  }
                  // Search all joints connect to this body.
                  for (let je = b.m_jointList; je; je = je.next) {
                      if (je.joint.m_islandFlag == true) {
                          continue;
                      }
                      const other = je.other;
                      // Don't simulate joints connected to inactive bodies.
                      if (other.isActive() == false) {
                          continue;
                      }
                      this.addJoint(je.joint);
                      je.joint.m_islandFlag = true;
                      if (other.m_islandFlag) {
                          continue;
                      }
                      // false && console.assert(stack.length < world.m_bodyCount);
                      stack.push(other);
                      other.m_islandFlag = true;
                  }
              }
              this.solveIsland(step);
              // Post solve cleanup.
              for (let i = 0; i < this.m_bodies.length; ++i) {
                  // Allow static bodies to participate in other islands.
                  // TODO: are they added at all?
                  const b = this.m_bodies[i];
                  if (b.isStatic()) {
                      b.m_islandFlag = false;
                  }
              }
          }
      }
      solveIsland(step) {
          // B2: Island Solve
          const world = this.m_world;
          const gravity = world.m_gravity;
          const allowSleep = world.m_allowSleep;
          const h = step.dt;
          // Integrate velocities and apply damping. Initialize the body state.
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              copyVec2(c, body.m_sweep.c);
              const a = body.m_sweep.a;
              copyVec2(v, body.m_linearVelocity);
              let w = body.m_angularVelocity;
              // Store positions for continuous collision.
              copyVec2(body.m_sweep.c0, body.m_sweep.c);
              body.m_sweep.a0 = body.m_sweep.a;
              if (body.isDynamic()) {
                  // Integrate velocities.
                  plusScaleVec2(v, h * body.m_gravityScale, gravity);
                  plusScaleVec2(v, h * body.m_invMass, body.m_force);
                  w += h * body.m_invI * body.m_torque;
                  /**
                   * <pre>
                   * Apply damping.
                   * ODE: dv/dt + c * v = 0
                   * Solution: v(t) = v0 * exp(-c * t)
                   * Time step: v(t + dt) = v0 * exp(-c * (t + dt)) = v0 * exp(-c * t) * exp(-c * dt) = v * exp(-c * dt)
                   * v2 = exp(-c * dt) * v1
                   * Pade approximation:
                   * v2 = v1 * 1 / (1 + c * dt)
                   * </pre>
                   */
                  scaleVec2(v, 1.0 / (1.0 + h * body.m_linearDamping), v);
                  w *= 1.0 / (1.0 + h * body.m_angularDamping);
              }
              copyVec2(body.c_position.c, c);
              body.c_position.a = a;
              copyVec2(body.c_velocity.v, v);
              body.c_velocity.w = w;
          }
          for (let i = 0; i < this.m_contacts.length; ++i) {
              const contact = this.m_contacts[i];
              contact.initConstraint(step);
          }
          for (let i = 0; i < this.m_contacts.length; ++i) {
              const contact = this.m_contacts[i];
              contact.initVelocityConstraint(step);
          }
          if (step.warmStarting) {
              // Warm start.
              for (let i = 0; i < this.m_contacts.length; ++i) {
                  const contact = this.m_contacts[i];
                  contact.warmStartConstraint(step);
              }
          }
          for (let i = 0; i < this.m_joints.length; ++i) {
              const joint = this.m_joints[i];
              joint.initVelocityConstraints(step);
          }
          // Solve velocity constraints
          for (let i = 0; i < step.velocityIterations; ++i) {
              for (let j = 0; j < this.m_joints.length; ++j) {
                  const joint = this.m_joints[j];
                  joint.solveVelocityConstraints(step);
              }
              for (let j = 0; j < this.m_contacts.length; ++j) {
                  const contact = this.m_contacts[j];
                  contact.solveVelocityConstraint(step);
              }
          }
          // Store impulses for warm starting
          for (let i = 0; i < this.m_contacts.length; ++i) {
              const contact = this.m_contacts[i];
              contact.storeConstraintImpulses(step);
          }
          // Integrate positions
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              copyVec2(c, body.c_position.c);
              let a = body.c_position.a;
              copyVec2(v, body.c_velocity.v);
              let w = body.c_velocity.w;
              // Check for large velocities
              scaleVec2(translation, h, v);
              const translationLengthSqr = lengthSqrVec2(translation);
              if (translationLengthSqr > SettingsInternal.maxTranslationSquared) {
                  const ratio = SettingsInternal.maxTranslation / math_sqrt$4(translationLengthSqr);
                  mulVec2(v, ratio);
              }
              const rotation = h * w;
              if (rotation * rotation > SettingsInternal.maxRotationSquared) {
                  const ratio = SettingsInternal.maxRotation / math_abs$8(rotation);
                  w *= ratio;
              }
              // Integrate
              plusScaleVec2(c, h, v);
              a += h * w;
              copyVec2(body.c_position.c, c);
              body.c_position.a = a;
              copyVec2(body.c_velocity.v, v);
              body.c_velocity.w = w;
          }
          // Solve position constraints
          let positionSolved = false;
          for (let i = 0; i < step.positionIterations; ++i) {
              let minSeparation = 0.0;
              for (let j = 0; j < this.m_contacts.length; ++j) {
                  const contact = this.m_contacts[j];
                  const separation = contact.solvePositionConstraint(step);
                  minSeparation = math_min$7(minSeparation, separation);
              }
              // We can't expect minSpeparation >= -Settings.linearSlop because we don't
              // push the separation above -Settings.linearSlop.
              const contactsOkay = minSeparation >= -3.0 * SettingsInternal.linearSlop;
              let jointsOkay = true;
              for (let j = 0; j < this.m_joints.length; ++j) {
                  const joint = this.m_joints[j];
                  const jointOkay = joint.solvePositionConstraints(step);
                  jointsOkay = jointsOkay && jointOkay;
              }
              if (contactsOkay && jointsOkay) {
                  // Exit early if the position errors are small.
                  positionSolved = true;
                  break;
              }
          }
          // Copy state buffers back to the bodies
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              copyVec2(body.m_sweep.c, body.c_position.c);
              body.m_sweep.a = body.c_position.a;
              copyVec2(body.m_linearVelocity, body.c_velocity.v);
              body.m_angularVelocity = body.c_velocity.w;
              body.synchronizeTransform();
          }
          this.postSolveIsland();
          if (allowSleep) {
              let minSleepTime = Infinity;
              const linTolSqr = SettingsInternal.linearSleepToleranceSqr;
              const angTolSqr = SettingsInternal.angularSleepToleranceSqr;
              for (let i = 0; i < this.m_bodies.length; ++i) {
                  const body = this.m_bodies[i];
                  if (body.isStatic()) {
                      continue;
                  }
                  if ((body.m_autoSleepFlag == false)
                      || (body.m_angularVelocity * body.m_angularVelocity > angTolSqr)
                      || (lengthSqrVec2(body.m_linearVelocity) > linTolSqr)) {
                      body.m_sleepTime = 0.0;
                      minSleepTime = 0.0;
                  }
                  else {
                      body.m_sleepTime += h;
                      minSleepTime = math_min$7(minSleepTime, body.m_sleepTime);
                  }
              }
              if (minSleepTime >= SettingsInternal.timeToSleep && positionSolved) {
                  for (let i = 0; i < this.m_bodies.length; ++i) {
                      const body = this.m_bodies[i];
                      body.setAwake(false);
                  }
              }
          }
      }
      /**
       * Find TOI contacts and solve them.
       */
      solveWorldTOI(step) {
          const world = this.m_world;
          if (world.m_stepComplete) {
              for (let b = world.m_bodyList; b; b = b.m_next) {
                  b.m_islandFlag = false;
                  b.m_sweep.alpha0 = 0.0;
              }
              for (let c = world.m_contactList; c; c = c.m_next) {
                  // Invalidate TOI
                  c.m_toiFlag = false;
                  c.m_islandFlag = false;
                  c.m_toiCount = 0;
                  c.m_toi = 1.0;
              }
          }
          // Find TOI events and solve them.
          while (true) {
              // Find the first TOI.
              let minContact = null;
              let minAlpha = 1.0;
              for (let c = world.m_contactList; c; c = c.m_next) {
                  // Is this contact disabled?
                  if (c.isEnabled() == false) {
                      continue;
                  }
                  // Prevent excessive sub-stepping.
                  if (c.m_toiCount > SettingsInternal.maxSubSteps) {
                      continue;
                  }
                  let alpha = 1.0;
                  if (c.m_toiFlag) {
                      // This contact has a valid cached TOI.
                      alpha = c.m_toi;
                  }
                  else {
                      const fA = c.getFixtureA();
                      const fB = c.getFixtureB();
                      // Is there a sensor?
                      if (fA.isSensor() || fB.isSensor()) {
                          continue;
                      }
                      const bA = fA.getBody();
                      const bB = fB.getBody();
                      const activeA = bA.isAwake() && !bA.isStatic();
                      const activeB = bB.isAwake() && !bB.isStatic();
                      // Is at least one body active (awake and dynamic or kinematic)?
                      if (activeA == false && activeB == false) {
                          continue;
                      }
                      const collideA = bA.isBullet() || !bA.isDynamic();
                      const collideB = bB.isBullet() || !bB.isDynamic();
                      // Are these two non-bullet dynamic bodies?
                      if (collideA == false && collideB == false) {
                          continue;
                      }
                      // Compute the TOI for this contact.
                      // Put the sweeps onto the same time interval.
                      let alpha0 = bA.m_sweep.alpha0;
                      if (bA.m_sweep.alpha0 < bB.m_sweep.alpha0) {
                          alpha0 = bB.m_sweep.alpha0;
                          bA.m_sweep.advance(alpha0);
                      }
                      else if (bB.m_sweep.alpha0 < bA.m_sweep.alpha0) {
                          alpha0 = bA.m_sweep.alpha0;
                          bB.m_sweep.advance(alpha0);
                      }
                      const indexA = c.getChildIndexA();
                      const indexB = c.getChildIndexB();
                      bA.m_sweep;
                      bB.m_sweep;
                      // Compute the time of impact in interval [0, minTOI]
                      input.proxyA.set(fA.getShape(), indexA);
                      input.proxyB.set(fB.getShape(), indexB);
                      input.sweepA.set(bA.m_sweep);
                      input.sweepB.set(bB.m_sweep);
                      input.tMax = 1.0;
                      TimeOfImpact(output, input);
                      // Beta is the fraction of the remaining portion of the [time?].
                      const beta = output.t;
                      if (output.state == exports.TOIOutputState.e_touching) {
                          alpha = math_min$7(alpha0 + (1.0 - alpha0) * beta, 1.0);
                      }
                      else {
                          alpha = 1.0;
                      }
                      c.m_toi = alpha;
                      c.m_toiFlag = true;
                  }
                  if (alpha < minAlpha) {
                      // This is the minimum TOI found so far.
                      minContact = c;
                      minAlpha = alpha;
                  }
              }
              if (minContact == null || 1.0 - 10.0 * EPSILON < minAlpha) {
                  // No more TOI events. Done!
                  world.m_stepComplete = true;
                  break;
              }
              // Advance the bodies to the TOI.
              const fA = minContact.getFixtureA();
              const fB = minContact.getFixtureB();
              const bA = fA.getBody();
              const bB = fB.getBody();
              backup1.set(bA.m_sweep);
              backup2.set(bB.m_sweep);
              bA.advance(minAlpha);
              bB.advance(minAlpha);
              // The TOI contact likely has some new contact points.
              minContact.update(world);
              minContact.m_toiFlag = false;
              ++minContact.m_toiCount;
              // Is the contact solid?
              if (minContact.isEnabled() == false || minContact.isTouching() == false) {
                  // Restore the sweeps.
                  minContact.setEnabled(false);
                  bA.m_sweep.set(backup1);
                  bB.m_sweep.set(backup2);
                  bA.synchronizeTransform();
                  bB.synchronizeTransform();
                  continue;
              }
              bA.setAwake(true);
              bB.setAwake(true);
              // Build the island
              this.clear();
              this.addBody(bA);
              this.addBody(bB);
              this.addContact(minContact);
              bA.m_islandFlag = true;
              bB.m_islandFlag = true;
              minContact.m_islandFlag = true;
              // Get contacts on bodyA and bodyB.
              const bodies = [bA, bB];
              for (let i = 0; i < bodies.length; ++i) {
                  const body = bodies[i];
                  if (body.isDynamic()) {
                      for (let ce = body.m_contactList; ce; ce = ce.next) {
                          // if (this.m_bodyCount == this.m_bodyCapacity) { break; }
                          // if (this.m_contactCount == this.m_contactCapacity) { break; }
                          const contact = ce.contact;
                          // Has this contact already been added to the island?
                          if (contact.m_islandFlag) {
                              continue;
                          }
                          // Only add if either is static, kinematic or bullet.
                          const other = ce.other;
                          if (other.isDynamic() && !body.isBullet() && !other.isBullet()) {
                              continue;
                          }
                          // Skip sensors.
                          const sensorA = contact.m_fixtureA.m_isSensor;
                          const sensorB = contact.m_fixtureB.m_isSensor;
                          if (sensorA || sensorB) {
                              continue;
                          }
                          // Tentatively advance the body to the TOI.
                          backup.set(other.m_sweep);
                          if (other.m_islandFlag == false) {
                              other.advance(minAlpha);
                          }
                          // Update the contact points
                          contact.update(world);
                          // Was the contact disabled by the user?
                          // Are there contact points?
                          if (contact.isEnabled() == false || contact.isTouching() == false) {
                              other.m_sweep.set(backup);
                              other.synchronizeTransform();
                              continue;
                          }
                          // Add the contact to the island
                          contact.m_islandFlag = true;
                          this.addContact(contact);
                          // Has the other body already been added to the island?
                          if (other.m_islandFlag) {
                              continue;
                          }
                          // Add the other body to the island.
                          other.m_islandFlag = true;
                          if (!other.isStatic()) {
                              other.setAwake(true);
                          }
                          this.addBody(other);
                      }
                  }
              }
              s_subStep.reset((1.0 - minAlpha) * step.dt);
              s_subStep.dtRatio = 1.0;
              s_subStep.positionIterations = 20;
              s_subStep.velocityIterations = step.velocityIterations;
              s_subStep.warmStarting = false;
              this.solveIslandTOI(s_subStep, bA, bB);
              // Reset island flags and synchronize broad-phase proxies.
              for (let i = 0; i < this.m_bodies.length; ++i) {
                  const body = this.m_bodies[i];
                  body.m_islandFlag = false;
                  if (!body.isDynamic()) {
                      continue;
                  }
                  body.synchronizeFixtures();
                  // Invalidate all contact TOIs on this displaced body.
                  for (let ce = body.m_contactList; ce; ce = ce.next) {
                      ce.contact.m_toiFlag = false;
                      ce.contact.m_islandFlag = false;
                  }
              }
              // Commit fixture proxy movements to the broad-phase so that new contacts
              // are created.
              // Also, some contacts can be destroyed.
              world.findNewContacts();
              if (world.m_subStepping) {
                  world.m_stepComplete = false;
                  break;
              }
          }
      }
      solveIslandTOI(subStep, toiA, toiB) {
          // Initialize the body state.
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              copyVec2(body.c_position.c, body.m_sweep.c);
              body.c_position.a = body.m_sweep.a;
              copyVec2(body.c_velocity.v, body.m_linearVelocity);
              body.c_velocity.w = body.m_angularVelocity;
          }
          for (let i = 0; i < this.m_contacts.length; ++i) {
              const contact = this.m_contacts[i];
              contact.initConstraint(subStep);
          }
          // Solve position constraints.
          for (let i = 0; i < subStep.positionIterations; ++i) {
              let minSeparation = 0.0;
              for (let j = 0; j < this.m_contacts.length; ++j) {
                  const contact = this.m_contacts[j];
                  const separation = contact.solvePositionConstraintTOI(subStep, toiA, toiB);
                  minSeparation = math_min$7(minSeparation, separation);
              }
              // We can't expect minSpeparation >= -Settings.linearSlop because we don't
              // push the separation above -Settings.linearSlop.
              const contactsOkay = minSeparation >= -1.5 * SettingsInternal.linearSlop;
              if (contactsOkay) {
                  break;
              }
          }
          // Leap of faith to new safe state.
          copyVec2(toiA.m_sweep.c0, toiA.c_position.c);
          toiA.m_sweep.a0 = toiA.c_position.a;
          copyVec2(toiB.m_sweep.c0, toiB.c_position.c);
          toiB.m_sweep.a0 = toiB.c_position.a;
          // No warm starting is needed for TOI events because warm
          // starting impulses were applied in the discrete solver.
          for (let i = 0; i < this.m_contacts.length; ++i) {
              const contact = this.m_contacts[i];
              contact.initVelocityConstraint(subStep);
          }
          // Solve velocity constraints.
          for (let i = 0; i < subStep.velocityIterations; ++i) {
              for (let j = 0; j < this.m_contacts.length; ++j) {
                  const contact = this.m_contacts[j];
                  contact.solveVelocityConstraint(subStep);
              }
          }
          // Don't store the TOI contact forces for warm starting
          // because they can be quite large.
          const h = subStep.dt;
          // Integrate positions
          for (let i = 0; i < this.m_bodies.length; ++i) {
              const body = this.m_bodies[i];
              copyVec2(c, body.c_position.c);
              let a = body.c_position.a;
              copyVec2(v, body.c_velocity.v);
              let w = body.c_velocity.w;
              // Check for large velocities
              scaleVec2(translation, h, v);
              const translationLengthSqr = lengthSqrVec2(translation);
              if (translationLengthSqr > SettingsInternal.maxTranslationSquared) {
                  const ratio = SettingsInternal.maxTranslation / math_sqrt$4(translationLengthSqr);
                  mulVec2(v, ratio);
              }
              const rotation = h * w;
              if (rotation * rotation > SettingsInternal.maxRotationSquared) {
                  const ratio = SettingsInternal.maxRotation / math_abs$8(rotation);
                  w *= ratio;
              }
              // Integrate
              plusScaleVec2(c, h, v);
              a += h * w;
              copyVec2(body.c_position.c, c);
              body.c_position.a = a;
              copyVec2(body.c_velocity.v, v);
              body.c_velocity.w = w;
              // Sync bodies
              copyVec2(body.m_sweep.c, c);
              body.m_sweep.a = a;
              copyVec2(body.m_linearVelocity, v);
              body.m_angularVelocity = w;
              body.synchronizeTransform();
          }
          this.postSolveIsland();
      }
      /** @internal */
      postSolveIsland() {
          for (let c = 0; c < this.m_contacts.length; ++c) {
              const contact = this.m_contacts[c];
              this.m_world.postSolve(contact, contact.m_impulse);
          }
      }
  }
  // @ts-ignore
  Solver.TimeStep = TimeStep;

  /*
   * Copyright (c) 2016-2018 Ali Shakiba http://shakiba.me/planck.js
   *
   * This software is provided 'as-is', without any express or implied
   * warranty.  In no event will the authors be held liable for any damages
   * arising from the use of this software.
   * Permission is granted to anyone to use this software for any purpose,
   * including commercial applications, and to alter it and redistribute it
   * freely, subject to the following restrictions:
   * 1. The origin of this software must not be misrepresented; you must not
   * claim that you wrote the original software. If you use this software
   * in a product, an acknowledgment in the product documentation would be
   * appreciated but is not required.
   * 2. Altered source versions must be plainly marked as such, and must not be
   * misrepresented as being the original software.
   * 3. This notice may not be removed or altered from any source distribution.
   */
  /** @internal */
  class Pool {
      constructor(opts) {
          this._list = [];
          this._max = Infinity;
          this._hasCreateFn = false;
          this._createCount = 0;
          this._hasAllocateFn = false;
          this._allocateCount = 0;
          this._hasReleaseFn = false;
          this._releaseCount = 0;
          this._hasDisposeFn = false;
          this._disposeCount = 0;
          this._list = [];
          this._max = opts.max || this._max;
          this._createFn = opts.create;
          this._hasCreateFn = typeof this._createFn === 'function';
          this._allocateFn = opts.allocate;
          this._hasAllocateFn = typeof this._allocateFn === 'function';
          this._releaseFn = opts.release;
          this._hasReleaseFn = typeof this._releaseFn === 'function';
          this._disposeFn = opts.dispose;
          this._hasDisposeFn = typeof this._disposeFn === 'function';
      }
      max(n) {
          if (typeof n === 'number') {
              this._max = n;
              return this;
          }
          return this._max;
      }
      size() {
          return this._list.length;
      }
      allocate() {
          let item;
          if (this._list.length > 0) {
              item = this._list.shift();
          }
          else {
              this._createCount++;
              if (this._hasCreateFn) {
                  item = this._createFn();
              }
              else {
                  // tslint:disable-next-line:no-object-literal-type-assertion
                  item = {};
              }
          }
          this._allocateCount++;
          if (this._hasAllocateFn) {
              this._allocateFn(item);
          }
          return item;
      }
      release(item) {
          if (this._list.length < this._max) {
              this._releaseCount++;
              if (this._hasReleaseFn) {
                  this._releaseFn(item);
              }
              this._list.push(item);
          }
          else {
              this._disposeCount++;
              if (this._hasDisposeFn) {
                  item = this._disposeFn(item);
              }
          }
      }
      toString() {
          return " +" + this._createCount + " >" + this._allocateCount + " <" + this._releaseCount + " -"
              + this._disposeCount + " =" + this._list.length + "/" + this._max;
      }
  }

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
  /** @internal */ const math_sqrt$3 = Math.sqrt;
  /** @internal */ const math_max$5 = Math.max;
  /** @internal */ const math_min$6 = Math.min;
  /** @internal */ const contactPool = new Pool({
      create() {
          return new Contact();
      },
      release(contact) {
          contact.recycle();
      }
  });
  /** @internal */ const oldManifold = new Manifold();
  /** @internal */ const worldManifold = new WorldManifold();
  /**
   * A contact edge is used to connect bodies and contacts together in a contact
   * graph where each body is a node and each contact is an edge. A contact edge
   * belongs to a doubly linked list maintained in each attached body. Each
   * contact has two contact nodes, one for each attached body.
   */
  class ContactEdge {
      constructor(contact) {
          this.prev = null;
          this.next = null;
          this.other = null;
          this.contact = contact;
      }
      /** @internal */
      recycle() {
          this.prev = null;
          this.next = null;
          this.other = null;
      }
  }
  /**
   * Friction mixing law. The idea is to allow either fixture to drive the
   * friction to zero. For example, anything slides on ice.
   */
  function mixFriction(friction1, friction2) {
      return math_sqrt$3(friction1 * friction2);
  }
  /**
   * Restitution mixing law. The idea is allow for anything to bounce off an
   * inelastic surface. For example, a superball bounces on anything.
   */
  function mixRestitution(restitution1, restitution2) {
      return restitution1 > restitution2 ? restitution1 : restitution2;
  }
  // TODO: move this to Settings?
  /** @internal */ const s_registers = [];
  // TODO: merge with ManifoldPoint?
  class VelocityConstraintPoint {
      constructor() {
          this.rA = vec2(0, 0);
          this.rB = vec2(0, 0);
          this.normalImpulse = 0;
          this.tangentImpulse = 0;
          this.normalMass = 0;
          this.tangentMass = 0;
          this.velocityBias = 0;
      }
      recycle() {
          zeroVec2(this.rA);
          zeroVec2(this.rB);
          this.normalImpulse = 0;
          this.tangentImpulse = 0;
          this.normalMass = 0;
          this.tangentMass = 0;
          this.velocityBias = 0;
      }
  }
  /** @internal */ const cA = vec2(0, 0);
  /** @internal */ const vA = vec2(0, 0);
  /** @internal */ const cB = vec2(0, 0);
  /** @internal */ const vB = vec2(0, 0);
  /** @internal */ const tangent$1 = vec2(0, 0);
  /** @internal */ const xfA = transform(0, 0, 0);
  /** @internal */ const xfB = transform(0, 0, 0);
  /** @internal */ const pointA = vec2(0, 0);
  /** @internal */ const pointB = vec2(0, 0);
  /** @internal */ const clipPoint = vec2(0, 0);
  /** @internal */ const planePoint$1 = vec2(0, 0);
  /** @internal */ const rA = vec2(0, 0);
  /** @internal */ const rB = vec2(0, 0);
  /** @internal */ const P$1 = vec2(0, 0);
  /** @internal */ const normal$2 = vec2(0, 0);
  /** @internal */ const point = vec2(0, 0);
  /** @internal */ const dv = vec2(0, 0);
  /** @internal */ const dv1 = vec2(0, 0);
  /** @internal */ const dv2 = vec2(0, 0);
  /** @internal */ const b = vec2(0, 0);
  /** @internal */ const a = vec2(0, 0);
  /** @internal */ const x = vec2(0, 0);
  /** @internal */ const d = vec2(0, 0);
  /** @internal */ const P1 = vec2(0, 0);
  /** @internal */ const P2 = vec2(0, 0);
  /** @internal */ const temp$2 = vec2(0, 0);
  /**
   * The class manages contact between two shapes. A contact exists for each
   * overlapping AABB in the broad-phase (except if filtered). Therefore a contact
   * object may exist that has no contact points.
   */
  class Contact {
      constructor() {
          // Nodes for connecting bodies.
          /** @internal */ this.m_nodeA = new ContactEdge(this);
          /** @internal */ this.m_nodeB = new ContactEdge(this);
          /** @internal */ this.m_fixtureA = null;
          /** @internal */ this.m_fixtureB = null;
          /** @internal */ this.m_indexA = -1;
          /** @internal */ this.m_indexB = -1;
          /** @internal */ this.m_evaluateFcn = null;
          /** @internal */ this.m_manifold = new Manifold();
          /** @internal */ this.m_prev = null;
          /** @internal */ this.m_next = null;
          /** @internal */ this.m_toi = 1.0;
          /** @internal */ this.m_toiCount = 0;
          // This contact has a valid TOI in m_toi
          /** @internal */ this.m_toiFlag = false;
          /** @internal */ this.m_friction = 0.0;
          /** @internal */ this.m_restitution = 0.0;
          /** @internal */ this.m_tangentSpeed = 0.0;
          /** @internal This contact can be disabled (by user) */
          this.m_enabledFlag = true;
          /** @internal Used when crawling contact graph when forming islands. */
          this.m_islandFlag = false;
          /** @internal Set when the shapes are touching. */
          this.m_touchingFlag = false;
          /** @internal This contact needs filtering because a fixture filter was changed. */
          this.m_filterFlag = false;
          /** @internal This bullet contact had a TOI event */
          this.m_bulletHitFlag = false;
          /** @internal Contact reporting impulse object cache */
          this.m_impulse = new ContactImpulse(this);
          // VelocityConstraint
          /** @internal */ this.v_points = [new VelocityConstraintPoint(), new VelocityConstraintPoint()]; // [maxManifoldPoints];
          /** @internal */ this.v_normal = vec2(0, 0);
          /** @internal */ this.v_normalMass = new Mat22();
          /** @internal */ this.v_K = new Mat22();
          /** @internal */ this.v_pointCount = 0;
          /** @internal */ this.v_tangentSpeed = 0;
          /** @internal */ this.v_friction = 0;
          /** @internal */ this.v_restitution = 0;
          /** @internal */ this.v_invMassA = 0;
          /** @internal */ this.v_invMassB = 0;
          /** @internal */ this.v_invIA = 0;
          /** @internal */ this.v_invIB = 0;
          // PositionConstraint
          /** @internal */ this.p_localPoints = [vec2(0, 0), vec2(0, 0)]; // [maxManifoldPoints];
          /** @internal */ this.p_localNormal = vec2(0, 0);
          /** @internal */ this.p_localPoint = vec2(0, 0);
          /** @internal */ this.p_localCenterA = vec2(0, 0);
          /** @internal */ this.p_localCenterB = vec2(0, 0);
          /** @internal */ this.p_type = exports.ManifoldType.e_unset;
          /** @internal */ this.p_radiusA = 0;
          /** @internal */ this.p_radiusB = 0;
          /** @internal */ this.p_pointCount = 0;
          /** @internal */ this.p_invMassA = 0;
          /** @internal */ this.p_invMassB = 0;
          /** @internal */ this.p_invIA = 0;
          /** @internal */ this.p_invIB = 0;
      }
      /** @internal */
      initialize(fA, indexA, fB, indexB, evaluateFcn) {
          this.m_fixtureA = fA;
          this.m_fixtureB = fB;
          this.m_indexA = indexA;
          this.m_indexB = indexB;
          this.m_evaluateFcn = evaluateFcn;
          this.m_friction = mixFriction(this.m_fixtureA.m_friction, this.m_fixtureB.m_friction);
          this.m_restitution = mixRestitution(this.m_fixtureA.m_restitution, this.m_fixtureB.m_restitution);
      }
      /** @internal */
      recycle() {
          this.m_nodeA.recycle();
          this.m_nodeB.recycle();
          this.m_fixtureA = null;
          this.m_fixtureB = null;
          this.m_indexA = -1;
          this.m_indexB = -1;
          this.m_evaluateFcn = null;
          this.m_manifold.recycle();
          this.m_prev = null;
          this.m_next = null;
          this.m_toi = 1;
          this.m_toiCount = 0;
          this.m_toiFlag = false;
          this.m_friction = 0;
          this.m_restitution = 0;
          this.m_tangentSpeed = 0;
          this.m_enabledFlag = true;
          this.m_islandFlag = false;
          this.m_touchingFlag = false;
          this.m_filterFlag = false;
          this.m_bulletHitFlag = false;
          this.m_impulse.recycle();
          // VelocityConstraint
          for (const point of this.v_points) {
              point.recycle();
          }
          zeroVec2(this.v_normal);
          this.v_normalMass.setZero();
          this.v_K.setZero();
          this.v_pointCount = 0;
          this.v_tangentSpeed = 0;
          this.v_friction = 0;
          this.v_restitution = 0;
          this.v_invMassA = 0;
          this.v_invMassB = 0;
          this.v_invIA = 0;
          this.v_invIB = 0;
          // PositionConstraint
          for (const point of this.p_localPoints) {
              zeroVec2(point);
          }
          zeroVec2(this.p_localNormal);
          zeroVec2(this.p_localPoint);
          zeroVec2(this.p_localCenterA);
          zeroVec2(this.p_localCenterB);
          this.p_type = exports.ManifoldType.e_unset;
          this.p_radiusA = 0;
          this.p_radiusB = 0;
          this.p_pointCount = 0;
          this.p_invMassA = 0;
          this.p_invMassB = 0;
          this.p_invIA = 0;
          this.p_invIB = 0;
      }
      initConstraint(step) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          const shapeA = fixtureA.m_shape;
          const shapeB = fixtureB.m_shape;
          if (shapeA === null || shapeB === null)
              return;
          const manifold = this.m_manifold;
          const pointCount = manifold.pointCount;
          this.v_invMassA = bodyA.m_invMass;
          this.v_invMassB = bodyB.m_invMass;
          this.v_invIA = bodyA.m_invI;
          this.v_invIB = bodyB.m_invI;
          this.v_friction = this.m_friction;
          this.v_restitution = this.m_restitution;
          this.v_tangentSpeed = this.m_tangentSpeed;
          this.v_pointCount = pointCount;
          this.v_K.setZero();
          this.v_normalMass.setZero();
          this.p_invMassA = bodyA.m_invMass;
          this.p_invMassB = bodyB.m_invMass;
          this.p_invIA = bodyA.m_invI;
          this.p_invIB = bodyB.m_invI;
          copyVec2(this.p_localCenterA, bodyA.m_sweep.localCenter);
          copyVec2(this.p_localCenterB, bodyB.m_sweep.localCenter);
          this.p_radiusA = shapeA.m_radius;
          this.p_radiusB = shapeB.m_radius;
          this.p_type = manifold.type;
          copyVec2(this.p_localNormal, manifold.localNormal);
          copyVec2(this.p_localPoint, manifold.localPoint);
          this.p_pointCount = pointCount;
          for (let j = 0; j < SettingsInternal.maxManifoldPoints; ++j) {
              this.v_points[j].recycle();
              zeroVec2(this.p_localPoints[j]);
          }
          for (let j = 0; j < pointCount; ++j) {
              const cp = manifold.points[j];
              const vcp = this.v_points[j];
              if (step.warmStarting) {
                  vcp.normalImpulse = step.dtRatio * cp.normalImpulse;
                  vcp.tangentImpulse = step.dtRatio * cp.tangentImpulse;
              }
              copyVec2(this.p_localPoints[j], cp.localPoint);
          }
      }
      /**
       * Get the contact manifold. Do not modify the manifold unless you understand
       * the internals of the library.
       */
      getManifold() {
          return this.m_manifold;
      }
      /**
       * Get the world manifold.
       */
      getWorldManifold(worldManifold) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          const shapeA = fixtureA.m_shape;
          const shapeB = fixtureB.m_shape;
          if (shapeA === null || shapeB === null)
              return;
          return this.m_manifold.getWorldManifold(worldManifold, bodyA.getTransform(), shapeA.m_radius, bodyB.getTransform(), shapeB.m_radius);
      }
      /**
       * Enable/disable this contact. This can be used inside the pre-solve contact
       * listener. The contact is only disabled for the current time step (or sub-step
       * in continuous collisions).
       */
      setEnabled(flag) {
          this.m_enabledFlag = !!flag;
      }
      /**
       * Has this contact been disabled?
       */
      isEnabled() {
          return this.m_enabledFlag;
      }
      /**
       * Is this contact touching?
       */
      isTouching() {
          return this.m_touchingFlag;
      }
      /**
       * Get the next contact in the world's contact list.
       */
      getNext() {
          return this.m_next;
      }
      /**
       * Get fixture A in this contact.
       */
      getFixtureA() {
          return this.m_fixtureA;
      }
      /**
       * Get fixture B in this contact.
       */
      getFixtureB() {
          return this.m_fixtureB;
      }
      /**
       * Get the child primitive index for fixture A.
       */
      getChildIndexA() {
          return this.m_indexA;
      }
      /**
       * Get the child primitive index for fixture B.
       */
      getChildIndexB() {
          return this.m_indexB;
      }
      /**
       * Flag this contact for filtering. Filtering will occur the next time step.
       */
      flagForFiltering() {
          this.m_filterFlag = true;
      }
      /**
       * Override the default friction mixture. You can call this in
       * "pre-solve" callback. This value persists until set or reset.
       */
      setFriction(friction) {
          this.m_friction = friction;
      }
      /**
       * Get the friction.
       */
      getFriction() {
          return this.m_friction;
      }
      /**
       * Reset the friction mixture to the default value.
       */
      resetFriction() {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          this.m_friction = mixFriction(fixtureA.m_friction, fixtureB.m_friction);
      }
      /**
       * Override the default restitution mixture. You can call this in
       * "pre-solve" callback. The value persists until you set or reset.
       */
      setRestitution(restitution) {
          this.m_restitution = restitution;
      }
      /**
       * Get the restitution.
       */
      getRestitution() {
          return this.m_restitution;
      }
      /**
       * Reset the restitution to the default value.
       */
      resetRestitution() {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          this.m_restitution = mixRestitution(fixtureA.m_restitution, fixtureB.m_restitution);
      }
      /**
       * Set the desired tangent speed for a conveyor belt behavior. In meters per
       * second.
       */
      setTangentSpeed(speed) {
          this.m_tangentSpeed = speed;
      }
      /**
       * Get the desired tangent speed. In meters per second.
       */
      getTangentSpeed() {
          return this.m_tangentSpeed;
      }
      /**
       * Called by Update method, and implemented by subclasses.
       */
      evaluate(manifold, xfA, xfB) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          this.m_evaluateFcn(manifold, xfA, fixtureA, this.m_indexA, xfB, fixtureB, this.m_indexB);
      }
      /**
       * Updates the contact manifold and touching status.
       *
       * Note: do not assume the fixture AABBs are overlapping or are valid.
       *
       * @param listener.beginContact
       * @param listener.endContact
       * @param listener.preSolve
       */
      update(listener) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          const shapeA = fixtureA.m_shape;
          const shapeB = fixtureB.m_shape;
          if (shapeA === null || shapeB === null)
              return;
          // Re-enable this contact.
          this.m_enabledFlag = true;
          let touching = false;
          const wasTouching = this.m_touchingFlag;
          const sensorA = fixtureA.m_isSensor;
          const sensorB = fixtureB.m_isSensor;
          const sensor = sensorA || sensorB;
          const xfA = bodyA.m_xf;
          const xfB = bodyB.m_xf;
          // Is this contact a sensor?
          if (sensor) {
              touching = testOverlap(shapeA, this.m_indexA, shapeB, this.m_indexB, xfA, xfB);
              // Sensors don't generate manifolds.
              this.m_manifold.pointCount = 0;
          }
          else {
              oldManifold.recycle();
              oldManifold.set(this.m_manifold);
              this.m_manifold.recycle();
              this.evaluate(this.m_manifold, xfA, xfB);
              touching = this.m_manifold.pointCount > 0;
              // Match old contact ids to new contact ids and copy the
              // stored impulses to warm start the solver.
              for (let i = 0; i < this.m_manifold.pointCount; ++i) {
                  const nmp = this.m_manifold.points[i];
                  nmp.normalImpulse = 0.0;
                  nmp.tangentImpulse = 0.0;
                  for (let j = 0; j < oldManifold.pointCount; ++j) {
                      const omp = oldManifold.points[j];
                      if (omp.id.key === nmp.id.key) {
                          nmp.normalImpulse = omp.normalImpulse;
                          nmp.tangentImpulse = omp.tangentImpulse;
                          break;
                      }
                  }
              }
              if (touching !== wasTouching) {
                  bodyA.setAwake(true);
                  bodyB.setAwake(true);
              }
          }
          this.m_touchingFlag = touching;
          const hasListener = typeof listener === 'object' && listener !== null;
          if (!wasTouching && touching && hasListener) {
              listener.beginContact(this);
          }
          if (wasTouching && !touching && hasListener) {
              listener.endContact(this);
          }
          if (!sensor && touching && hasListener && oldManifold) {
              listener.preSolve(this, oldManifold);
          }
      }
      solvePositionConstraint(step) {
          return this._solvePositionConstraint(step, null, null);
      }
      solvePositionConstraintTOI(step, toiA, toiB) {
          return this._solvePositionConstraint(step, toiA, toiB);
      }
      _solvePositionConstraint(step, toiA, toiB) {
          const toi = toiA !== null && toiB !== null ? true : false;
          let minSeparation = 0.0;
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return minSeparation;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return minSeparation;
          bodyA.c_velocity;
          bodyB.c_velocity;
          const positionA = bodyA.c_position;
          const positionB = bodyB.c_position;
          const localCenterA = this.p_localCenterA;
          const localCenterB = this.p_localCenterB;
          let mA = 0.0;
          let iA = 0.0;
          if (!toi || (bodyA === toiA || bodyA === toiB)) {
              mA = this.p_invMassA;
              iA = this.p_invIA;
          }
          let mB = 0.0;
          let iB = 0.0;
          if (!toi || (bodyB === toiA || bodyB === toiB)) {
              mB = this.p_invMassB;
              iB = this.p_invIB;
          }
          copyVec2(cA, positionA.c);
          let aA = positionA.a;
          copyVec2(cB, positionB.c);
          let aB = positionB.a;
          // Solve normal constraints
          for (let j = 0; j < this.p_pointCount; ++j) {
              getTransform(xfA, localCenterA, cA, aA);
              getTransform(xfB, localCenterB, cB, aB);
              // PositionSolverManifold
              let separation;
              switch (this.p_type) {
                  case exports.ManifoldType.e_circles: {
                      transformVec2(pointA, xfA, this.p_localPoint);
                      transformVec2(pointB, xfB, this.p_localPoints[0]);
                      subVec2(normal$2, pointB, pointA);
                      normalizeVec2(normal$2);
                      combine2Vec2(point, 0.5, pointA, 0.5, pointB);
                      separation = dotVec2(pointB, normal$2) - dotVec2(pointA, normal$2) - this.p_radiusA - this.p_radiusB;
                      break;
                  }
                  case exports.ManifoldType.e_faceA: {
                      rotVec2(normal$2, xfA.q, this.p_localNormal);
                      transformVec2(planePoint$1, xfA, this.p_localPoint);
                      transformVec2(clipPoint, xfB, this.p_localPoints[j]);
                      separation = dotVec2(clipPoint, normal$2) - dotVec2(planePoint$1, normal$2) - this.p_radiusA - this.p_radiusB;
                      copyVec2(point, clipPoint);
                      break;
                  }
                  case exports.ManifoldType.e_faceB: {
                      rotVec2(normal$2, xfB.q, this.p_localNormal);
                      transformVec2(planePoint$1, xfB, this.p_localPoint);
                      transformVec2(clipPoint, xfA, this.p_localPoints[j]);
                      separation = dotVec2(clipPoint, normal$2) - dotVec2(planePoint$1, normal$2) - this.p_radiusA - this.p_radiusB;
                      copyVec2(point, clipPoint);
                      // Ensure normal points from A to B
                      negVec2(normal$2);
                      break;
                  }
                  // todo: what should we do here?
                  default: {
                      return minSeparation;
                  }
              }
              subVec2(rA, point, cA);
              subVec2(rB, point, cB);
              // Track max constraint error.
              minSeparation = math_min$6(minSeparation, separation);
              const baumgarte = toi ? SettingsInternal.toiBaugarte : SettingsInternal.baumgarte;
              const linearSlop = SettingsInternal.linearSlop;
              const maxLinearCorrection = SettingsInternal.maxLinearCorrection;
              // Prevent large corrections and allow slop.
              const C = clamp$2(baumgarte * (separation + linearSlop), -maxLinearCorrection, 0.0);
              // Compute the effective mass.
              const rnA = crossVec2Vec2(rA, normal$2);
              const rnB = crossVec2Vec2(rB, normal$2);
              const K = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
              // Compute normal impulse
              const impulse = K > 0.0 ? -C / K : 0.0;
              scaleVec2(P$1, impulse, normal$2);
              minusScaleVec2(cA, mA, P$1);
              aA -= iA * crossVec2Vec2(rA, P$1);
              plusScaleVec2(cB, mB, P$1);
              aB += iB * crossVec2Vec2(rB, P$1);
          }
          copyVec2(positionA.c, cA);
          positionA.a = aA;
          copyVec2(positionB.c, cB);
          positionB.a = aB;
          return minSeparation;
      }
      initVelocityConstraint(step) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          const velocityA = bodyA.c_velocity;
          const velocityB = bodyB.c_velocity;
          const positionA = bodyA.c_position;
          const positionB = bodyB.c_position;
          const radiusA = this.p_radiusA;
          const radiusB = this.p_radiusB;
          const manifold = this.m_manifold;
          const mA = this.v_invMassA;
          const mB = this.v_invMassB;
          const iA = this.v_invIA;
          const iB = this.v_invIB;
          const localCenterA = this.p_localCenterA;
          const localCenterB = this.p_localCenterB;
          copyVec2(cA, positionA.c);
          const aA = positionA.a;
          copyVec2(vA, velocityA.v);
          const wA = velocityA.w;
          copyVec2(cB, positionB.c);
          const aB = positionB.a;
          copyVec2(vB, velocityB.v);
          const wB = velocityB.w;
          getTransform(xfA, localCenterA, cA, aA);
          getTransform(xfB, localCenterB, cB, aB);
          worldManifold.recycle();
          manifold.getWorldManifold(worldManifold, xfA, radiusA, xfB, radiusB);
          copyVec2(this.v_normal, worldManifold.normal);
          for (let j = 0; j < this.v_pointCount; ++j) {
              const vcp = this.v_points[j]; // VelocityConstraintPoint
              const wmp = worldManifold.points[j];
              subVec2(vcp.rA, wmp, cA);
              subVec2(vcp.rB, wmp, cB);
              const rnA = crossVec2Vec2(vcp.rA, this.v_normal);
              const rnB = crossVec2Vec2(vcp.rB, this.v_normal);
              const kNormal = mA + mB + iA * rnA * rnA + iB * rnB * rnB;
              vcp.normalMass = kNormal > 0.0 ? 1.0 / kNormal : 0.0;
              crossVec2Num(tangent$1, this.v_normal, 1.0);
              const rtA = crossVec2Vec2(vcp.rA, tangent$1);
              const rtB = crossVec2Vec2(vcp.rB, tangent$1);
              const kTangent = mA + mB + iA * rtA * rtA + iB * rtB * rtB;
              vcp.tangentMass = kTangent > 0.0 ? 1.0 / kTangent : 0.0;
              // Setup a velocity bias for restitution.
              vcp.velocityBias = 0.0;
              let vRel = 0;
              vRel += dotVec2(this.v_normal, vB);
              vRel += dotVec2(this.v_normal, crossNumVec2(temp$2, wB, vcp.rB));
              vRel -= dotVec2(this.v_normal, vA);
              vRel -= dotVec2(this.v_normal, crossNumVec2(temp$2, wA, vcp.rA));
              if (vRel < -SettingsInternal.velocityThreshold) {
                  vcp.velocityBias = -this.v_restitution * vRel;
              }
          }
          // If we have two points, then prepare the block solver.
          if (this.v_pointCount == 2 && step.blockSolve) {
              const vcp1 = this.v_points[0]; // VelocityConstraintPoint
              const vcp2 = this.v_points[1]; // VelocityConstraintPoint
              const rn1A = crossVec2Vec2(vcp1.rA, this.v_normal);
              const rn1B = crossVec2Vec2(vcp1.rB, this.v_normal);
              const rn2A = crossVec2Vec2(vcp2.rA, this.v_normal);
              const rn2B = crossVec2Vec2(vcp2.rB, this.v_normal);
              const k11 = mA + mB + iA * rn1A * rn1A + iB * rn1B * rn1B;
              const k22 = mA + mB + iA * rn2A * rn2A + iB * rn2B * rn2B;
              const k12 = mA + mB + iA * rn1A * rn2A + iB * rn1B * rn2B;
              // Ensure a reasonable condition number.
              const k_maxConditionNumber = 1000.0;
              if (k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
                  // K is safe to invert.
                  set$1(k11, k12, this.v_K.ex);
                  set$1(k12, k22, this.v_K.ey);
                  // this.v_normalMass.set(this.v_K.getInverse());
                  const a = this.v_K.ex[0];
                  const b = this.v_K.ey[0];
                  const c = this.v_K.ex[1];
                  const d = this.v_K.ey[1];
                  let det = a * d - b * c;
                  if (det !== 0.0) {
                      det = 1.0 / det;
                  }
                  this.v_normalMass.ex[0] = det * d;
                  this.v_normalMass.ey[0] = -det * b;
                  this.v_normalMass.ex[1] = -det * c;
                  this.v_normalMass.ey[1] = det * a;
              }
              else {
                  // The constraints are redundant, just use one.
                  // TODO_ERIN use deepest?
                  this.v_pointCount = 1;
              }
          }
          copyVec2(positionA.c, cA);
          positionA.a = aA;
          copyVec2(velocityA.v, vA);
          velocityA.w = wA;
          copyVec2(positionB.c, cB);
          positionB.a = aB;
          copyVec2(velocityB.v, vB);
          velocityB.w = wB;
      }
      warmStartConstraint(step) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          const velocityA = bodyA.c_velocity;
          const velocityB = bodyB.c_velocity;
          bodyA.c_position;
          bodyB.c_position;
          const mA = this.v_invMassA;
          const iA = this.v_invIA;
          const mB = this.v_invMassB;
          const iB = this.v_invIB;
          copyVec2(vA, velocityA.v);
          let wA = velocityA.w;
          copyVec2(vB, velocityB.v);
          let wB = velocityB.w;
          copyVec2(normal$2, this.v_normal);
          crossVec2Num(tangent$1, normal$2, 1.0);
          for (let j = 0; j < this.v_pointCount; ++j) {
              const vcp = this.v_points[j]; // VelocityConstraintPoint
              combine2Vec2(P$1, vcp.normalImpulse, normal$2, vcp.tangentImpulse, tangent$1);
              wA -= iA * crossVec2Vec2(vcp.rA, P$1);
              minusScaleVec2(vA, mA, P$1);
              wB += iB * crossVec2Vec2(vcp.rB, P$1);
              plusScaleVec2(vB, mB, P$1);
          }
          copyVec2(velocityA.v, vA);
          velocityA.w = wA;
          copyVec2(velocityB.v, vB);
          velocityB.w = wB;
      }
      storeConstraintImpulses(step) {
          const manifold = this.m_manifold;
          for (let j = 0; j < this.v_pointCount; ++j) {
              manifold.points[j].normalImpulse = this.v_points[j].normalImpulse;
              manifold.points[j].tangentImpulse = this.v_points[j].tangentImpulse;
          }
      }
      solveVelocityConstraint(step) {
          const fixtureA = this.m_fixtureA;
          const fixtureB = this.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          const velocityA = bodyA.c_velocity;
          bodyA.c_position;
          const velocityB = bodyB.c_velocity;
          bodyB.c_position;
          const mA = this.v_invMassA;
          const iA = this.v_invIA;
          const mB = this.v_invMassB;
          const iB = this.v_invIB;
          copyVec2(vA, velocityA.v);
          let wA = velocityA.w;
          copyVec2(vB, velocityB.v);
          let wB = velocityB.w;
          copyVec2(normal$2, this.v_normal);
          crossVec2Num(tangent$1, normal$2, 1.0);
          const friction = this.v_friction;
          // Solve tangent constraints first because non-penetration is more important
          // than friction.
          for (let j = 0; j < this.v_pointCount; ++j) {
              const vcp = this.v_points[j]; // VelocityConstraintPoint
              // Relative velocity at contact
              zeroVec2(dv);
              plusVec2(dv, vB);
              plusVec2(dv, crossNumVec2(temp$2, wB, vcp.rB));
              minusVec2(dv, vA);
              minusVec2(dv, crossNumVec2(temp$2, wA, vcp.rA));
              // Compute tangent force
              const vt = dotVec2(dv, tangent$1) - this.v_tangentSpeed;
              let lambda = vcp.tangentMass * (-vt);
              // Clamp the accumulated force
              const maxFriction = friction * vcp.normalImpulse;
              const newImpulse = clamp$2(vcp.tangentImpulse + lambda, -maxFriction, maxFriction);
              lambda = newImpulse - vcp.tangentImpulse;
              vcp.tangentImpulse = newImpulse;
              // Apply contact impulse
              scaleVec2(P$1, lambda, tangent$1);
              minusScaleVec2(vA, mA, P$1);
              wA -= iA * crossVec2Vec2(vcp.rA, P$1);
              plusScaleVec2(vB, mB, P$1);
              wB += iB * crossVec2Vec2(vcp.rB, P$1);
          }
          // Solve normal constraints
          if (this.v_pointCount == 1 || step.blockSolve == false) {
              for (let i = 0; i < this.v_pointCount; ++i) {
                  const vcp = this.v_points[i]; // VelocityConstraintPoint
                  // Relative velocity at contact
                  zeroVec2(dv);
                  plusVec2(dv, vB);
                  plusVec2(dv, crossNumVec2(temp$2, wB, vcp.rB));
                  minusVec2(dv, vA);
                  minusVec2(dv, crossNumVec2(temp$2, wA, vcp.rA));
                  // Compute normal impulse
                  const vn = dotVec2(dv, normal$2);
                  let lambda = -vcp.normalMass * (vn - vcp.velocityBias);
                  // Clamp the accumulated impulse
                  const newImpulse = math_max$5(vcp.normalImpulse + lambda, 0.0);
                  lambda = newImpulse - vcp.normalImpulse;
                  vcp.normalImpulse = newImpulse;
                  // Apply contact impulse
                  scaleVec2(P$1, lambda, normal$2);
                  minusScaleVec2(vA, mA, P$1);
                  wA -= iA * crossVec2Vec2(vcp.rA, P$1);
                  plusScaleVec2(vB, mB, P$1);
                  wB += iB * crossVec2Vec2(vcp.rB, P$1);
              }
          }
          else {
              // Block solver developed in collaboration with Dirk Gregorius (back in
              // 01/07 on Box2D_Lite).
              // Build the mini LCP for this contact patch
              //
              // vn = A * x + b, vn >= 0, x >= 0 and vn_i * x_i = 0 with i = 1..2
              //
              // A = J * W * JT and J = ( -n, -r1 x n, n, r2 x n )
              // b = vn0 - velocityBias
              //
              // The system is solved using the "Total enumeration method" (s. Murty).
              // The complementary constraint vn_i * x_i
              // implies that we must have in any solution either vn_i = 0 or x_i = 0.
              // So for the 2D contact problem the cases
              // vn1 = 0 and vn2 = 0, x1 = 0 and x2 = 0, x1 = 0 and vn2 = 0, x2 = 0 and
              // vn1 = 0 need to be tested. The first valid
              // solution that satisfies the problem is chosen.
              //
              // In order to account of the accumulated impulse 'a' (because of the
              // iterative nature of the solver which only requires
              // that the accumulated impulse is clamped and not the incremental
              // impulse) we change the impulse variable (x_i).
              //
              // Substitute:
              //
              // x = a + d
              //
              // a := old total impulse
              // x := new total impulse
              // d := incremental impulse
              //
              // For the current iteration we extend the formula for the incremental
              // impulse
              // to compute the new total impulse:
              //
              // vn = A * d + b
              // = A * (x - a) + b
              // = A * x + b - A * a
              // = A * x + b'
              // b' = b - A * a;
              const vcp1 = this.v_points[0]; // VelocityConstraintPoint
              const vcp2 = this.v_points[1]; // VelocityConstraintPoint
              set$1(vcp1.normalImpulse, vcp2.normalImpulse, a);
              // Relative velocity at contact
              // let dv1 = Vec2.zero().add(vB).add(Vec2.crossNumVec2(wB, vcp1.rB)).sub(vA).sub(Vec2.crossNumVec2(wA, vcp1.rA));
              zeroVec2(dv1);
              plusVec2(dv1, vB);
              plusVec2(dv1, crossNumVec2(temp$2, wB, vcp1.rB));
              minusVec2(dv1, vA);
              minusVec2(dv1, crossNumVec2(temp$2, wA, vcp1.rA));
              // let dv2 = Vec2.zero().add(vB).add(Vec2.crossNumVec2(wB, vcp2.rB)).sub(vA).sub(Vec2.crossNumVec2(wA, vcp2.rA));
              zeroVec2(dv2);
              plusVec2(dv2, vB);
              plusVec2(dv2, crossNumVec2(temp$2, wB, vcp2.rB));
              minusVec2(dv2, vA);
              minusVec2(dv2, crossNumVec2(temp$2, wA, vcp2.rA));
              // Compute normal velocity
              let vn1 = dotVec2(dv1, normal$2);
              let vn2 = dotVec2(dv2, normal$2);
              set$1(vn1 - vcp1.velocityBias, vn2 - vcp2.velocityBias, b);
              // Compute b'
              // b.sub(Mat22.mulVec2(this.v_K, a));
              b[0] -= this.v_K.ex[0] * a[0] + this.v_K.ey[0] * a[1];
              b[1] -= this.v_K.ex[1] * a[0] + this.v_K.ey[1] * a[1];
              // NOT_USED(k_errorTol);
              while (true) {
                  //
                  // Case 1: vn = 0
                  //
                  // 0 = A * x + b'
                  //
                  // Solve for x:
                  //
                  // x = - inv(A) * b'
                  //
                  // const x = Mat22.mulVec2(this.v_normalMass, b).neg();
                  zeroVec2(x);
                  x[0] = -(this.v_normalMass.ex[0] * b[0] + this.v_normalMass.ey[0] * b[1]);
                  x[1] = -(this.v_normalMass.ex[1] * b[0] + this.v_normalMass.ey[1] * b[1]);
                  if (x[0] >= 0.0 && x[1] >= 0.0) {
                      // Get the incremental impulse
                      subVec2(d, x, a);
                      // Apply incremental impulse
                      scaleVec2(P1, d[0], normal$2);
                      scaleVec2(P2, d[1], normal$2);
                      // vA.subCombine(mA, P1, mA, P2);
                      combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
                      wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
                      // vB.addCombine(mB, P1, mB, P2);
                      combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
                      wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
                      // Accumulate
                      vcp1.normalImpulse = x[0];
                      vcp2.normalImpulse = x[1];
                      break;
                  }
                  //
                  // Case 2: vn1 = 0 and x2 = 0
                  //
                  // 0 = a11 * x1 + a12 * 0 + b1'
                  // vn2 = a21 * x1 + a22 * 0 + b2'
                  //
                  x[0] = -vcp1.normalMass * b[0];
                  x[1] = 0.0;
                  vn1 = 0.0;
                  vn2 = this.v_K.ex[1] * x[0] + b[1];
                  if (x[0] >= 0.0 && vn2 >= 0.0) {
                      // Get the incremental impulse
                      subVec2(d, x, a);
                      // Apply incremental impulse
                      scaleVec2(P1, d[0], normal$2);
                      scaleVec2(P2, d[1], normal$2);
                      // vA.subCombine(mA, P1, mA, P2);
                      combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
                      wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
                      // vB.addCombine(mB, P1, mB, P2);
                      combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
                      wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
                      // Accumulate
                      vcp1.normalImpulse = x[0];
                      vcp2.normalImpulse = x[1];
                      break;
                  }
                  //
                  // Case 3: vn2 = 0 and x1 = 0
                  //
                  // vn1 = a11 * 0 + a12 * x2 + b1'
                  // 0 = a21 * 0 + a22 * x2 + b2'
                  //
                  x[0] = 0.0;
                  x[1] = -vcp2.normalMass * b[1];
                  vn1 = this.v_K.ey[0] * x[1] + b[0];
                  vn2 = 0.0;
                  if (x[1] >= 0.0 && vn1 >= 0.0) {
                      // Resubstitute for the incremental impulse
                      subVec2(d, x, a);
                      // Apply incremental impulse
                      scaleVec2(P1, d[0], normal$2);
                      scaleVec2(P2, d[1], normal$2);
                      // vA.subCombine(mA, P1, mA, P2);
                      combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
                      wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
                      // vB.addCombine(mB, P1, mB, P2);
                      combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
                      wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
                      // Accumulate
                      vcp1.normalImpulse = x[0];
                      vcp2.normalImpulse = x[1];
                      break;
                  }
                  //
                  // Case 4: x1 = 0 and x2 = 0
                  //
                  // vn1 = b1
                  // vn2 = b2;
                  //
                  x[0] = 0.0;
                  x[1] = 0.0;
                  vn1 = b[0];
                  vn2 = b[1];
                  if (vn1 >= 0.0 && vn2 >= 0.0) {
                      // Resubstitute for the incremental impulse
                      subVec2(d, x, a);
                      // Apply incremental impulse
                      scaleVec2(P1, d[0], normal$2);
                      scaleVec2(P2, d[1], normal$2);
                      // vA.subCombine(mA, P1, mA, P2);
                      combine3Vec2(vA, -mA, P1, -mA, P2, 1, vA);
                      wA -= iA * (crossVec2Vec2(vcp1.rA, P1) + crossVec2Vec2(vcp2.rA, P2));
                      // vB.addCombine(mB, P1, mB, P2);
                      combine3Vec2(vB, mB, P1, mB, P2, 1, vB);
                      wB += iB * (crossVec2Vec2(vcp1.rB, P1) + crossVec2Vec2(vcp2.rB, P2));
                      // Accumulate
                      vcp1.normalImpulse = x[0];
                      vcp2.normalImpulse = x[1];
                      break;
                  }
                  // No solution, give up. This is hit sometimes, but it doesn't seem to
                  // matter.
                  break;
              }
          }
          copyVec2(velocityA.v, vA);
          velocityA.w = wA;
          copyVec2(velocityB.v, vB);
          velocityB.w = wB;
      }
      /** @internal */
      static addType(type1, type2, callback) {
          s_registers[type1] = s_registers[type1] || {};
          s_registers[type1][type2] = callback;
      }
      /** @internal */
      static create(fixtureA, indexA, fixtureB, indexB) {
          const typeA = fixtureA.m_shape.m_type;
          const typeB = fixtureB.m_shape.m_type;
          const contact = contactPool.allocate();
          let evaluateFcn;
          if (evaluateFcn = s_registers[typeA] && s_registers[typeA][typeB]) {
              contact.initialize(fixtureA, indexA, fixtureB, indexB, evaluateFcn);
          }
          else if (evaluateFcn = s_registers[typeB] && s_registers[typeB][typeA]) {
              contact.initialize(fixtureB, indexB, fixtureA, indexA, evaluateFcn);
          }
          else {
              return null;
          }
          // Contact creation may swap fixtures.
          fixtureA = contact.m_fixtureA;
          fixtureB = contact.m_fixtureB;
          indexA = contact.getChildIndexA();
          indexB = contact.getChildIndexB();
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          // Connect to body A
          contact.m_nodeA.contact = contact;
          contact.m_nodeA.other = bodyB;
          contact.m_nodeA.prev = null;
          contact.m_nodeA.next = bodyA.m_contactList;
          if (bodyA.m_contactList != null) {
              bodyA.m_contactList.prev = contact.m_nodeA;
          }
          bodyA.m_contactList = contact.m_nodeA;
          // Connect to body B
          contact.m_nodeB.contact = contact;
          contact.m_nodeB.other = bodyA;
          contact.m_nodeB.prev = null;
          contact.m_nodeB.next = bodyB.m_contactList;
          if (bodyB.m_contactList != null) {
              bodyB.m_contactList.prev = contact.m_nodeB;
          }
          bodyB.m_contactList = contact.m_nodeB;
          // Wake up the bodies
          if (fixtureA.isSensor() == false && fixtureB.isSensor() == false) {
              bodyA.setAwake(true);
              bodyB.setAwake(true);
          }
          return contact;
      }
      /** @internal */
      static destroy(contact, listener) {
          const fixtureA = contact.m_fixtureA;
          const fixtureB = contact.m_fixtureB;
          if (fixtureA === null || fixtureB === null)
              return;
          const bodyA = fixtureA.m_body;
          const bodyB = fixtureB.m_body;
          if (bodyA === null || bodyB === null)
              return;
          if (contact.isTouching()) {
              listener.endContact(contact);
          }
          // Remove from body 1
          if (contact.m_nodeA.prev) {
              contact.m_nodeA.prev.next = contact.m_nodeA.next;
          }
          if (contact.m_nodeA.next) {
              contact.m_nodeA.next.prev = contact.m_nodeA.prev;
          }
          if (contact.m_nodeA == bodyA.m_contactList) {
              bodyA.m_contactList = contact.m_nodeA.next;
          }
          // Remove from body 2
          if (contact.m_nodeB.prev) {
              contact.m_nodeB.prev.next = contact.m_nodeB.next;
          }
          if (contact.m_nodeB.next) {
              contact.m_nodeB.next.prev = contact.m_nodeB.prev;
          }
          if (contact.m_nodeB == bodyB.m_contactList) {
              bodyB.m_contactList = contact.m_nodeB.next;
          }
          if (contact.m_manifold.pointCount > 0 && !fixtureA.m_isSensor && !fixtureB.m_isSensor) {
              bodyA.setAwake(true);
              bodyB.setAwake(true);
          }
          // const typeA = fixtureA.getType();
          // const typeB = fixtureB.getType();
          // const destroyFcn = s_registers[typeA][typeB].destroyFcn;
          // if (typeof destroyFcn === 'function') {
          //   destroyFcn(contact);
          // }
          contactPool.release(contact);
      }
  }

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
  /** @internal */ const math_abs$7 = Math.abs;
  /** @internal */ const math_max$4 = Math.max;
  /**
   * A node in the dynamic tree. The client does not interact with this directly.
   */
  class TreeNode {
      constructor(id) {
          /** Enlarged AABB */
          this.aabb = new AABB();
          this.userData = null;
          this.parent = null;
          this.child1 = null;
          this.child2 = null;
          /** 0: leaf, -1: free node */
          this.height = -1;
          this.id = id;
      }
      /** @internal */
      toString() {
          return this.id + ": " + this.userData;
      }
      isLeaf() {
          return this.child1 == null;
      }
  }
  /** @internal */ const poolTreeNode = new Pool({
      create() {
          return new TreeNode();
      },
      release(node) {
          node.userData = null;
          node.parent = null;
          node.child1 = null;
          node.child2 = null;
          node.height = -1;
          node.id = undefined;
      }
  });
  /**
   * A dynamic AABB tree broad-phase, inspired by Nathanael Presson's btDbvt. A
   * dynamic tree arranges data in a binary tree to accelerate queries such as
   * volume queries and ray casts. Leafs are proxies with an AABB. In the tree we
   * expand the proxy AABB by `aabbExtension` so that the proxy AABB is bigger
   * than the client object. This allows the client object to move by small
   * amounts without triggering a tree update.
   *
   * Nodes are pooled and relocatable, so we use node indices rather than
   * pointers.
   */
  class DynamicTree {
      constructor() {
          this.inputPool = new Pool({
              create() {
                  // tslint:disable-next-line:no-object-literal-type-assertion
                  return {};
              },
              release(stack) {
              }
          });
          this.stackPool = new Pool({
              create() {
                  return [];
              },
              release(stack) {
                  stack.length = 0;
              }
          });
          this.iteratorPool = new Pool({
              create() {
                  return new Iterator();
              },
              release(iterator) {
                  iterator.close();
              }
          });
          this.m_root = null;
          this.m_nodes = {};
          this.m_lastProxyId = 0;
      }
      /**
       * Get proxy user data.
       *
       * @return the proxy user data or 0 if the id is invalid.
       */
      getUserData(id) {
          const node = this.m_nodes[id];
          return node.userData;
      }
      /**
       * Get the fat AABB for a node id.
       *
       * @return the proxy user data or 0 if the id is invalid.
       */
      getFatAABB(id) {
          const node = this.m_nodes[id];
          return node.aabb;
      }
      allocateNode() {
          const node = poolTreeNode.allocate();
          node.id = ++this.m_lastProxyId;
          this.m_nodes[node.id] = node;
          return node;
      }
      freeNode(node) {
          // tslint:disable-next-line:no-dynamic-delete
          delete this.m_nodes[node.id];
          poolTreeNode.release(node);
      }
      /**
       * Create a proxy in the tree as a leaf node. We return the index of the node
       * instead of a pointer so that we can grow the node pool.
       *
       * Create a proxy. Provide a tight fitting AABB and a userData pointer.
       */
      createProxy(aabb, userData) {
          const node = this.allocateNode();
          node.aabb.set(aabb);
          // Fatten the aabb.
          AABB.extend(node.aabb, SettingsInternal.aabbExtension);
          node.userData = userData;
          node.height = 0;
          this.insertLeaf(node);
          return node.id;
      }
      /**
       * Destroy a proxy. This asserts if the id is invalid.
       */
      destroyProxy(id) {
          const node = this.m_nodes[id];
          this.removeLeaf(node);
          this.freeNode(node);
      }
      /**
       * Move a proxy with a swepted AABB. If the proxy has moved outside of its
       * fattened AABB, then the proxy is removed from the tree and re-inserted.
       * Otherwise the function returns immediately.
       *
       * @param d Displacement
       *
       * @return true if the proxy was re-inserted.
       */
      moveProxy(id, aabb, d) {
          const node = this.m_nodes[id];
          if (node.aabb.contains(aabb)) {
              return false;
          }
          this.removeLeaf(node);
          node.aabb.set(aabb);
          // Extend AABB.
          aabb = node.aabb;
          AABB.extend(aabb, SettingsInternal.aabbExtension);
          // Predict AABB displacement.
          // const d = Vec2.scale(displacement, Settings.aabbMultiplier);
          if (d[0] < 0.0) {
              aabb.lowerBound[0] += d[0] * SettingsInternal.aabbMultiplier;
          }
          else {
              aabb.upperBound[0] += d[0] * SettingsInternal.aabbMultiplier;
          }
          if (d[1] < 0.0) {
              aabb.lowerBound[1] += d[1] * SettingsInternal.aabbMultiplier;
          }
          else {
              aabb.upperBound[1] += d[1] * SettingsInternal.aabbMultiplier;
          }
          this.insertLeaf(node);
          return true;
      }
      insertLeaf(leaf) {
          if (this.m_root == null) {
              this.m_root = leaf;
              this.m_root.parent = null;
              return;
          }
          // Find the best sibling for this node
          const leafAABB = leaf.aabb;
          let index = this.m_root;
          while (!index.isLeaf()) {
              const child1 = index.child1;
              const child2 = index.child2;
              const area = index.aabb.getPerimeter();
              const combinedArea = AABB.combinedPerimeter(index.aabb, leafAABB);
              // Cost of creating a new parent for this node and the new leaf
              const cost = 2.0 * combinedArea;
              // Minimum cost of pushing the leaf further down the tree
              const inheritanceCost = 2.0 * (combinedArea - area);
              // Cost of descending into child1
              const newArea1 = AABB.combinedPerimeter(leafAABB, child1.aabb);
              let cost1 = newArea1 + inheritanceCost;
              if (!child1.isLeaf()) {
                  const oldArea = child1.aabb.getPerimeter();
                  cost1 -= oldArea;
              }
              // Cost of descending into child2
              const newArea2 = AABB.combinedPerimeter(leafAABB, child2.aabb);
              let cost2 = newArea2 + inheritanceCost;
              if (!child2.isLeaf()) {
                  const oldArea = child2.aabb.getPerimeter();
                  cost2 -= oldArea;
              }
              // Descend according to the minimum cost.
              if (cost < cost1 && cost < cost2) {
                  break;
              }
              // Descend
              if (cost1 < cost2) {
                  index = child1;
              }
              else {
                  index = child2;
              }
          }
          const sibling = index;
          // Create a new parent.
          const oldParent = sibling.parent;
          const newParent = this.allocateNode();
          newParent.parent = oldParent;
          newParent.userData = null;
          newParent.aabb.combine(leafAABB, sibling.aabb);
          newParent.height = sibling.height + 1;
          if (oldParent != null) {
              // The sibling was not the root.
              if (oldParent.child1 === sibling) {
                  oldParent.child1 = newParent;
              }
              else {
                  oldParent.child2 = newParent;
              }
              newParent.child1 = sibling;
              newParent.child2 = leaf;
              sibling.parent = newParent;
              leaf.parent = newParent;
          }
          else {
              // The sibling was the root.
              newParent.child1 = sibling;
              newParent.child2 = leaf;
              sibling.parent = newParent;
              leaf.parent = newParent;
              this.m_root = newParent;
          }
          // Walk back up the tree fixing heights and AABBs
          index = leaf.parent;
          while (index != null) {
              index = this.balance(index);
              const child1 = index.child1;
              const child2 = index.child2;
              index.height = 1 + math_max$4(child1.height, child2.height);
              index.aabb.combine(child1.aabb, child2.aabb);
              index = index.parent;
          }
          // validate();
      }
      removeLeaf(leaf) {
          if (leaf === this.m_root) {
              this.m_root = null;
              return;
          }
          const parent = leaf.parent;
          const grandParent = parent.parent;
          let sibling;
          if (parent.child1 === leaf) {
              sibling = parent.child2;
          }
          else {
              sibling = parent.child1;
          }
          if (grandParent != null) {
              // Destroy parent and connect sibling to grandParent.
              if (grandParent.child1 === parent) {
                  grandParent.child1 = sibling;
              }
              else {
                  grandParent.child2 = sibling;
              }
              sibling.parent = grandParent;
              this.freeNode(parent);
              // Adjust ancestor bounds.
              let index = grandParent;
              while (index != null) {
                  index = this.balance(index);
                  const child1 = index.child1;
                  const child2 = index.child2;
                  index.aabb.combine(child1.aabb, child2.aabb);
                  index.height = 1 + math_max$4(child1.height, child2.height);
                  index = index.parent;
              }
          }
          else {
              this.m_root = sibling;
              sibling.parent = null;
              this.freeNode(parent);
          }
          // validate();
      }
      /**
       * Perform a left or right rotation if node A is imbalanced. Returns the new
       * root index.
       */
      balance(iA) {
          const A = iA;
          if (A.isLeaf() || A.height < 2) {
              return iA;
          }
          const B = A.child1;
          const C = A.child2;
          const balance = C.height - B.height;
          // Rotate C up
          if (balance > 1) {
              const F = C.child1;
              const G = C.child2;
              // Swap A and C
              C.child1 = A;
              C.parent = A.parent;
              A.parent = C;
              // A's old parent should point to C
              if (C.parent != null) {
                  if (C.parent.child1 === iA) {
                      C.parent.child1 = C;
                  }
                  else {
                      C.parent.child2 = C;
                  }
              }
              else {
                  this.m_root = C;
              }
              // Rotate
              if (F.height > G.height) {
                  C.child2 = F;
                  A.child2 = G;
                  G.parent = A;
                  A.aabb.combine(B.aabb, G.aabb);
                  C.aabb.combine(A.aabb, F.aabb);
                  A.height = 1 + math_max$4(B.height, G.height);
                  C.height = 1 + math_max$4(A.height, F.height);
              }
              else {
                  C.child2 = G;
                  A.child2 = F;
                  F.parent = A;
                  A.aabb.combine(B.aabb, F.aabb);
                  C.aabb.combine(A.aabb, G.aabb);
                  A.height = 1 + math_max$4(B.height, F.height);
                  C.height = 1 + math_max$4(A.height, G.height);
              }
              return C;
          }
          // Rotate B up
          if (balance < -1) {
              const D = B.child1;
              const E = B.child2;
              // Swap A and B
              B.child1 = A;
              B.parent = A.parent;
              A.parent = B;
              // A's old parent should point to B
              if (B.parent != null) {
                  if (B.parent.child1 === A) {
                      B.parent.child1 = B;
                  }
                  else {
                      B.parent.child2 = B;
                  }
              }
              else {
                  this.m_root = B;
              }
              // Rotate
              if (D.height > E.height) {
                  B.child2 = D;
                  A.child1 = E;
                  E.parent = A;
                  A.aabb.combine(C.aabb, E.aabb);
                  B.aabb.combine(A.aabb, D.aabb);
                  A.height = 1 + math_max$4(C.height, E.height);
                  B.height = 1 + math_max$4(A.height, D.height);
              }
              else {
                  B.child2 = E;
                  A.child1 = D;
                  D.parent = A;
                  A.aabb.combine(C.aabb, D.aabb);
                  B.aabb.combine(A.aabb, E.aabb);
                  A.height = 1 + math_max$4(C.height, D.height);
                  B.height = 1 + math_max$4(A.height, E.height);
              }
              return B;
          }
          return A;
      }
      /**
       * Compute the height of the binary tree in O(N) time. Should not be called
       * often.
       */
      getHeight() {
          if (this.m_root == null) {
              return 0;
          }
          return this.m_root.height;
      }
      /**
       * Get the ratio of the sum of the node areas to the root area.
       */
      getAreaRatio() {
          if (this.m_root == null) {
              return 0.0;
          }
          const root = this.m_root;
          const rootArea = root.aabb.getPerimeter();
          let totalArea = 0.0;
          let node;
          const it = this.iteratorPool.allocate().preorder(this.m_root);
          while (node = it.next()) {
              if (node.height < 0) {
                  // Free node in pool
                  continue;
              }
              totalArea += node.aabb.getPerimeter();
          }
          this.iteratorPool.release(it);
          return totalArea / rootArea;
      }
      /**
       * Compute the height of a sub-tree.
       */
      computeHeight(id) {
          let node;
          if (typeof id !== 'undefined') {
              node = this.m_nodes[id];
          }
          else {
              node = this.m_root;
          }
          // false && console.assert(0 <= id && id < this.m_nodeCapacity);
          if (node.isLeaf()) {
              return 0;
          }
          const height1 = this.computeHeight(node.child1.id);
          const height2 = this.computeHeight(node.child2.id);
          return 1 + math_max$4(height1, height2);
      }
      validateStructure(node) {
          if (node == null) {
              return;
          }
          if (node === this.m_root) ;
          const child1 = node.child1;
          const child2 = node.child2;
          if (node.isLeaf()) {
              return;
          }
          this.validateStructure(child1);
          this.validateStructure(child2);
      }
      validateMetrics(node) {
          if (node == null) {
              return;
          }
          const child1 = node.child1;
          const child2 = node.child2;
          if (node.isLeaf()) {
              return;
          }
          // false && console.assert(0 <= child1 && child1 < this.m_nodeCapacity);
          // false && console.assert(0 <= child2 && child2 < this.m_nodeCapacity);
          child1.height;
          child2.height;
          const aabb = new AABB();
          aabb.combine(child1.aabb, child2.aabb);
          this.validateMetrics(child1);
          this.validateMetrics(child2);
      }
      /**
       * Validate this tree. For testing.
       */
      validate() {
          return;
      }
      /**
       * Get the maximum balance of an node in the tree. The balance is the difference
       * in height of the two children of a node.
       */
      getMaxBalance() {
          let maxBalance = 0;
          let node;
          const it = this.iteratorPool.allocate().preorder(this.m_root);
          while (node = it.next()) {
              if (node.height <= 1) {
                  continue;
              }
              const balance = math_abs$7(node.child2.height - node.child1.height);
              maxBalance = math_max$4(maxBalance, balance);
          }
          this.iteratorPool.release(it);
          return maxBalance;
      }
      /**
       * Build an optimal tree. Very expensive. For testing.
       */
      rebuildBottomUp() {
          const nodes = [];
          let count = 0;
          // Build array of leaves. Free the rest.
          let node;
          const it = this.iteratorPool.allocate().preorder(this.m_root);
          while (node = it.next()) {
              if (node.height < 0) {
                  // free node in pool
                  continue;
              }
              if (node.isLeaf()) {
                  node.parent = null;
                  nodes[count] = node;
                  ++count;
              }
              else {
                  this.freeNode(node);
              }
          }
          this.iteratorPool.release(it);
          while (count > 1) {
              let minCost = Infinity;
              let iMin = -1;
              let jMin = -1;
              for (let i = 0; i < count; ++i) {
                  const aabbi = nodes[i].aabb;
                  for (let j = i + 1; j < count; ++j) {
                      const aabbj = nodes[j].aabb;
                      const cost = AABB.combinedPerimeter(aabbi, aabbj);
                      if (cost < minCost) {
                          iMin = i;
                          jMin = j;
                          minCost = cost;
                      }
                  }
              }
              const child1 = nodes[iMin];
              const child2 = nodes[jMin];
              const parent = this.allocateNode();
              parent.child1 = child1;
              parent.child2 = child2;
              parent.height = 1 + math_max$4(child1.height, child2.height);
              parent.aabb.combine(child1.aabb, child2.aabb);
              parent.parent = null;
              child1.parent = parent;
              child2.parent = parent;
              nodes[jMin] = nodes[count - 1];
              nodes[iMin] = parent;
              --count;
          }
          this.m_root = nodes[0];
      }
      /**
       * Shift the world origin. Useful for large worlds. The shift formula is:
       * position -= newOrigin
       *
       * @param newOrigin The new origin with respect to the old origin
       */
      shiftOrigin(newOrigin) {
          // Build array of leaves. Free the rest.
          let node;
          const it = this.iteratorPool.allocate().preorder(this.m_root);
          while (node = it.next()) {
              const aabb = node.aabb;
              aabb.lowerBound.x -= newOrigin[0];
              aabb.lowerBound.y -= newOrigin[1];
              aabb.upperBound.x -= newOrigin[0];
              aabb.upperBound.y -= newOrigin[1];
          }
          this.iteratorPool.release(it);
      }
      /**
       * Query an AABB for overlapping proxies. The callback class is called for each
       * proxy that overlaps the supplied AABB.
       */
      query(aabb, queryCallback) {
          const stack = this.stackPool.allocate();
          stack.push(this.m_root);
          while (stack.length > 0) {
              const node = stack.pop();
              if (node == null) {
                  continue;
              }
              if (AABB.testOverlap(node.aabb, aabb)) {
                  if (node.isLeaf()) {
                      const proceed = queryCallback(node.id);
                      if (proceed === false) {
                          return;
                      }
                  }
                  else {
                      stack.push(node.child1);
                      stack.push(node.child2);
                  }
              }
          }
          this.stackPool.release(stack);
      }
      /**
       * Ray-cast against the proxies in the tree. This relies on the callback to
       * perform a exact ray-cast in the case were the proxy contains a shape. The
       * callback also performs the any collision filtering. This has performance
       * roughly equal to k * log(n), where k is the number of collisions and n is the
       * number of proxies in the tree.
       *
       * @param input The ray-cast input data. The ray extends from `p1` to `p1 + maxFraction * (p2 - p1)`.
       * @param rayCastCallback A function that is called for each proxy that is hit by the ray. If the return value is a positive number it will update the maxFraction of the ray cast input, and if it is zero it will terminate they ray cast.
       */
      rayCast(input, rayCastCallback) {
          const p1 = input.p1;
          const p2 = input.p2;
          const r = sub$1(p2, p1);
          normalize(r, r);
          // v is perpendicular to the segment.
          const v = crossNumVec2$1(1.0, r);
          const abs_v = abs(v);
          // Separating axis for segment (Gino, p80).
          // |dot(v, p1 - c)| > dot(|v|, h)
          let maxFraction = input.maxFraction;
          // Build a bounding box for the segment.
          const segmentAABB = new AABB();
          let t = combine((1 - maxFraction), p1, maxFraction, p2);
          segmentAABB.combinePoints(p1, t);
          const stack = this.stackPool.allocate();
          const subInput = this.inputPool.allocate();
          stack.push(this.m_root);
          while (stack.length > 0) {
              const node = stack.pop();
              if (node == null) {
                  continue;
              }
              if (AABB.testOverlap(node.aabb, segmentAABB) === false) {
                  continue;
              }
              // Separating axis for segment (Gino, p80).
              // |dot(v, p1 - c)| > dot(|v|, h)
              const c = node.aabb.getCenter();
              const h = node.aabb.getExtents();
              const separation = math_abs$7(dot$1(v, sub$1(p1, c))) - dot$1(abs_v, h);
              if (separation > 0.0) {
                  continue;
              }
              if (node.isLeaf()) {
                  subInput.p1 = clone$1(input.p1);
                  subInput.p2 = clone$1(input.p2);
                  subInput.maxFraction = maxFraction;
                  const value = rayCastCallback(subInput, node.id);
                  if (value === 0.0) {
                      // The client has terminated the ray cast.
                      break;
                  }
                  else if (value > 0.0) {
                      // update segment bounding box.
                      maxFraction = value;
                      t = combine((1 - maxFraction), p1, maxFraction, p2);
                      segmentAABB.combinePoints(p1, t);
                  }
              }
              else {
                  stack.push(node.child1);
                  stack.push(node.child2);
              }
          }
          this.stackPool.release(stack);
          this.inputPool.release(subInput);
      }
  }
  /** @internal */
  class Iterator {
      constructor() {
          this.parents = [];
          this.states = [];
      }
      preorder(root) {
          this.parents.length = 0;
          this.parents.push(root);
          this.states.length = 0;
          this.states.push(0);
          return this;
      }
      next() {
          while (this.parents.length > 0) {
              const i = this.parents.length - 1;
              const node = this.parents[i];
              if (this.states[i] === 0) {
                  this.states[i] = 1;
                  return node;
              }
              if (this.states[i] === 1) {
                  this.states[i] = 2;
                  if (node.child1) {
                      this.parents.push(node.child1);
                      this.states.push(1);
                      return node.child1;
                  }
              }
              if (this.states[i] === 2) {
                  this.states[i] = 3;
                  if (node.child2) {
                      this.parents.push(node.child2);
                      this.states.push(1);
                      return node.child2;
                  }
              }
              this.parents.pop();
              this.states.pop();
          }
      }
      close() {
          this.parents.length = 0;
      }
  }

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
  /** @internal */ const math_max$3 = Math.max;
  /** @internal */ const math_min$5 = Math.min;
  /**
   * The broad-phase wraps and extends a dynamic-tree to keep track of moved
   * objects and query them on update.
   */
  class BroadPhase {
      constructor() {
          this.m_tree = new DynamicTree();
          this.m_moveBuffer = [];
          /**
           * Query an AABB for overlapping proxies. The callback class is called for each
           * proxy that overlaps the supplied AABB.
           */
          this.query = (aabb, queryCallback) => {
              this.m_tree.query(aabb, queryCallback);
          };
          this.queryCallback = (proxyId) => {
              // A proxy cannot form a pair with itself.
              if (proxyId === this.m_queryProxyId) {
                  return true;
              }
              const proxyIdA = math_min$5(proxyId, this.m_queryProxyId);
              const proxyIdB = math_max$3(proxyId, this.m_queryProxyId);
              // TODO: Skip any duplicate pairs.
              const userDataA = this.m_tree.getUserData(proxyIdA);
              const userDataB = this.m_tree.getUserData(proxyIdB);
              // Send the pairs back to the client.
              this.m_callback(userDataA, userDataB);
              return true;
          };
      }
      /**
       * Get user data from a proxy. Returns null if the id is invalid.
       */
      getUserData(proxyId) {
          return this.m_tree.getUserData(proxyId);
      }
      /**
       * Test overlap of fat AABBs.
       */
      testOverlap(proxyIdA, proxyIdB) {
          const aabbA = this.m_tree.getFatAABB(proxyIdA);
          const aabbB = this.m_tree.getFatAABB(proxyIdB);
          return AABB.testOverlap(aabbA, aabbB);
      }
      /**
       * Get the fat AABB for a proxy.
       */
      getFatAABB(proxyId) {
          return this.m_tree.getFatAABB(proxyId);
      }
      /**
       * Get the number of proxies.
       */
      getProxyCount() {
          return this.m_moveBuffer.length;
      }
      /**
       * Get the height of the embedded tree.
       */
      getTreeHeight() {
          return this.m_tree.getHeight();
      }
      /**
       * Get the balance (integer) of the embedded tree.
       */
      getTreeBalance() {
          return this.m_tree.getMaxBalance();
      }
      /**
       * Get the quality metric of the embedded tree.
       */
      getTreeQuality() {
          return this.m_tree.getAreaRatio();
      }
      /**
       * Ray-cast against the proxies in the tree. This relies on the callback to
       * perform a exact ray-cast in the case were the proxy contains a shape. The
       * callback also performs the any collision filtering. This has performance
       * roughly equal to k * log(n), where k is the number of collisions and n is the
       * number of proxies in the tree.
       *
       * @param input The ray-cast input data. The ray extends from `p1` to `p1 + maxFraction * (p2 - p1)`.
       * @param rayCastCallback A function that is called for each proxy that is hit by the ray. If the return value is a positive number it will update the maxFraction of the ray cast input, and if it is zero it will terminate they ray cast.
       */
      rayCast(input, rayCastCallback) {
          this.m_tree.rayCast(input, rayCastCallback);
      }
      /**
       * Shift the world origin. Useful for large worlds. The shift formula is:
       * position -= newOrigin
       *
       * @param newOrigin The new origin with respect to the old origin
       */
      shiftOrigin(newOrigin) {
          this.m_tree.shiftOrigin(newOrigin);
      }
      /**
       * Create a proxy with an initial AABB. Pairs are not reported until UpdatePairs
       * is called.
       */
      createProxy(aabb, userData) {
          const proxyId = this.m_tree.createProxy(aabb, userData);
          this.bufferMove(proxyId);
          return proxyId;
      }
      /**
       * Destroy a proxy. It is up to the client to remove any pairs.
       */
      destroyProxy(proxyId) {
          this.unbufferMove(proxyId);
          this.m_tree.destroyProxy(proxyId);
      }
      /**
       * Call moveProxy as many times as you like, then when you are done call
       * UpdatePairs to finalized the proxy pairs (for your time step).
       */
      moveProxy(proxyId, aabb, displacement) {
          const changed = this.m_tree.moveProxy(proxyId, aabb, displacement);
          if (changed) {
              this.bufferMove(proxyId);
          }
      }
      /**
       * Call to trigger a re-processing of it's pairs on the next call to
       * UpdatePairs.
       */
      touchProxy(proxyId) {
          this.bufferMove(proxyId);
      }
      bufferMove(proxyId) {
          this.m_moveBuffer.push(proxyId);
      }
      unbufferMove(proxyId) {
          for (let i = 0; i < this.m_moveBuffer.length; ++i) {
              if (this.m_moveBuffer[i] === proxyId) {
                  this.m_moveBuffer[i] = null;
              }
          }
      }
      /**
       * Update the pairs. This results in pair callbacks. This can only add pairs.
       */
      updatePairs(addPairCallback) {
          this.m_callback = addPairCallback;
          // Perform tree queries for all moving proxies.
          while (this.m_moveBuffer.length > 0) {
              this.m_queryProxyId = this.m_moveBuffer.pop();
              if (this.m_queryProxyId === null) {
                  continue;
              }
              // We have to query the tree with the fat AABB so that
              // we don't fail to create a pair that may touch later.
              const fatAABB = this.m_tree.getFatAABB(this.m_queryProxyId);
              // Query tree, create pairs and add them pair buffer.
              this.m_tree.query(fatAABB, this.queryCallback);
          }
          // Try to keep the tree balanced.
          // this.m_tree.rebalance(4);
      }
  }

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
  /** @internal */ const DEFAULTS$b = {
      gravity: zero$1(),
      allowSleep: true,
      warmStarting: true,
      continuousPhysics: true,
      subStepping: false,
      blockSolve: true,
      velocityIterations: 8,
      positionIterations: 3
  };
  class World {
      /**
       * @param def World definition or gravity vector.
       */
      constructor(def) {
          this.s_step = new TimeStep();
          if (!def) {
              def = {};
          }
          else if (isValid$1(def)) {
              def = { gravity: def };
          }
          def = options(def, DEFAULTS$b);
          this.m_solver = new Solver(this);
          this.m_broadPhase = new BroadPhase();
          this.m_contactList = null;
          this.m_contactCount = 0;
          this.m_bodyList = null;
          this.m_bodyCount = 0;
          this.m_jointList = null;
          this.m_jointCount = 0;
          this.m_stepComplete = true;
          this.m_allowSleep = def.allowSleep;
          this.m_gravity = clone$1(def.gravity);
          this.m_clearForces = true;
          this.m_newFixture = false;
          this.m_locked = false;
          // These are for debugging the solver.
          this.m_warmStarting = def.warmStarting;
          this.m_continuousPhysics = def.continuousPhysics;
          this.m_subStepping = def.subStepping;
          this.m_blockSolve = def.blockSolve;
          this.m_velocityIterations = def.velocityIterations;
          this.m_positionIterations = def.positionIterations;
          this.m_t = 0;
          this.m_step_callback = [];
      }
      /** @internal */
      _serialize() {
          const bodies = [];
          const joints = [];
          for (let b = this.getBodyList(); b; b = b.getNext()) {
              bodies.push(b);
          }
          for (let j = this.getJointList(); j; j = j.getNext()) {
              // @ts-ignore
              if (typeof j._serialize === 'function') {
                  joints.push(j);
              }
          }
          return {
              gravity: this.m_gravity,
              bodies,
              joints,
          };
      }
      /** @internal */
      static _deserialize(data, context, restore) {
          if (!data) {
              return new World();
          }
          const world = new World(data.gravity);
          if (data.bodies) {
              for (let i = data.bodies.length - 1; i >= 0; i -= 1) {
                  world._addBody(restore(Body, data.bodies[i], world));
              }
          }
          if (data.joints) {
              for (let i = data.joints.length - 1; i >= 0; i--) {
                  world.createJoint(restore(Joint, data.joints[i], world));
              }
          }
          return world;
      }
      /**
       * Get the world body list. With the returned body, use Body.getNext to get the
       * next body in the world list. A null body indicates the end of the list.
       *
       * @return the head of the world body list.
       */
      getBodyList() {
          return this.m_bodyList;
      }
      /**
       * Get the world joint list. With the returned joint, use Joint.getNext to get
       * the next joint in the world list. A null joint indicates the end of the list.
       *
       * @return the head of the world joint list.
       */
      getJointList() {
          return this.m_jointList;
      }
      /**
       * Get the world contact list. With the returned contact, use Contact.getNext to
       * get the next contact in the world list. A null contact indicates the end of
       * the list.
       *
       * Warning: contacts are created and destroyed in the middle of a time step.
       * Use ContactListener to avoid missing contacts.
       *
       * @return the head of the world contact list.
       */
      getContactList() {
          return this.m_contactList;
      }
      getBodyCount() {
          return this.m_bodyCount;
      }
      getJointCount() {
          return this.m_jointCount;
      }
      /**
       * Get the number of contacts (each may have 0 or more contact points).
       */
      getContactCount() {
          return this.m_contactCount;
      }
      /**
       * Change the global gravity vector.
       */
      setGravity(gravity) {
          copy(gravity, this.m_gravity);
      }
      /**
       * Get the global gravity vector.
       */
      getGravity() {
          return this.m_gravity;
      }
      /**
       * Is the world locked (in the middle of a time step).
       */
      isLocked() {
          return this.m_locked;
      }
      /**
       * Enable/disable sleep.
       */
      setAllowSleeping(flag) {
          if (flag == this.m_allowSleep) {
              return;
          }
          this.m_allowSleep = flag;
          if (this.m_allowSleep == false) {
              for (let b = this.m_bodyList; b; b = b.m_next) {
                  b.setAwake(true);
              }
          }
      }
      getAllowSleeping() {
          return this.m_allowSleep;
      }
      /**
       * Enable/disable warm starting. For testing.
       */
      setWarmStarting(flag) {
          this.m_warmStarting = flag;
      }
      getWarmStarting() {
          return this.m_warmStarting;
      }
      /**
       * Enable/disable continuous physics. For testing.
       */
      setContinuousPhysics(flag) {
          this.m_continuousPhysics = flag;
      }
      getContinuousPhysics() {
          return this.m_continuousPhysics;
      }
      /**
       * Enable/disable single stepped continuous physics. For testing.
       */
      setSubStepping(flag) {
          this.m_subStepping = flag;
      }
      getSubStepping() {
          return this.m_subStepping;
      }
      /**
       * Set flag to control automatic clearing of forces after each time step.
       */
      setAutoClearForces(flag) {
          this.m_clearForces = flag;
      }
      /**
       * Get the flag that controls automatic clearing of forces after each time step.
       */
      getAutoClearForces() {
          return this.m_clearForces;
      }
      /**
       * Manually clear the force buffer on all bodies. By default, forces are cleared
       * automatically after each call to step. The default behavior is modified by
       * calling setAutoClearForces. The purpose of this function is to support
       * sub-stepping. Sub-stepping is often used to maintain a fixed sized time step
       * under a variable frame-rate. When you perform sub-stepping you will disable
       * auto clearing of forces and instead call clearForces after all sub-steps are
       * complete in one pass of your game loop.
       *
       * See {@link World.setAutoClearForces}
       */
      clearForces() {
          for (let body = this.m_bodyList; body; body = body.getNext()) {
              setZero$1(body.m_force);
              body.m_torque = 0.0;
          }
      }
      /**
       * Query the world for all fixtures that potentially overlap the provided AABB.
       *
       * @param aabb The query box.
       * @param callback Called for each fixture found in the query AABB. It may return `false` to terminate the query.
       */
      queryAABB(aabb, callback) {
          const broadPhase = this.m_broadPhase;
          this.m_broadPhase.query(aabb, function (proxyId) {
              const proxy = broadPhase.getUserData(proxyId);
              return callback(proxy.fixture);
          });
      }
      /**
       * Ray-cast the world for all fixtures in the path of the ray. Your callback
       * controls whether you get the closest point, any point, or n-points. The
       * ray-cast ignores shapes that contain the starting point.
       *
       * @param point1 The ray starting point
       * @param point2 The ray ending point
       * @param callback A function that is called for each fixture that is hit by the ray. You control how the ray cast proceeds by returning a numeric/float value.
       */
      rayCast(point1, point2, callback) {
          const broadPhase = this.m_broadPhase;
          this.m_broadPhase.rayCast({
              maxFraction: 1.0,
              p1: point1,
              p2: point2
          }, function (input, proxyId) {
              const proxy = broadPhase.getUserData(proxyId);
              const fixture = proxy.fixture;
              const index = proxy.childIndex;
              // @ts-ignore
              const output = {}; // TODO GC
              const hit = fixture.rayCast(output, input, index);
              if (hit) {
                  const fraction = output.fraction;
                  const point = add$1(mulNumVec2((1.0 - fraction), input.p1), mulNumVec2(fraction, input.p2));
                  return callback(fixture, point, output.normal, fraction);
              }
              return input.maxFraction;
          });
      }
      /**
       * Get the number of broad-phase proxies.
       */
      getProxyCount() {
          return this.m_broadPhase.getProxyCount();
      }
      /**
       * Get the height of broad-phase dynamic tree.
       */
      getTreeHeight() {
          return this.m_broadPhase.getTreeHeight();
      }
      /**
       * Get the balance of broad-phase dynamic tree.
       */
      getTreeBalance() {
          return this.m_broadPhase.getTreeBalance();
      }
      /**
       * Get the quality metric of broad-phase dynamic tree. The smaller the better.
       * The minimum is 1.
       */
      getTreeQuality() {
          return this.m_broadPhase.getTreeQuality();
      }
      /**
       * Shift the world origin. Useful for large worlds. The body shift formula is:
       * position -= newOrigin
       *
       * @param newOrigin The new origin with respect to the old origin
       */
      shiftOrigin(newOrigin) {
          if (this.m_locked) {
              return;
          }
          for (let b = this.m_bodyList; b; b = b.m_next) {
              sub$1(b.m_xf.p, newOrigin, b.m_xf.p);
              sub$1(b.m_sweep.c0, newOrigin, b.m_sweep.c0);
              sub$1(b.m_sweep.c, newOrigin, b.m_sweep.c);
          }
          for (let j = this.m_jointList; j; j = j.m_next) {
              j.shiftOrigin(newOrigin);
          }
          this.m_broadPhase.shiftOrigin(newOrigin);
      }
      /** @internal Used for deserialize. */
      _addBody(body) {
          if (this.isLocked()) {
              return;
          }
          // Add to world doubly linked list.
          body.m_prev = null;
          body.m_next = this.m_bodyList;
          if (this.m_bodyList) {
              this.m_bodyList.m_prev = body;
          }
          this.m_bodyList = body;
          ++this.m_bodyCount;
          this.publish('add-body', body);
      }
      // tslint:disable-next-line:typedef
      createBody(arg1, arg2) {
          if (this.isLocked()) {
              return null;
          }
          let def = {};
          if (!arg1) ;
          else if (isValid$1(arg1)) {
              def = { position: arg1, angle: arg2 };
          }
          else if (typeof arg1 === 'object') {
              def = arg1;
          }
          const body = new Body(this, def);
          this._addBody(body);
          return body;
      }
      // tslint:disable-next-line:typedef
      createDynamicBody(arg1, arg2) {
          let def = {};
          if (!arg1) ;
          else if (isValid$1(arg1)) {
              def = { position: arg1, angle: arg2 };
          }
          else if (typeof arg1 === 'object') {
              def = arg1;
          }
          def.type = 'dynamic';
          return this.createBody(def);
      }
      // tslint:disable-next-line:typedef
      createKinematicBody(arg1, arg2) {
          let def = {};
          if (!arg1) ;
          else if (isValid$1(arg1)) {
              def = { position: arg1, angle: arg2 };
          }
          else if (typeof arg1 === 'object') {
              def = arg1;
          }
          def.type = 'kinematic';
          return this.createBody(def);
      }
      /**
       * Destroy a rigid body given a definition. No reference to the definition is
       * retained.
       *
       * Warning: This automatically deletes all associated shapes and joints.
       *
       * Warning: This function is locked when a world simulation step is in progress. Use queueUpdate to schedule a function to be called after the step.
       */
      destroyBody(b) {
          if (this.isLocked()) {
              return;
          }
          if (b.m_destroyed) {
              return false;
          }
          // Delete the attached joints.
          let je = b.m_jointList;
          while (je) {
              const je0 = je;
              je = je.next;
              this.publish('remove-joint', je0.joint);
              this.destroyJoint(je0.joint);
              b.m_jointList = je;
          }
          b.m_jointList = null;
          // Delete the attached contacts.
          let ce = b.m_contactList;
          while (ce) {
              const ce0 = ce;
              ce = ce.next;
              this.destroyContact(ce0.contact);
              b.m_contactList = ce;
          }
          b.m_contactList = null;
          // Delete the attached fixtures. This destroys broad-phase proxies.
          let f = b.m_fixtureList;
          while (f) {
              const f0 = f;
              f = f.m_next;
              this.publish('remove-fixture', f0);
              f0.destroyProxies(this.m_broadPhase);
              b.m_fixtureList = f;
          }
          b.m_fixtureList = null;
          // Remove world body list.
          if (b.m_prev) {
              b.m_prev.m_next = b.m_next;
          }
          if (b.m_next) {
              b.m_next.m_prev = b.m_prev;
          }
          if (b == this.m_bodyList) {
              this.m_bodyList = b.m_next;
          }
          b.m_destroyed = true;
          --this.m_bodyCount;
          this.publish('remove-body', b);
          return true;
      }
      /**
       * Create a joint to constrain bodies together. No reference to the definition
       * is retained. This may cause the connected bodies to cease colliding.
       *
       * Note: creating a joint doesn't wake the bodies.
       *
       * Warning: This function is locked when a world simulation step is in progress. Use queueUpdate to schedule a function to be called after the step.
       */
      createJoint(joint) {
          if (this.isLocked()) {
              return null;
          }
          // Connect to the world list.
          joint.m_prev = null;
          joint.m_next = this.m_jointList;
          if (this.m_jointList) {
              this.m_jointList.m_prev = joint;
          }
          this.m_jointList = joint;
          ++this.m_jointCount;
          // Connect to the bodies' doubly linked lists.
          joint.m_edgeA.joint = joint;
          joint.m_edgeA.other = joint.m_bodyB;
          joint.m_edgeA.prev = null;
          joint.m_edgeA.next = joint.m_bodyA.m_jointList;
          if (joint.m_bodyA.m_jointList)
              joint.m_bodyA.m_jointList.prev = joint.m_edgeA;
          joint.m_bodyA.m_jointList = joint.m_edgeA;
          joint.m_edgeB.joint = joint;
          joint.m_edgeB.other = joint.m_bodyA;
          joint.m_edgeB.prev = null;
          joint.m_edgeB.next = joint.m_bodyB.m_jointList;
          if (joint.m_bodyB.m_jointList)
              joint.m_bodyB.m_jointList.prev = joint.m_edgeB;
          joint.m_bodyB.m_jointList = joint.m_edgeB;
          // If the joint prevents collisions, then flag any contacts for filtering.
          if (joint.m_collideConnected == false) {
              for (let edge = joint.m_bodyB.getContactList(); edge; edge = edge.next) {
                  if (edge.other == joint.m_bodyA) {
                      // Flag the contact for filtering at the next time step (where either
                      // body is awake).
                      edge.contact.flagForFiltering();
                  }
              }
          }
          this.publish('add-joint', joint);
          return joint;
      }
      /**
       * Destroy a joint. This may cause the connected bodies to begin colliding.
       * Warning: This function is locked when a world simulation step is in progress. Use queueUpdate to schedule a function to be called after the step.
       */
      destroyJoint(joint) {
          if (this.isLocked()) {
              return;
          }
          // Remove from the doubly linked list.
          if (joint.m_prev) {
              joint.m_prev.m_next = joint.m_next;
          }
          if (joint.m_next) {
              joint.m_next.m_prev = joint.m_prev;
          }
          if (joint == this.m_jointList) {
              this.m_jointList = joint.m_next;
          }
          // Disconnect from bodies.
          const bodyA = joint.m_bodyA;
          const bodyB = joint.m_bodyB;
          // Wake up connected bodies.
          bodyA.setAwake(true);
          bodyB.setAwake(true);
          // Remove from body 1.
          if (joint.m_edgeA.prev) {
              joint.m_edgeA.prev.next = joint.m_edgeA.next;
          }
          if (joint.m_edgeA.next) {
              joint.m_edgeA.next.prev = joint.m_edgeA.prev;
          }
          if (joint.m_edgeA == bodyA.m_jointList) {
              bodyA.m_jointList = joint.m_edgeA.next;
          }
          joint.m_edgeA.prev = null;
          joint.m_edgeA.next = null;
          // Remove from body 2
          if (joint.m_edgeB.prev) {
              joint.m_edgeB.prev.next = joint.m_edgeB.next;
          }
          if (joint.m_edgeB.next) {
              joint.m_edgeB.next.prev = joint.m_edgeB.prev;
          }
          if (joint.m_edgeB == bodyB.m_jointList) {
              bodyB.m_jointList = joint.m_edgeB.next;
          }
          joint.m_edgeB.prev = null;
          joint.m_edgeB.next = null;
          --this.m_jointCount;
          // If the joint prevents collisions, then flag any contacts for filtering.
          if (joint.m_collideConnected == false) {
              let edge = bodyB.getContactList();
              while (edge) {
                  if (edge.other == bodyA) {
                      // Flag the contact for filtering at the next time step (where either
                      // body is awake).
                      edge.contact.flagForFiltering();
                  }
                  edge = edge.next;
              }
          }
          this.publish('remove-joint', joint);
      }
      /**
       * Take a time step. This performs collision detection, integration, and
       * constraint solution.
       *
       * Broad-phase, narrow-phase, solve and solve time of impacts.
       *
       * @param timeStep Time step, this should not vary.
       */
      step(timeStep, velocityIterations, positionIterations) {
          this.publish('pre-step', timeStep);
          if ((velocityIterations | 0) !== velocityIterations) {
              // TODO: remove this in future
              velocityIterations = 0;
          }
          velocityIterations = velocityIterations || this.m_velocityIterations;
          positionIterations = positionIterations || this.m_positionIterations;
          // If new fixtures were added, we need to find the new contacts.
          if (this.m_newFixture) {
              this.findNewContacts();
              this.m_newFixture = false;
          }
          this.m_locked = true;
          this.s_step.reset(timeStep);
          this.s_step.velocityIterations = velocityIterations;
          this.s_step.positionIterations = positionIterations;
          this.s_step.warmStarting = this.m_warmStarting;
          this.s_step.blockSolve = this.m_blockSolve;
          // Update contacts. This is where some contacts are destroyed.
          this.updateContacts();
          // Integrate velocities, solve velocity constraints, and integrate positions.
          if (this.m_stepComplete && timeStep > 0.0) {
              this.m_solver.solveWorld(this.s_step);
              // Synchronize fixtures, check for out of range bodies.
              for (let b = this.m_bodyList; b; b = b.getNext()) {
                  // If a body was not in an island then it did not move.
                  if (b.m_islandFlag == false) {
                      continue;
                  }
                  if (b.isStatic()) {
                      continue;
                  }
                  // Update fixtures (for broad-phase).
                  b.synchronizeFixtures();
              }
              // Look for new contacts.
              this.findNewContacts();
          }
          // Handle TOI events.
          if (this.m_continuousPhysics && timeStep > 0.0) {
              this.m_solver.solveWorldTOI(this.s_step);
          }
          if (this.m_clearForces) {
              this.clearForces();
          }
          this.m_locked = false;
          let callback;
          while (callback = this.m_step_callback.shift()) {
              callback(this);
          }
          this.publish('post-step', timeStep);
      }
      /**
       * Queue a function to be called after ongoing simulation step. If no simulation is in progress call it immediately.
       */
      queueUpdate(callback) {
          if (!this.isLocked()) {
              callback(this);
          }
          else {
              this.m_step_callback.push(callback);
          }
      }
      /**
       * @internal
       * Call this method to find new contacts.
       */
      findNewContacts() {
          this.m_broadPhase.updatePairs((proxyA, proxyB) => this.createContact(proxyA, proxyB));
      }
      /**
       * @internal
       * Callback for broad-phase.
       */
      createContact(proxyA, proxyB) {
          const fixtureA = proxyA.fixture;
          const fixtureB = proxyB.fixture;
          const indexA = proxyA.childIndex;
          const indexB = proxyB.childIndex;
          const bodyA = fixtureA.getBody();
          const bodyB = fixtureB.getBody();
          // Are the fixtures on the same body?
          if (bodyA == bodyB) {
              return;
          }
          // TODO_ERIN use a hash table to remove a potential bottleneck when both
          // bodies have a lot of contacts.
          // Does a contact already exist?
          let edge = bodyB.getContactList(); // ContactEdge
          while (edge) {
              if (edge.other == bodyA) {
                  const fA = edge.contact.getFixtureA();
                  const fB = edge.contact.getFixtureB();
                  const iA = edge.contact.getChildIndexA();
                  const iB = edge.contact.getChildIndexB();
                  if (fA == fixtureA && fB == fixtureB && iA == indexA && iB == indexB) {
                      // A contact already exists.
                      return;
                  }
                  if (fA == fixtureB && fB == fixtureA && iA == indexB && iB == indexA) {
                      // A contact already exists.
                      return;
                  }
              }
              edge = edge.next;
          }
          if (bodyB.shouldCollide(bodyA) == false) {
              return;
          }
          if (fixtureB.shouldCollide(fixtureA) == false) {
              return;
          }
          // Call the factory.
          const contact = Contact.create(fixtureA, indexA, fixtureB, indexB);
          if (contact == null) {
              return;
          }
          // Insert into the world.
          contact.m_prev = null;
          if (this.m_contactList != null) {
              contact.m_next = this.m_contactList;
              this.m_contactList.m_prev = contact;
          }
          this.m_contactList = contact;
          ++this.m_contactCount;
      }
      /**
       * @internal
       * Removes old non-overlapping contacts, applies filters and updates contacts.
       */
      updateContacts() {
          // Update awake contacts.
          let c;
          let next_c = this.m_contactList;
          while (c = next_c) {
              next_c = c.getNext();
              const fixtureA = c.getFixtureA();
              const fixtureB = c.getFixtureB();
              const indexA = c.getChildIndexA();
              const indexB = c.getChildIndexB();
              const bodyA = fixtureA.getBody();
              const bodyB = fixtureB.getBody();
              // Is this contact flagged for filtering?
              if (c.m_filterFlag) {
                  if (bodyB.shouldCollide(bodyA) == false) {
                      this.destroyContact(c);
                      continue;
                  }
                  if (fixtureB.shouldCollide(fixtureA) == false) {
                      this.destroyContact(c);
                      continue;
                  }
                  // Clear the filtering flag.
                  c.m_filterFlag = false;
              }
              const activeA = bodyA.isAwake() && !bodyA.isStatic();
              const activeB = bodyB.isAwake() && !bodyB.isStatic();
              // At least one body must be awake and it must be dynamic or kinematic.
              if (activeA == false && activeB == false) {
                  continue;
              }
              const proxyIdA = fixtureA.m_proxies[indexA].proxyId;
              const proxyIdB = fixtureB.m_proxies[indexB].proxyId;
              const overlap = this.m_broadPhase.testOverlap(proxyIdA, proxyIdB);
              // Here we destroy contacts that cease to overlap in the broad-phase.
              if (overlap == false) {
                  this.destroyContact(c);
                  continue;
              }
              // The contact persists.
              c.update(this);
          }
      }
      /** @internal */
      destroyContact(contact) {
          // Remove from the world.
          if (contact.m_prev) {
              contact.m_prev.m_next = contact.m_next;
          }
          if (contact.m_next) {
              contact.m_next.m_prev = contact.m_prev;
          }
          if (contact == this.m_contactList) {
              this.m_contactList = contact.m_next;
          }
          Contact.destroy(contact, this);
          --this.m_contactCount;
      }
      /**
       * Register an event listener.
       */
      // tslint:disable-next-line:typedef
      on(name, listener) {
          if (typeof name !== 'string' || typeof listener !== 'function') {
              return this;
          }
          if (!this._listeners) {
              this._listeners = {};
          }
          if (!this._listeners[name]) {
              this._listeners[name] = [];
          }
          this._listeners[name].push(listener);
          return this;
      }
      /**
       * Remove an event listener.
       */
      // tslint:disable-next-line:typedef
      off(name, listener) {
          if (typeof name !== 'string' || typeof listener !== 'function') {
              return this;
          }
          const listeners = this._listeners && this._listeners[name];
          if (!listeners || !listeners.length) {
              return this;
          }
          const index = listeners.indexOf(listener);
          if (index >= 0) {
              listeners.splice(index, 1);
          }
          return this;
      }
      publish(name, arg1, arg2, arg3) {
          const listeners = this._listeners && this._listeners[name];
          if (!listeners || !listeners.length) {
              return 0;
          }
          for (let l = 0; l < listeners.length; l++) {
              listeners[l].call(this, arg1, arg2, arg3);
          }
          return listeners.length;
      }
      /** @internal */
      beginContact(contact) {
          this.publish('begin-contact', contact);
      }
      /** @internal */
      endContact(contact) {
          this.publish('end-contact', contact);
      }
      /** @internal */
      preSolve(contact, oldManifold) {
          this.publish('pre-solve', contact, oldManifold);
      }
      /** @internal */
      postSolve(contact, impulse) {
          this.publish('post-solve', contact, impulse);
      }
  }

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
  /** @internal */ const math_sqrt$2 = Math.sqrt;
  /** @internal */ const math_PI$5 = Math.PI;
  /** @internal */ const temp$1 = vec2(0, 0);
  class CircleShape extends Shape {
      constructor(a, b) {
          super();
          this.m_type = CircleShape.TYPE;
          this.m_p = zero$1();
          this.m_radius = 1;
          if (typeof a === 'object' && isValid$1(a)) {
              copy(a, this.m_p);
              if (typeof b === 'number') {
                  this.m_radius = b;
              }
          }
          else if (typeof a === 'number') {
              this.m_radius = a;
          }
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              p: this.m_p,
              radius: this.m_radius,
          };
      }
      /** @internal */
      static _deserialize(data) {
          return new CircleShape(data.p, data.radius);
      }
      /** @hidden */
      _reset() {
          // noop
      }
      getType() {
          return this.m_type;
      }
      getRadius() {
          return this.m_radius;
      }
      getCenter() {
          return this.m_p;
      }
      /**
       * @internal @deprecated Shapes should be treated as immutable.
       *
       * clone the concrete shape.
       */
      _clone() {
          const clone = new CircleShape();
          clone.m_type = this.m_type;
          clone.m_radius = this.m_radius;
          clone.m_p = clone$1(this.m_p);
          return clone;
      }
      /**
       * Get the number of child primitives.
       */
      getChildCount() {
          return 1;
      }
      /**
       * Test a point for containment in this shape. This only works for convex
       * shapes.
       *
       * @param xf The shape world transform.
       * @param p A point in world coordinates.
       */
      testPoint(xf, p) {
          const center = transformVec2(temp$1, xf, this.m_p);
          return distSqrVec2(p, center) <= this.m_radius * this.m_radius;
      }
      /**
       * Cast a ray against a child shape.
       *
       * @param output The ray-cast results.
       * @param input The ray-cast input parameters.
       * @param xf The transform to be applied to the shape.
       * @param childIndex The child shape index
       */
      rayCast(output, input, xf, childIndex) {
          // Collision Detection in Interactive 3D Environments by Gino van den Bergen
          // From Section 3.1.2
          // x = s + a * r
          // norm(x) = radius
          const position = add$1(xf.p, Rot.mulVec2(xf.q, this.m_p));
          const s = sub$1(input.p1, position);
          const b = dot$1(s, s) - this.m_radius * this.m_radius;
          // Solve quadratic equation.
          const r = sub$1(input.p2, input.p1);
          const c = dot$1(s, r);
          const rr = dot$1(r, r);
          const sigma = c * c - rr * b;
          // Check for negative discriminant and short segment.
          if (sigma < 0.0 || rr < EPSILON) {
              return false;
          }
          // Find the point of intersection of the line with the circle.
          let a = -(c + math_sqrt$2(sigma));
          // Is the intersection point on the segment?
          if (0.0 <= a && a <= input.maxFraction * rr) {
              a /= rr;
              output.fraction = a;
              output.normal = add$1(s, mulNumVec2(a, r));
              normalize(output.normal, output.normal);
              return true;
          }
          return false;
      }
      /**
       * Given a transform, compute the associated axis aligned bounding box for a
       * child shape.
       *
       * @param aabb Returns the axis aligned box.
       * @param xf The world transform of the shape.
       * @param childIndex The child shape
       */
      computeAABB(aabb, xf, childIndex) {
          const p = transformVec2(temp$1, xf, this.m_p);
          set$1(p[0] - this.m_radius, p[1] - this.m_radius, aabb.lowerBound);
          set$1(p[0] + this.m_radius, p[1] + this.m_radius, aabb.upperBound);
      }
      /**
       * Compute the mass properties of this shape using its dimensions and density.
       * The inertia tensor is computed about the local origin.
       *
       * @param massData Returns the mass data for this shape.
       * @param density The density in kilograms per meter squared.
       */
      computeMass(massData, density) {
          massData.mass = density * math_PI$5 * this.m_radius * this.m_radius;
          copyVec2(massData.center, this.m_p);
          // inertia about the local origin
          massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + lengthSqrVec2(this.m_p));
      }
      computeDistanceProxy(proxy) {
          proxy.m_vertices[0] = this.m_p;
          proxy.m_vertices.length = 1;
          proxy.m_count = 1;
          proxy.m_radius = this.m_radius;
      }
  }
  CircleShape.TYPE = 'circle';

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
  /** @internal */ const v1$2 = vec2(0, 0);
  /** @internal */ const v2$1 = vec2(0, 0);
  /**
   * A line segment (edge) shape. These can be connected in chains or loops to
   * other edge shapes. The connectivity information is used to ensure correct
   * contact normals.
   */
  class EdgeShape extends Shape {
      constructor(v1, v2) {
          super();
          this.m_type = EdgeShape.TYPE;
          this.m_radius = SettingsInternal.polygonRadius;
          this.m_vertex1 = v1 ? clone$1(v1) : zero$1();
          this.m_vertex2 = v2 ? clone$1(v2) : zero$1();
          this.m_vertex0 = zero$1();
          this.m_vertex3 = zero$1();
          this.m_hasVertex0 = false;
          this.m_hasVertex3 = false;
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              vertex1: this.m_vertex1,
              vertex2: this.m_vertex2,
              vertex0: this.m_vertex0,
              vertex3: this.m_vertex3,
              hasVertex0: this.m_hasVertex0,
              hasVertex3: this.m_hasVertex3,
          };
      }
      /** @internal */
      static _deserialize(data) {
          const shape = new EdgeShape(data.vertex1, data.vertex2);
          if (shape.m_hasVertex0) {
              shape.setPrevVertex(data.vertex0);
          }
          if (shape.m_hasVertex3) {
              shape.setNextVertex(data.vertex3);
          }
          return shape;
      }
      /** @hidden */
      _reset() {
          // noop
      }
      getRadius() {
          return this.m_radius;
      }
      getType() {
          return this.m_type;
      }
      /** @internal @deprecated */
      setNext(v) {
          return this.setNextVertex(v);
      }
      /**
       * Optional next vertex, used for smooth collision.
       */
      setNextVertex(v) {
          if (v) {
              copy(v, this.m_vertex3);
              this.m_hasVertex3 = true;
          }
          else {
              setZero$1(this.m_vertex3);
              this.m_hasVertex3 = false;
          }
          return this;
      }
      /**
       * Optional next vertex, used for smooth collision.
       */
      getNextVertex() {
          return this.m_vertex3;
      }
      /** @internal @deprecated */
      setPrev(v) {
          return this.setPrevVertex(v);
      }
      /**
       * Optional prev vertex, used for smooth collision.
       */
      setPrevVertex(v) {
          if (v) {
              copy(v, this.m_vertex0);
              this.m_hasVertex0 = true;
          }
          else {
              setZero$1(this.m_vertex0);
              this.m_hasVertex0 = false;
          }
          return this;
      }
      /**
       * Optional prev vertex, used for smooth collision.
       */
      getPrevVertex() {
          return this.m_vertex0;
      }
      /**
       * Set this as an isolated edge.
       */
      _set(v1, v2) {
          copy(v1, this.m_vertex1);
          copy(v2, this.m_vertex2);
          this.m_hasVertex0 = false;
          this.m_hasVertex3 = false;
          return this;
      }
      /**
       * @internal @deprecated Shapes should be treated as immutable.
       *
       * clone the concrete shape.
       */
      _clone() {
          const clone = new EdgeShape();
          clone.m_type = this.m_type;
          clone.m_radius = this.m_radius;
          copy(this.m_vertex1, clone.m_vertex1);
          copy(this.m_vertex2, clone.m_vertex2);
          copy(this.m_vertex0, clone.m_vertex0);
          copy(this.m_vertex3, clone.m_vertex3);
          clone.m_hasVertex0 = this.m_hasVertex0;
          clone.m_hasVertex3 = this.m_hasVertex3;
          return clone;
      }
      /**
       * Get the number of child primitives.
       */
      getChildCount() {
          return 1;
      }
      /**
       * Test a point for containment in this shape. This only works for convex
       * shapes.
       *
       * @param xf The shape world transform.
       * @param p A point in world coordinates.
       */
      testPoint(xf, p) {
          return false;
      }
      /**
       * Cast a ray against a child shape.
       *
       * @param output The ray-cast results.
       * @param input The ray-cast input parameters.
       * @param xf The transform to be applied to the shape.
       * @param childIndex The child shape index
       */
      rayCast(output, input, xf, childIndex) {
          // p = p1 + t * d
          // v = v1 + s * e
          // p1 + t * d = v1 + s * e
          // s * e - t * d = p1 - v1
          // NOT_USED(childIndex);
          // Put the ray into the edge's frame of reference.
          const p1 = Rot.mulTVec2(xf.q, sub$1(input.p1, xf.p));
          const p2 = Rot.mulTVec2(xf.q, sub$1(input.p2, xf.p));
          const d = sub$1(p2, p1);
          const v1 = this.m_vertex1;
          const v2 = this.m_vertex2;
          const e = sub$1(v2, v1);
          const normal = create$2(e[1], -e[0]);
          normalize(normal, normal);
          // q = p1 + t * d
          // dot(normal, q - v1) = 0
          // dot(normal, p1 - v1) + t * dot(normal, d) = 0
          const numerator = dot$1(normal, sub$1(v1, p1));
          const denominator = dot$1(normal, d);
          if (denominator == 0.0) {
              return false;
          }
          const t = numerator / denominator;
          if (t < 0.0 || input.maxFraction < t) {
              return false;
          }
          const q = add$1(p1, mulNumVec2(t, d));
          // q = v1 + s * r
          // s = dot(q - v1, r) / dot(r, r)
          const r = sub$1(v2, v1);
          const rr = dot$1(r, r);
          if (rr == 0.0) {
              return false;
          }
          const s = dot$1(sub$1(q, v1), r) / rr;
          if (s < 0.0 || 1.0 < s) {
              return false;
          }
          output.fraction = t;
          if (numerator > 0.0) {
              const tmp = Rot.mulVec2(xf.q, normal);
              output.normal = neg$1(tmp, output.normal);
          }
          else {
              output.normal = Rot.mulVec2(xf.q, normal);
          }
          return true;
      }
      /**
       * Given a transform, compute the associated axis aligned bounding box for a
       * child shape.
       *
       * @param aabb Returns the axis aligned box.
       * @param xf The world transform of the shape.
       * @param childIndex The child shape
       */
      computeAABB(aabb, xf, childIndex) {
          transformVec2(v1$2, xf, this.m_vertex1);
          transformVec2(v2$1, xf, this.m_vertex2);
          AABB.combinePoints(aabb, v1$2, v2$1);
          AABB.extend(aabb, this.m_radius);
      }
      /**
       * Compute the mass properties of this shape using its dimensions and density.
       * The inertia tensor is computed about the local origin.
       *
       * @param massData Returns the mass data for this shape.
       * @param density The density in kilograms per meter squared.
       */
      computeMass(massData, density) {
          massData.mass = 0.0;
          combine2Vec2(massData.center, 0.5, this.m_vertex1, 0.5, this.m_vertex2);
          massData.I = 0.0;
      }
      computeDistanceProxy(proxy) {
          proxy.m_vertices[0] = this.m_vertex1;
          proxy.m_vertices[1] = this.m_vertex2;
          proxy.m_vertices.length = 2;
          proxy.m_count = 2;
          proxy.m_radius = this.m_radius;
      }
  }
  EdgeShape.TYPE = 'edge';

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
  /** @internal */ const math_max$2 = Math.max;
  /** @internal */ const math_min$4 = Math.min;
  /** @internal */ const temp = vec2(0, 0);
  /** @internal */ const e$1 = vec2(0, 0);
  /** @internal */ const e1$1 = vec2(0, 0);
  /** @internal */ const e2$1 = vec2(0, 0);
  /** @internal */ const center = vec2(0, 0);
  /** @internal */ const s = vec2(0, 0);
  /**
   * A convex polygon. It is assumed that the interior of the polygon is to the
   * left of each edge. Polygons have a maximum number of vertices equal to
   * Settings.maxPolygonVertices. In most cases you should not need many vertices
   * for a convex polygon. extends Shape
   */
  class PolygonShape extends Shape {
      constructor(vertices) {
          super();
          this.m_type = PolygonShape.TYPE;
          this.m_radius = SettingsInternal.polygonRadius;
          this.m_centroid = zero$1();
          this.m_vertices = [];
          this.m_normals = [];
          this.m_count = 0;
          if (vertices && vertices.length) {
              this._set(vertices);
          }
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              vertices: this.m_vertices,
          };
      }
      /** @internal */
      static _deserialize(data, fixture, restore) {
          const vertices = [];
          if (data.vertices) {
              for (let i = 0; i < data.vertices.length; i++) {
                  vertices.push(restore(Vec2, data.vertices[i]));
              }
          }
          const shape = new PolygonShape(vertices);
          return shape;
      }
      getType() {
          return this.m_type;
      }
      getRadius() {
          return this.m_radius;
      }
      /**
       * @internal @deprecated Shapes should be treated as immutable.
       *
       * clone the concrete shape.
       */
      _clone() {
          const clone = new PolygonShape();
          clone.m_type = this.m_type;
          clone.m_radius = this.m_radius;
          clone.m_count = this.m_count;
          copy(this.m_centroid, clone.m_centroid);
          for (let i = 0; i < this.m_count; i++) {
              clone.m_vertices.push(clone$1(this.m_vertices[i]));
          }
          for (let i = 0; i < this.m_normals.length; i++) {
              clone.m_normals.push(clone$1(this.m_normals[i]));
          }
          return clone;
      }
      /**
       * Get the number of child primitives.
       */
      getChildCount() {
          return 1;
      }
      /** @hidden */
      _reset() {
          this._set(this.m_vertices);
      }
      /**
       * @internal
       *
       * Create a convex hull from the given array of local points. The count must be
       * in the range [3, Settings.maxPolygonVertices].
       *
       * Warning: the points may be re-ordered, even if they form a convex polygon
       * Warning: collinear points are handled but not removed. Collinear points may
       * lead to poor stacking behavior.
       */
      _set(vertices) {
          if (vertices.length < 3) {
              this._setAsBox(1.0, 1.0);
              return;
          }
          let n = math_min$4(vertices.length, SettingsInternal.maxPolygonVertices);
          // Perform welding and copy vertices into local buffer.
          const ps = []; // [Settings.maxPolygonVertices];
          for (let i = 0; i < n; ++i) {
              const v = vertices[i];
              let unique = true;
              for (let j = 0; j < ps.length; ++j) {
                  if (distanceSquared(v, ps[j]) < 0.25 * SettingsInternal.linearSlopSquared) {
                      unique = false;
                      break;
                  }
              }
              if (unique) {
                  ps.push(clone$1(v));
              }
          }
          n = ps.length;
          if (n < 3) {
              this._setAsBox(1.0, 1.0);
              return;
          }
          // Create the convex hull using the Gift wrapping algorithm
          // http://en.wikipedia.org/wiki/Gift_wrapping_algorithm
          // Find the right most point on the hull (in case of multiple points bottom most is used)
          let i0 = 0;
          let x0 = ps[0][0];
          for (let i = 1; i < n; ++i) {
              const x = ps[i][0];
              if (x > x0 || (x === x0 && ps[i][1] < ps[i0][1])) {
                  i0 = i;
                  x0 = x;
              }
          }
          const hull = []; // [Settings.maxPolygonVertices];
          let m = 0;
          let ih = i0;
          while (true) {
              hull[m] = ih;
              let ie = 0;
              for (let j = 1; j < n; ++j) {
                  if (ie === ih) {
                      ie = j;
                      continue;
                  }
                  const r = sub$1(ps[ie], ps[hull[m]]);
                  const v = sub$1(ps[j], ps[hull[m]]);
                  const c = crossVec2Vec2$1(r, v);
                  // c < 0 means counter-clockwise wrapping, c > 0 means clockwise wrapping
                  if (c < 0.0) {
                      ie = j;
                  }
                  // Collinearity check
                  if (c === 0.0 && lengthSquared(v) > lengthSquared(r)) {
                      ie = j;
                  }
              }
              ++m;
              ih = ie;
              if (ie === i0) {
                  break;
              }
          }
          if (m < 3) {
              this._setAsBox(1.0, 1.0);
              return;
          }
          this.m_count = m;
          // Copy vertices.
          this.m_vertices = [];
          for (let i = 0; i < m; ++i) {
              this.m_vertices[i] = ps[hull[i]];
          }
          // Compute normals. Ensure the edges have non-zero length.
          for (let i = 0; i < m; ++i) {
              const i1 = i;
              const i2 = i + 1 < m ? i + 1 : 0;
              const edge = sub$1(this.m_vertices[i2], this.m_vertices[i1]);
              this.m_normals[i] = crossVec2Num$1(edge, 1.0);
              normalize(this.m_normals[i], this.m_normals[i]);
          }
          // Compute the polygon centroid.
          this.m_centroid = computeCentroid(this.m_vertices, m);
      }
      /** @internal */ _setAsBox(hx, hy, center, angle) {
          // start with right-bottom, counter-clockwise, as in Gift wrapping algorithm in PolygonShape._set()
          this.m_vertices[0] = create$2(hx, -hy);
          this.m_vertices[1] = create$2(hx, hy);
          this.m_vertices[2] = create$2(-hx, hy);
          this.m_vertices[3] = create$2(-hx, -hy);
          this.m_normals[0] = create$2(1.0, 0.0);
          this.m_normals[1] = create$2(0.0, 1.0);
          this.m_normals[2] = create$2(-1.0, 0.0);
          this.m_normals[3] = create$2(0.0, -1.0);
          this.m_count = 4;
          if (center && isValid$1(center)) {
              angle = angle || 0;
              copyVec2(this.m_centroid, center);
              const xf = Transform.identity();
              copy(center, xf.p);
              xf.q.setAngle(angle);
              // Transform vertices and normals.
              for (let i = 0; i < this.m_count; ++i) {
                  this.m_vertices[i] = Transform.mulVec2(xf, this.m_vertices[i]);
                  this.m_normals[i] = Rot.mulVec2(xf.q, this.m_normals[i]);
              }
          }
      }
      /**
       * Test a point for containment in this shape. This only works for convex
       * shapes.
       *
       * @param xf The shape world transform.
       * @param p A point in world coordinates.
       */
      testPoint(xf, p) {
          const pLocal = detransformVec2(temp, xf, p);
          for (let i = 0; i < this.m_count; ++i) {
              const dot = dotVec2(this.m_normals[i], pLocal) - dotVec2(this.m_normals[i], this.m_vertices[i]);
              if (dot > 0.0) {
                  return false;
              }
          }
          return true;
      }
      /**
       * Cast a ray against a child shape.
       *
       * @param output The ray-cast results.
       * @param input The ray-cast input parameters.
       * @param xf The transform to be applied to the shape.
       * @param childIndex The child shape index
       */
      rayCast(output, input, xf, childIndex) {
          // Put the ray into the polygon's frame of reference.
          const p1 = Rot.mulTVec2(xf.q, sub$1(input.p1, xf.p));
          const p2 = Rot.mulTVec2(xf.q, sub$1(input.p2, xf.p));
          const d = sub$1(p2, p1);
          let lower = 0.0;
          let upper = input.maxFraction;
          let index = -1;
          for (let i = 0; i < this.m_count; ++i) {
              // p = p1 + a * d
              // dot(normal, p - v) = 0
              // dot(normal, p1 - v) + a * dot(normal, d) = 0
              const numerator = dot$1(this.m_normals[i], sub$1(this.m_vertices[i], p1));
              const denominator = dot$1(this.m_normals[i], d);
              if (denominator == 0.0) {
                  if (numerator < 0.0) {
                      return false;
                  }
              }
              else {
                  // Note: we want this predicate without division:
                  // lower < numerator / denominator, where denominator < 0
                  // Since denominator < 0, we have to flip the inequality:
                  // lower < numerator / denominator <==> denominator * lower > numerator.
                  if (denominator < 0.0 && numerator < lower * denominator) {
                      // Increase lower.
                      // The segment enters this half-space.
                      lower = numerator / denominator;
                      index = i;
                  }
                  else if (denominator > 0.0 && numerator < upper * denominator) {
                      // Decrease upper.
                      // The segment exits this half-space.
                      upper = numerator / denominator;
                  }
              }
              // The use of epsilon here causes the assert on lower to trip
              // in some cases. Apparently the use of epsilon was to make edge
              // shapes work, but now those are handled separately.
              // if (upper < lower - matrix.EPSILON)
              if (upper < lower) {
                  return false;
              }
          }
          if (index >= 0) {
              output.fraction = lower;
              output.normal = Rot.mulVec2(xf.q, this.m_normals[index]);
              return true;
          }
          return false;
      }
      /**
       * Given a transform, compute the associated axis aligned bounding box for a
       * child shape.
       *
       * @param aabb Returns the axis aligned box.
       * @param xf The world transform of the shape.
       * @param childIndex The child shape
       */
      computeAABB(aabb, xf, childIndex) {
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          for (let i = 0; i < this.m_count; ++i) {
              const v = transformVec2(temp, xf, this.m_vertices[i]);
              minX = math_min$4(minX, v[0]);
              maxX = math_max$2(maxX, v[0]);
              minY = math_min$4(minY, v[1]);
              maxY = math_max$2(maxY, v[1]);
          }
          set$1(minX - this.m_radius, minY - this.m_radius, aabb.lowerBound);
          set$1(maxX + this.m_radius, maxY + this.m_radius, aabb.upperBound);
      }
      /**
       * Compute the mass properties of this shape using its dimensions and density.
       * The inertia tensor is computed about the local origin.
       *
       * @param massData Returns the mass data for this shape.
       * @param density The density in kilograms per meter squared.
       */
      computeMass(massData, density) {
          zeroVec2(center);
          let area = 0.0;
          let I = 0.0;
          // s is the reference point for forming triangles.
          // It's location doesn't change the result (except for rounding error).
          zeroVec2(s);
          // This code would put the reference point inside the polygon.
          for (let i = 0; i < this.m_count; ++i) {
              plusVec2(s, this.m_vertices[i]);
          }
          scaleVec2(s, 1.0 / this.m_count, s);
          const k_inv3 = 1.0 / 3.0;
          for (let i = 0; i < this.m_count; ++i) {
              // Triangle vertices.
              subVec2(e1$1, this.m_vertices[i], s);
              if (i + 1 < this.m_count) {
                  subVec2(e2$1, this.m_vertices[i + 1], s);
              }
              else {
                  subVec2(e2$1, this.m_vertices[0], s);
              }
              const D = crossVec2Vec2(e1$1, e2$1);
              const triangleArea = 0.5 * D;
              area += triangleArea;
              // Area weighted centroid
              combine2Vec2(temp, triangleArea * k_inv3, e1$1, triangleArea * k_inv3, e2$1);
              plusVec2(center, temp);
              const ex1 = e1$1[0];
              const ey1 = e1$1[1];
              const ex2 = e2$1[0];
              const ey2 = e2$1[1];
              const intx2 = ex1 * ex1 + ex2 * ex1 + ex2 * ex2;
              const inty2 = ey1 * ey1 + ey2 * ey1 + ey2 * ey2;
              I += (0.25 * k_inv3 * D) * (intx2 + inty2);
          }
          // Total mass
          massData.mass = density * area;
          scaleVec2(center, 1.0 / area, center);
          addVec2(massData.center, center, s);
          // Inertia tensor relative to the local origin (point s).
          massData.I = density * I;
          // Shift to center of mass then to original body origin.
          massData.I += massData.mass * (dotVec2(massData.center, massData.center) - dotVec2(center, center));
      }
      /**
       * Validate convexity. This is a very time consuming operation.
       * @returns true if valid
       */
      validate() {
          for (let i = 0; i < this.m_count; ++i) {
              const i1 = i;
              const i2 = i < this.m_count - 1 ? i1 + 1 : 0;
              const p = this.m_vertices[i1];
              subVec2(e$1, this.m_vertices[i2], p);
              for (let j = 0; j < this.m_count; ++j) {
                  if (j == i1 || j == i2) {
                      continue;
                  }
                  const c = crossVec2Vec2(e$1, subVec2(temp, this.m_vertices[j], p));
                  if (c < 0.0) {
                      return false;
                  }
              }
          }
          return true;
      }
      computeDistanceProxy(proxy) {
          for (let i = 0; i < this.m_count; ++i) {
              proxy.m_vertices[i] = this.m_vertices[i];
          }
          proxy.m_vertices.length = this.m_count;
          proxy.m_count = this.m_count;
          proxy.m_radius = this.m_radius;
      }
  }
  PolygonShape.TYPE = 'polygon';
  /** @internal */ function computeCentroid(vs, count) {
      const c = zero$1();
      let area = 0.0;
      // pRef is the reference point for forming triangles.
      // It's location doesn't change the result (except for rounding error).
      const pRef = zero$1();
      const inv3 = 1.0 / 3.0;
      for (let i = 0; i < count; ++i) {
          // Triangle vertices.
          const p1 = pRef;
          const p2 = vs[i];
          const p3 = i + 1 < count ? vs[i + 1] : vs[0];
          const e1 = sub$1(p2, p1);
          const e2 = sub$1(p3, p1);
          const D = crossVec2Vec2$1(e1, e2);
          const triangleArea = 0.5 * D;
          area += triangleArea;
          // Area weighted centroid
          combine3Vec2(temp, 1, p1, 1, p2, 1, p3);
          plusScaleVec2(c, triangleArea * inv3, temp);
      }
      return scale$1(c, 1.0 / area, c);
  }

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
  /** @internal */ const v1$1 = vec2(0, 0);
  /** @internal */ const v2 = vec2(0, 0);
  /**
   * A chain shape is a free form sequence of line segments. The chain has
   * two-sided collision, so you can use inside and outside collision. Therefore,
   * you may use any winding order. Connectivity information is used to create
   * smooth collisions.
   *
   * WARNING: The chain will not collide properly if there are self-intersections.
   */
  class ChainShape extends Shape {
      constructor(vertices, loop) {
          super();
          this.m_type = ChainShape.TYPE;
          this.m_radius = SettingsInternal.polygonRadius;
          this.m_vertices = [];
          this.m_count = 0;
          this.m_prevVertex = null;
          this.m_nextVertex = null;
          this.m_hasPrevVertex = false;
          this.m_hasNextVertex = false;
          this.m_isLoop = !!loop;
          if (vertices && vertices.length) {
              if (loop) {
                  this._createLoop(vertices);
              }
              else {
                  this._createChain(vertices);
              }
          }
      }
      /** @internal */
      _serialize() {
          const data = {
              type: this.m_type,
              vertices: this.m_vertices,
              isLoop: this.m_isLoop,
              hasPrevVertex: this.m_hasPrevVertex,
              hasNextVertex: this.m_hasNextVertex,
              prevVertex: null,
              nextVertex: null,
          };
          if (this.m_prevVertex) {
              data.prevVertex = this.m_prevVertex;
          }
          if (this.m_nextVertex) {
              data.nextVertex = this.m_nextVertex;
          }
          return data;
      }
      /** @internal */
      static _deserialize(data, fixture, restore) {
          const vertices = [];
          if (data.vertices) {
              for (let i = 0; i < data.vertices.length; i++) {
                  vertices.push(restore(Vec2, data.vertices[i]));
              }
          }
          const shape = new ChainShape(vertices, data.isLoop);
          if (data.prevVertex) {
              shape.setPrevVertex(data.prevVertex);
          }
          if (data.nextVertex) {
              shape.setNextVertex(data.nextVertex);
          }
          return shape;
      }
      // clear() {
      //   this.m_vertices.length = 0;
      //   this.m_count = 0;
      // }
      getType() {
          return this.m_type;
      }
      getRadius() {
          return this.m_radius;
      }
      /**
       * @internal
       * Create a loop. This automatically adjusts connectivity.
       *
       * @param vertices an array of vertices, these are copied
       * @param count the vertex count
       */
      _createLoop(vertices) {
          if (vertices.length < 3) {
              return;
          }
          for (let i = 1; i < vertices.length; ++i) {
              vertices[i - 1];
              vertices[i];
          }
          this.m_vertices = [];
          this.m_count = vertices.length + 1;
          for (let i = 0; i < vertices.length; ++i) {
              this.m_vertices[i] = clone$1(vertices[i]);
          }
          this.m_vertices[vertices.length] = clone$1(vertices[0]);
          this.m_prevVertex = this.m_vertices[this.m_count - 2];
          this.m_nextVertex = this.m_vertices[1];
          this.m_hasPrevVertex = true;
          this.m_hasNextVertex = true;
          return this;
      }
      /**
       * @internal
       * Create a chain with isolated end vertices.
       *
       * @param vertices an array of vertices, these are copied
       */
      _createChain(vertices) {
          for (let i = 1; i < vertices.length; ++i) {
              // If the code crashes here, it means your vertices are too close together.
              vertices[i - 1];
              vertices[i];
          }
          this.m_vertices = [];
          this.m_count = vertices.length;
          for (let i = 0; i < vertices.length; ++i) {
              this.m_vertices[i] = clone$1(vertices[i]);
          }
          this.m_hasPrevVertex = false;
          this.m_hasNextVertex = false;
          this.m_prevVertex = null;
          this.m_nextVertex = null;
          return this;
      }
      /** @hidden */
      _reset() {
          if (this.m_isLoop) {
              this._createLoop(this.m_vertices.slice(0, this.m_vertices.length - 1));
          }
          else {
              this._createChain(this.m_vertices);
          }
      }
      /**
       * Establish connectivity to a vertex that precedes the first vertex. Don't call
       * this for loops.
       */
      setPrevVertex(prevVertex) {
          // todo: copy or reference
          this.m_prevVertex = prevVertex;
          this.m_hasPrevVertex = true;
      }
      getPrevVertex() {
          return this.m_prevVertex;
      }
      /**
       * Establish connectivity to a vertex that follows the last vertex. Don't call
       * this for loops.
       */
      setNextVertex(nextVertex) {
          // todo: copy or reference
          this.m_nextVertex = nextVertex;
          this.m_hasNextVertex = true;
      }
      getNextVertex() {
          return this.m_nextVertex;
      }
      /**
       * @internal @deprecated Shapes should be treated as immutable.
       *
       * clone the concrete shape.
       */
      _clone() {
          const clone = new ChainShape();
          clone._createChain(this.m_vertices);
          clone.m_type = this.m_type;
          clone.m_radius = this.m_radius;
          clone.m_prevVertex = this.m_prevVertex;
          clone.m_nextVertex = this.m_nextVertex;
          clone.m_hasPrevVertex = this.m_hasPrevVertex;
          clone.m_hasNextVertex = this.m_hasNextVertex;
          return clone;
      }
      /**
       * Get the number of child primitives.
       */
      getChildCount() {
          // edge count = vertex count - 1
          return this.m_count - 1;
      }
      // Get a child edge.
      getChildEdge(edge, childIndex) {
          edge.m_type = EdgeShape.TYPE;
          edge.m_radius = this.m_radius;
          edge.m_vertex1 = this.m_vertices[childIndex];
          edge.m_vertex2 = this.m_vertices[childIndex + 1];
          if (childIndex > 0) {
              edge.m_vertex0 = this.m_vertices[childIndex - 1];
              edge.m_hasVertex0 = true;
          }
          else {
              edge.m_vertex0 = this.m_prevVertex;
              edge.m_hasVertex0 = this.m_hasPrevVertex;
          }
          if (childIndex < this.m_count - 2) {
              edge.m_vertex3 = this.m_vertices[childIndex + 2];
              edge.m_hasVertex3 = true;
          }
          else {
              edge.m_vertex3 = this.m_nextVertex;
              edge.m_hasVertex3 = this.m_hasNextVertex;
          }
      }
      getVertex(index) {
          if (index < this.m_count) {
              return this.m_vertices[index];
          }
          else {
              return this.m_vertices[0];
          }
      }
      isLoop() {
          return this.m_isLoop;
      }
      /**
       * Test a point for containment in this shape. This only works for convex
       * shapes.
       *
       * This always return false.
       *
       * @param xf The shape world transform.
       * @param p A point in world coordinates.
       */
      testPoint(xf, p) {
          return false;
      }
      /**
       * Cast a ray against a child shape.
       *
       * @param output The ray-cast results.
       * @param input The ray-cast input parameters.
       * @param xf The transform to be applied to the shape.
       * @param childIndex The child shape index
       */
      rayCast(output, input, xf, childIndex) {
          const edgeShape = new EdgeShape(this.getVertex(childIndex), this.getVertex(childIndex + 1));
          return edgeShape.rayCast(output, input, xf, 0);
      }
      /**
       * Given a transform, compute the associated axis aligned bounding box for a
       * child shape.
       *
       * @param aabb Returns the axis aligned box.
       * @param xf The world transform of the shape.
       * @param childIndex The child shape
       */
      computeAABB(aabb, xf, childIndex) {
          transformVec2(v1$1, xf, this.getVertex(childIndex));
          transformVec2(v2, xf, this.getVertex(childIndex + 1));
          AABB.combinePoints(aabb, v1$1, v2);
      }
      /**
       * Compute the mass properties of this shape using its dimensions and density.
       * The inertia tensor is computed about the local origin.
       *
       * Chains have zero mass.
       *
       * @param massData Returns the mass data for this shape.
       * @param density The density in kilograms per meter squared.
       */
      computeMass(massData, density) {
          massData.mass = 0.0;
          zeroVec2(massData.center);
          massData.I = 0.0;
      }
      computeDistanceProxy(proxy, childIndex) {
          proxy.m_vertices[0] = this.getVertex(childIndex);
          proxy.m_vertices[1] = this.getVertex(childIndex + 1);
          proxy.m_count = 2;
          proxy.m_radius = this.m_radius;
      }
  }
  ChainShape.TYPE = 'chain';

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
  /**
   * A rectangle polygon which extend PolygonShape.
   */
  class BoxShape extends PolygonShape {
      /**
       *
       * @param halfWidth
       * @param halfHeight
       * @param center coordinate of the center of the box relative to the body
       * @param angle angle of the box relative to the body
       */
      constructor(halfWidth, halfHeight, center, angle) {
          super();
          this._setAsBox(halfWidth, halfHeight, center, angle);
      }
  }
  // note that box is serialized/deserialized as polygon
  BoxShape.TYPE = 'polygon';

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
  Contact.addType(CircleShape.TYPE, CircleShape.TYPE, CircleCircleContact);
  /** @internal */ function CircleCircleContact(manifold, xfA, fixtureA, indexA, xfB, fixtureB, indexB) {
      CollideCircles(manifold, fixtureA.getShape(), xfA, fixtureB.getShape(), xfB);
  }
  /** @internal */ const pA = vec2(0, 0);
  /** @internal */ const pB = vec2(0, 0);
  const CollideCircles = function (manifold, circleA, xfA, circleB, xfB) {
      manifold.pointCount = 0;
      transformVec2(pA, xfA, circleA.m_p);
      transformVec2(pB, xfB, circleB.m_p);
      const distSqr = distSqrVec2(pB, pA);
      const rA = circleA.m_radius;
      const rB = circleB.m_radius;
      const radius = rA + rB;
      if (distSqr > radius * radius) {
          return;
      }
      manifold.type = exports.ManifoldType.e_circles;
      copyVec2(manifold.localPoint, circleA.m_p);
      zeroVec2(manifold.localNormal);
      manifold.pointCount = 1;
      copyVec2(manifold.points[0].localPoint, circleB.m_p);
      // manifold.points[0].id.key = 0;
      manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
  };

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
  Contact.addType(EdgeShape.TYPE, CircleShape.TYPE, EdgeCircleContact);
  Contact.addType(ChainShape.TYPE, CircleShape.TYPE, ChainCircleContact);
  /** @internal */ function EdgeCircleContact(manifold, xfA, fixtureA, indexA, xfB, fixtureB, indexB) {
      const shapeA = fixtureA.getShape();
      const shapeB = fixtureB.getShape();
      CollideEdgeCircle(manifold, shapeA, xfA, shapeB, xfB);
  }
  function ChainCircleContact(manifold, xfA, fixtureA, indexA, xfB, fixtureB, indexB) {
      const chain = fixtureA.getShape();
      const edge = new EdgeShape();
      chain.getChildEdge(edge, indexA);
      const shapeA = edge;
      const shapeB = fixtureB.getShape();
      CollideEdgeCircle(manifold, shapeA, xfA, shapeB, xfB);
  }
  /** @internal */ const e = vec2(0, 0);
  /** @internal */ const e1 = vec2(0, 0);
  /** @internal */ const e2 = vec2(0, 0);
  /** @internal */ const Q = vec2(0, 0);
  /** @internal */ const P = vec2(0, 0);
  /** @internal */ const n$2 = vec2(0, 0);
  // Compute contact points for edge versus circle.
  // This accounts for edge connectivity.
  const CollideEdgeCircle = function (manifold, edgeA, xfA, circleB, xfB) {
      manifold.pointCount = 0;
      // Compute circle in frame of edge
      retransformVec2(Q, xfB, xfA, circleB.m_p);
      const A = edgeA.m_vertex1;
      const B = edgeA.m_vertex2;
      subVec2(e, B, A);
      // Barycentric coordinates
      const u = dotVec2(e, B) - dotVec2(e, Q);
      const v = dotVec2(e, Q) - dotVec2(e, A);
      const radius = edgeA.m_radius + circleB.m_radius;
      // Region A
      if (v <= 0.0) {
          copyVec2(P, A);
          const dd = distSqrVec2(Q, A);
          if (dd > radius * radius) {
              return;
          }
          // Is there an edge connected to A?
          if (edgeA.m_hasVertex0) {
              const A1 = edgeA.m_vertex0;
              const B1 = A;
              subVec2(e1, B1, A1);
              const u1 = dotVec2(e1, B1) - dotVec2(e1, Q);
              // Is the circle in Region AB of the previous edge?
              if (u1 > 0.0) {
                  return;
              }
          }
          manifold.type = exports.ManifoldType.e_circles;
          zeroVec2(manifold.localNormal);
          copyVec2(manifold.localPoint, P);
          manifold.pointCount = 1;
          copyVec2(manifold.points[0].localPoint, circleB.m_p);
          // manifold.points[0].id.key = 0;
          manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
          return;
      }
      // Region B
      if (u <= 0.0) {
          copyVec2(P, B);
          const dd = distSqrVec2(Q, P);
          if (dd > radius * radius) {
              return;
          }
          // Is there an edge connected to B?
          if (edgeA.m_hasVertex3) {
              const B2 = edgeA.m_vertex3;
              const A2 = B;
              subVec2(e2, B2, A2);
              const v2 = dotVec2(e2, Q) - dotVec2(e2, A2);
              // Is the circle in Region AB of the next edge?
              if (v2 > 0.0) {
                  return;
              }
          }
          manifold.type = exports.ManifoldType.e_circles;
          zeroVec2(manifold.localNormal);
          copyVec2(manifold.localPoint, P);
          manifold.pointCount = 1;
          copyVec2(manifold.points[0].localPoint, circleB.m_p);
          // manifold.points[0].id.key = 0;
          manifold.points[0].id.setFeatures(1, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
          return;
      }
      // Region AB
      const den = lengthSqrVec2(e);
      combine2Vec2(P, u / den, A, v / den, B);
      const dd = distSqrVec2(Q, P);
      if (dd > radius * radius) {
          return;
      }
      crossNumVec2(n$2, 1, e);
      if (dotVec2(n$2, Q) - dotVec2(n$2, A) < 0.0) {
          negVec2(n$2);
      }
      normalizeVec2(n$2);
      manifold.type = exports.ManifoldType.e_faceA;
      copyVec2(manifold.localNormal, n$2);
      copyVec2(manifold.localPoint, A);
      manifold.pointCount = 1;
      copyVec2(manifold.points[0].localPoint, circleB.m_p);
      // manifold.points[0].id.key = 0;
      manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_face, 0, exports.ContactFeatureType.e_vertex);
  };

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
  /** @internal */ const incidentEdge = [new ClipVertex(), new ClipVertex()];
  /** @internal */ const clipPoints1$1 = [new ClipVertex(), new ClipVertex()];
  /** @internal */ const clipPoints2$1 = [new ClipVertex(), new ClipVertex()];
  /** @internal */ const clipSegmentToLineNormal = vec2(0, 0);
  /** @internal */ const v1 = vec2(0, 0);
  /** @internal */ const n$1 = vec2(0, 0);
  /** @internal */ const xf$1 = transform(0, 0, 0);
  /** @internal */ const v11 = vec2(0, 0);
  /** @internal */ const v12 = vec2(0, 0);
  /** @internal */ const localTangent = vec2(0, 0);
  /** @internal */ const localNormal = vec2(0, 0);
  /** @internal */ const planePoint = vec2(0, 0);
  /** @internal */ const tangent = vec2(0, 0);
  /** @internal */ const normal$1 = vec2(0, 0);
  /** @internal */ const normal1$1 = vec2(0, 0);
  Contact.addType(PolygonShape.TYPE, PolygonShape.TYPE, PolygonContact);
  /** @internal */ function PolygonContact(manifold, xfA, fixtureA, indexA, xfB, fixtureB, indexB) {
      CollidePolygons(manifold, fixtureA.getShape(), xfA, fixtureB.getShape(), xfB);
  }
  /**
   * Find the max separation between poly1 and poly2 using edge normals from
   * poly1.
   */
  /** @internal */ function findMaxSeparation(poly1, xf1, poly2, xf2, output) {
      const count1 = poly1.m_count;
      const count2 = poly2.m_count;
      const n1s = poly1.m_normals;
      const v1s = poly1.m_vertices;
      const v2s = poly2.m_vertices;
      detransformTransform(xf$1, xf2, xf1);
      let bestIndex = 0;
      let maxSeparation = -Infinity;
      for (let i = 0; i < count1; ++i) {
          // Get poly1 normal in frame2.
          rotVec2(n$1, xf$1.q, n1s[i]);
          transformVec2(v1, xf$1, v1s[i]);
          // Find deepest point for normal i.
          let si = Infinity;
          for (let j = 0; j < count2; ++j) {
              const sij = dotVec2(n$1, v2s[j]) - dotVec2(n$1, v1);
              if (sij < si) {
                  si = sij;
              }
          }
          if (si > maxSeparation) {
              maxSeparation = si;
              bestIndex = i;
          }
      }
      // used to keep last FindMaxSeparation call values
      output.maxSeparation = maxSeparation;
      output.bestIndex = bestIndex;
  }
  /** @internal */ function findIncidentEdge(clipVertex, poly1, xf1, edge1, poly2, xf2) {
      const normals1 = poly1.m_normals;
      const count2 = poly2.m_count;
      const vertices2 = poly2.m_vertices;
      const normals2 = poly2.m_normals;
      // Get the normal of the reference edge in poly2's frame.
      rerotVec2(normal1$1, xf2.q, xf1.q, normals1[edge1]);
      // Find the incident edge on poly2.
      let index = 0;
      let minDot = Infinity;
      for (let i = 0; i < count2; ++i) {
          const dot = dotVec2(normal1$1, normals2[i]);
          if (dot < minDot) {
              minDot = dot;
              index = i;
          }
      }
      // Build the clip vertices for the incident edge.
      const i1 = index;
      const i2 = i1 + 1 < count2 ? i1 + 1 : 0;
      transformVec2(clipVertex[0].v, xf2, vertices2[i1]);
      clipVertex[0].id.setFeatures(edge1, exports.ContactFeatureType.e_face, i1, exports.ContactFeatureType.e_vertex);
      transformVec2(clipVertex[1].v, xf2, vertices2[i2]);
      clipVertex[1].id.setFeatures(edge1, exports.ContactFeatureType.e_face, i2, exports.ContactFeatureType.e_vertex);
  }
  /** @internal */ const maxSeparation = {
      maxSeparation: 0,
      bestIndex: 0,
  };
  /**
   *
   * Find edge normal of max separation on A - return if separating axis is found<br>
   * Find edge normal of max separation on B - return if separation axis is found<br>
   * Choose reference edge as min(minA, minB)<br>
   * Find incident edge<br>
   * Clip
   *
   * The normal points from 1 to 2
   */
  const CollidePolygons = function (manifold, polyA, xfA, polyB, xfB) {
      manifold.pointCount = 0;
      const totalRadius = polyA.m_radius + polyB.m_radius;
      findMaxSeparation(polyA, xfA, polyB, xfB, maxSeparation);
      const edgeA = maxSeparation.bestIndex;
      const separationA = maxSeparation.maxSeparation;
      if (separationA > totalRadius)
          return;
      findMaxSeparation(polyB, xfB, polyA, xfA, maxSeparation);
      const edgeB = maxSeparation.bestIndex;
      const separationB = maxSeparation.maxSeparation;
      if (separationB > totalRadius)
          return;
      let poly1; // reference polygon
      let poly2; // incident polygon
      let xf1;
      let xf2;
      let edge1; // reference edge
      let flip;
      const k_tol = 0.1 * SettingsInternal.linearSlop;
      if (separationB > separationA + k_tol) {
          poly1 = polyB;
          poly2 = polyA;
          xf1 = xfB;
          xf2 = xfA;
          edge1 = edgeB;
          manifold.type = exports.ManifoldType.e_faceB;
          flip = true;
      }
      else {
          poly1 = polyA;
          poly2 = polyB;
          xf1 = xfA;
          xf2 = xfB;
          edge1 = edgeA;
          manifold.type = exports.ManifoldType.e_faceA;
          flip = false;
      }
      incidentEdge[0].recycle(), incidentEdge[1].recycle();
      findIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
      const count1 = poly1.m_count;
      const vertices1 = poly1.m_vertices;
      const iv1 = edge1;
      const iv2 = edge1 + 1 < count1 ? edge1 + 1 : 0;
      copyVec2(v11, vertices1[iv1]);
      copyVec2(v12, vertices1[iv2]);
      subVec2(localTangent, v12, v11);
      normalizeVec2(localTangent);
      crossVec2Num(localNormal, localTangent, 1.0);
      combine2Vec2(planePoint, 0.5, v11, 0.5, v12);
      rotVec2(tangent, xf1.q, localTangent);
      crossVec2Num(normal$1, tangent, 1.0);
      transformVec2(v11, xf1, v11);
      transformVec2(v12, xf1, v12);
      // Face offset.
      const frontOffset = dotVec2(normal$1, v11);
      // Side offsets, extended by polytope skin thickness.
      const sideOffset1 = -dotVec2(tangent, v11) + totalRadius;
      const sideOffset2 = dotVec2(tangent, v12) + totalRadius;
      // Clip incident edge against extruded edge1 side edges.
      clipPoints1$1[0].recycle(), clipPoints1$1[1].recycle();
      clipPoints2$1[0].recycle(), clipPoints2$1[1].recycle();
      // Clip to box side 1
      set$1(-tangent[0], -tangent[1], clipSegmentToLineNormal);
      const np1 = clipSegmentToLine(clipPoints1$1, incidentEdge, clipSegmentToLineNormal, sideOffset1, iv1);
      if (np1 < 2) {
          return;
      }
      // Clip to negative box side 1
      set$1(tangent[0], tangent[1], clipSegmentToLineNormal);
      const np2 = clipSegmentToLine(clipPoints2$1, clipPoints1$1, clipSegmentToLineNormal, sideOffset2, iv2);
      if (np2 < 2) {
          return;
      }
      // Now clipPoints2 contains the clipped points.
      copyVec2(manifold.localNormal, localNormal);
      copyVec2(manifold.localPoint, planePoint);
      let pointCount = 0;
      for (let i = 0; i < clipPoints2$1.length /* maxManifoldPoints */; ++i) {
          const separation = dotVec2(normal$1, clipPoints2$1[i].v) - frontOffset;
          if (separation <= totalRadius) {
              const cp = manifold.points[pointCount];
              detransformVec2(cp.localPoint, xf2, clipPoints2$1[i].v);
              cp.id.set(clipPoints2$1[i].id);
              if (flip) {
                  // Swap features
                  cp.id.swapFeatures();
              }
              ++pointCount;
          }
      }
      manifold.pointCount = pointCount;
  };

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
  Contact.addType(PolygonShape.TYPE, CircleShape.TYPE, PolygonCircleContact);
  /** @internal */ function PolygonCircleContact(manifold, xfA, fixtureA, indexA, xfB, fixtureB, indexB) {
      CollidePolygonCircle(manifold, fixtureA.getShape(), xfA, fixtureB.getShape(), xfB);
  }
  /** @internal */ const cLocal = vec2(0, 0);
  /** @internal */ const faceCenter = vec2(0, 0);
  const CollidePolygonCircle = function (manifold, polygonA, xfA, circleB, xfB) {
      manifold.pointCount = 0;
      // Compute circle position in the frame of the polygon.
      retransformVec2(cLocal, xfB, xfA, circleB.m_p);
      // Find the min separating edge.
      let normalIndex = 0;
      let separation = -Infinity;
      const radius = polygonA.m_radius + circleB.m_radius;
      const vertexCount = polygonA.m_count;
      const vertices = polygonA.m_vertices;
      const normals = polygonA.m_normals;
      for (let i = 0; i < vertexCount; ++i) {
          const s = dotVec2(normals[i], cLocal) - dotVec2(normals[i], vertices[i]);
          if (s > radius) {
              // Early out.
              return;
          }
          if (s > separation) {
              separation = s;
              normalIndex = i;
          }
      }
      // Vertices that subtend the incident face.
      const vertIndex1 = normalIndex;
      const vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
      const v1 = vertices[vertIndex1];
      const v2 = vertices[vertIndex2];
      // If the center is inside the polygon ...
      if (separation < EPSILON) {
          manifold.pointCount = 1;
          manifold.type = exports.ManifoldType.e_faceA;
          copyVec2(manifold.localNormal, normals[normalIndex]);
          combine2Vec2(manifold.localPoint, 0.5, v1, 0.5, v2);
          copyVec2(manifold.points[0].localPoint, circleB.m_p);
          // manifold.points[0].id.key = 0;
          manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
          return;
      }
      // Compute barycentric coordinates
      // u1 = (cLocal - v1) dot (v2 - v1))
      const u1 = dotVec2(cLocal, v2) - dotVec2(cLocal, v1) - dotVec2(v1, v2) + dotVec2(v1, v1);
      // u2 = (cLocal - v2) dot (v1 - v2)
      const u2 = dotVec2(cLocal, v1) - dotVec2(cLocal, v2) - dotVec2(v2, v1) + dotVec2(v2, v2);
      if (u1 <= 0.0) {
          if (distSqrVec2(cLocal, v1) > radius * radius) {
              return;
          }
          manifold.pointCount = 1;
          manifold.type = exports.ManifoldType.e_faceA;
          subVec2(manifold.localNormal, cLocal, v1);
          normalizeVec2(manifold.localNormal);
          copyVec2(manifold.localPoint, v1);
          copyVec2(manifold.points[0].localPoint, circleB.m_p);
          // manifold.points[0].id.key = 0;
          manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
      }
      else if (u2 <= 0.0) {
          if (distSqrVec2(cLocal, v2) > radius * radius) {
              return;
          }
          manifold.pointCount = 1;
          manifold.type = exports.ManifoldType.e_faceA;
          subVec2(manifold.localNormal, cLocal, v2);
          normalizeVec2(manifold.localNormal);
          copyVec2(manifold.localPoint, v2);
          copyVec2(manifold.points[0].localPoint, circleB.m_p);
          // manifold.points[0].id.key = 0;
          manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
      }
      else {
          combine2Vec2(faceCenter, 0.5, v1, 0.5, v2);
          const separation = dotVec2(cLocal, normals[vertIndex1]) - dotVec2(faceCenter, normals[vertIndex1]);
          if (separation > radius) {
              return;
          }
          manifold.pointCount = 1;
          manifold.type = exports.ManifoldType.e_faceA;
          copyVec2(manifold.localNormal, normals[vertIndex1]);
          copyVec2(manifold.localPoint, faceCenter);
          copyVec2(manifold.points[0].localPoint, circleB.m_p);
          // manifold.points[0].id.key = 0;
          manifold.points[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, 0, exports.ContactFeatureType.e_vertex);
      }
  };

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
  /** @internal */ const math_min$3 = Math.min;
  Contact.addType(EdgeShape.TYPE, PolygonShape.TYPE, EdgePolygonContact);
  Contact.addType(ChainShape.TYPE, PolygonShape.TYPE, ChainPolygonContact);
  /** @internal */ function EdgePolygonContact(manifold, xfA, fA, indexA, xfB, fB, indexB) {
      CollideEdgePolygon(manifold, fA.getShape(), xfA, fB.getShape(), xfB);
  }
  // reused
  /** @internal */ const edge_reuse = new EdgeShape();
  /** @internal */ function ChainPolygonContact(manifold, xfA, fA, indexA, xfB, fB, indexB) {
      const chain = fA.getShape();
      chain.getChildEdge(edge_reuse, indexA);
      CollideEdgePolygon(manifold, edge_reuse, xfA, fB.getShape(), xfB);
  }
  /** @internal */ var EPAxisType;
  (function (EPAxisType) {
      EPAxisType[EPAxisType["e_unknown"] = -1] = "e_unknown";
      EPAxisType[EPAxisType["e_edgeA"] = 1] = "e_edgeA";
      EPAxisType[EPAxisType["e_edgeB"] = 2] = "e_edgeB";
  })(EPAxisType || (EPAxisType = {}));
  // unused?
  /** @internal */ var VertexType;
  (function (VertexType) {
      VertexType[VertexType["e_isolated"] = 0] = "e_isolated";
      VertexType[VertexType["e_concave"] = 1] = "e_concave";
      VertexType[VertexType["e_convex"] = 2] = "e_convex";
  })(VertexType || (VertexType = {}));
  /**
   * This structure is used to keep track of the best separating axis.
   */
  /** @internal */ class EPAxis {
  }
  /**
   * This holds polygon B expressed in frame A.
   */
  /** @internal */ class TempPolygon {
      constructor() {
          this.vertices = []; // [Settings.maxPolygonVertices]
          this.normals = []; // [Settings.maxPolygonVertices];
          this.count = 0;
          for (let i = 0; i < SettingsInternal.maxPolygonVertices; i++) {
              this.vertices.push(vec2(0, 0));
              this.normals.push(vec2(0, 0));
          }
      }
  }
  /**
   * Reference face used for clipping
   */
  /** @internal */ class ReferenceFace {
      constructor() {
          this.v1 = vec2(0, 0);
          this.v2 = vec2(0, 0);
          this.normal = vec2(0, 0);
          this.sideNormal1 = vec2(0, 0);
          this.sideNormal2 = vec2(0, 0);
      }
      recycle() {
          zeroVec2(this.v1);
          zeroVec2(this.v2);
          zeroVec2(this.normal);
          zeroVec2(this.sideNormal1);
          zeroVec2(this.sideNormal2);
      }
  }
  // reused
  /** @internal */ const clipPoints1 = [new ClipVertex(), new ClipVertex()];
  /** @internal */ const clipPoints2 = [new ClipVertex(), new ClipVertex()];
  /** @internal */ const ie = [new ClipVertex(), new ClipVertex()];
  /** @internal */ const edgeAxis = new EPAxis();
  /** @internal */ const polygonAxis = new EPAxis();
  /** @internal */ const polygonBA = new TempPolygon();
  /** @internal */ const rf = new ReferenceFace();
  /** @internal */ const centroidB = vec2(0, 0);
  /** @internal */ const edge0 = vec2(0, 0);
  /** @internal */ const edge1 = vec2(0, 0);
  /** @internal */ const edge2 = vec2(0, 0);
  /** @internal */ const xf = transform(0, 0, 0);
  /** @internal */ const normal = vec2(0, 0);
  /** @internal */ const normal0 = vec2(0, 0);
  /** @internal */ const normal1 = vec2(0, 0);
  /** @internal */ const normal2 = vec2(0, 0);
  /** @internal */ const lowerLimit = vec2(0, 0);
  /** @internal */ const upperLimit = vec2(0, 0);
  /** @internal */ const perp = vec2(0, 0);
  /** @internal */ const n = vec2(0, 0);
  /**
   * This function collides and edge and a polygon, taking into account edge
   * adjacency.
   */
  const CollideEdgePolygon = function (manifold, edgeA, xfA, polygonB, xfB) {
      // Algorithm:
      // 1. Classify v1 and v2
      // 2. Classify polygon centroid as front or back
      // 3. Flip normal if necessary
      // 4. Initialize normal range to [-pi, pi] about face normal
      // 5. Adjust normal range according to adjacent edges
      // 6. Visit each separating axes, only accept axes within the range
      // 7. Return if _any_ axis indicates separation
      // 8. Clip
      // let m_type1: VertexType;
      // let m_type2: VertexType;
      detransformTransform(xf, xfA, xfB);
      transformVec2(centroidB, xf, polygonB.m_centroid);
      const v0 = edgeA.m_vertex0;
      const v1 = edgeA.m_vertex1;
      const v2 = edgeA.m_vertex2;
      const v3 = edgeA.m_vertex3;
      const hasVertex0 = edgeA.m_hasVertex0;
      const hasVertex3 = edgeA.m_hasVertex3;
      subVec2(edge1, v2, v1);
      normalizeVec2(edge1);
      set$1(edge1[1], -edge1[0], normal1);
      const offset1 = dotVec2(normal1, centroidB) - dotVec2(normal1, v1);
      let offset0 = 0.0;
      let offset2 = 0.0;
      let convex1 = false;
      let convex2 = false;
      zeroVec2(normal0);
      zeroVec2(normal2);
      // Is there a preceding edge?
      if (hasVertex0) {
          subVec2(edge0, v1, v0);
          normalizeVec2(edge0);
          set$1(edge0[1], -edge0[0], normal0);
          convex1 = crossVec2Vec2(edge0, edge1) >= 0.0;
          offset0 = dot$1(normal0, centroidB) - dot$1(normal0, v0);
      }
      // Is there a following edge?
      if (hasVertex3) {
          subVec2(edge2, v3, v2);
          normalizeVec2(edge2);
          set$1(edge2[1], -edge2[0], normal2);
          convex2 = crossVec2Vec2$1(edge1, edge2) > 0.0;
          offset2 = dot$1(normal2, centroidB) - dot$1(normal2, v2);
      }
      let front;
      zeroVec2(normal);
      zeroVec2(lowerLimit);
      zeroVec2(upperLimit);
      // Determine front or back collision. Determine collision normal limits.
      if (hasVertex0 && hasVertex3) {
          if (convex1 && convex2) {
              front = offset0 >= 0.0 || offset1 >= 0.0 || offset2 >= 0.0;
              if (front) {
                  copyVec2(normal, normal1);
                  copyVec2(lowerLimit, normal0);
                  copyVec2(upperLimit, normal2);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  scaleVec2(lowerLimit, -1, normal1);
                  scaleVec2(upperLimit, -1, normal1);
              }
          }
          else if (convex1) {
              front = offset0 >= 0.0 || (offset1 >= 0.0 && offset2 >= 0.0);
              if (front) {
                  copyVec2(normal, normal1);
                  copyVec2(lowerLimit, normal0);
                  copyVec2(upperLimit, normal1);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  scaleVec2(lowerLimit, -1, normal2);
                  scaleVec2(upperLimit, -1, normal1);
              }
          }
          else if (convex2) {
              front = offset2 >= 0.0 || (offset0 >= 0.0 && offset1 >= 0.0);
              if (front) {
                  copyVec2(normal, normal1);
                  copyVec2(lowerLimit, normal1);
                  copyVec2(upperLimit, normal2);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  scaleVec2(lowerLimit, -1, normal1);
                  scaleVec2(upperLimit, -1, normal0);
              }
          }
          else {
              front = offset0 >= 0.0 && offset1 >= 0.0 && offset2 >= 0.0;
              if (front) {
                  copyVec2(normal, normal1);
                  copyVec2(lowerLimit, normal1);
                  copyVec2(upperLimit, normal1);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  scaleVec2(lowerLimit, -1, normal2);
                  scaleVec2(upperLimit, -1, normal0);
              }
          }
      }
      else if (hasVertex0) {
          if (convex1) {
              front = offset0 >= 0.0 || offset1 >= 0.0;
              if (front) {
                  copyVec2(normal, normal1);
                  copyVec2(lowerLimit, normal0);
                  scaleVec2(upperLimit, -1, normal1);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  copyVec2(lowerLimit, normal1);
                  scaleVec2(upperLimit, -1, normal1);
              }
          }
          else {
              front = offset0 >= 0.0 && offset1 >= 0.0;
              if (front) {
                  copyVec2(normal, normal1);
                  copyVec2(lowerLimit, normal1);
                  scaleVec2(upperLimit, -1, normal1);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  copyVec2(lowerLimit, normal1);
                  scaleVec2(upperLimit, -1, normal0);
              }
          }
      }
      else if (hasVertex3) {
          if (convex2) {
              front = offset1 >= 0.0 || offset2 >= 0.0;
              if (front) {
                  copyVec2(normal, normal1);
                  scaleVec2(lowerLimit, -1, normal1);
                  copyVec2(upperLimit, normal2);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  scaleVec2(lowerLimit, -1, normal1);
                  copyVec2(upperLimit, normal1);
              }
          }
          else {
              front = offset1 >= 0.0 && offset2 >= 0.0;
              if (front) {
                  copyVec2(normal, normal1);
                  scaleVec2(lowerLimit, -1, normal1);
                  copyVec2(upperLimit, normal1);
              }
              else {
                  scaleVec2(normal, -1, normal1);
                  scaleVec2(lowerLimit, -1, normal2);
                  copyVec2(upperLimit, normal1);
              }
          }
      }
      else {
          front = offset1 >= 0.0;
          if (front) {
              copyVec2(normal, normal1);
              scaleVec2(lowerLimit, -1, normal1);
              scaleVec2(upperLimit, -1, normal1);
          }
          else {
              scaleVec2(normal, -1, normal1);
              copyVec2(lowerLimit, normal1);
              copyVec2(upperLimit, normal1);
          }
      }
      // Get polygonB in frameA
      polygonBA.count = polygonB.m_count;
      for (let i = 0; i < polygonB.m_count; ++i) {
          transformVec2(polygonBA.vertices[i], xf, polygonB.m_vertices[i]);
          rotVec2(polygonBA.normals[i], xf.q, polygonB.m_normals[i]);
      }
      const radius = polygonB.m_radius + edgeA.m_radius;
      manifold.pointCount = 0;
      { // ComputeEdgeSeparation
          edgeAxis.type = EPAxisType.e_edgeA;
          edgeAxis.index = front ? 0 : 1;
          edgeAxis.separation = Infinity;
          for (let i = 0; i < polygonBA.count; ++i) {
              const v = polygonBA.vertices[i];
              const s = dotVec2(normal, v) - dotVec2(normal, v1);
              if (s < edgeAxis.separation) {
                  edgeAxis.separation = s;
              }
          }
      }
      // If no valid normal can be found than this edge should not collide.
      // @ts-ignore todo: why we need this if here?
      if (edgeAxis.type == EPAxisType.e_unknown) {
          return;
      }
      if (edgeAxis.separation > radius) {
          return;
      }
      { // ComputePolygonSeparation
          polygonAxis.type = EPAxisType.e_unknown;
          polygonAxis.index = -1;
          polygonAxis.separation = -Infinity;
          set$1(-normal[1], normal[0], perp);
          for (let i = 0; i < polygonBA.count; ++i) {
              scaleVec2(n, -1, polygonBA.normals[i]);
              const s1 = dotVec2(n, polygonBA.vertices[i]) - dotVec2(n, v1);
              const s2 = dotVec2(n, polygonBA.vertices[i]) - dotVec2(n, v2);
              const s = math_min$3(s1, s2);
              if (s > radius) {
                  // No collision
                  polygonAxis.type = EPAxisType.e_edgeB;
                  polygonAxis.index = i;
                  polygonAxis.separation = s;
                  break;
              }
              // Adjacency
              if (dotVec2(n, perp) >= 0.0) {
                  if (dotVec2(n, normal) - dotVec2(upperLimit, normal) < -SettingsInternal.angularSlop) {
                      continue;
                  }
              }
              else {
                  if (dotVec2(n, normal) - dotVec2(lowerLimit, normal) < -SettingsInternal.angularSlop) {
                      continue;
                  }
              }
              if (s > polygonAxis.separation) {
                  polygonAxis.type = EPAxisType.e_edgeB;
                  polygonAxis.index = i;
                  polygonAxis.separation = s;
              }
          }
      }
      if (polygonAxis.type != EPAxisType.e_unknown && polygonAxis.separation > radius) {
          return;
      }
      // Use hysteresis for jitter reduction.
      const k_relativeTol = 0.98;
      const k_absoluteTol = 0.001;
      let primaryAxis;
      if (polygonAxis.type == EPAxisType.e_unknown) {
          primaryAxis = edgeAxis;
      }
      else if (polygonAxis.separation > k_relativeTol * edgeAxis.separation + k_absoluteTol) {
          primaryAxis = polygonAxis;
      }
      else {
          primaryAxis = edgeAxis;
      }
      ie[0].recycle(), ie[1].recycle();
      if (primaryAxis.type == EPAxisType.e_edgeA) {
          manifold.type = exports.ManifoldType.e_faceA;
          // Search for the polygon normal that is most anti-parallel to the edge
          // normal.
          let bestIndex = 0;
          let bestValue = dotVec2(normal, polygonBA.normals[0]);
          for (let i = 1; i < polygonBA.count; ++i) {
              const value = dotVec2(normal, polygonBA.normals[i]);
              if (value < bestValue) {
                  bestValue = value;
                  bestIndex = i;
              }
          }
          const i1 = bestIndex;
          const i2 = i1 + 1 < polygonBA.count ? i1 + 1 : 0;
          copyVec2(ie[0].v, polygonBA.vertices[i1]);
          ie[0].id.setFeatures(0, exports.ContactFeatureType.e_face, i1, exports.ContactFeatureType.e_vertex);
          copyVec2(ie[1].v, polygonBA.vertices[i2]);
          ie[1].id.setFeatures(0, exports.ContactFeatureType.e_face, i2, exports.ContactFeatureType.e_vertex);
          if (front) {
              rf.i1 = 0;
              rf.i2 = 1;
              copyVec2(rf.v1, v1);
              copyVec2(rf.v2, v2);
              copyVec2(rf.normal, normal1);
          }
          else {
              rf.i1 = 1;
              rf.i2 = 0;
              copyVec2(rf.v1, v2);
              copyVec2(rf.v2, v1);
              scaleVec2(rf.normal, -1, normal1);
          }
      }
      else {
          manifold.type = exports.ManifoldType.e_faceB;
          copyVec2(ie[0].v, v1);
          ie[0].id.setFeatures(0, exports.ContactFeatureType.e_vertex, primaryAxis.index, exports.ContactFeatureType.e_face);
          copyVec2(ie[1].v, v2);
          ie[1].id.setFeatures(0, exports.ContactFeatureType.e_vertex, primaryAxis.index, exports.ContactFeatureType.e_face);
          rf.i1 = primaryAxis.index;
          rf.i2 = rf.i1 + 1 < polygonBA.count ? rf.i1 + 1 : 0;
          copyVec2(rf.v1, polygonBA.vertices[rf.i1]);
          copyVec2(rf.v2, polygonBA.vertices[rf.i2]);
          copyVec2(rf.normal, polygonBA.normals[rf.i1]);
      }
      set$1(rf.normal[1], -rf.normal[0], rf.sideNormal1);
      set$1(-rf.sideNormal1[0], -rf.sideNormal1[1], rf.sideNormal2);
      rf.sideOffset1 = dotVec2(rf.sideNormal1, rf.v1);
      rf.sideOffset2 = dotVec2(rf.sideNormal2, rf.v2);
      // Clip incident edge against extruded edge1 side edges.
      clipPoints1[0].recycle(), clipPoints1[1].recycle();
      clipPoints2[0].recycle(), clipPoints2[1].recycle();
      // Clip to box side 1
      const np1 = clipSegmentToLine(clipPoints1, ie, rf.sideNormal1, rf.sideOffset1, rf.i1);
      if (np1 < SettingsInternal.maxManifoldPoints) {
          return;
      }
      // Clip to negative box side 1
      const np2 = clipSegmentToLine(clipPoints2, clipPoints1, rf.sideNormal2, rf.sideOffset2, rf.i2);
      if (np2 < SettingsInternal.maxManifoldPoints) {
          return;
      }
      // Now clipPoints2 contains the clipped points.
      if (primaryAxis.type == EPAxisType.e_edgeA) {
          copyVec2(manifold.localNormal, rf.normal);
          copyVec2(manifold.localPoint, rf.v1);
      }
      else {
          copyVec2(manifold.localNormal, polygonB.m_normals[rf.i1]);
          copyVec2(manifold.localPoint, polygonB.m_vertices[rf.i1]);
      }
      let pointCount = 0;
      for (let i = 0; i < SettingsInternal.maxManifoldPoints; ++i) {
          const separation = dotVec2(rf.normal, clipPoints2[i].v) - dotVec2(rf.normal, rf.v1);
          if (separation <= radius) {
              const cp = manifold.points[pointCount]; // ManifoldPoint
              if (primaryAxis.type == EPAxisType.e_edgeA) {
                  detransformVec2(cp.localPoint, xf, clipPoints2[i].v);
                  cp.id.set(clipPoints2[i].id);
              }
              else {
                  copyVec2(cp.localPoint, clipPoints2[i].v);
                  cp.id.set(clipPoints2[i].id);
                  cp.id.swapFeatures();
              }
              ++pointCount;
          }
      }
      manifold.pointCount = pointCount;
  };

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
  /** @internal */ const math_abs$6 = Math.abs;
  /** @internal */ const math_PI$4 = Math.PI;
  /** @internal */ const DEFAULTS$a = {
      frequencyHz: 0.0,
      dampingRatio: 0.0
  };
  /**
   * A distance joint constrains two points on two bodies to remain at a fixed
   * distance from each other. You can view this as a massless, rigid rod.
   */
  class DistanceJoint extends Joint {
      constructor(def, bodyA, bodyB, anchorA, anchorB) {
          // order of constructor arguments is changed in v0.2
          if (bodyB && anchorA && ('m_type' in anchorA) && ('x' in bodyB) && ('y' in bodyB)) {
              const temp = bodyB;
              bodyB = anchorA;
              anchorA = temp;
          }
          def = options(def, DEFAULTS$a);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = DistanceJoint.TYPE;
          // Solver shared
          this.m_localAnchorA = clone$1(anchorA ? bodyA.getLocalPoint(anchorA) : def.localAnchorA || zero$1());
          this.m_localAnchorB = clone$1(anchorB ? bodyB.getLocalPoint(anchorB) : def.localAnchorB || zero$1());
          this.m_length = Number.isFinite(def.length) ? def.length :
              distance(bodyA.getWorldPoint(this.m_localAnchorA), bodyB.getWorldPoint(this.m_localAnchorB));
          this.m_frequencyHz = def.frequencyHz;
          this.m_dampingRatio = def.dampingRatio;
          this.m_impulse = 0.0;
          this.m_gamma = 0.0;
          this.m_bias = 0.0;
          // 1-D constrained system
          // m (v2 - v1) = lambda
          // v2 + (beta/h) * x1 + gamma * lambda = 0, gamma has units of inverse mass.
          // x2 = x1 + h * v2
          // 1-D mass-damper-spring system
          // m (v2 - v1) + h * d * v2 + h * k *
          // C = norm(p2 - p1) - L
          // u = (p2 - p1) / norm(p2 - p1)
          // Cdot = dot(u, v2 + cross(w2, r2) - v1 - cross(w1, r1))
          // J = [-u -cross(r1, u) u cross(r2, u)]
          // K = J * invM * JT
          // = invMass1 + invI1 * cross(r1, u)^2 + invMass2 + invI2 * cross(r2, u)^2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              frequencyHz: this.m_frequencyHz,
              dampingRatio: this.m_dampingRatio,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              length: this.m_length,
              impulse: this.m_impulse,
              gamma: this.m_gamma,
              bias: this.m_bias,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new DistanceJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (def.anchorA) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          else if (def.localAnchorA) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          if (def.anchorB) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          else if (def.localAnchorB) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          if (def.length > 0) {
              this.m_length = +def.length;
          }
          else if (def.length < 0) ;
          else if (def.anchorA || def.anchorA || def.anchorA || def.anchorA) {
              this.m_length = distance(this.m_bodyA.getWorldPoint(this.m_localAnchorA), this.m_bodyB.getWorldPoint(this.m_localAnchorB));
          }
          if (Number.isFinite(def.frequencyHz)) {
              this.m_frequencyHz = def.frequencyHz;
          }
          if (Number.isFinite(def.dampingRatio)) {
              this.m_dampingRatio = def.dampingRatio;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * Set the natural length. Manipulating the length can lead to non-physical
       * behavior when the frequency is zero.
       */
      setLength(length) {
          this.m_length = length;
      }
      /**
       * Get the natural length.
       */
      getLength() {
          return this.m_length;
      }
      setFrequency(hz) {
          this.m_frequencyHz = hz;
      }
      getFrequency() {
          return this.m_frequencyHz;
      }
      setDampingRatio(ratio) {
          this.m_dampingRatio = ratio;
      }
      getDampingRatio() {
          return this.m_dampingRatio;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          const f = mulNumVec2(this.m_impulse, this.m_u);
          return scale$1(f, inv_dt, f);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return 0.0;
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = this.m_bodyA.c_position.c;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const cB = this.m_bodyB.c_position.c;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          this.m_rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          this.m_rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          this.m_u = sub$1(add$1(cB, this.m_rB), add$1(cA, this.m_rA));
          // Handle singularity.
          const length = length$1(this.m_u);
          if (length > SettingsInternal.linearSlop) {
              scale$1(this.m_u, 1.0 / length, this.m_u);
          }
          else {
              set$1(0.0, 0.0, this.m_u);
          }
          const crAu = crossVec2Vec2$1(this.m_rA, this.m_u);
          const crBu = crossVec2Vec2$1(this.m_rB, this.m_u);
          let invMass = this.m_invMassA + this.m_invIA * crAu * crAu + this.m_invMassB + this.m_invIB * crBu * crBu;
          // Compute the effective mass matrix.
          this.m_mass = invMass != 0.0 ? 1.0 / invMass : 0.0;
          if (this.m_frequencyHz > 0.0) {
              const C = length - this.m_length;
              // Frequency
              const omega = 2.0 * math_PI$4 * this.m_frequencyHz;
              // Damping coefficient
              const d = 2.0 * this.m_mass * this.m_dampingRatio * omega;
              // Spring stiffness
              const k = this.m_mass * omega * omega;
              // magic formulas
              const h = step.dt;
              this.m_gamma = h * (d + h * k);
              this.m_gamma = this.m_gamma != 0.0 ? 1.0 / this.m_gamma : 0.0;
              this.m_bias = C * h * k * this.m_gamma;
              invMass += this.m_gamma;
              this.m_mass = invMass != 0.0 ? 1.0 / invMass : 0.0;
          }
          else {
              this.m_gamma = 0.0;
              this.m_bias = 0.0;
          }
          if (step.warmStarting) {
              // Scale the impulse to support a variable time step.
              this.m_impulse *= step.dtRatio;
              const P = mulNumVec2(this.m_impulse, this.m_u);
              subMul(vA, this.m_invMassA, P, vA);
              wA -= this.m_invIA * crossVec2Vec2$1(this.m_rA, P);
              addMul(vB, this.m_invMassB, P, vB);
              wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, P);
          }
          else {
              this.m_impulse = 0.0;
          }
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          // Cdot = dot(u, v + cross(w, r))
          const vpA = add$1(vA, crossNumVec2$1(wA, this.m_rA));
          const vpB = add$1(vB, crossNumVec2$1(wB, this.m_rB));
          const Cdot = dot$1(this.m_u, vpB) - dot$1(this.m_u, vpA);
          const impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
          this.m_impulse += impulse;
          const P = mulNumVec2(impulse, this.m_u);
          subMul(vA, this.m_invMassA, P, vA);
          wA -= this.m_invIA * crossVec2Vec2$1(this.m_rA, P);
          addMul(vB, this.m_invMassB, P, vB);
          wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, P);
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          if (this.m_frequencyHz > 0.0) {
              // There is no position correction for soft distance constraints.
              return true;
          }
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const rA = Rot.mulSub(qA, this.m_localAnchorA, this.m_localCenterA);
          const rB = Rot.mulSub(qB, this.m_localAnchorB, this.m_localCenterB);
          const u = sub$1(add$1(cB, rB), add$1(cA, rA));
          const length = normalize(u, u);
          const C = clamp$2(length - this.m_length, -SettingsInternal.maxLinearCorrection, SettingsInternal.maxLinearCorrection);
          const impulse = -this.m_mass * C;
          const P = mulNumVec2(impulse, u);
          subMul(cA, this.m_invMassA, P, cA);
          aA -= this.m_invIA * crossVec2Vec2$1(rA, P);
          addMul(cB, this.m_invMassB, P, cB);
          aB += this.m_invIB * crossVec2Vec2$1(rB, P);
          copy(cA, this.m_bodyA.c_position.c);
          this.m_bodyA.c_position.a = aA;
          copy(cB, this.m_bodyB.c_position.c);
          this.m_bodyB.c_position.a = aB;
          return math_abs$6(C) < SettingsInternal.linearSlop;
      }
  }
  DistanceJoint.TYPE = 'distance-joint';

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
  /** @internal */ const DEFAULTS$9 = {
      maxForce: 0.0,
      maxTorque: 0.0,
  };
  /**
   * Friction joint. This is used for top-down friction. It provides 2D
   * translational friction and angular friction.
   */
  class FrictionJoint extends Joint {
      constructor(def, bodyA, bodyB, anchor) {
          def = options(def, DEFAULTS$9);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = FrictionJoint.TYPE;
          this.m_localAnchorA = clone$1(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || zero$1());
          this.m_localAnchorB = clone$1(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || zero$1());
          // Solver shared
          this.m_linearImpulse = zero$1();
          this.m_angularImpulse = 0.0;
          this.m_maxForce = def.maxForce;
          this.m_maxTorque = def.maxTorque;
          // Point-to-point constraint
          // Cdot = v2 - v1
          // = v2 + cross(w2, r2) - v1 - cross(w1, r1)
          // J = [-I -r1_skew I r2_skew ]
          // Identity used:
          // w k % (rx i + ry j) = w * (-ry i + rx j)
          // Angle constraint
          // Cdot = w2 - w1
          // J = [0 0 -1 0 0 1]
          // K = invI1 + invI2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              maxForce: this.m_maxForce,
              maxTorque: this.m_maxTorque,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new FrictionJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (def.anchorA) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          else if (def.localAnchorA) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          if (def.anchorB) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          else if (def.localAnchorB) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          if (Number.isFinite(def.maxForce)) {
              this.m_maxForce = def.maxForce;
          }
          if (Number.isFinite(def.maxTorque)) {
              this.m_maxTorque = def.maxTorque;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * Set the maximum friction force in N.
       */
      setMaxForce(force) {
          this.m_maxForce = force;
      }
      /**
       * Get the maximum friction force in N.
       */
      getMaxForce() {
          return this.m_maxForce;
      }
      /**
       * Set the maximum friction torque in N*m.
       */
      setMaxTorque(torque) {
          this.m_maxTorque = torque;
      }
      /**
       * Get the maximum friction torque in N*m.
       */
      getMaxTorque() {
          return this.m_maxTorque;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          return mulNumVec2(inv_dt, this.m_linearImpulse);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * this.m_angularImpulse;
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          // Compute the effective mass matrix.
          this.m_rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          this.m_rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          // J = [-I -r1_skew I r2_skew]
          // [ 0 -1 0 1]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB, -r1y*iA*r1x-r2y*iB*r2x, -r1y*iA-r2y*iB]
          // [ -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB, r1x*iA+r2x*iB]
          // [ -r1y*iA-r2y*iB, r1x*iA+r2x*iB, iA+iB]
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const K = new Mat22();
          K.ex[0] = mA + mB + iA * this.m_rA[1] * this.m_rA[1] + iB * this.m_rB[1]
              * this.m_rB[1];
          K.ex[1] = -iA * this.m_rA[0] * this.m_rA[1] - iB * this.m_rB[0] * this.m_rB[1];
          K.ey[0] = K.ex[1];
          K.ey[1] = mA + mB + iA * this.m_rA[0] * this.m_rA[0] + iB * this.m_rB[0]
              * this.m_rB[0];
          this.m_linearMass = K.getInverse();
          this.m_angularMass = iA + iB;
          if (this.m_angularMass > 0.0) {
              this.m_angularMass = 1.0 / this.m_angularMass;
          }
          if (step.warmStarting) {
              // Scale impulses to support a variable time step.
              scale$1(this.m_linearImpulse, step.dtRatio, this.m_linearImpulse);
              this.m_angularImpulse *= step.dtRatio;
              const P = create$2(this.m_linearImpulse[0], this.m_linearImpulse[1]);
              subMul(vA, mA, P, vA);
              wA -= iA * (crossVec2Vec2$1(this.m_rA, P) + this.m_angularImpulse);
              addMul(vB, mB, P, vB);
              wB += iB * (crossVec2Vec2$1(this.m_rB, P) + this.m_angularImpulse);
          }
          else {
              setZero$1(this.m_linearImpulse);
              this.m_angularImpulse = 0.0;
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const h = step.dt;
          // Solve angular friction
          {
              const Cdot = wB - wA;
              let impulse = -this.m_angularMass * Cdot;
              const oldImpulse = this.m_angularImpulse;
              const maxImpulse = h * this.m_maxTorque;
              this.m_angularImpulse = clamp$2(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_angularImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve linear friction
          {
              const Cdot = sub$1(add$1(vB, crossNumVec2$1(wB, this.m_rB)), add$1(vA, crossNumVec2$1(wA, this.m_rA)));
              let impulse = neg$1(Mat22.mulVec2(this.m_linearMass, Cdot));
              const oldImpulse = this.m_linearImpulse;
              add$1(this.m_linearImpulse, impulse, this.m_linearImpulse);
              const maxImpulse = h * this.m_maxForce;
              if (lengthSquared(this.m_linearImpulse) > maxImpulse * maxImpulse) {
                  normalize(this.m_linearImpulse, this.m_linearImpulse);
                  scale$1(this.m_linearImpulse, maxImpulse, this.m_linearImpulse);
              }
              impulse = sub$1(this.m_linearImpulse, oldImpulse);
              subMul(vA, mA, impulse, vA);
              wA -= iA * crossVec2Vec2$1(this.m_rA, impulse);
              addMul(vB, mB, impulse, vB);
              wB += iB * crossVec2Vec2$1(this.m_rB, impulse);
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          return true;
      }
  }
  FrictionJoint.TYPE = 'friction-joint';

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
  /** @internal */ const math_abs$5 = Math.abs;
  // todo: use string?
  /** @internal */ var LimitState$2;
  (function (LimitState) {
      LimitState[LimitState["inactiveLimit"] = 0] = "inactiveLimit";
      LimitState[LimitState["atLowerLimit"] = 1] = "atLowerLimit";
      LimitState[LimitState["atUpperLimit"] = 2] = "atUpperLimit";
      LimitState[LimitState["equalLimits"] = 3] = "equalLimits";
  })(LimitState$2 || (LimitState$2 = {}));
  /** @internal */ const DEFAULTS$8 = {
      lowerAngle: 0.0,
      upperAngle: 0.0,
      maxMotorTorque: 0.0,
      motorSpeed: 0.0,
      enableLimit: false,
      enableMotor: false
  };
  /**
   * A revolute joint constrains two bodies to share a common point while they are
   * free to rotate about the point. The relative rotation about the shared point
   * is the joint angle. You can limit the relative rotation with a joint limit
   * that specifies a lower and upper angle. You can use a motor to drive the
   * relative rotation about the shared point. A maximum motor torque is provided
   * so that infinite forces are not generated.
   */
  class RevoluteJoint extends Joint {
      constructor(def, bodyA, bodyB, anchor) {
          var _a, _b, _c, _d, _e, _f;
          def = def !== null && def !== void 0 ? def : {};
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_mass = new Mat33();
          this.m_limitState = LimitState$2.inactiveLimit;
          this.m_type = RevoluteJoint.TYPE;
          if (isValid$1(anchor)) {
              this.m_localAnchorA = bodyA.getLocalPoint(anchor);
          }
          else if (isValid$1(def.localAnchorA)) {
              this.m_localAnchorA = clone$1(def.localAnchorA);
          }
          else {
              this.m_localAnchorA = zero$1();
          }
          if (isValid$1(anchor)) {
              this.m_localAnchorB = bodyB.getLocalPoint(anchor);
          }
          else if (isValid$1(def.localAnchorB)) {
              this.m_localAnchorB = clone$1(def.localAnchorB);
          }
          else {
              this.m_localAnchorB = zero$1();
          }
          if (Number.isFinite(def.referenceAngle)) {
              this.m_referenceAngle = def.referenceAngle;
          }
          else {
              this.m_referenceAngle = bodyB.getAngle() - bodyA.getAngle();
          }
          this.m_impulse = create$1();
          this.m_motorImpulse = 0.0;
          this.m_lowerAngle = (_a = def.lowerAngle) !== null && _a !== void 0 ? _a : DEFAULTS$8.lowerAngle;
          this.m_upperAngle = (_b = def.upperAngle) !== null && _b !== void 0 ? _b : DEFAULTS$8.upperAngle;
          this.m_maxMotorTorque = (_c = def.maxMotorTorque) !== null && _c !== void 0 ? _c : DEFAULTS$8.maxMotorTorque;
          this.m_motorSpeed = (_d = def.motorSpeed) !== null && _d !== void 0 ? _d : DEFAULTS$8.motorSpeed;
          this.m_enableLimit = (_e = def.enableLimit) !== null && _e !== void 0 ? _e : DEFAULTS$8.enableLimit;
          this.m_enableMotor = (_f = def.enableMotor) !== null && _f !== void 0 ? _f : DEFAULTS$8.enableMotor;
          // Point-to-point constraint
          // C = p2 - p1
          // Cdot = v2 - v1
          // = v2 + cross(w2, r2) - v1 - cross(w1, r1)
          // J = [-I -r1_skew I r2_skew ]
          // Identity used:
          // w k % (rx i + ry j) = w * (-ry i + rx j)
          // Motor constraint
          // Cdot = w2 - w1
          // J = [0 0 -1 0 0 1]
          // K = invI1 + invI2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              lowerAngle: this.m_lowerAngle,
              upperAngle: this.m_upperAngle,
              maxMotorTorque: this.m_maxMotorTorque,
              motorSpeed: this.m_motorSpeed,
              enableLimit: this.m_enableLimit,
              enableMotor: this.m_enableMotor,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              referenceAngle: this.m_referenceAngle,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new RevoluteJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (def.anchorA) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          else if (def.localAnchorA) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          if (def.anchorB) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          else if (def.localAnchorB) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          if (Number.isFinite(def.referenceAngle)) {
              this.m_referenceAngle = def.referenceAngle;
          }
          if (def.enableLimit !== undefined) {
              this.m_enableLimit = def.enableLimit;
          }
          if (Number.isFinite(def.lowerAngle)) {
              this.m_lowerAngle = def.lowerAngle;
          }
          if (Number.isFinite(def.upperAngle)) {
              this.m_upperAngle = def.upperAngle;
          }
          if (Number.isFinite(def.maxMotorTorque)) {
              this.m_maxMotorTorque = def.maxMotorTorque;
          }
          if (Number.isFinite(def.motorSpeed)) {
              this.m_motorSpeed = def.motorSpeed;
          }
          if (def.enableMotor !== undefined) {
              this.m_enableMotor = def.enableMotor;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * Get the reference angle.
       */
      getReferenceAngle() {
          return this.m_referenceAngle;
      }
      /**
       * Get the current joint angle in radians.
       */
      getJointAngle() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          return bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
      }
      /**
       * Get the current joint angle speed in radians per second.
       */
      getJointSpeed() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          return bB.m_angularVelocity - bA.m_angularVelocity;
      }
      /**
       * Is the joint motor enabled?
       */
      isMotorEnabled() {
          return this.m_enableMotor;
      }
      /**
       * Enable/disable the joint motor.
       */
      enableMotor(flag) {
          if (flag == this.m_enableMotor)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_enableMotor = flag;
      }
      /**
       * Get the current motor torque given the inverse time step. Unit is N*m.
       */
      getMotorTorque(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      /**
       * Set the motor speed in radians per second.
       */
      setMotorSpeed(speed) {
          if (speed == this.m_motorSpeed)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_motorSpeed = speed;
      }
      /**
       * Get the motor speed in radians per second.
       */
      getMotorSpeed() {
          return this.m_motorSpeed;
      }
      /**
       * Set the maximum motor torque, usually in N-m.
       */
      setMaxMotorTorque(torque) {
          if (torque == this.m_maxMotorTorque)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_maxMotorTorque = torque;
      }
      getMaxMotorTorque() {
          return this.m_maxMotorTorque;
      }
      /**
       * Is the joint limit enabled?
       */
      isLimitEnabled() {
          return this.m_enableLimit;
      }
      /**
       * Enable/disable the joint limit.
       */
      enableLimit(flag) {
          if (flag != this.m_enableLimit) {
              this.m_bodyA.setAwake(true);
              this.m_bodyB.setAwake(true);
              this.m_enableLimit = flag;
              this.m_impulse[2] = 0.0;
          }
      }
      /**
       * Get the lower joint limit in radians.
       */
      getLowerLimit() {
          return this.m_lowerAngle;
      }
      /**
       * Get the upper joint limit in radians.
       */
      getUpperLimit() {
          return this.m_upperAngle;
      }
      /**
       * Set the joint limits in radians.
       */
      setLimits(lower, upper) {
          if (lower != this.m_lowerAngle || upper != this.m_upperAngle) {
              this.m_bodyA.setAwake(true);
              this.m_bodyB.setAwake(true);
              this.m_impulse[2] = 0.0;
              this.m_lowerAngle = lower;
              this.m_upperAngle = upper;
          }
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force given the inverse time step. Unit is N.
       */
      getReactionForce(inv_dt) {
          return create$2(this.m_impulse[0] * inv_dt, this.m_impulse[1] * inv_dt);
      }
      /**
       * Get the reaction torque due to the joint limit given the inverse time step.
       * Unit is N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * this.m_impulse[2];
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          this.m_rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          this.m_rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          // J = [-I -r1_skew I r2_skew]
          // [ 0 -1 0 1]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB, -r1y*iA*r1x-r2y*iB*r2x, -r1y*iA-r2y*iB]
          // [ -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB, r1x*iA+r2x*iB]
          // [ -r1y*iA-r2y*iB, r1x*iA+r2x*iB, iA+iB]
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const fixedRotation = (iA + iB === 0.0);
          this.m_mass.ex[0] = mA + mB + this.m_rA[1] * this.m_rA[1] * iA + this.m_rB[1] * this.m_rB[1] * iB;
          this.m_mass.ey[0] = -this.m_rA[1] * this.m_rA[0] * iA - this.m_rB[1] * this.m_rB[0] * iB;
          this.m_mass.ez[0] = -this.m_rA[1] * iA - this.m_rB[1] * iB;
          this.m_mass.ex[1] = this.m_mass.ey[0];
          this.m_mass.ey[1] = mA + mB + this.m_rA[0] * this.m_rA[0] * iA + this.m_rB[0] * this.m_rB[0] * iB;
          this.m_mass.ez[1] = this.m_rA[0] * iA + this.m_rB[0] * iB;
          this.m_mass.ex[2] = this.m_mass.ez[0];
          this.m_mass.ey[2] = this.m_mass.ez[1];
          this.m_mass.ez[2] = iA + iB;
          this.m_motorMass = iA + iB;
          if (this.m_motorMass > 0.0) {
              this.m_motorMass = 1.0 / this.m_motorMass;
          }
          if (this.m_enableMotor == false || fixedRotation) {
              this.m_motorImpulse = 0.0;
          }
          if (this.m_enableLimit && fixedRotation == false) {
              const jointAngle = aB - aA - this.m_referenceAngle;
              if (math_abs$5(this.m_upperAngle - this.m_lowerAngle) < 2.0 * SettingsInternal.angularSlop) {
                  this.m_limitState = LimitState$2.equalLimits;
              }
              else if (jointAngle <= this.m_lowerAngle) {
                  if (this.m_limitState != LimitState$2.atLowerLimit) {
                      this.m_impulse[2] = 0.0;
                  }
                  this.m_limitState = LimitState$2.atLowerLimit;
              }
              else if (jointAngle >= this.m_upperAngle) {
                  if (this.m_limitState != LimitState$2.atUpperLimit) {
                      this.m_impulse[2] = 0.0;
                  }
                  this.m_limitState = LimitState$2.atUpperLimit;
              }
              else {
                  this.m_limitState = LimitState$2.inactiveLimit;
                  this.m_impulse[2] = 0.0;
              }
          }
          else {
              this.m_limitState = LimitState$2.inactiveLimit;
          }
          if (step.warmStarting) {
              // Scale impulses to support a variable time step.
              set(this.m_impulse[0] * step.dtRatio, this.m_impulse[1] * step.dtRatio, this.m_impulse[2], this.m_impulse);
              this.m_motorImpulse *= step.dtRatio;
              const P = create$2(this.m_impulse[0], this.m_impulse[1]);
              subMul(vA, mA, P, vA);
              wA -= iA * (crossVec2Vec2$1(this.m_rA, P) + this.m_motorImpulse + this.m_impulse[2]);
              addMul(vB, mB, P, vB);
              wB += iB * (crossVec2Vec2$1(this.m_rB, P) + this.m_motorImpulse + this.m_impulse[2]);
          }
          else {
              setZero(this.m_impulse);
              this.m_motorImpulse = 0.0;
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const fixedRotation = (iA + iB === 0.0);
          // Solve motor constraint.
          if (this.m_enableMotor && this.m_limitState != LimitState$2.equalLimits && fixedRotation == false) {
              const Cdot = wB - wA - this.m_motorSpeed;
              let impulse = -this.m_motorMass * Cdot;
              const oldImpulse = this.m_motorImpulse;
              const maxImpulse = step.dt * this.m_maxMotorTorque;
              this.m_motorImpulse = clamp$2(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_motorImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve limit constraint.
          if (this.m_enableLimit && this.m_limitState != LimitState$2.inactiveLimit && fixedRotation == false) {
              const Cdot1 = zero$1();
              addCombine(Cdot1, 1, vB, 1, crossNumVec2$1(wB, this.m_rB), Cdot1);
              subCombine(Cdot1, 1, vA, 1, crossNumVec2$1(wA, this.m_rA), Cdot1);
              const Cdot2 = wB - wA;
              const Cdot = create$1(Cdot1[0], Cdot1[1], Cdot2);
              const impulse = neg(this.m_mass.solve33(Cdot));
              if (this.m_limitState == LimitState$2.equalLimits) {
                  add(this.m_impulse, impulse, this.m_impulse);
              }
              else if (this.m_limitState == LimitState$2.atLowerLimit) {
                  const newImpulse = this.m_impulse[2] + impulse[2];
                  if (newImpulse < 0.0) {
                      const rhs = combine(-1, Cdot1, this.m_impulse[2], create$2(this.m_mass.ez[0], this.m_mass.ez[1]));
                      const reduced = this.m_mass.solve22(rhs);
                      impulse[0] = reduced[0];
                      impulse[1] = reduced[1];
                      impulse[2] = -this.m_impulse[2];
                      this.m_impulse[0] += reduced[0];
                      this.m_impulse[1] += reduced[1];
                      this.m_impulse[2] = 0.0;
                  }
                  else {
                      add(this.m_impulse, impulse, this.m_impulse);
                  }
              }
              else if (this.m_limitState == LimitState$2.atUpperLimit) {
                  const newImpulse = this.m_impulse[2] + impulse[2];
                  if (newImpulse > 0.0) {
                      const rhs = combine(-1, Cdot1, this.m_impulse[2], create$2(this.m_mass.ez[0], this.m_mass.ez[1]));
                      const reduced = this.m_mass.solve22(rhs);
                      impulse[0] = reduced[0];
                      impulse[1] = reduced[1];
                      impulse[2] = -this.m_impulse[2];
                      this.m_impulse[0] += reduced[0];
                      this.m_impulse[1] += reduced[1];
                      this.m_impulse[2] = 0.0;
                  }
                  else {
                      add(this.m_impulse, impulse, this.m_impulse);
                  }
              }
              const P = create$2(impulse[0], impulse[1]);
              subMul(vA, mA, P, vA);
              wA -= iA * (crossVec2Vec2$1(this.m_rA, P) + impulse[2]);
              addMul(vB, mB, P, vB);
              wB += iB * (crossVec2Vec2$1(this.m_rB, P) + impulse[2]);
          }
          else {
              // Solve point-to-point constraint
              const Cdot = zero$1();
              addCombine(Cdot, 1, vB, 1, crossNumVec2$1(wB, this.m_rB), Cdot);
              subCombine(Cdot, 1, vA, 1, crossNumVec2$1(wA, this.m_rA), Cdot);
              const impulse = this.m_mass.solve22(neg$1(Cdot));
              this.m_impulse[0] += impulse[0];
              this.m_impulse[1] += impulse[1];
              subMul(vA, mA, impulse, vA);
              wA -= iA * crossVec2Vec2$1(this.m_rA, impulse);
              addMul(vB, mB, impulse, vB);
              wB += iB * crossVec2Vec2$1(this.m_rB, impulse);
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          let angularError = 0.0;
          let positionError = 0.0;
          const fixedRotation = (this.m_invIA + this.m_invIB == 0.0);
          // Solve angular limit constraint.
          if (this.m_enableLimit && this.m_limitState != LimitState$2.inactiveLimit && fixedRotation == false) {
              const angle = aB - aA - this.m_referenceAngle;
              let limitImpulse = 0.0;
              if (this.m_limitState == LimitState$2.equalLimits) {
                  // Prevent large angular corrections
                  const C = clamp$2(angle - this.m_lowerAngle, -SettingsInternal.maxAngularCorrection, SettingsInternal.maxAngularCorrection);
                  limitImpulse = -this.m_motorMass * C;
                  angularError = math_abs$5(C);
              }
              else if (this.m_limitState == LimitState$2.atLowerLimit) {
                  let C = angle - this.m_lowerAngle;
                  angularError = -C;
                  // Prevent large angular corrections and allow some slop.
                  C = clamp$2(C + SettingsInternal.angularSlop, -SettingsInternal.maxAngularCorrection, 0.0);
                  limitImpulse = -this.m_motorMass * C;
              }
              else if (this.m_limitState == LimitState$2.atUpperLimit) {
                  let C = angle - this.m_upperAngle;
                  angularError = C;
                  // Prevent large angular corrections and allow some slop.
                  C = clamp$2(C - SettingsInternal.angularSlop, 0.0, SettingsInternal.maxAngularCorrection);
                  limitImpulse = -this.m_motorMass * C;
              }
              aA -= this.m_invIA * limitImpulse;
              aB += this.m_invIB * limitImpulse;
          }
          // Solve point-to-point constraint.
          {
              qA.setAngle(aA);
              qB.setAngle(aB);
              const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
              const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
              const C = zero$1();
              addCombine(C, 1, cB, 1, rB, C);
              subCombine(C, 1, cA, 1, rA, C);
              positionError = length$1(C);
              const mA = this.m_invMassA;
              const mB = this.m_invMassB;
              const iA = this.m_invIA;
              const iB = this.m_invIB;
              const K = new Mat22();
              K.ex[0] = mA + mB + iA * rA[1] * rA[1] + iB * rB[1] * rB[1];
              K.ex[1] = -iA * rA[0] * rA[1] - iB * rB[0] * rB[1];
              K.ey[0] = K.ex[1];
              K.ey[1] = mA + mB + iA * rA[0] * rA[0] + iB * rB[0] * rB[0];
              const impulse = neg$1(K.solve(C));
              subMul(cA, mA, impulse, cA);
              aA -= iA * crossVec2Vec2$1(rA, impulse);
              addMul(cB, mB, impulse, cB);
              aB += iB * crossVec2Vec2$1(rB, impulse);
          }
          copy(cA, this.m_bodyA.c_position.c);
          this.m_bodyA.c_position.a = aA;
          copy(cB, this.m_bodyB.c_position.c);
          this.m_bodyB.c_position.a = aB;
          return positionError <= SettingsInternal.linearSlop && angularError <= SettingsInternal.angularSlop;
      }
  }
  RevoluteJoint.TYPE = 'revolute-joint';

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
  /** @internal */ const math_abs$4 = Math.abs;
  /** @internal */ const math_max$1 = Math.max;
  /** @internal */ const math_min$2 = Math.min;
  /** @internal */ var LimitState$1;
  (function (LimitState) {
      LimitState[LimitState["inactiveLimit"] = 0] = "inactiveLimit";
      LimitState[LimitState["atLowerLimit"] = 1] = "atLowerLimit";
      LimitState[LimitState["atUpperLimit"] = 2] = "atUpperLimit";
      LimitState[LimitState["equalLimits"] = 3] = "equalLimits";
  })(LimitState$1 || (LimitState$1 = {}));
  /** @internal */ const DEFAULTS$7 = {
      enableLimit: false,
      lowerTranslation: 0.0,
      upperTranslation: 0.0,
      enableMotor: false,
      maxMotorForce: 0.0,
      motorSpeed: 0.0
  };
  /**
   * A prismatic joint. This joint provides one degree of freedom: translation
   * along an axis fixed in bodyA. Relative rotation is prevented. You can use a
   * joint limit to restrict the range of motion and a joint motor to drive the
   * motion or to model joint friction.
   */
  class PrismaticJoint extends Joint {
      constructor(def, bodyA, bodyB, anchor, axis) {
          def = options(def, DEFAULTS$7);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = PrismaticJoint.TYPE;
          this.m_localAnchorA = clone$1(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || zero$1());
          this.m_localAnchorB = clone$1(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || zero$1());
          this.m_localXAxisA = clone$1(axis ? bodyA.getLocalVector(axis) : def.localAxisA || create$2(1.0, 0.0));
          normalize(this.m_localXAxisA, this.m_localXAxisA);
          this.m_localYAxisA = crossNumVec2$1(1.0, this.m_localXAxisA);
          this.m_referenceAngle = Number.isFinite(def.referenceAngle) ? def.referenceAngle : bodyB.getAngle() - bodyA.getAngle();
          this.m_impulse = create$1();
          this.m_motorMass = 0.0;
          this.m_motorImpulse = 0.0;
          this.m_lowerTranslation = def.lowerTranslation;
          this.m_upperTranslation = def.upperTranslation;
          this.m_maxMotorForce = def.maxMotorForce;
          this.m_motorSpeed = def.motorSpeed;
          this.m_enableLimit = def.enableLimit;
          this.m_enableMotor = def.enableMotor;
          this.m_limitState = LimitState$1.inactiveLimit;
          this.m_axis = zero$1();
          this.m_perp = zero$1();
          this.m_K = new Mat33();
          // Linear constraint (point-to-line)
          // d = p2 - p1 = x2 + r2 - x1 - r1
          // C = dot(perp, d)
          // Cdot = dot(d, cross(w1, perp)) + dot(perp, v2 + cross(w2, r2) - v1 -
          // cross(w1, r1))
          // = -dot(perp, v1) - dot(cross(d + r1, perp), w1) + dot(perp, v2) +
          // dot(cross(r2, perp), v2)
          // J = [-perp, -cross(d + r1, perp), perp, cross(r2,perp)]
          //
          // Angular constraint
          // C = a2 - a1 + a_initial
          // Cdot = w2 - w1
          // J = [0 0 -1 0 0 1]
          //
          // K = J * invM * JT
          //
          // J = [-a -s1 a s2]
          // [0 -1 0 1]
          // a = perp
          // s1 = cross(d + r1, a) = cross(p2 - x1, a)
          // s2 = cross(r2, a) = cross(p2 - x2, a)
          // Motor/Limit linear constraint
          // C = dot(ax1, d)
          // Cdot = = -dot(ax1, v1) - dot(cross(d + r1, ax1), w1) + dot(ax1, v2) +
          // dot(cross(r2, ax1), v2)
          // J = [-ax1 -cross(d+r1,ax1) ax1 cross(r2,ax1)]
          // Block Solver
          // We develop a block solver that includes the joint limit. This makes the
          // limit stiff (inelastic) even
          // when the mass has poor distribution (leading to large torques about the
          // joint anchor points).
          //
          // The Jacobian has 3 rows:
          // J = [-uT -s1 uT s2] // linear
          // [0 -1 0 1] // angular
          // [-vT -a1 vT a2] // limit
          //
          // u = perp
          // v = axis
          // s1 = cross(d + r1, u), s2 = cross(r2, u)
          // a1 = cross(d + r1, v), a2 = cross(r2, v)
          // M * (v2 - v1) = JT * df
          // J * v2 = bias
          //
          // v2 = v1 + invM * JT * df
          // J * (v1 + invM * JT * df) = bias
          // K * df = bias - J * v1 = -Cdot
          // K = J * invM * JT
          // Cdot = J * v1 - bias
          //
          // Now solve for f2.
          // df = f2 - f1
          // K * (f2 - f1) = -Cdot
          // f2 = invK * (-Cdot) + f1
          //
          // Clamp accumulated limit impulse.
          // lower: f2(3) = max(f2(3), 0)
          // upper: f2(3) = min(f2(3), 0)
          //
          // Solve for correct f2(1:2)
          // K(1:2, 1:2) * f2(1:2) = -Cdot(1:2) - K(1:2,3) * f2(3) + K(1:2,1:3) * f1
          // = -Cdot(1:2) - K(1:2,3) * f2(3) + K(1:2,1:2) * f1(1:2) + K(1:2,3) * f1(3)
          // K(1:2, 1:2) * f2(1:2) = -Cdot(1:2) - K(1:2,3) * (f2(3) - f1(3)) +
          // K(1:2,1:2) * f1(1:2)
          // f2(1:2) = invK(1:2,1:2) * (-Cdot(1:2) - K(1:2,3) * (f2(3) - f1(3))) +
          // f1(1:2)
          //
          // Now compute impulse to be applied:
          // df = f2 - f1
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              lowerTranslation: this.m_lowerTranslation,
              upperTranslation: this.m_upperTranslation,
              maxMotorForce: this.m_maxMotorForce,
              motorSpeed: this.m_motorSpeed,
              enableLimit: this.m_enableLimit,
              enableMotor: this.m_enableMotor,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              localAxisA: this.m_localXAxisA,
              referenceAngle: this.m_referenceAngle,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          data.localAxisA = clone$1(data.localAxisA);
          const joint = new PrismaticJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (def.anchorA) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          else if (def.localAnchorA) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          if (def.anchorB) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          else if (def.localAnchorB) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          if (def.localAxisA) {
              copy(def.localAxisA, this.m_localXAxisA);
              copy(crossNumVec2$1(1.0, def.localAxisA), this.m_localYAxisA);
          }
          if (Number.isFinite(def.referenceAngle)) {
              this.m_referenceAngle = def.referenceAngle;
          }
          if (typeof def.enableLimit !== 'undefined') {
              this.m_enableLimit = !!def.enableLimit;
          }
          if (Number.isFinite(def.lowerTranslation)) {
              this.m_lowerTranslation = def.lowerTranslation;
          }
          if (Number.isFinite(def.upperTranslation)) {
              this.m_upperTranslation = def.upperTranslation;
          }
          if (typeof def.enableMotor !== 'undefined') {
              this.m_enableMotor = !!def.enableMotor;
          }
          if (Number.isFinite(def.maxMotorForce)) {
              this.m_maxMotorForce = def.maxMotorForce;
          }
          if (Number.isFinite(def.motorSpeed)) {
              this.m_motorSpeed = def.motorSpeed;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * The local joint axis relative to bodyA.
       */
      getLocalAxisA() {
          return this.m_localXAxisA;
      }
      /**
       * Get the reference angle.
       */
      getReferenceAngle() {
          return this.m_referenceAngle;
      }
      /**
       * Get the current joint translation, usually in meters.
       */
      getJointTranslation() {
          const pA = this.m_bodyA.getWorldPoint(this.m_localAnchorA);
          const pB = this.m_bodyB.getWorldPoint(this.m_localAnchorB);
          const d = sub$1(pB, pA);
          const axis = this.m_bodyA.getWorldVector(this.m_localXAxisA);
          const translation = dot$1(d, axis);
          return translation;
      }
      /**
       * Get the current joint translation speed, usually in meters per second.
       */
      getJointSpeed() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          const rA = Rot.mulVec2(bA.m_xf.q, sub$1(this.m_localAnchorA, bA.m_sweep.localCenter));
          const rB = Rot.mulVec2(bB.m_xf.q, sub$1(this.m_localAnchorB, bB.m_sweep.localCenter));
          const p1 = add$1(bA.m_sweep.c, rA);
          const p2 = add$1(bB.m_sweep.c, rB);
          const d = sub$1(p2, p1);
          const axis = Rot.mulVec2(bA.m_xf.q, this.m_localXAxisA);
          const vA = bA.m_linearVelocity;
          const vB = bB.m_linearVelocity;
          const wA = bA.m_angularVelocity;
          const wB = bB.m_angularVelocity;
          const speed = dot$1(d, crossNumVec2$1(wA, axis)) + dot$1(axis, sub$1(addCrossNumVec2(vB, wB, rB), addCrossNumVec2(vA, wA, rA)));
          return speed;
      }
      /**
       * Is the joint limit enabled?
       */
      isLimitEnabled() {
          return this.m_enableLimit;
      }
      /**
       * Enable/disable the joint limit.
       */
      enableLimit(flag) {
          if (flag != this.m_enableLimit) {
              this.m_bodyA.setAwake(true);
              this.m_bodyB.setAwake(true);
              this.m_enableLimit = flag;
              this.m_impulse[2] = 0.0;
          }
      }
      /**
       * Get the lower joint limit, usually in meters.
       */
      getLowerLimit() {
          return this.m_lowerTranslation;
      }
      /**
       * Get the upper joint limit, usually in meters.
       */
      getUpperLimit() {
          return this.m_upperTranslation;
      }
      /**
       * Set the joint limits, usually in meters.
       */
      setLimits(lower, upper) {
          if (lower != this.m_lowerTranslation || upper != this.m_upperTranslation) {
              this.m_bodyA.setAwake(true);
              this.m_bodyB.setAwake(true);
              this.m_lowerTranslation = lower;
              this.m_upperTranslation = upper;
              this.m_impulse[2] = 0.0;
          }
      }
      /**
       * Is the joint motor enabled?
       */
      isMotorEnabled() {
          return this.m_enableMotor;
      }
      /**
       * Enable/disable the joint motor.
       */
      enableMotor(flag) {
          if (flag == this.m_enableMotor)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_enableMotor = flag;
      }
      /**
       * Set the motor speed, usually in meters per second.
       */
      setMotorSpeed(speed) {
          if (speed == this.m_motorSpeed)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_motorSpeed = speed;
      }
      /**
       * Set the maximum motor force, usually in N.
       */
      setMaxMotorForce(force) {
          if (force == this.m_maxMotorForce)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_maxMotorForce = force;
      }
      getMaxMotorForce() {
          return this.m_maxMotorForce;
      }
      /**
       * Get the motor speed, usually in meters per second.
       */
      getMotorSpeed() {
          return this.m_motorSpeed;
      }
      /**
       * Get the current motor force given the inverse time step, usually in N.
       */
      getMotorForce(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          const f = combine(this.m_impulse[0], this.m_perp, this.m_motorImpulse + this.m_impulse[2], this.m_axis);
          return scale$1(f, inv_dt, f);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * this.m_impulse[1];
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = this.m_bodyA.c_position.c;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const cB = this.m_bodyB.c_position.c;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          // Compute the effective masses.
          const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          const d = zero$1();
          addCombine(d, 1, cB, 1, rB, d);
          subCombine(d, 1, cA, 1, rA, d);
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          // Compute motor Jacobian and effective mass.
          {
              this.m_axis = Rot.mulVec2(qA, this.m_localXAxisA);
              this.m_a1 = crossVec2Vec2$1(add$1(d, rA), this.m_axis);
              this.m_a2 = crossVec2Vec2$1(rB, this.m_axis);
              this.m_motorMass = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2
                  * this.m_a2;
              if (this.m_motorMass > 0.0) {
                  this.m_motorMass = 1.0 / this.m_motorMass;
              }
          }
          // Prismatic constraint.
          {
              this.m_perp = Rot.mulVec2(qA, this.m_localYAxisA);
              this.m_s1 = crossVec2Vec2$1(add$1(d, rA), this.m_perp);
              this.m_s2 = crossVec2Vec2$1(rB, this.m_perp);
              crossVec2Vec2$1(rA, this.m_perp);
              const k11 = mA + mB + iA * this.m_s1 * this.m_s1 + iB * this.m_s2 * this.m_s2;
              const k12 = iA * this.m_s1 + iB * this.m_s2;
              const k13 = iA * this.m_s1 * this.m_a1 + iB * this.m_s2 * this.m_a2;
              let k22 = iA + iB;
              if (k22 == 0.0) {
                  // For bodies with fixed rotation.
                  k22 = 1.0;
              }
              const k23 = iA * this.m_a1 + iB * this.m_a2;
              const k33 = mA + mB + iA * this.m_a1 * this.m_a1 + iB * this.m_a2 * this.m_a2;
              set(k11, k12, k13, this.m_K.ex);
              set(k12, k22, k23, this.m_K.ey);
              set(k13, k23, k33, this.m_K.ez);
          }
          // Compute motor and limit terms.
          if (this.m_enableLimit) {
              const jointTranslation = dot$1(this.m_axis, d);
              if (math_abs$4(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * SettingsInternal.linearSlop) {
                  this.m_limitState = LimitState$1.equalLimits;
              }
              else if (jointTranslation <= this.m_lowerTranslation) {
                  if (this.m_limitState != LimitState$1.atLowerLimit) {
                      this.m_limitState = LimitState$1.atLowerLimit;
                      this.m_impulse[2] = 0.0;
                  }
              }
              else if (jointTranslation >= this.m_upperTranslation) {
                  if (this.m_limitState != LimitState$1.atUpperLimit) {
                      this.m_limitState = LimitState$1.atUpperLimit;
                      this.m_impulse[2] = 0.0;
                  }
              }
              else {
                  this.m_limitState = LimitState$1.inactiveLimit;
                  this.m_impulse[2] = 0.0;
              }
          }
          else {
              this.m_limitState = LimitState$1.inactiveLimit;
              this.m_impulse[2] = 0.0;
          }
          if (this.m_enableMotor == false) {
              this.m_motorImpulse = 0.0;
          }
          if (step.warmStarting) {
              // Account for variable time step.
              set(this.m_impulse[0] * step.dtRatio, this.m_impulse[1] * step.dtRatio, this.m_impulse[2], this.m_impulse);
              this.m_motorImpulse *= step.dtRatio;
              const P = combine(this.m_impulse[0], this.m_perp, this.m_motorImpulse
                  + this.m_impulse[2], this.m_axis);
              const LA = this.m_impulse[0] * this.m_s1 + this.m_impulse[1]
                  + (this.m_motorImpulse + this.m_impulse[2]) * this.m_a1;
              const LB = this.m_impulse[0] * this.m_s2 + this.m_impulse[1]
                  + (this.m_motorImpulse + this.m_impulse[2]) * this.m_a2;
              subMul(vA, mA, P, vA);
              wA -= iA * LA;
              addMul(vB, mB, P, vB);
              wB += iB * LB;
          }
          else {
              setZero(this.m_impulse);
              this.m_motorImpulse = 0.0;
          }
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          // Solve linear motor constraint.
          if (this.m_enableMotor && this.m_limitState != LimitState$1.equalLimits) {
              const Cdot = dot$1(this.m_axis, sub$1(vB, vA)) + this.m_a2 * wB
                  - this.m_a1 * wA;
              let impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
              const oldImpulse = this.m_motorImpulse;
              const maxImpulse = step.dt * this.m_maxMotorForce;
              this.m_motorImpulse = clamp$2(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_motorImpulse - oldImpulse;
              const P = mulNumVec2(impulse, this.m_axis);
              const LA = impulse * this.m_a1;
              const LB = impulse * this.m_a2;
              subMul(vA, mA, P, vA);
              wA -= iA * LA;
              addMul(vB, mB, P, vB);
              wB += iB * LB;
          }
          const Cdot1 = zero$1();
          Cdot1[0] += dot$1(this.m_perp, vB) + this.m_s2 * wB;
          Cdot1[0] -= dot$1(this.m_perp, vA) + this.m_s1 * wA;
          Cdot1[1] = wB - wA;
          if (this.m_enableLimit && this.m_limitState != LimitState$1.inactiveLimit) {
              // Solve prismatic and limit constraint in block form.
              let Cdot2 = 0;
              Cdot2 += dot$1(this.m_axis, vB) + this.m_a2 * wB;
              Cdot2 -= dot$1(this.m_axis, vA) + this.m_a1 * wA;
              const Cdot = create$1(Cdot1[0], Cdot1[1], Cdot2);
              const f1 = clone(this.m_impulse);
              let df = this.m_K.solve33(neg(Cdot));
              add(this.m_impulse, df, this.m_impulse);
              if (this.m_limitState == LimitState$1.atLowerLimit) {
                  this.m_impulse[2] = math_max$1(this.m_impulse[2], 0.0);
              }
              else if (this.m_limitState == LimitState$1.atUpperLimit) {
                  this.m_impulse[2] = math_min$2(this.m_impulse[2], 0.0);
              }
              // f2(1:2) = invK(1:2,1:2) * (-Cdot(1:2) - K(1:2,3) * (f2(3) - f1(3))) +
              // f1(1:2)
              const b = combine(-1, Cdot1, -(this.m_impulse[2] - f1[2]), create$2(this.m_K.ez[0], this.m_K.ez[1]));
              const f2r = add$1(this.m_K.solve22(b), create$2(f1[0], f1[1]));
              this.m_impulse[0] = f2r[0];
              this.m_impulse[1] = f2r[1];
              df = sub(this.m_impulse, f1);
              const P = combine(df[0], this.m_perp, df[2], this.m_axis);
              const LA = df[0] * this.m_s1 + df[1] + df[2] * this.m_a1;
              const LB = df[0] * this.m_s2 + df[1] + df[2] * this.m_a2;
              subMul(vA, mA, P, vA);
              wA -= iA * LA;
              addMul(vB, mB, P, vB);
              wB += iB * LB;
          }
          else {
              // Limit is inactive, just solve the prismatic constraint in block form.
              const df = this.m_K.solve22(neg$1(Cdot1));
              this.m_impulse[0] += df[0];
              this.m_impulse[1] += df[1];
              const P = mulNumVec2(df[0], this.m_perp);
              const LA = df[0] * this.m_s1 + df[1];
              const LB = df[0] * this.m_s2 + df[1];
              subMul(vA, mA, P, vA);
              wA -= iA * LA;
              addMul(vB, mB, P, vB);
              wB += iB * LB;
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          // Compute fresh Jacobians
          const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          const d = sub$1(add$1(cB, rB), add$1(cA, rA));
          const axis = Rot.mulVec2(qA, this.m_localXAxisA);
          const a1 = crossVec2Vec2$1(add$1(d, rA), axis);
          const a2 = crossVec2Vec2$1(rB, axis);
          const perp = Rot.mulVec2(qA, this.m_localYAxisA);
          const s1 = crossVec2Vec2$1(add$1(d, rA), perp);
          const s2 = crossVec2Vec2$1(rB, perp);
          let impulse = create$1();
          const C1 = zero$1();
          C1[0] = dot$1(perp, d);
          C1[1] = aB - aA - this.m_referenceAngle;
          let linearError = math_abs$4(C1[0]);
          const angularError = math_abs$4(C1[1]);
          const linearSlop = SettingsInternal.linearSlop;
          const maxLinearCorrection = SettingsInternal.maxLinearCorrection;
          let active = false; // bool
          let C2 = 0.0;
          if (this.m_enableLimit) {
              const translation = dot$1(axis, d);
              if (math_abs$4(this.m_upperTranslation - this.m_lowerTranslation) < 2.0 * linearSlop) {
                  // Prevent large angular corrections
                  C2 = clamp$2(translation, -maxLinearCorrection, maxLinearCorrection);
                  linearError = math_max$1(linearError, math_abs$4(translation));
                  active = true;
              }
              else if (translation <= this.m_lowerTranslation) {
                  // Prevent large linear corrections and allow some slop.
                  C2 = clamp$2(translation - this.m_lowerTranslation + linearSlop, -maxLinearCorrection, 0.0);
                  linearError = Math
                      .max(linearError, this.m_lowerTranslation - translation);
                  active = true;
              }
              else if (translation >= this.m_upperTranslation) {
                  // Prevent large linear corrections and allow some slop.
                  C2 = clamp$2(translation - this.m_upperTranslation - linearSlop, 0.0, maxLinearCorrection);
                  linearError = Math
                      .max(linearError, translation - this.m_upperTranslation);
                  active = true;
              }
          }
          if (active) {
              const k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
              const k12 = iA * s1 + iB * s2;
              const k13 = iA * s1 * a1 + iB * s2 * a2;
              let k22 = iA + iB;
              if (k22 == 0.0) {
                  // For fixed rotation
                  k22 = 1.0;
              }
              const k23 = iA * a1 + iB * a2;
              const k33 = mA + mB + iA * a1 * a1 + iB * a2 * a2;
              const K = new Mat33();
              set(k11, k12, k13, K.ex);
              set(k12, k22, k23, K.ey);
              set(k13, k23, k33, K.ez);
              const C = create$1();
              C[0] = C1[0];
              C[1] = C1[1];
              C[2] = C2;
              impulse = K.solve33(neg(C));
          }
          else {
              const k11 = mA + mB + iA * s1 * s1 + iB * s2 * s2;
              const k12 = iA * s1 + iB * s2;
              let k22 = iA + iB;
              if (k22 == 0.0) {
                  k22 = 1.0;
              }
              const K = new Mat22();
              set$1(k11, k12, K.ex);
              set$1(k12, k22, K.ey);
              const impulse1 = K.solve(neg$1(C1));
              impulse[0] = impulse1[0];
              impulse[1] = impulse1[1];
              impulse[2] = 0.0;
          }
          const P = combine(impulse[0], perp, impulse[2], axis);
          const LA = impulse[0] * s1 + impulse[1] + impulse[2] * a1;
          const LB = impulse[0] * s2 + impulse[1] + impulse[2] * a2;
          subMul(cA, mA, P, cA);
          aA -= iA * LA;
          addMul(cB, mB, P, cB);
          aB += iB * LB;
          this.m_bodyA.c_position.c = cA;
          this.m_bodyA.c_position.a = aA;
          this.m_bodyB.c_position.c = cB;
          this.m_bodyB.c_position.a = aB;
          return linearError <= SettingsInternal.linearSlop
              && angularError <= SettingsInternal.angularSlop;
      }
  }
  PrismaticJoint.TYPE = 'prismatic-joint';

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
  /** @internal */ const DEFAULTS$6 = {
      ratio: 1.0
  };
  /**
   * A gear joint is used to connect two joints together. Either joint can be a
   * revolute or prismatic joint. You specify a gear ratio to bind the motions
   * together: coordinate1 + ratio * coordinate2 = constant
   *
   * The ratio can be negative or positive. If one joint is a revolute joint and
   * the other joint is a prismatic joint, then the ratio will have units of
   * length or units of 1/length. Warning: You have to manually destroy the gear
   * joint if joint1 or joint2 is destroyed.
   *
   * This definition requires two existing revolute or prismatic joints (any
   * combination will work).
   */
  class GearJoint extends Joint {
      constructor(def, bodyA, bodyB, joint1, joint2, ratio) {
          def = options(def, DEFAULTS$6);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = GearJoint.TYPE;
          this.m_joint1 = joint1 ? joint1 : def.joint1;
          this.m_joint2 = joint2 ? joint2 : def.joint2;
          this.m_ratio = Number.isFinite(ratio) ? ratio : def.ratio;
          this.m_type1 = this.m_joint1.getType();
          this.m_type2 = this.m_joint2.getType();
          // joint1 connects body A to body C
          // joint2 connects body B to body D
          let coordinateA;
          let coordinateB;
          // TODO_ERIN there might be some problem with the joint edges in Joint.
          this.m_bodyC = this.m_joint1.getBodyA();
          this.m_bodyA = this.m_joint1.getBodyB();
          // Get geometry of joint1
          const xfA = this.m_bodyA.m_xf;
          const aA = this.m_bodyA.m_sweep.a;
          const xfC = this.m_bodyC.m_xf;
          const aC = this.m_bodyC.m_sweep.a;
          if (this.m_type1 === RevoluteJoint.TYPE) {
              const revolute = this.m_joint1;
              this.m_localAnchorC = revolute.m_localAnchorA;
              this.m_localAnchorA = revolute.m_localAnchorB;
              this.m_referenceAngleA = revolute.m_referenceAngle;
              this.m_localAxisC = zero$1();
              coordinateA = aA - aC - this.m_referenceAngleA;
          }
          else {
              const prismatic = this.m_joint1;
              this.m_localAnchorC = prismatic.m_localAnchorA;
              this.m_localAnchorA = prismatic.m_localAnchorB;
              this.m_referenceAngleA = prismatic.m_referenceAngle;
              this.m_localAxisC = prismatic.m_localXAxisA;
              const pC = this.m_localAnchorC;
              const pA = Rot.mulTVec2(xfC.q, add$1(Rot.mulVec2(xfA.q, this.m_localAnchorA), sub$1(xfA.p, xfC.p)));
              coordinateA = dot$1(pA, this.m_localAxisC) - dot$1(pC, this.m_localAxisC);
          }
          this.m_bodyD = this.m_joint2.getBodyA();
          this.m_bodyB = this.m_joint2.getBodyB();
          // Get geometry of joint2
          const xfB = this.m_bodyB.m_xf;
          const aB = this.m_bodyB.m_sweep.a;
          const xfD = this.m_bodyD.m_xf;
          const aD = this.m_bodyD.m_sweep.a;
          if (this.m_type2 === RevoluteJoint.TYPE) {
              const revolute = this.m_joint2;
              this.m_localAnchorD = revolute.m_localAnchorA;
              this.m_localAnchorB = revolute.m_localAnchorB;
              this.m_referenceAngleB = revolute.m_referenceAngle;
              this.m_localAxisD = zero$1();
              coordinateB = aB - aD - this.m_referenceAngleB;
          }
          else {
              const prismatic = this.m_joint2;
              this.m_localAnchorD = prismatic.m_localAnchorA;
              this.m_localAnchorB = prismatic.m_localAnchorB;
              this.m_referenceAngleB = prismatic.m_referenceAngle;
              this.m_localAxisD = prismatic.m_localXAxisA;
              const pD = this.m_localAnchorD;
              const pB = Rot.mulTVec2(xfD.q, add$1(Rot.mulVec2(xfB.q, this.m_localAnchorB), sub$1(xfB.p, xfD.p)));
              coordinateB = dot$1(pB, this.m_localAxisD) - dot$1(pD, this.m_localAxisD);
          }
          this.m_constant = coordinateA + this.m_ratio * coordinateB;
          this.m_impulse = 0.0;
          // Gear Joint:
          // C0 = (coordinate1 + ratio * coordinate2)_initial
          // C = (coordinate1 + ratio * coordinate2) - C0 = 0
          // J = [J1 ratio * J2]
          // K = J * invM * JT
          // = J1 * invM1 * J1T + ratio * ratio * J2 * invM2 * J2T
          //
          // Revolute:
          // coordinate = rotation
          // Cdot = angularVelocity
          // J = [0 0 1]
          // K = J * invM * JT = invI
          //
          // Prismatic:
          // coordinate = dot(p - pg, ug)
          // Cdot = dot(v + cross(w, r), ug)
          // J = [ug cross(r, ug)]
          // K = J * invM * JT = invMass + invI * cross(r, ug)^2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              joint1: this.m_joint1,
              joint2: this.m_joint2,
              ratio: this.m_ratio,
              // _constant: this.m_constant,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          data.joint1 = restore(Joint, data.joint1, world);
          data.joint2 = restore(Joint, data.joint2, world);
          const joint = new GearJoint(data);
          // if (data._constant) joint.m_constant = data._constant;
          return joint;
      }
      /** @hidden */
      _reset(def) {
          // todo: implement other fields
          if (Number.isFinite(def.ratio)) {
              this.m_ratio = def.ratio;
          }
      }
      /**
       * Get the first joint.
       */
      getJoint1() {
          return this.m_joint1;
      }
      /**
       * Get the second joint.
       */
      getJoint2() {
          return this.m_joint2;
      }
      /**
       * Set the gear ratio.
       */
      setRatio(ratio) {
          this.m_ratio = ratio;
      }
      /**
       * Get the gear ratio.
       */
      getRatio() {
          return this.m_ratio;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          const f = mulNumVec2(this.m_impulse, this.m_JvAC);
          return scale$1(f, inv_dt, f);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          const L = this.m_impulse * this.m_JwA;
          return inv_dt * L;
      }
      initVelocityConstraints(step) {
          this.m_lcA = this.m_bodyA.m_sweep.localCenter;
          this.m_lcB = this.m_bodyB.m_sweep.localCenter;
          this.m_lcC = this.m_bodyC.m_sweep.localCenter;
          this.m_lcD = this.m_bodyD.m_sweep.localCenter;
          this.m_mA = this.m_bodyA.m_invMass;
          this.m_mB = this.m_bodyB.m_invMass;
          this.m_mC = this.m_bodyC.m_invMass;
          this.m_mD = this.m_bodyD.m_invMass;
          this.m_iA = this.m_bodyA.m_invI;
          this.m_iB = this.m_bodyB.m_invI;
          this.m_iC = this.m_bodyC.m_invI;
          this.m_iD = this.m_bodyD.m_invI;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const aC = this.m_bodyC.c_position.a;
          const vC = this.m_bodyC.c_velocity.v;
          let wC = this.m_bodyC.c_velocity.w;
          const aD = this.m_bodyD.c_position.a;
          const vD = this.m_bodyD.c_velocity.v;
          let wD = this.m_bodyD.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const qC = Rot.neo(aC);
          const qD = Rot.neo(aD);
          this.m_mass = 0.0;
          if (this.m_type1 == RevoluteJoint.TYPE) {
              this.m_JvAC = zero$1();
              this.m_JwA = 1.0;
              this.m_JwC = 1.0;
              this.m_mass += this.m_iA + this.m_iC;
          }
          else {
              const u = Rot.mulVec2(qC, this.m_localAxisC);
              const rC = Rot.mulSub(qC, this.m_localAnchorC, this.m_lcC);
              const rA = Rot.mulSub(qA, this.m_localAnchorA, this.m_lcA);
              this.m_JvAC = u;
              this.m_JwC = crossVec2Vec2$1(rC, u);
              this.m_JwA = crossVec2Vec2$1(rA, u);
              this.m_mass += this.m_mC + this.m_mA + this.m_iC * this.m_JwC * this.m_JwC + this.m_iA * this.m_JwA * this.m_JwA;
          }
          if (this.m_type2 == RevoluteJoint.TYPE) {
              this.m_JvBD = zero$1();
              this.m_JwB = this.m_ratio;
              this.m_JwD = this.m_ratio;
              this.m_mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
          }
          else {
              const u = Rot.mulVec2(qD, this.m_localAxisD);
              const rD = Rot.mulSub(qD, this.m_localAnchorD, this.m_lcD);
              const rB = Rot.mulSub(qB, this.m_localAnchorB, this.m_lcB);
              this.m_JvBD = mulNumVec2(this.m_ratio, u);
              this.m_JwD = this.m_ratio * crossVec2Vec2$1(rD, u);
              this.m_JwB = this.m_ratio * crossVec2Vec2$1(rB, u);
              this.m_mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * this.m_JwD * this.m_JwD + this.m_iB * this.m_JwB * this.m_JwB;
          }
          // Compute effective mass.
          this.m_mass = this.m_mass > 0.0 ? 1.0 / this.m_mass : 0.0;
          if (step.warmStarting) {
              addMul(vA, this.m_mA * this.m_impulse, this.m_JvAC, vA);
              wA += this.m_iA * this.m_impulse * this.m_JwA;
              addMul(vB, this.m_mB * this.m_impulse, this.m_JvBD, vB);
              wB += this.m_iB * this.m_impulse * this.m_JwB;
              subMul(vC, this.m_mC * this.m_impulse, this.m_JvAC, vC);
              wC -= this.m_iC * this.m_impulse * this.m_JwC;
              subMul(vD, this.m_mD * this.m_impulse, this.m_JvBD, vD);
              wD -= this.m_iD * this.m_impulse * this.m_JwD;
          }
          else {
              this.m_impulse = 0.0;
          }
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
          copy(vC, this.m_bodyC.c_velocity.v);
          this.m_bodyC.c_velocity.w = wC;
          copy(vD, this.m_bodyD.c_velocity.v);
          this.m_bodyD.c_velocity.w = wD;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const vC = this.m_bodyC.c_velocity.v;
          let wC = this.m_bodyC.c_velocity.w;
          const vD = this.m_bodyD.c_velocity.v;
          let wD = this.m_bodyD.c_velocity.w;
          let Cdot = dot$1(this.m_JvAC, vA) - dot$1(this.m_JvAC, vC) + dot$1(this.m_JvBD, vB) - dot$1(this.m_JvBD, vD);
          Cdot += (this.m_JwA * wA - this.m_JwC * wC) + (this.m_JwB * wB - this.m_JwD * wD);
          const impulse = -this.m_mass * Cdot;
          this.m_impulse += impulse;
          addMul(vA, this.m_mA * impulse, this.m_JvAC, vA);
          wA += this.m_iA * impulse * this.m_JwA;
          addMul(vB, this.m_mB * impulse, this.m_JvBD, vB);
          wB += this.m_iB * impulse * this.m_JwB;
          subMul(vC, this.m_mC * impulse, this.m_JvAC, vC);
          wC -= this.m_iC * impulse * this.m_JwC;
          subMul(vD, this.m_mD * impulse, this.m_JvBD, vD);
          wD -= this.m_iD * impulse * this.m_JwD;
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
          copy(vC, this.m_bodyC.c_velocity.v);
          this.m_bodyC.c_velocity.w = wC;
          copy(vD, this.m_bodyD.c_velocity.v);
          this.m_bodyD.c_velocity.w = wD;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const cC = this.m_bodyC.c_position.c;
          let aC = this.m_bodyC.c_position.a;
          const cD = this.m_bodyD.c_position.c;
          let aD = this.m_bodyD.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const qC = Rot.neo(aC);
          const qD = Rot.neo(aD);
          const linearError = 0.0;
          let coordinateA;
          let coordinateB;
          let JvAC;
          let JvBD;
          let JwA;
          let JwB;
          let JwC;
          let JwD;
          let mass = 0.0;
          if (this.m_type1 == RevoluteJoint.TYPE) {
              JvAC = zero$1();
              JwA = 1.0;
              JwC = 1.0;
              mass += this.m_iA + this.m_iC;
              coordinateA = aA - aC - this.m_referenceAngleA;
          }
          else {
              const u = Rot.mulVec2(qC, this.m_localAxisC);
              const rC = Rot.mulSub(qC, this.m_localAnchorC, this.m_lcC);
              const rA = Rot.mulSub(qA, this.m_localAnchorA, this.m_lcA);
              JvAC = u;
              JwC = crossVec2Vec2$1(rC, u);
              JwA = crossVec2Vec2$1(rA, u);
              mass += this.m_mC + this.m_mA + this.m_iC * JwC * JwC + this.m_iA * JwA * JwA;
              const pC = sub$1(this.m_localAnchorC, this.m_lcC);
              const pA = Rot.mulTVec2(qC, add$1(rA, sub$1(cA, cC)));
              coordinateA = dot$1(sub$1(pA, pC), this.m_localAxisC);
          }
          if (this.m_type2 == RevoluteJoint.TYPE) {
              JvBD = zero$1();
              JwB = this.m_ratio;
              JwD = this.m_ratio;
              mass += this.m_ratio * this.m_ratio * (this.m_iB + this.m_iD);
              coordinateB = aB - aD - this.m_referenceAngleB;
          }
          else {
              const u = Rot.mulVec2(qD, this.m_localAxisD);
              const rD = Rot.mulSub(qD, this.m_localAnchorD, this.m_lcD);
              const rB = Rot.mulSub(qB, this.m_localAnchorB, this.m_lcB);
              JvBD = mulNumVec2(this.m_ratio, u);
              JwD = this.m_ratio * crossVec2Vec2$1(rD, u);
              JwB = this.m_ratio * crossVec2Vec2$1(rB, u);
              mass += this.m_ratio * this.m_ratio * (this.m_mD + this.m_mB) + this.m_iD * JwD * JwD + this.m_iB * JwB * JwB;
              const pD = sub$1(this.m_localAnchorD, this.m_lcD);
              const pB = Rot.mulTVec2(qD, add$1(rB, sub$1(cB, cD)));
              coordinateB = dot$1(pB, this.m_localAxisD) - dot$1(pD, this.m_localAxisD);
          }
          const C = (coordinateA + this.m_ratio * coordinateB) - this.m_constant;
          let impulse = 0.0;
          if (mass > 0.0) {
              impulse = -C / mass;
          }
          addMul(cA, this.m_mA * impulse, JvAC, cA);
          aA += this.m_iA * impulse * JwA;
          addMul(cB, this.m_mB * impulse, JvBD, cB);
          aB += this.m_iB * impulse * JwB;
          subMul(cC, this.m_mC * impulse, JvAC, cC);
          aC -= this.m_iC * impulse * JwC;
          subMul(cD, this.m_mD * impulse, JvBD, cD);
          aD -= this.m_iD * impulse * JwD;
          copy(cA, this.m_bodyA.c_position.c);
          this.m_bodyA.c_position.a = aA;
          copy(cB, this.m_bodyB.c_position.c);
          this.m_bodyB.c_position.a = aB;
          copy(cC, this.m_bodyC.c_position.c);
          this.m_bodyC.c_position.a = aC;
          copy(cD, this.m_bodyD.c_position.c);
          this.m_bodyD.c_position.a = aD;
          // TODO_ERIN not implemented
          return linearError < SettingsInternal.linearSlop;
      }
  }
  GearJoint.TYPE = 'gear-joint';

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
  /** @internal */ const DEFAULTS$5 = {
      maxForce: 1.0,
      maxTorque: 1.0,
      correctionFactor: 0.3
  };
  /**
   * A motor joint is used to control the relative motion between two bodies. A
   * typical usage is to control the movement of a dynamic body with respect to
   * the ground.
   */
  class MotorJoint extends Joint {
      constructor(def, bodyA, bodyB) {
          def = options(def, DEFAULTS$5);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = MotorJoint.TYPE;
          this.m_linearOffset = isValid$1(def.linearOffset) ? clone$1(def.linearOffset) : bodyA.getLocalPoint(bodyB.getPosition());
          this.m_angularOffset = Number.isFinite(def.angularOffset) ? def.angularOffset : bodyB.getAngle() - bodyA.getAngle();
          this.m_linearImpulse = zero$1();
          this.m_angularImpulse = 0.0;
          this.m_maxForce = def.maxForce;
          this.m_maxTorque = def.maxTorque;
          this.m_correctionFactor = def.correctionFactor;
          // Point-to-point constraint
          // Cdot = v2 - v1
          // = v2 + cross(w2, r2) - v1 - cross(w1, r1)
          // J = [-I -r1_skew I r2_skew ]
          // Identity used:
          // w k % (rx i + ry j) = w * (-ry i + rx j)
          //
          // r1 = offset - c1
          // r2 = -c2
          // Angle constraint
          // Cdot = w2 - w1
          // J = [0 0 -1 0 0 1]
          // K = invI1 + invI2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              maxForce: this.m_maxForce,
              maxTorque: this.m_maxTorque,
              correctionFactor: this.m_correctionFactor,
              linearOffset: this.m_linearOffset,
              angularOffset: this.m_angularOffset,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new MotorJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (Number.isFinite(def.angularOffset)) {
              this.m_angularOffset = def.angularOffset;
          }
          if (Number.isFinite(def.maxForce)) {
              this.m_maxForce = def.maxForce;
          }
          if (Number.isFinite(def.maxTorque)) {
              this.m_maxTorque = def.maxTorque;
          }
          if (Number.isFinite(def.correctionFactor)) {
              this.m_correctionFactor = def.correctionFactor;
          }
          if (isValid$1(def.linearOffset)) {
              copy(def.linearOffset, this.m_linearOffset);
          }
      }
      /**
       * Set the maximum friction force in N.
       */
      setMaxForce(force) {
          this.m_maxForce = force;
      }
      /**
       * Get the maximum friction force in N.
       */
      getMaxForce() {
          return this.m_maxForce;
      }
      /**
       * Set the maximum friction torque in N*m.
       */
      setMaxTorque(torque) {
          this.m_maxTorque = torque;
      }
      /**
       * Get the maximum friction torque in N*m.
       */
      getMaxTorque() {
          return this.m_maxTorque;
      }
      /**
       * Set the position correction factor in the range [0,1].
       */
      setCorrectionFactor(factor) {
          this.m_correctionFactor = factor;
      }
      /**
       * Get the position correction factor in the range [0,1].
       */
      getCorrectionFactor() {
          return this.m_correctionFactor;
      }
      /**
       * Set/get the target linear offset, in frame A, in meters.
       */
      setLinearOffset(linearOffset) {
          if (linearOffset[0] != this.m_linearOffset[0] || linearOffset[1] != this.m_linearOffset[1]) {
              this.m_bodyA.setAwake(true);
              this.m_bodyB.setAwake(true);
              copy(linearOffset, this.m_linearOffset);
          }
      }
      getLinearOffset() {
          return this.m_linearOffset;
      }
      /**
       * Set/get the target angular offset, in radians.
       */
      setAngularOffset(angularOffset) {
          if (angularOffset != this.m_angularOffset) {
              this.m_bodyA.setAwake(true);
              this.m_bodyB.setAwake(true);
              this.m_angularOffset = angularOffset;
          }
      }
      getAngularOffset() {
          return this.m_angularOffset;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getPosition();
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getPosition();
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          return mulNumVec2(inv_dt, this.m_linearImpulse);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * this.m_angularImpulse;
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = this.m_bodyA.c_position.c;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const cB = this.m_bodyB.c_position.c;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          // Compute the effective mass matrix.
          this.m_rA = Rot.mulVec2(qA, sub$1(this.m_linearOffset, this.m_localCenterA));
          this.m_rB = Rot.mulVec2(qB, neg$1(this.m_localCenterB));
          // J = [-I -r1_skew I r2_skew]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB, -r1y*iA*r1x-r2y*iB*r2x, -r1y*iA-r2y*iB]
          // [ -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB, r1x*iA+r2x*iB]
          // [ -r1y*iA-r2y*iB, r1x*iA+r2x*iB, iA+iB]
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          // Upper 2 by 2 of K for point to point
          const K = new Mat22();
          K.ex[0] = mA + mB + iA * this.m_rA[1] * this.m_rA[1] + iB * this.m_rB[1] * this.m_rB[1];
          K.ex[1] = -iA * this.m_rA[0] * this.m_rA[1] - iB * this.m_rB[0] * this.m_rB[1];
          K.ey[0] = K.ex[1];
          K.ey[1] = mA + mB + iA * this.m_rA[0] * this.m_rA[0] + iB * this.m_rB[0] * this.m_rB[0];
          this.m_linearMass = K.getInverse();
          this.m_angularMass = iA + iB;
          if (this.m_angularMass > 0.0) {
              this.m_angularMass = 1.0 / this.m_angularMass;
          }
          this.m_linearError = zero$1();
          addCombine(this.m_linearError, 1, cB, 1, this.m_rB, this.m_linearError);
          subCombine(this.m_linearError, 1, cA, 1, this.m_rA, this.m_linearError);
          this.m_angularError = aB - aA - this.m_angularOffset;
          if (step.warmStarting) {
              // Scale impulses to support a variable time step.
              scale$1(this.m_linearImpulse, step.dtRatio, this.m_linearImpulse);
              this.m_angularImpulse *= step.dtRatio;
              const P = create$2(this.m_linearImpulse[0], this.m_linearImpulse[1]);
              subMul(vA, mA, P, vA);
              wA -= iA * (crossVec2Vec2$1(this.m_rA, P) + this.m_angularImpulse);
              addMul(vB, mB, P, vB);
              wB += iB * (crossVec2Vec2$1(this.m_rB, P) + this.m_angularImpulse);
          }
          else {
              setZero$1(this.m_linearImpulse);
              this.m_angularImpulse = 0.0;
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const h = step.dt;
          const inv_h = step.inv_dt;
          // Solve angular friction
          {
              const Cdot = wB - wA + inv_h * this.m_correctionFactor * this.m_angularError;
              let impulse = -this.m_angularMass * Cdot;
              const oldImpulse = this.m_angularImpulse;
              const maxImpulse = h * this.m_maxTorque;
              this.m_angularImpulse = clamp$2(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_angularImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve linear friction
          {
              const Cdot = zero$1();
              addCombine(Cdot, 1, vB, 1, crossNumVec2$1(wB, this.m_rB), Cdot);
              subCombine(Cdot, 1, vA, 1, crossNumVec2$1(wA, this.m_rA), Cdot);
              addMul(Cdot, inv_h * this.m_correctionFactor, this.m_linearError, Cdot);
              let impulse = neg$1(Mat22.mulVec2(this.m_linearMass, Cdot));
              const oldImpulse = clone$1(this.m_linearImpulse);
              add$1(this.m_linearImpulse, impulse, this.m_linearImpulse);
              const maxImpulse = h * this.m_maxForce;
              clamp$1(this.m_linearImpulse, maxImpulse, this.m_linearImpulse);
              impulse = sub$1(this.m_linearImpulse, oldImpulse);
              subMul(vA, mA, impulse, vA);
              wA -= iA * crossVec2Vec2$1(this.m_rA, impulse);
              addMul(vB, mB, impulse, vB);
              wB += iB * crossVec2Vec2$1(this.m_rB, impulse);
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          return true;
      }
  }
  MotorJoint.TYPE = 'motor-joint';

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
  /** @internal */ const math_PI$3 = Math.PI;
  /** @internal */ const DEFAULTS$4 = {
      maxForce: 0.0,
      frequencyHz: 5.0,
      dampingRatio: 0.7
  };
  /**
   * A mouse joint is used to make a point on a body track a specified world
   * point. This a soft constraint with a maximum force. This allows the
   * constraint to stretch and without applying huge forces.
   *
   * You need to call setTarget(target) every time that mouse is
   * moved, to track the new location of the mouse.
   *
   * NOTE: this joint is not documented in the manual because it was developed to
   * be used in the testbed. If you want to learn how to use the mouse joint, look
   * at the testbed.
   */
  class MouseJoint extends Joint {
      constructor(def, bodyA, bodyB, target) {
          def = options(def, DEFAULTS$4);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = MouseJoint.TYPE;
          if (isValid$1(target)) {
              this.m_targetA = clone$1(target);
          }
          else if (isValid$1(def.target)) {
              this.m_targetA = clone$1(def.target);
          }
          else {
              this.m_targetA = zero$1();
          }
          this.m_localAnchorB = Transform.mulTVec2(bodyB.getTransform(), this.m_targetA);
          this.m_maxForce = def.maxForce;
          this.m_impulse = zero$1();
          this.m_frequencyHz = def.frequencyHz;
          this.m_dampingRatio = def.dampingRatio;
          this.m_beta = 0.0;
          this.m_gamma = 0.0;
          // Solver temp
          this.m_rB = zero$1();
          this.m_localCenterB = zero$1();
          this.m_invMassB = 0.0;
          this.m_invIB = 0.0;
          this.m_mass = new Mat22();
          this.m_C = zero$1();
          // p = attached point, m = mouse point
          // C = p - m
          // Cdot = v
          // = v + cross(w, r)
          // J = [I r_skew]
          // Identity used:
          // w k % (rx i + ry j) = w * (-ry i + rx j)
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              target: this.m_targetA,
              maxForce: this.m_maxForce,
              frequencyHz: this.m_frequencyHz,
              dampingRatio: this.m_dampingRatio,
              _localAnchorB: this.m_localAnchorB,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          data.target = clone$1(data.target);
          const joint = new MouseJoint(data);
          if (data._localAnchorB) {
              joint.m_localAnchorB = data._localAnchorB;
          }
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (Number.isFinite(def.maxForce)) {
              this.m_maxForce = def.maxForce;
          }
          if (Number.isFinite(def.frequencyHz)) {
              this.m_frequencyHz = def.frequencyHz;
          }
          if (Number.isFinite(def.dampingRatio)) {
              this.m_dampingRatio = def.dampingRatio;
          }
      }
      /**
       * Use this to update the target point.
       */
      setTarget(target) {
          if (areEqual$1(target, this.m_targetA))
              return;
          this.m_bodyB.setAwake(true);
          copy(target, this.m_targetA);
      }
      getTarget() {
          return this.m_targetA;
      }
      /**
       * Set the maximum force in Newtons.
       */
      setMaxForce(force) {
          this.m_maxForce = force;
      }
      /**
       * Get the maximum force in Newtons.
       */
      getMaxForce() {
          return this.m_maxForce;
      }
      /**
       * Set the frequency in Hertz.
       */
      setFrequency(hz) {
          this.m_frequencyHz = hz;
      }
      /**
       * Get the frequency in Hertz.
       */
      getFrequency() {
          return this.m_frequencyHz;
      }
      /**
       * Set the damping ratio (dimensionless).
       */
      setDampingRatio(ratio) {
          this.m_dampingRatio = ratio;
      }
      /**
       * Get the damping ratio (dimensionless).
       */
      getDampingRatio() {
          return this.m_dampingRatio;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return clone$1(this.m_targetA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          return mulNumVec2(inv_dt, this.m_impulse);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * 0.0;
      }
      /**
       * Shift the origin for any points stored in world coordinates.
       */
      shiftOrigin(newOrigin) {
          sub$1(this.m_targetA, newOrigin, this.m_targetA);
      }
      initVelocityConstraints(step) {
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIB = this.m_bodyB.m_invI;
          const position = this.m_bodyB.c_position;
          const velocity = this.m_bodyB.c_velocity;
          const cB = position.c;
          const aB = position.a;
          const vB = velocity.v;
          let wB = velocity.w;
          const qB = Rot.neo(aB);
          const mass = this.m_bodyB.getMass();
          // Frequency
          const omega = 2.0 * math_PI$3 * this.m_frequencyHz;
          // Damping coefficient
          const d = 2.0 * mass * this.m_dampingRatio * omega;
          // Spring stiffness
          const k = mass * (omega * omega);
          // magic formulas
          // gamma has units of inverse mass.
          // beta has units of inverse time.
          const h = step.dt;
          this.m_gamma = h * (d + h * k);
          if (this.m_gamma != 0.0) {
              this.m_gamma = 1.0 / this.m_gamma;
          }
          this.m_beta = h * k * this.m_gamma;
          // Compute the effective mass matrix.
          this.m_rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          // K = [(1/m1 + 1/m2) * eye(2) - skew(r1) * invI1 * skew(r1) - skew(r2) *
          // invI2 * skew(r2)]
          // = [1/m1+1/m2 0 ] + invI1 * [r1.y*r1.y -r1.x*r1.y] + invI2 * [r1.y*r1.y
          // -r1.x*r1.y]
          // [ 0 1/m1+1/m2] [-r1.x*r1.y r1.x*r1.x] [-r1.x*r1.y r1.x*r1.x]
          const K = new Mat22();
          K.ex[0] = this.m_invMassB + this.m_invIB * this.m_rB[1] * this.m_rB[1]
              + this.m_gamma;
          K.ex[1] = -this.m_invIB * this.m_rB[0] * this.m_rB[1];
          K.ey[0] = K.ex[1];
          K.ey[1] = this.m_invMassB + this.m_invIB * this.m_rB[0] * this.m_rB[0]
              + this.m_gamma;
          this.m_mass = K.getInverse();
          copy(cB, this.m_C);
          addCombine(this.m_C, 1, this.m_rB, -1, this.m_targetA, this.m_C);
          scale$1(this.m_C, this.m_beta, this.m_C);
          // Cheat with some damping
          wB *= 0.98;
          if (step.warmStarting) {
              scale$1(this.m_impulse, step.dtRatio, this.m_impulse);
              addMul(vB, this.m_invMassB, this.m_impulse, vB);
              wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, this.m_impulse);
          }
          else {
              setZero$1(this.m_impulse);
          }
          copy(vB, velocity.v);
          velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const velocity = this.m_bodyB.c_velocity;
          const vB = clone$1(velocity.v);
          let wB = velocity.w;
          // Cdot = v + cross(w, r)
          const Cdot = crossNumVec2$1(wB, this.m_rB);
          add$1(Cdot, vB, Cdot);
          addCombine(Cdot, 1, this.m_C, this.m_gamma, this.m_impulse, Cdot);
          neg$1(Cdot, Cdot);
          let impulse = Mat22.mulVec2(this.m_mass, Cdot);
          const oldImpulse = clone$1(this.m_impulse);
          add$1(this.m_impulse, impulse, this.m_impulse);
          const maxImpulse = step.dt * this.m_maxForce;
          clamp$1(this.m_impulse, maxImpulse, this.m_impulse);
          impulse = sub$1(this.m_impulse, oldImpulse);
          addMul(vB, this.m_invMassB, impulse, vB);
          wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, impulse);
          copy(vB, velocity.v);
          velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          return true;
      }
  }
  MouseJoint.TYPE = 'mouse-joint';

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
  /** @internal */ const math_abs$3 = Math.abs;
  /** @internal */ const DEFAULTS$3 = {
      collideConnected: true
  };
  /**
   * The pulley joint is connected to two bodies and two fixed ground points. The
   * pulley supports a ratio such that: length1 + ratio * length2 <= constant
   *
   * Yes, the force transmitted is scaled by the ratio.
   *
   * Warning: the pulley joint can get a bit squirrelly by itself. They often work
   * better when combined with prismatic joints. You should also cover the the
   * anchor points with static shapes to prevent one side from going to zero
   * length.
   */
  class PulleyJoint extends Joint {
      constructor(def, bodyA, bodyB, groundA, groundB, anchorA, anchorB, ratio) {
          def = options(def, DEFAULTS$3);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = PulleyJoint.TYPE;
          this.m_groundAnchorA = clone$1(groundA ? groundA : def.groundAnchorA || create$2(-1.0, 1.0));
          this.m_groundAnchorB = clone$1(groundB ? groundB : def.groundAnchorB || create$2(1.0, 1.0));
          this.m_localAnchorA = clone$1(anchorA ? bodyA.getLocalPoint(anchorA) : def.localAnchorA || create$2(-1.0, 0.0));
          this.m_localAnchorB = clone$1(anchorB ? bodyB.getLocalPoint(anchorB) : def.localAnchorB || create$2(1.0, 0.0));
          this.m_lengthA = Number.isFinite(def.lengthA) ? def.lengthA : distance(anchorA, groundA);
          this.m_lengthB = Number.isFinite(def.lengthB) ? def.lengthB : distance(anchorB, groundB);
          this.m_ratio = Number.isFinite(ratio) ? ratio : def.ratio;
          this.m_constant = this.m_lengthA + this.m_ratio * this.m_lengthB;
          this.m_impulse = 0.0;
          // Pulley:
          // length1 = norm(p1 - s1)
          // length2 = norm(p2 - s2)
          // C0 = (length1 + ratio * length2)_initial
          // C = C0 - (length1 + ratio * length2)
          // u1 = (p1 - s1) / norm(p1 - s1)
          // u2 = (p2 - s2) / norm(p2 - s2)
          // Cdot = -dot(u1, v1 + cross(w1, r1)) - ratio * dot(u2, v2 + cross(w2, r2))
          // J = -[u1 cross(r1, u1) ratio * u2 ratio * cross(r2, u2)]
          // K = J * invM * JT
          // = invMass1 + invI1 * cross(r1, u1)^2 + ratio^2 * (invMass2 + invI2 *
          // cross(r2, u2)^2)
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              groundAnchorA: this.m_groundAnchorA,
              groundAnchorB: this.m_groundAnchorB,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              lengthA: this.m_lengthA,
              lengthB: this.m_lengthB,
              ratio: this.m_ratio,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new PulleyJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (isValid$1(def.groundAnchorA)) {
              copy(def.groundAnchorA, this.m_groundAnchorA);
          }
          if (isValid$1(def.groundAnchorB)) {
              copy(def.groundAnchorB, this.m_groundAnchorB);
          }
          if (isValid$1(def.localAnchorA)) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          else if (isValid$1(def.anchorA)) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          if (isValid$1(def.localAnchorB)) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          else if (isValid$1(def.anchorB)) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          if (Number.isFinite(def.lengthA)) {
              this.m_lengthA = def.lengthA;
          }
          if (Number.isFinite(def.lengthB)) {
              this.m_lengthB = def.lengthB;
          }
          if (Number.isFinite(def.ratio)) {
              this.m_ratio = def.ratio;
          }
      }
      /**
       * Get the first ground anchor.
       */
      getGroundAnchorA() {
          return this.m_groundAnchorA;
      }
      /**
       * Get the second ground anchor.
       */
      getGroundAnchorB() {
          return this.m_groundAnchorB;
      }
      /**
       * Get the current length of the segment attached to bodyA.
       */
      getLengthA() {
          return this.m_lengthA;
      }
      /**
       * Get the current length of the segment attached to bodyB.
       */
      getLengthB() {
          return this.m_lengthB;
      }
      /**
       * Get the pulley ratio.
       */
      getRatio() {
          return this.m_ratio;
      }
      /**
       * Get the current length of the segment attached to bodyA.
       */
      getCurrentLengthA() {
          const p = this.m_bodyA.getWorldPoint(this.m_localAnchorA);
          const s = this.m_groundAnchorA;
          return distance(p, s);
      }
      /**
       * Get the current length of the segment attached to bodyB.
       */
      getCurrentLengthB() {
          const p = this.m_bodyB.getWorldPoint(this.m_localAnchorB);
          const s = this.m_groundAnchorB;
          return distance(p, s);
      }
      /**
       * Shift the origin for any points stored in world coordinates.
       *
       * @param newOrigin
       */
      shiftOrigin(newOrigin) {
          sub$1(this.m_groundAnchorA, newOrigin, this.m_groundAnchorA);
          sub$1(this.m_groundAnchorB, newOrigin, this.m_groundAnchorB);
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          const f = mulNumVec2(this.m_impulse, this.m_uB);
          return scale$1(f, inv_dt, f);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return 0.0;
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = this.m_bodyA.c_position.c;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const cB = this.m_bodyB.c_position.c;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          this.m_rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          this.m_rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          // Get the pulley axes.
          this.m_uA = sub$1(add$1(cA, this.m_rA), this.m_groundAnchorA);
          this.m_uB = sub$1(add$1(cB, this.m_rB), this.m_groundAnchorB);
          const lengthA = length$1(this.m_uA);
          const lengthB = length$1(this.m_uB);
          if (lengthA > 10.0 * SettingsInternal.linearSlop) {
              scale$1(this.m_uA, 1.0 / lengthA, this.m_uA);
          }
          else {
              setZero$1(this.m_uA);
          }
          if (lengthB > 10.0 * SettingsInternal.linearSlop) {
              scale$1(this.m_uB, 1.0 / lengthB, this.m_uB);
          }
          else {
              setZero$1(this.m_uB);
          }
          // Compute effective mass.
          const ruA = crossVec2Vec2$1(this.m_rA, this.m_uA);
          const ruB = crossVec2Vec2$1(this.m_rB, this.m_uB);
          const mA = this.m_invMassA + this.m_invIA * ruA * ruA;
          const mB = this.m_invMassB + this.m_invIB * ruB * ruB;
          this.m_mass = mA + this.m_ratio * this.m_ratio * mB;
          if (this.m_mass > 0.0) {
              this.m_mass = 1.0 / this.m_mass;
          }
          if (step.warmStarting) {
              // Scale impulses to support variable time steps.
              this.m_impulse *= step.dtRatio;
              // Warm starting.
              const PA = mulNumVec2(-this.m_impulse, this.m_uA);
              const PB = mulNumVec2(-this.m_ratio * this.m_impulse, this.m_uB);
              addMul(vA, this.m_invMassA, PA, vA);
              wA += this.m_invIA * crossVec2Vec2$1(this.m_rA, PA);
              addMul(vB, this.m_invMassB, PB, vB);
              wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, PB);
          }
          else {
              this.m_impulse = 0.0;
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const vpA = add$1(vA, crossNumVec2$1(wA, this.m_rA));
          const vpB = add$1(vB, crossNumVec2$1(wB, this.m_rB));
          const Cdot = -dot$1(this.m_uA, vpA) - this.m_ratio * dot$1(this.m_uB, vpB);
          const impulse = -this.m_mass * Cdot;
          this.m_impulse += impulse;
          const PA = mulNumVec2(-impulse, this.m_uA);
          const PB = mulNumVec2(-this.m_ratio * impulse, this.m_uB);
          addMul(vA, this.m_invMassA, PA, vA);
          wA += this.m_invIA * crossVec2Vec2$1(this.m_rA, PA);
          addMul(vB, this.m_invMassB, PB, vB);
          wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, PB);
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          // Get the pulley axes.
          const uA = sub$1(add$1(cA, this.m_rA), this.m_groundAnchorA);
          const uB = sub$1(add$1(cB, this.m_rB), this.m_groundAnchorB);
          const lengthA = length$1(uA);
          const lengthB = length$1(uB);
          if (lengthA > 10.0 * SettingsInternal.linearSlop) {
              scale$1(uA, 1.0 / lengthA, uA);
          }
          else {
              setZero$1(uA);
          }
          if (lengthB > 10.0 * SettingsInternal.linearSlop) {
              scale$1(uB, 1.0 / lengthB, uB);
          }
          else {
              setZero$1(uB);
          }
          // Compute effective mass.
          const ruA = crossVec2Vec2$1(rA, uA);
          const ruB = crossVec2Vec2$1(rB, uB);
          const mA = this.m_invMassA + this.m_invIA * ruA * ruA;
          const mB = this.m_invMassB + this.m_invIB * ruB * ruB;
          let mass = mA + this.m_ratio * this.m_ratio * mB;
          if (mass > 0.0) {
              mass = 1.0 / mass;
          }
          const C = this.m_constant - lengthA - this.m_ratio * lengthB;
          const linearError = math_abs$3(C);
          const impulse = -mass * C;
          const PA = mulNumVec2(-impulse, uA);
          const PB = mulNumVec2(-this.m_ratio * impulse, uB);
          addMul(cA, this.m_invMassA, PA, cA);
          aA += this.m_invIA * crossVec2Vec2$1(rA, PA);
          addMul(cB, this.m_invMassB, PB, cB);
          aB += this.m_invIB * crossVec2Vec2$1(rB, PB);
          this.m_bodyA.c_position.c = cA;
          this.m_bodyA.c_position.a = aA;
          this.m_bodyB.c_position.c = cB;
          this.m_bodyB.c_position.a = aB;
          return linearError < SettingsInternal.linearSlop;
      }
  }
  PulleyJoint.TYPE = 'pulley-joint';

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
  /** @internal */ const math_min$1 = Math.min;
  /** @internal */ var LimitState;
  (function (LimitState) {
      LimitState[LimitState["inactiveLimit"] = 0] = "inactiveLimit";
      LimitState[LimitState["atLowerLimit"] = 1] = "atLowerLimit";
      LimitState[LimitState["atUpperLimit"] = 2] = "atUpperLimit";
      LimitState[LimitState["equalLimits"] = 3] = "equalLimits";
  })(LimitState || (LimitState = {}));
  /** @internal */ const DEFAULTS$2 = {
      maxLength: 0.0,
  };
  /**
   * A rope joint enforces a maximum distance between two points on two bodies. It
   * has no other effect.
   *
   * Warning: if you attempt to change the maximum length during the simulation
   * you will get some non-physical behavior.
   *
   * A model that would allow you to dynamically modify the length would have some
   * sponginess, so I chose not to implement it that way. See {@link DistanceJoint} if you
   * want to dynamically control length.
   */
  class RopeJoint extends Joint {
      constructor(def, bodyA, bodyB, anchor) {
          def = options(def, DEFAULTS$2);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = RopeJoint.TYPE;
          this.m_localAnchorA = clone$1(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || create$2(-1.0, 0.0));
          this.m_localAnchorB = clone$1(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || create$2(1.0, 0.0));
          this.m_maxLength = def.maxLength;
          this.m_mass = 0.0;
          this.m_impulse = 0.0;
          this.m_length = 0.0;
          this.m_state = LimitState.inactiveLimit;
          // Limit:
          // C = norm(pB - pA) - L
          // u = (pB - pA) / norm(pB - pA)
          // Cdot = dot(u, vB + cross(wB, rB) - vA - cross(wA, rA))
          // J = [-u -cross(rA, u) u cross(rB, u)]
          // K = J * invM * JT
          // = invMassA + invIA * cross(rA, u)^2 + invMassB + invIB * cross(rB, u)^2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              maxLength: this.m_maxLength,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new RopeJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (Number.isFinite(def.maxLength)) {
              this.m_maxLength = def.maxLength;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * Set the maximum length of the rope.
       */
      setMaxLength(length) {
          this.m_maxLength = length;
      }
      /**
       * Get the maximum length of the rope.
       */
      getMaxLength() {
          return this.m_maxLength;
      }
      getLimitState() {
          // TODO LimitState
          return this.m_state;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          const f = mulNumVec2(this.m_impulse, this.m_u);
          return scale$1(f, inv_dt, f);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return 0.0;
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const cA = this.m_bodyA.c_position.c;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const cB = this.m_bodyB.c_position.c;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          this.m_rA = Rot.mulSub(qA, this.m_localAnchorA, this.m_localCenterA);
          this.m_rB = Rot.mulSub(qB, this.m_localAnchorB, this.m_localCenterB);
          this.m_u = zero$1();
          addCombine(this.m_u, 1, cB, 1, this.m_rB, this.m_u);
          subCombine(this.m_u, 1, cA, 1, this.m_rA, this.m_u);
          this.m_length = length$1(this.m_u);
          const C = this.m_length - this.m_maxLength;
          if (C > 0.0) {
              this.m_state = LimitState.atUpperLimit;
          }
          else {
              this.m_state = LimitState.inactiveLimit;
          }
          if (this.m_length > SettingsInternal.linearSlop) {
              scale$1(this.m_u, 1.0 / this.m_length, this.m_u);
          }
          else {
              setZero$1(this.m_u);
              this.m_mass = 0.0;
              this.m_impulse = 0.0;
              return;
          }
          // Compute effective mass.
          const crA = crossVec2Vec2$1(this.m_rA, this.m_u);
          const crB = crossVec2Vec2$1(this.m_rB, this.m_u);
          const invMass = this.m_invMassA + this.m_invIA * crA * crA + this.m_invMassB + this.m_invIB * crB * crB;
          this.m_mass = invMass != 0.0 ? 1.0 / invMass : 0.0;
          if (step.warmStarting) {
              // Scale the impulse to support a variable time step.
              this.m_impulse *= step.dtRatio;
              const P = mulNumVec2(this.m_impulse, this.m_u);
              subMul(vA, this.m_invMassA, P, vA);
              wA -= this.m_invIA * crossVec2Vec2$1(this.m_rA, P);
              addMul(vB, this.m_invMassB, P, vB);
              wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, P);
          }
          else {
              this.m_impulse = 0.0;
          }
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          // Cdot = dot(u, v + cross(w, r))
          const vpA = addCrossNumVec2(vA, wA, this.m_rA);
          const vpB = addCrossNumVec2(vB, wB, this.m_rB);
          const C = this.m_length - this.m_maxLength;
          let Cdot = dot$1(this.m_u, sub$1(vpB, vpA));
          // Predictive constraint.
          if (C < 0.0) {
              Cdot += step.inv_dt * C;
          }
          let impulse = -this.m_mass * Cdot;
          const oldImpulse = this.m_impulse;
          this.m_impulse = math_min$1(0.0, this.m_impulse + impulse);
          impulse = this.m_impulse - oldImpulse;
          const P = mulNumVec2(impulse, this.m_u);
          subMul(vA, this.m_invMassA, P, vA);
          wA -= this.m_invIA * crossVec2Vec2$1(this.m_rA, P);
          addMul(vB, this.m_invMassB, P, vB);
          wB += this.m_invIB * crossVec2Vec2$1(this.m_rB, P);
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const rA = Rot.mulSub(qA, this.m_localAnchorA, this.m_localCenterA);
          const rB = Rot.mulSub(qB, this.m_localAnchorB, this.m_localCenterB);
          const u = zero$1();
          addCombine(u, 1, cB, 1, rB, u);
          subCombine(u, 1, cA, 1, rA, u);
          const length = normalize(u, u);
          let C = length - this.m_maxLength;
          C = clamp$2(C, 0.0, SettingsInternal.maxLinearCorrection);
          const impulse = -this.m_mass * C;
          const P = mulNumVec2(impulse, u);
          subMul(cA, this.m_invMassA, P, cA);
          aA -= this.m_invIA * crossVec2Vec2$1(rA, P);
          addMul(cB, this.m_invMassB, P, cB);
          aB += this.m_invIB * crossVec2Vec2$1(rB, P);
          copy(cA, this.m_bodyA.c_position.c);
          this.m_bodyA.c_position.a = aA;
          copy(cB, this.m_bodyB.c_position.c);
          this.m_bodyB.c_position.a = aB;
          return length - this.m_maxLength < SettingsInternal.linearSlop;
      }
  }
  RopeJoint.TYPE = 'rope-joint';

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
  /** @internal */ const math_abs$2 = Math.abs;
  /** @internal */ const math_PI$2 = Math.PI;
  /** @internal */ const DEFAULTS$1 = {
      frequencyHz: 0.0,
      dampingRatio: 0.0,
  };
  /**
   * A weld joint essentially glues two bodies together. A weld joint may distort
   * somewhat because the island constraint solver is approximate.
   */
  class WeldJoint extends Joint {
      constructor(def, bodyA, bodyB, anchor) {
          def = options(def, DEFAULTS$1);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_type = WeldJoint.TYPE;
          this.m_localAnchorA = clone$1(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || zero$1());
          this.m_localAnchorB = clone$1(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || zero$1());
          this.m_referenceAngle = Number.isFinite(def.referenceAngle) ? def.referenceAngle : bodyB.getAngle() - bodyA.getAngle();
          this.m_frequencyHz = def.frequencyHz;
          this.m_dampingRatio = def.dampingRatio;
          this.m_impulse = create$1();
          this.m_bias = 0.0;
          this.m_gamma = 0.0;
          // Solver temp
          this.m_rA;
          this.m_rB;
          this.m_localCenterA;
          this.m_localCenterB;
          this.m_invMassA;
          this.m_invMassB;
          this.m_invIA;
          this.m_invIB;
          this.m_mass = new Mat33();
          // Point-to-point constraint
          // C = p2 - p1
          // Cdot = v2 - v1
          // / = v2 + cross(w2, r2) - v1 - cross(w1, r1)
          // J = [-I -r1_skew I r2_skew ]
          // Identity used:
          // w k % (rx i + ry j) = w * (-ry i + rx j)
          // Angle constraint
          // C = angle2 - angle1 - referenceAngle
          // Cdot = w2 - w1
          // J = [0 0 -1 0 0 1]
          // K = invI1 + invI2
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              frequencyHz: this.m_frequencyHz,
              dampingRatio: this.m_dampingRatio,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              referenceAngle: this.m_referenceAngle,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new WeldJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (def.anchorA) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          else if (def.localAnchorA) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          if (def.anchorB) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          else if (def.localAnchorB) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          if (Number.isFinite(def.frequencyHz)) {
              this.m_frequencyHz = def.frequencyHz;
          }
          if (Number.isFinite(def.dampingRatio)) {
              this.m_dampingRatio = def.dampingRatio;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * Get the reference angle.
       */
      getReferenceAngle() {
          return this.m_referenceAngle;
      }
      /**
       * Set frequency in Hz.
       */
      setFrequency(hz) {
          this.m_frequencyHz = hz;
      }
      /**
       * Get frequency in Hz.
       */
      getFrequency() {
          return this.m_frequencyHz;
      }
      /**
       * Set damping ratio.
       */
      setDampingRatio(ratio) {
          this.m_dampingRatio = ratio;
      }
      /**
       * Get damping ratio.
       */
      getDampingRatio() {
          return this.m_dampingRatio;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          return create$2(this.m_impulse[0] * inv_dt, this.m_impulse[1] * inv_dt);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * this.m_impulse[2];
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          this.m_rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          this.m_rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          // J = [-I -r1_skew I r2_skew]
          // [ 0 -1 0 1]
          // r_skew = [-ry; rx]
          // Matlab
          // K = [ mA+r1y^2*iA+mB+r2y^2*iB, -r1y*iA*r1x-r2y*iB*r2x, -r1y*iA-r2y*iB]
          // [ -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB, r1x*iA+r2x*iB]
          // [ -r1y*iA-r2y*iB, r1x*iA+r2x*iB, iA+iB]
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const K = new Mat33();
          K.ex[0] = mA + mB + this.m_rA[1] * this.m_rA[1] * iA + this.m_rB[1] * this.m_rB[1]
              * iB;
          K.ey[0] = -this.m_rA[1] * this.m_rA[0] * iA - this.m_rB[1] * this.m_rB[0] * iB;
          K.ez[0] = -this.m_rA[1] * iA - this.m_rB[1] * iB;
          K.ex[1] = K.ey[0];
          K.ey[1] = mA + mB + this.m_rA[0] * this.m_rA[0] * iA + this.m_rB[0] * this.m_rB[0]
              * iB;
          K.ez[1] = this.m_rA[0] * iA + this.m_rB[0] * iB;
          K.ex[2] = K.ez[0];
          K.ey[2] = K.ez[1];
          K.ez[2] = iA + iB;
          if (this.m_frequencyHz > 0.0) {
              K.getInverse22(this.m_mass);
              let invM = iA + iB;
              const m = invM > 0.0 ? 1.0 / invM : 0.0;
              const C = aB - aA - this.m_referenceAngle;
              // Frequency
              const omega = 2.0 * math_PI$2 * this.m_frequencyHz;
              // Damping coefficient
              const d = 2.0 * m * this.m_dampingRatio * omega;
              // Spring stiffness
              const k = m * omega * omega;
              // magic formulas
              const h = step.dt;
              this.m_gamma = h * (d + h * k);
              this.m_gamma = this.m_gamma != 0.0 ? 1.0 / this.m_gamma : 0.0;
              this.m_bias = C * h * k * this.m_gamma;
              invM += this.m_gamma;
              this.m_mass.ez[2] = invM != 0.0 ? 1.0 / invM : 0.0;
          }
          else if (K.ez[2] == 0.0) {
              K.getInverse22(this.m_mass);
              this.m_gamma = 0.0;
              this.m_bias = 0.0;
          }
          else {
              K.getSymInverse33(this.m_mass);
              this.m_gamma = 0.0;
              this.m_bias = 0.0;
          }
          if (step.warmStarting) {
              // Scale impulses to support a variable time step.
              set(this.m_impulse[0] * step.dtRatio, this.m_impulse[1] * step.dtRatio, this.m_impulse[2], this.m_impulse);
              const P = create$2(this.m_impulse[0], this.m_impulse[1]);
              subMul(vA, mA, P, vA);
              wA -= iA * (crossVec2Vec2$1(this.m_rA, P) + this.m_impulse[2]);
              addMul(vB, mB, P, vB);
              wB += iB * (crossVec2Vec2$1(this.m_rB, P) + this.m_impulse[2]);
          }
          else {
              setZero(this.m_impulse);
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          if (this.m_frequencyHz > 0.0) {
              const Cdot2 = wB - wA;
              const impulse2 = -this.m_mass.ez[2] * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse[2]);
              this.m_impulse[2] += impulse2;
              wA -= iA * impulse2;
              wB += iB * impulse2;
              const Cdot1 = zero$1();
              addCombine(Cdot1, 1, vB, 1, crossNumVec2$1(wB, this.m_rB), Cdot1);
              subCombine(Cdot1, 1, vA, 1, crossNumVec2$1(wA, this.m_rA), Cdot1);
              const impulse1 = neg$1(Mat33.mulVec2(this.m_mass, Cdot1));
              this.m_impulse[0] += impulse1[0];
              this.m_impulse[1] += impulse1[1];
              const P = clone$1(impulse1);
              subMul(vA, mA, P, vA);
              wA -= iA * crossVec2Vec2$1(this.m_rA, P);
              addMul(vB, mB, P, vB);
              wB += iB * crossVec2Vec2$1(this.m_rB, P);
          }
          else {
              const Cdot1 = zero$1();
              addCombine(Cdot1, 1, vB, 1, crossNumVec2$1(wB, this.m_rB), Cdot1);
              subCombine(Cdot1, 1, vA, 1, crossNumVec2$1(wA, this.m_rA), Cdot1);
              const Cdot2 = wB - wA;
              const Cdot = create$1(Cdot1[0], Cdot1[1], Cdot2);
              const impulse = neg(Mat33.mulVec3(this.m_mass, Cdot));
              add(this.m_impulse, impulse, this.m_impulse);
              const P = create$2(impulse[0], impulse[1]);
              subMul(vA, mA, P, vA);
              wA -= iA * (crossVec2Vec2$1(this.m_rA, P) + impulse[2]);
              addMul(vB, mB, P, vB);
              wB += iB * (crossVec2Vec2$1(this.m_rB, P) + impulse[2]);
          }
          this.m_bodyA.c_velocity.v = vA;
          this.m_bodyA.c_velocity.w = wA;
          this.m_bodyB.c_velocity.v = vB;
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          let positionError;
          let angularError;
          const K = new Mat33();
          K.ex[0] = mA + mB + rA[1] * rA[1] * iA + rB[1] * rB[1] * iB;
          K.ey[0] = -rA[1] * rA[0] * iA - rB[1] * rB[0] * iB;
          K.ez[0] = -rA[1] * iA - rB[1] * iB;
          K.ex[1] = K.ey[0];
          K.ey[1] = mA + mB + rA[0] * rA[0] * iA + rB[0] * rB[0] * iB;
          K.ez[1] = rA[0] * iA + rB[0] * iB;
          K.ex[2] = K.ez[0];
          K.ey[2] = K.ez[1];
          K.ez[2] = iA + iB;
          if (this.m_frequencyHz > 0.0) {
              const C1 = zero$1();
              addCombine(C1, 1, cB, 1, rB, C1);
              subCombine(C1, 1, cA, 1, rA, C1);
              positionError = length$1(C1);
              angularError = 0.0;
              const P = neg$1(K.solve22(C1));
              subMul(cA, mA, P, cA);
              aA -= iA * crossVec2Vec2$1(rA, P);
              addMul(cB, mB, P, cB);
              aB += iB * crossVec2Vec2$1(rB, P);
          }
          else {
              const C1 = zero$1();
              addCombine(C1, 1, cB, 1, rB, C1);
              subCombine(C1, 1, cA, 1, rA, C1);
              const C2 = aB - aA - this.m_referenceAngle;
              positionError = length$1(C1);
              angularError = math_abs$2(C2);
              const C = create$1(C1[0], C1[1], C2);
              let impulse = create$1();
              if (K.ez[2] > 0.0) {
                  impulse = neg(K.solve33(C));
              }
              else {
                  const impulse2 = neg$1(K.solve22(C1));
                  set(impulse2[0], impulse2[1], 0.0, impulse);
              }
              const P = create$2(impulse[0], impulse[1]);
              subMul(cA, mA, P, cA);
              aA -= iA * (crossVec2Vec2$1(rA, P) + impulse[2]);
              addMul(cB, mB, P, cB);
              aB += iB * (crossVec2Vec2$1(rB, P) + impulse[2]);
          }
          this.m_bodyA.c_position.c = cA;
          this.m_bodyA.c_position.a = aA;
          this.m_bodyB.c_position.c = cB;
          this.m_bodyB.c_position.a = aB;
          return positionError <= SettingsInternal.linearSlop && angularError <= SettingsInternal.angularSlop;
      }
  }
  WeldJoint.TYPE = 'weld-joint';

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
  /** @internal */ const math_abs$1 = Math.abs;
  /** @internal */ const math_PI$1 = Math.PI;
  /** @internal */ const DEFAULTS = {
      enableMotor: false,
      maxMotorTorque: 0.0,
      motorSpeed: 0.0,
      frequencyHz: 2.0,
      dampingRatio: 0.7,
  };
  /**
   * A wheel joint. This joint provides two degrees of freedom: translation along
   * an axis fixed in bodyA and rotation in the plane. In other words, it is a
   * point to line constraint with a rotational motor and a linear spring/damper.
   * This joint is designed for vehicle suspensions.
   */
  class WheelJoint extends Joint {
      constructor(def, bodyA, bodyB, anchor, axis) {
          def = options(def, DEFAULTS);
          super(def, bodyA, bodyB);
          bodyA = this.m_bodyA;
          bodyB = this.m_bodyB;
          this.m_ax = zero$1();
          this.m_ay = zero$1();
          this.m_type = WheelJoint.TYPE;
          this.m_localAnchorA = clone$1(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || zero$1());
          this.m_localAnchorB = clone$1(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || zero$1());
          if (isValid$1(axis)) {
              this.m_localXAxisA = bodyA.getLocalVector(axis);
          }
          else if (isValid$1(def.localAxisA)) {
              this.m_localXAxisA = clone$1(def.localAxisA);
          }
          else if (isValid$1(def.localAxis)) {
              // localAxis is renamed to localAxisA, this is for backward compatibility
              this.m_localXAxisA = clone$1(def.localAxis);
          }
          else {
              this.m_localXAxisA = create$2(1.0, 0.0);
          }
          this.m_localYAxisA = crossNumVec2$1(1.0, this.m_localXAxisA);
          this.m_mass = 0.0;
          this.m_impulse = 0.0;
          this.m_motorMass = 0.0;
          this.m_motorImpulse = 0.0;
          this.m_springMass = 0.0;
          this.m_springImpulse = 0.0;
          this.m_maxMotorTorque = def.maxMotorTorque;
          this.m_motorSpeed = def.motorSpeed;
          this.m_enableMotor = def.enableMotor;
          this.m_frequencyHz = def.frequencyHz;
          this.m_dampingRatio = def.dampingRatio;
          this.m_bias = 0.0;
          this.m_gamma = 0.0;
          // Linear constraint (point-to-line)
          // d = pB - pA = xB + rB - xA - rA
          // C = dot(ay, d)
          // Cdot = dot(d, cross(wA, ay)) + dot(ay, vB + cross(wB, rB) - vA - cross(wA,
          // rA))
          // = -dot(ay, vA) - dot(cross(d + rA, ay), wA) + dot(ay, vB) + dot(cross(rB,
          // ay), vB)
          // J = [-ay, -cross(d + rA, ay), ay, cross(rB, ay)]
          // Spring linear constraint
          // C = dot(ax, d)
          // Cdot = = -dot(ax, vA) - dot(cross(d + rA, ax), wA) + dot(ax, vB) +
          // dot(cross(rB, ax), vB)
          // J = [-ax -cross(d+rA, ax) ax cross(rB, ax)]
          // Motor rotational constraint
          // Cdot = wB - wA
          // J = [0 0 -1 0 0 1]
      }
      /** @internal */
      _serialize() {
          return {
              type: this.m_type,
              bodyA: this.m_bodyA,
              bodyB: this.m_bodyB,
              collideConnected: this.m_collideConnected,
              enableMotor: this.m_enableMotor,
              maxMotorTorque: this.m_maxMotorTorque,
              motorSpeed: this.m_motorSpeed,
              frequencyHz: this.m_frequencyHz,
              dampingRatio: this.m_dampingRatio,
              localAnchorA: this.m_localAnchorA,
              localAnchorB: this.m_localAnchorB,
              localAxisA: this.m_localXAxisA,
          };
      }
      /** @internal */
      static _deserialize(data, world, restore) {
          data = Object.assign({}, data);
          data.bodyA = restore(Body, data.bodyA, world);
          data.bodyB = restore(Body, data.bodyB, world);
          const joint = new WheelJoint(data);
          return joint;
      }
      /** @hidden */
      _reset(def) {
          if (def.anchorA) {
              copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
          }
          else if (def.localAnchorA) {
              copy(def.localAnchorA, this.m_localAnchorA);
          }
          if (def.anchorB) {
              copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
          }
          else if (def.localAnchorB) {
              copy(def.localAnchorB, this.m_localAnchorB);
          }
          if (def.localAxisA) {
              copy(def.localAxisA, this.m_localXAxisA);
              copy(crossNumVec2$1(1.0, def.localAxisA), this.m_localYAxisA);
          }
          if (def.enableMotor !== undefined) {
              this.m_enableMotor = def.enableMotor;
          }
          if (Number.isFinite(def.maxMotorTorque)) {
              this.m_maxMotorTorque = def.maxMotorTorque;
          }
          if (Number.isFinite(def.motorSpeed)) {
              this.m_motorSpeed = def.motorSpeed;
          }
          if (Number.isFinite(def.frequencyHz)) {
              this.m_frequencyHz = def.frequencyHz;
          }
          if (Number.isFinite(def.dampingRatio)) {
              this.m_dampingRatio = def.dampingRatio;
          }
      }
      /**
       * The local anchor point relative to bodyA's origin.
       */
      getLocalAnchorA() {
          return this.m_localAnchorA;
      }
      /**
       * The local anchor point relative to bodyB's origin.
       */
      getLocalAnchorB() {
          return this.m_localAnchorB;
      }
      /**
       * The local joint axis relative to bodyA.
       */
      getLocalAxisA() {
          return this.m_localXAxisA;
      }
      /**
       * Get the current joint translation, usually in meters.
       */
      getJointTranslation() {
          const bA = this.m_bodyA;
          const bB = this.m_bodyB;
          const pA = bA.getWorldPoint(this.m_localAnchorA);
          const pB = bB.getWorldPoint(this.m_localAnchorB);
          const d = sub$1(pB, pA);
          const axis = bA.getWorldVector(this.m_localXAxisA);
          const translation = dot$1(d, axis);
          return translation;
      }
      /**
       * Get the current joint translation speed, usually in meters per second.
       */
      getJointSpeed() {
          const wA = this.m_bodyA.m_angularVelocity;
          const wB = this.m_bodyB.m_angularVelocity;
          return wB - wA;
      }
      /**
       * Is the joint motor enabled?
       */
      isMotorEnabled() {
          return this.m_enableMotor;
      }
      /**
       * Enable/disable the joint motor.
       */
      enableMotor(flag) {
          if (flag == this.m_enableMotor)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_enableMotor = flag;
      }
      /**
       * Set the motor speed, usually in radians per second.
       */
      setMotorSpeed(speed) {
          if (speed == this.m_motorSpeed)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_motorSpeed = speed;
      }
      /**
       * Get the motor speed, usually in radians per second.
       */
      getMotorSpeed() {
          return this.m_motorSpeed;
      }
      /**
       * Set/Get the maximum motor force, usually in N-m.
       */
      setMaxMotorTorque(torque) {
          if (torque == this.m_maxMotorTorque)
              return;
          this.m_bodyA.setAwake(true);
          this.m_bodyB.setAwake(true);
          this.m_maxMotorTorque = torque;
      }
      getMaxMotorTorque() {
          return this.m_maxMotorTorque;
      }
      /**
       * Get the current motor torque given the inverse time step, usually in N-m.
       */
      getMotorTorque(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      /**
       * Set/Get the spring frequency in hertz. Setting the frequency to zero disables
       * the spring.
       */
      setSpringFrequencyHz(hz) {
          this.m_frequencyHz = hz;
      }
      getSpringFrequencyHz() {
          return this.m_frequencyHz;
      }
      /**
       * Set/Get the spring damping ratio
       */
      setSpringDampingRatio(ratio) {
          this.m_dampingRatio = ratio;
      }
      getSpringDampingRatio() {
          return this.m_dampingRatio;
      }
      /**
       * Get the anchor point on bodyA in world coordinates.
       */
      getAnchorA() {
          return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
      }
      /**
       * Get the anchor point on bodyB in world coordinates.
       */
      getAnchorB() {
          return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
      }
      /**
       * Get the reaction force on bodyB at the joint anchor in Newtons.
       */
      getReactionForce(inv_dt) {
          const f = combine(this.m_impulse, this.m_ay, this.m_springImpulse, this.m_ax);
          return scale$1(f, inv_dt, f);
      }
      /**
       * Get the reaction torque on bodyB in N*m.
       */
      getReactionTorque(inv_dt) {
          return inv_dt * this.m_motorImpulse;
      }
      initVelocityConstraints(step) {
          this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
          this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
          this.m_invMassA = this.m_bodyA.m_invMass;
          this.m_invMassB = this.m_bodyB.m_invMass;
          this.m_invIA = this.m_bodyA.m_invI;
          this.m_invIB = this.m_bodyB.m_invI;
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const cA = this.m_bodyA.c_position.c;
          const aA = this.m_bodyA.c_position.a;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const cB = this.m_bodyB.c_position.c;
          const aB = this.m_bodyB.c_position.a;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          // Compute the effective masses.
          const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          const d = zero$1();
          addCombine(d, 1, cB, 1, rB, d);
          subCombine(d, 1, cA, 1, rA, d);
          // Point to line constraint
          {
              this.m_ay = Rot.mulVec2(qA, this.m_localYAxisA);
              this.m_sAy = crossVec2Vec2$1(add$1(d, rA), this.m_ay);
              this.m_sBy = crossVec2Vec2$1(rB, this.m_ay);
              this.m_mass = mA + mB + iA * this.m_sAy * this.m_sAy + iB * this.m_sBy
                  * this.m_sBy;
              if (this.m_mass > 0.0) {
                  this.m_mass = 1.0 / this.m_mass;
              }
          }
          // Spring constraint
          this.m_springMass = 0.0;
          this.m_bias = 0.0;
          this.m_gamma = 0.0;
          if (this.m_frequencyHz > 0.0) {
              this.m_ax = Rot.mulVec2(qA, this.m_localXAxisA);
              this.m_sAx = crossVec2Vec2$1(add$1(d, rA), this.m_ax);
              this.m_sBx = crossVec2Vec2$1(rB, this.m_ax);
              const invMass = mA + mB + iA * this.m_sAx * this.m_sAx + iB * this.m_sBx
                  * this.m_sBx;
              if (invMass > 0.0) {
                  this.m_springMass = 1.0 / invMass;
                  const C = dot$1(d, this.m_ax);
                  // Frequency
                  const omega = 2.0 * math_PI$1 * this.m_frequencyHz;
                  // Damping coefficient
                  const damp = 2.0 * this.m_springMass * this.m_dampingRatio * omega;
                  // Spring stiffness
                  const k = this.m_springMass * omega * omega;
                  // magic formulas
                  const h = step.dt;
                  this.m_gamma = h * (damp + h * k);
                  if (this.m_gamma > 0.0) {
                      this.m_gamma = 1.0 / this.m_gamma;
                  }
                  this.m_bias = C * h * k * this.m_gamma;
                  this.m_springMass = invMass + this.m_gamma;
                  if (this.m_springMass > 0.0) {
                      this.m_springMass = 1.0 / this.m_springMass;
                  }
              }
          }
          else {
              this.m_springImpulse = 0.0;
          }
          // Rotational motor
          if (this.m_enableMotor) {
              this.m_motorMass = iA + iB;
              if (this.m_motorMass > 0.0) {
                  this.m_motorMass = 1.0 / this.m_motorMass;
              }
          }
          else {
              this.m_motorMass = 0.0;
              this.m_motorImpulse = 0.0;
          }
          if (step.warmStarting) {
              // Account for variable time step.
              this.m_impulse *= step.dtRatio;
              this.m_springImpulse *= step.dtRatio;
              this.m_motorImpulse *= step.dtRatio;
              const P = combine(this.m_impulse, this.m_ay, this.m_springImpulse, this.m_ax);
              const LA = this.m_impulse * this.m_sAy + this.m_springImpulse * this.m_sAx + this.m_motorImpulse;
              const LB = this.m_impulse * this.m_sBy + this.m_springImpulse * this.m_sBx + this.m_motorImpulse;
              subMul(vA, this.m_invMassA, P, vA);
              wA -= this.m_invIA * LA;
              addMul(vB, this.m_invMassB, P, vB);
              wB += this.m_invIB * LB;
          }
          else {
              this.m_impulse = 0.0;
              this.m_springImpulse = 0.0;
              this.m_motorImpulse = 0.0;
          }
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
      }
      solveVelocityConstraints(step) {
          const mA = this.m_invMassA;
          const mB = this.m_invMassB;
          const iA = this.m_invIA;
          const iB = this.m_invIB;
          const vA = this.m_bodyA.c_velocity.v;
          let wA = this.m_bodyA.c_velocity.w;
          const vB = this.m_bodyB.c_velocity.v;
          let wB = this.m_bodyB.c_velocity.w;
          // Solve spring constraint
          {
              const Cdot = dot$1(this.m_ax, vB) - dot$1(this.m_ax, vA) + this.m_sBx * wB - this.m_sAx * wA;
              const impulse = -this.m_springMass * (Cdot + this.m_bias + this.m_gamma * this.m_springImpulse);
              this.m_springImpulse += impulse;
              const P = mulNumVec2(impulse, this.m_ax);
              const LA = impulse * this.m_sAx;
              const LB = impulse * this.m_sBx;
              subMul(vA, mA, P, vA);
              wA -= iA * LA;
              addMul(vB, mB, P, vB);
              wB += iB * LB;
          }
          // Solve rotational motor constraint
          {
              const Cdot = wB - wA - this.m_motorSpeed;
              let impulse = -this.m_motorMass * Cdot;
              const oldImpulse = this.m_motorImpulse;
              const maxImpulse = step.dt * this.m_maxMotorTorque;
              this.m_motorImpulse = clamp$2(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
              impulse = this.m_motorImpulse - oldImpulse;
              wA -= iA * impulse;
              wB += iB * impulse;
          }
          // Solve point to line constraint
          {
              const Cdot = dot$1(this.m_ay, vB) - dot$1(this.m_ay, vA) + this.m_sBy * wB - this.m_sAy * wA;
              const impulse = -this.m_mass * Cdot;
              this.m_impulse += impulse;
              const P = mulNumVec2(impulse, this.m_ay);
              const LA = impulse * this.m_sAy;
              const LB = impulse * this.m_sBy;
              subMul(vA, mA, P, vA);
              wA -= iA * LA;
              addMul(vB, mB, P, vB);
              wB += iB * LB;
          }
          copy(vA, this.m_bodyA.c_velocity.v);
          this.m_bodyA.c_velocity.w = wA;
          copy(vB, this.m_bodyB.c_velocity.v);
          this.m_bodyB.c_velocity.w = wB;
      }
      /**
       * This returns true if the position errors are within tolerance.
       */
      solvePositionConstraints(step) {
          const cA = this.m_bodyA.c_position.c;
          let aA = this.m_bodyA.c_position.a;
          const cB = this.m_bodyB.c_position.c;
          let aB = this.m_bodyB.c_position.a;
          const qA = Rot.neo(aA);
          const qB = Rot.neo(aB);
          const rA = Rot.mulVec2(qA, sub$1(this.m_localAnchorA, this.m_localCenterA));
          const rB = Rot.mulVec2(qB, sub$1(this.m_localAnchorB, this.m_localCenterB));
          const d = zero$1();
          addCombine(d, 1, cB, 1, rB, d);
          subCombine(d, 1, cA, 1, rA, d);
          const ay = Rot.mulVec2(qA, this.m_localYAxisA);
          const sAy = crossVec2Vec2$1(add$1(d, rA), ay);
          const sBy = crossVec2Vec2$1(rB, ay);
          const C = dot$1(d, ay);
          const k = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_sAy * this.m_sAy + this.m_invIB * this.m_sBy * this.m_sBy;
          const impulse = k != 0.0 ? -C / k : 0.0;
          const P = mulNumVec2(impulse, ay);
          const LA = impulse * sAy;
          const LB = impulse * sBy;
          subMul(cA, this.m_invMassA, P, cA);
          aA -= this.m_invIA * LA;
          addMul(cB, this.m_invMassB, P, cB);
          aB += this.m_invIB * LB;
          copy(cA, this.m_bodyA.c_position.c);
          this.m_bodyA.c_position.a = aA;
          copy(cB, this.m_bodyB.c_position.c);
          this.m_bodyB.c_position.a = aB;
          return math_abs$1(C) <= SettingsInternal.linearSlop;
      }
  }
  WheelJoint.TYPE = 'wheel-joint';

  /** @deprecated Merged with main namespace */
  const internal = {
      CollidePolygons,
      Settings,
      Sweep,
      Manifold,
      Distance,
      TimeOfImpact,
      DynamicTree,
      stats: stats$1
  };

  /**
   * Stage.js 1.0.0-alpha.5
   *
   * @copyright Copyright (c) 2024 Ali Shakiba
   * @license The MIT License (MIT)
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
  var math_random = Math.random;
  var math_sqrt$1 = Math.sqrt;
  function random(min, max) {
    if (typeof min === "undefined") {
      max = 1;
      min = 0;
    } else if (typeof max === "undefined") {
      max = min;
      min = 0;
    }
    return min == max ? min : math_random() * (max - min) + min;
  }
  function wrap(num, min, max) {
    if (typeof min === "undefined") {
      max = 1;
      min = 0;
    } else if (typeof max === "undefined") {
      max = min;
      min = 0;
    }
    if (max > min) {
      num = (num - min) % (max - min);
      return num + (num < 0 ? max : min);
    } else {
      num = (num - max) % (min - max);
      return num + (num <= 0 ? min : max);
    }
  }
  function clamp(num, min, max) {
    if (num < min) {
      return min;
    } else if (num > max) {
      return max;
    } else {
      return num;
    }
  }
  function length(x, y) {
    return math_sqrt$1(x * x + y * y);
  }
  var math = Object.create(Math);
  math.random = random;
  math.wrap = wrap;
  math.clamp = clamp;
  math.length = length;
  math.rotate = wrap;
  math.limit = clamp;
  var Matrix = (
    /** @class */
    function() {
      function Matrix2(a, b, c, d, e, f) {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
        if (typeof a === "object") {
          this.reset(a);
        } else {
          this.reset(a, b, c, d, e, f);
        }
      }
      Matrix2.prototype.toString = function() {
        return "[" + this.a + ", " + this.b + ", " + this.c + ", " + this.d + ", " + this.e + ", " + this.f + "]";
      };
      Matrix2.prototype.clone = function() {
        return new Matrix2(this.a, this.b, this.c, this.d, this.e, this.f);
      };
      Matrix2.prototype.reset = function(a, b, c, d, e, f) {
        this._dirty = true;
        if (typeof a === "object") {
          this.a = a.a;
          this.d = a.d;
          this.b = a.b;
          this.c = a.c;
          this.e = a.e;
          this.f = a.f;
        } else {
          this.a = typeof a === "number" ? a : 1;
          this.b = typeof b === "number" ? b : 0;
          this.c = typeof c === "number" ? c : 0;
          this.d = typeof d === "number" ? d : 1;
          this.e = typeof e === "number" ? e : 0;
          this.f = typeof f === "number" ? f : 0;
        }
        return this;
      };
      Matrix2.prototype.identity = function() {
        this._dirty = true;
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
        return this;
      };
      Matrix2.prototype.rotate = function(angle) {
        if (!angle) {
          return this;
        }
        this._dirty = true;
        var u = angle ? Math.cos(angle) : 1;
        var v = angle ? Math.sin(angle) : 0;
        var a = u * this.a - v * this.b;
        var b = u * this.b + v * this.a;
        var c = u * this.c - v * this.d;
        var d = u * this.d + v * this.c;
        var e = u * this.e - v * this.f;
        var f = u * this.f + v * this.e;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
      };
      Matrix2.prototype.translate = function(x, y) {
        if (!x && !y) {
          return this;
        }
        this._dirty = true;
        this.e += x;
        this.f += y;
        return this;
      };
      Matrix2.prototype.scale = function(x, y) {
        if (!(x - 1) && !(y - 1)) {
          return this;
        }
        this._dirty = true;
        this.a *= x;
        this.b *= y;
        this.c *= x;
        this.d *= y;
        this.e *= x;
        this.f *= y;
        return this;
      };
      Matrix2.prototype.skew = function(x, y) {
        if (!x && !y) {
          return this;
        }
        this._dirty = true;
        var a = this.a + this.b * x;
        var b = this.b + this.a * y;
        var c = this.c + this.d * x;
        var d = this.d + this.c * y;
        var e = this.e + this.f * x;
        var f = this.f + this.e * y;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
      };
      Matrix2.prototype.concat = function(m) {
        this._dirty = true;
        var a = this.a * m.a + this.b * m.c;
        var b = this.b * m.d + this.a * m.b;
        var c = this.c * m.a + this.d * m.c;
        var d = this.d * m.d + this.c * m.b;
        var e = this.e * m.a + m.e + this.f * m.c;
        var f = this.f * m.d + m.f + this.e * m.b;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
      };
      Matrix2.prototype.inverse = function() {
        if (this._dirty) {
          this._dirty = false;
          if (!this.inverted) {
            this.inverted = new Matrix2();
          }
          var z = this.a * this.d - this.b * this.c;
          this.inverted.a = this.d / z;
          this.inverted.b = -this.b / z;
          this.inverted.c = -this.c / z;
          this.inverted.d = this.a / z;
          this.inverted.e = (this.c * this.f - this.e * this.d) / z;
          this.inverted.f = (this.e * this.b - this.a * this.f) / z;
        }
        return this.inverted;
      };
      Matrix2.prototype.map = function(p, q) {
        q = q || { x: 0, y: 0 };
        q.x = this.a * p.x + this.c * p.y + this.e;
        q.y = this.b * p.x + this.d * p.y + this.f;
        return q;
      };
      Matrix2.prototype.mapX = function(x, y) {
        if (typeof x === "object") {
          y = x.y;
          x = x.x;
        }
        return this.a * x + this.c * y + this.e;
      };
      Matrix2.prototype.mapY = function(x, y) {
        if (typeof x === "object") {
          y = x.y;
          x = x.x;
        }
        return this.b * x + this.d * y + this.f;
      };
      return Matrix2;
    }()
  );
  var objectToString = Object.prototype.toString;
  function isFn(value) {
    var str = objectToString.call(value);
    return str === "[object Function]" || str === "[object GeneratorFunction]" || str === "[object AsyncFunction]";
  }
  function isHash(value) {
    return objectToString.call(value) === "[object Object]" && value.constructor === Object;
  }
  const stats = {
    create: 0,
    tick: 0,
    node: 0,
    draw: 0,
    fps: 0
  };
  var uid = function() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };
  var Texture = (
    /** @class */
    function() {
      function Texture2() {
        this.uid = "texture:" + uid();
        this.sx = 0;
        this.sy = 0;
        this.dx = 0;
        this.dy = 0;
      }
      Texture2.prototype.setSourceCoordinate = function(x, y) {
        this.sx = x;
        this.sy = y;
      };
      Texture2.prototype.setSourceDimension = function(w, h) {
        this.sw = w;
        this.sh = h;
      };
      Texture2.prototype.setDestinationCoordinate = function(x, y) {
        this.dx = x;
        this.dy = y;
      };
      Texture2.prototype.setDestinationDimension = function(w, h) {
        this.dw = w;
        this.dh = h;
      };
      Texture2.prototype.draw = function(context, x1, y1, w1, h1, x2, y2, w2, h2) {
        var sx = this.sx;
        var sy = this.sy;
        var sw = this.sw;
        var sh = this.sh;
        var dx = this.dx;
        var dy = this.dy;
        var dw = this.dw;
        var dh = this.dh;
        if (typeof x1 === "number" || typeof y1 === "number" || typeof w1 === "number" || typeof h1 === "number" || typeof x2 === "number" || typeof y2 === "number" || typeof w2 === "number" || typeof h2 === "number") {
          if (typeof x2 === "number" || typeof y2 === "number" || typeof w2 === "number" || typeof h2 === "number") {
            sx += x1;
            sy += y1;
            sw = w1 !== null && w1 !== void 0 ? w1 : sw;
            sh = h1 !== null && h1 !== void 0 ? h1 : sh;
            dx += x2;
            dy += y2;
            dw = w2 !== null && w2 !== void 0 ? w2 : dw;
            dh = h2 !== null && h2 !== void 0 ? h2 : dh;
          } else {
            dx += x1;
            dy += y1;
            dw = w1;
            dh = h1;
          }
        }
        this.drawWithNormalizedArgs(context, sx, sy, sw, sh, dx, dy, dw, dh);
      };
      return Texture2;
    }()
  );
  var __extends$9 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var ImageTexture = (
    /** @class */
    function(_super) {
      __extends$9(ImageTexture2, _super);
      function ImageTexture2(source, pixelRatio) {
        var _this = _super.call(this) || this;
        _this._pixelRatio = 1;
        if (typeof source === "object") {
          _this.setSourceImage(source, pixelRatio);
        }
        return _this;
      }
      ImageTexture2.prototype.setSourceImage = function(image2, pixelRatio) {
        if (pixelRatio === void 0) {
          pixelRatio = 1;
        }
        this._source = image2;
        this._pixelRatio = pixelRatio;
      };
      ImageTexture2.prototype.getWidth = function() {
        return this._source.width / this._pixelRatio;
      };
      ImageTexture2.prototype.getHeight = function() {
        return this._source.height / this._pixelRatio;
      };
      ImageTexture2.prototype.prerender = function(context) {
        return false;
      };
      ImageTexture2.prototype.drawWithNormalizedArgs = function(context, sx, sy, sw, sh, dx, dy, dw, dh) {
        var image2 = this._source;
        if (image2 === null || typeof image2 !== "object") {
          return;
        }
        sw = sw !== null && sw !== void 0 ? sw : this.getWidth();
        sh = sh !== null && sh !== void 0 ? sh : this.getHeight();
        dw = dw !== null && dw !== void 0 ? dw : sw;
        dh = dh !== null && dh !== void 0 ? dh : sh;
        sx *= this._pixelRatio;
        sy *= this._pixelRatio;
        sw *= this._pixelRatio;
        sh *= this._pixelRatio;
        try {
          stats.draw++;
          context.drawImage(image2, sx, sy, sw, sh, dx, dy, dw, dh);
        } catch (ex) {
          if (!this._draw_failed) {
            console.log("Unable to draw: ", image2);
            console.log(ex);
            this._draw_failed = true;
          }
        }
      };
      return ImageTexture2;
    }(Texture)
  );
  var __extends$8 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var PipeTexture = (
    /** @class */
    function(_super) {
      __extends$8(PipeTexture2, _super);
      function PipeTexture2(source) {
        var _this = _super.call(this) || this;
        _this._source = source;
        return _this;
      }
      PipeTexture2.prototype.setSourceTexture = function(texture2) {
        this._source = texture2;
      };
      PipeTexture2.prototype.getWidth = function() {
        var _a, _b;
        return (_b = (_a = this.dw) !== null && _a !== void 0 ? _a : this.sw) !== null && _b !== void 0 ? _b : this._source.getWidth();
      };
      PipeTexture2.prototype.getHeight = function() {
        var _a, _b;
        return (_b = (_a = this.dh) !== null && _a !== void 0 ? _a : this.sh) !== null && _b !== void 0 ? _b : this._source.getHeight();
      };
      PipeTexture2.prototype.prerender = function(context) {
        return this._source.prerender(context);
      };
      PipeTexture2.prototype.drawWithNormalizedArgs = function(context, sx, sy, sw, sh, dx, dy, dw, dh) {
        var texture2 = this._source;
        if (texture2 === null || typeof texture2 !== "object") {
          return;
        }
        texture2.draw(context, sx, sy, sw, sh, dx, dy, dw, dh);
      };
      return PipeTexture2;
    }(Texture)
  );
  var __extends$7 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var __awaiter$1 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator$1 = function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
  var Atlas = (
    /** @class */
    function(_super) {
      __extends$7(Atlas2, _super);
      function Atlas2(def) {
        if (def === void 0) {
          def = {};
        }
        var _this = _super.call(this) || this;
        _this.pipeSpriteTexture = function(def2) {
          var map = _this._map;
          var ppu = _this._ppu;
          var trim = _this._trim;
          if (!def2) {
            return void 0;
          }
          def2 = Object.assign({}, def2);
          if (isFn(map)) {
            def2 = map(def2);
          }
          if (ppu != 1) {
            def2.x *= ppu;
            def2.y *= ppu;
            def2.width *= ppu;
            def2.height *= ppu;
            def2.top *= ppu;
            def2.bottom *= ppu;
            def2.left *= ppu;
            def2.right *= ppu;
          }
          if (trim != 0) {
            def2.x += trim;
            def2.y += trim;
            def2.width -= 2 * trim;
            def2.height -= 2 * trim;
            def2.top -= trim;
            def2.bottom -= trim;
            def2.left -= trim;
            def2.right -= trim;
          }
          var texture2 = new PipeTexture(_this);
          texture2.top = def2.top;
          texture2.bottom = def2.bottom;
          texture2.left = def2.left;
          texture2.right = def2.right;
          texture2.setSourceCoordinate(def2.x, def2.y);
          texture2.setSourceDimension(def2.width, def2.height);
          return texture2;
        };
        _this.findSpriteDefinition = function(query) {
          var textures = _this._textures;
          if (textures) {
            if (isFn(textures)) {
              return textures(query);
            } else if (isHash(textures)) {
              return textures[query];
            }
          }
        };
        _this.select = function(query) {
          if (!query) {
            return new TextureSelection(new PipeTexture(_this));
          }
          var textureDefinition = _this.findSpriteDefinition(query);
          if (textureDefinition) {
            return new TextureSelection(textureDefinition, _this);
          }
        };
        _this.name = def.name;
        _this._ppu = def.ppu || def.ratio || 1;
        _this._trim = def.trim || 0;
        _this._map = def.map || def.filter;
        _this._textures = def.textures;
        if (typeof def.image === "object" && isHash(def.image)) {
          _this._imageSrc = def.image.src || def.image.url;
          if (typeof def.image.ratio === "number") {
            _this._pixelRatio = def.image.ratio;
          }
        } else {
          if (typeof def.imagePath === "string") {
            _this._imageSrc = def.imagePath;
          } else if (typeof def.image === "string") {
            _this._imageSrc = def.image;
          }
          if (typeof def.imageRatio === "number") {
            _this._pixelRatio = def.imageRatio;
          }
        }
        deprecatedWarning(def);
        return _this;
      }
      Atlas2.prototype.load = function() {
        return __awaiter$1(this, void 0, void 0, function() {
          var image2;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                if (!this._imageSrc)
                  return [3, 2];
                return [4, asyncLoadImage(this._imageSrc)];
              case 1:
                image2 = _a.sent();
                this.setSourceImage(image2, this._pixelRatio);
                _a.label = 2;
              case 2:
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      return Atlas2;
    }(ImageTexture)
  );
  function asyncLoadImage(src) {
    return new Promise(function(resolve, reject) {
      var img = new Image();
      img.onload = function() {
        resolve(img);
      };
      img.onerror = function(error) {
        console.error("Loading failed: " + src);
        reject(error);
      };
      img.src = src;
    });
  }
  function deprecatedWarning(def) {
    if ("filter" in def)
      console.warn("'filter' field of atlas definition is deprecated");
    if ("cutouts" in def)
      console.warn("'cutouts' field of atlas definition is deprecated");
    if ("sprites" in def)
      console.warn("'sprites' field of atlas definition is deprecated");
    if ("factory" in def)
      console.warn("'factory' field of atlas definition is deprecated");
    if ("ratio" in def)
      console.warn("'ratio' field of atlas definition is deprecated");
    if ("imagePath" in def)
      console.warn("'imagePath' field of atlas definition is deprecated");
    if ("imageRatio" in def)
      console.warn("'imageRatio' field of atlas definition is deprecated");
    if (typeof def.image === "object" && "url" in def.image)
      console.warn("'image.url' field of atlas definition is deprecated");
  }
  var __extends$6 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
  function isAtlasSpriteDefinition(selection) {
    return typeof selection === "object" && isHash(selection) && "number" === typeof selection.width && "number" === typeof selection.height;
  }
  var TextureSelection = (
    /** @class */
    function() {
      function TextureSelection2(selection, atlas2) {
        this.selection = selection;
        this.atlas = atlas2;
      }
      TextureSelection2.prototype.resolve = function(selection, subquery) {
        if (!selection) {
          return NO_TEXTURE;
        } else if (Array.isArray(selection)) {
          return this.resolve(selection[0]);
        } else if (selection instanceof Texture) {
          return selection;
        } else if (isAtlasSpriteDefinition(selection)) {
          if (!this.atlas) {
            return NO_TEXTURE;
          }
          return this.atlas.pipeSpriteTexture(selection);
        } else if (typeof selection === "object" && isHash(selection) && typeof subquery !== "undefined") {
          return this.resolve(selection[subquery]);
        } else if (typeof selection === "function" && isFn(selection)) {
          return this.resolve(selection(subquery));
        } else if (typeof selection === "string") {
          if (!this.atlas) {
            return NO_TEXTURE;
          }
          return this.resolve(this.atlas.findSpriteDefinition(selection));
        }
      };
      TextureSelection2.prototype.one = function(subquery) {
        return this.resolve(this.selection, subquery);
      };
      TextureSelection2.prototype.array = function(arr) {
        var array = Array.isArray(arr) ? arr : [];
        if (Array.isArray(this.selection)) {
          for (var i = 0; i < this.selection.length; i++) {
            array[i] = this.resolve(this.selection[i]);
          }
        } else {
          array[0] = this.resolve(this.selection);
        }
        return array;
      };
      return TextureSelection2;
    }()
  );
  var NO_TEXTURE = new /** @class */
  (function(_super) {
    __extends$6(class_1, _super);
    function class_1() {
      var _this = _super.call(this) || this;
      _this.setSourceDimension(0, 0);
      return _this;
    }
    class_1.prototype.getWidth = function() {
      return 0;
    };
    class_1.prototype.getHeight = function() {
      return 0;
    };
    class_1.prototype.prerender = function(context) {
      return false;
    };
    class_1.prototype.drawWithNormalizedArgs = function(context, sx, sy, sw, sh, dx, dy, dw, dh) {
    };
    class_1.prototype.setSourceCoordinate = function(x, y) {
    };
    class_1.prototype.setSourceDimension = function(w, h) {
    };
    class_1.prototype.setDestinationCoordinate = function(x, y) {
    };
    class_1.prototype.setDestinationDimension = function(w, h) {
    };
    class_1.prototype.draw = function() {
    };
    return class_1;
  }(Texture))();
  var NO_SELECTION = new TextureSelection(NO_TEXTURE);
  var ATLAS_MEMO_BY_NAME = {};
  var ATLAS_ARRAY = [];
  function atlas(def) {
    return __awaiter(this, void 0, Promise, function() {
      var atlas2;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            if (def instanceof Atlas) {
              atlas2 = def;
            } else {
              atlas2 = new Atlas(def);
            }
            if (atlas2.name) {
              ATLAS_MEMO_BY_NAME[atlas2.name] = atlas2;
            }
            ATLAS_ARRAY.push(atlas2);
            return [4, atlas2.load()];
          case 1:
            _a.sent();
            return [2, atlas2];
        }
      });
    });
  }
  function texture(query) {
    if ("string" !== typeof query) {
      return new TextureSelection(query);
    }
    var result = null;
    var colonIndex = query.indexOf(":");
    if (colonIndex > 0 && query.length > colonIndex + 1) {
      var atlas_1 = ATLAS_MEMO_BY_NAME[query.slice(0, colonIndex)];
      result = atlas_1 && atlas_1.select(query.slice(colonIndex + 1));
    }
    if (!result) {
      var atlas_2 = ATLAS_MEMO_BY_NAME[query];
      result = atlas_2 && atlas_2.select();
    }
    if (!result) {
      for (var i = 0; i < ATLAS_ARRAY.length; i++) {
        result = ATLAS_ARRAY[i].select(query);
        if (result) {
          break;
        }
      }
    }
    if (!result) {
      console.error("Texture not found: " + query);
      result = NO_SELECTION;
    }
    return result;
  }
  var __extends$5 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var ResizableTexture = (
    /** @class */
    function(_super) {
      __extends$5(ResizableTexture2, _super);
      function ResizableTexture2(source, mode) {
        var _this = _super.call(this) || this;
        _this._source = source;
        _this._resizeMode = mode;
        return _this;
      }
      ResizableTexture2.prototype.getWidth = function() {
        var _a;
        return (_a = this.dw) !== null && _a !== void 0 ? _a : this._source.getWidth();
      };
      ResizableTexture2.prototype.getHeight = function() {
        var _a;
        return (_a = this.dh) !== null && _a !== void 0 ? _a : this._source.getHeight();
      };
      ResizableTexture2.prototype.prerender = function(context) {
        return false;
      };
      ResizableTexture2.prototype.drawWithNormalizedArgs = function(context, sx, sy, sw, sh, dx, dy, dw, dh) {
        var texture2 = this._source;
        if (texture2 === null || typeof texture2 !== "object") {
          return;
        }
        var outWidth = dw;
        var outHeight = dh;
        var left = Number.isFinite(texture2.left) ? texture2.left : 0;
        var right = Number.isFinite(texture2.right) ? texture2.right : 0;
        var top = Number.isFinite(texture2.top) ? texture2.top : 0;
        var bottom = Number.isFinite(texture2.bottom) ? texture2.bottom : 0;
        var width = texture2.getWidth() - left - right;
        var height = texture2.getHeight() - top - bottom;
        if (!this._innerSize) {
          outWidth = Math.max(outWidth - left - right, 0);
          outHeight = Math.max(outHeight - top - bottom, 0);
        }
        if (top > 0 && left > 0) {
          texture2.draw(context, 0, 0, left, top, 0, 0, left, top);
        }
        if (bottom > 0 && left > 0) {
          texture2.draw(context, 0, height + top, left, bottom, 0, outHeight + top, left, bottom);
        }
        if (top > 0 && right > 0) {
          texture2.draw(context, width + left, 0, right, top, outWidth + left, 0, right, top);
        }
        if (bottom > 0 && right > 0) {
          texture2.draw(context, width + left, height + top, right, bottom, outWidth + left, outHeight + top, right, bottom);
        }
        if (this._resizeMode === "stretch") {
          if (top > 0) {
            texture2.draw(context, left, 0, width, top, left, 0, outWidth, top);
          }
          if (bottom > 0) {
            texture2.draw(context, left, height + top, width, bottom, left, outHeight + top, outWidth, bottom);
          }
          if (left > 0) {
            texture2.draw(context, 0, top, left, height, 0, top, left, outHeight);
          }
          if (right > 0) {
            texture2.draw(context, width + left, top, right, height, outWidth + left, top, right, outHeight);
          }
          texture2.draw(context, left, top, width, height, left, top, outWidth, outHeight);
        } else if (this._resizeMode === "tile") {
          var l = left;
          var r = outWidth;
          var w = void 0;
          while (r > 0) {
            w = Math.min(width, r);
            r -= width;
            var t = top;
            var b = outHeight;
            var h = void 0;
            while (b > 0) {
              h = Math.min(height, b);
              b -= height;
              texture2.draw(context, left, top, w, h, l, t, w, h);
              if (r <= 0) {
                if (left) {
                  texture2.draw(context, 0, top, left, h, 0, t, left, h);
                }
                if (right) {
                  texture2.draw(context, width + left, top, right, h, l + w, t, right, h);
                }
              }
              t += h;
            }
            if (top) {
              texture2.draw(context, left, 0, w, top, l, 0, w, top);
            }
            if (bottom) {
              texture2.draw(context, left, height + top, w, bottom, l, t, w, bottom);
            }
            l += w;
          }
        }
      };
      return ResizableTexture2;
    }(Texture)
  );
  function getPixelRatio() {
    return typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  }
  function isValidFitMode(value) {
    return value && (value === "cover" || value === "contain" || value === "fill" || value === "in" || value === "in-pad" || value === "out" || value === "out-crop");
  }
  var iid$1 = 0;
  var Pin = (
    /** @class */
    function() {
      function Pin2(owner) {
        this.uid = "pin:" + uid();
        this._owner = owner;
        this._parent = null;
        this._relativeMatrix = new Matrix();
        this._absoluteMatrix = new Matrix();
        this.reset();
      }
      Pin2.prototype.reset = function() {
        this._textureAlpha = 1;
        this._alpha = 1;
        this._width = 0;
        this._height = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._skewX = 0;
        this._skewY = 0;
        this._rotation = 0;
        this._pivoted = false;
        this._pivotX = 0;
        this._pivotY = 0;
        this._handled = false;
        this._handleX = 0;
        this._handleY = 0;
        this._aligned = false;
        this._alignX = 0;
        this._alignY = 0;
        this._offsetX = 0;
        this._offsetY = 0;
        this._boxX = 0;
        this._boxY = 0;
        this._boxWidth = this._width;
        this._boxHeight = this._height;
        this._ts_translate = ++iid$1;
        this._ts_transform = ++iid$1;
        this._ts_matrix = ++iid$1;
      };
      Pin2.prototype._update = function() {
        this._parent = this._owner._parent && this._owner._parent._pin;
        if (this._handled && this._mo_handle != this._ts_transform) {
          this._mo_handle = this._ts_transform;
          this._ts_translate = ++iid$1;
        }
        if (this._aligned && this._parent && this._mo_align != this._parent._ts_transform) {
          this._mo_align = this._parent._ts_transform;
          this._ts_translate = ++iid$1;
        }
        return this;
      };
      Pin2.prototype.toString = function() {
        return this._owner + " (" + (this._parent ? this._parent._owner : null) + ")";
      };
      Pin2.prototype.absoluteMatrix = function() {
        this._update();
        var ts = Math.max(this._ts_transform, this._ts_translate, this._parent ? this._parent._ts_matrix : 0);
        if (this._mo_abs == ts) {
          return this._absoluteMatrix;
        }
        this._mo_abs = ts;
        var abs = this._absoluteMatrix;
        abs.reset(this.relativeMatrix());
        this._parent && abs.concat(this._parent._absoluteMatrix);
        this._ts_matrix = ++iid$1;
        return abs;
      };
      Pin2.prototype.relativeMatrix = function() {
        this._update();
        var ts = Math.max(this._ts_transform, this._ts_translate, this._parent ? this._parent._ts_transform : 0);
        if (this._mo_rel == ts) {
          return this._relativeMatrix;
        }
        this._mo_rel = ts;
        var rel = this._relativeMatrix;
        rel.identity();
        if (this._pivoted) {
          rel.translate(-this._pivotX * this._width, -this._pivotY * this._height);
        }
        rel.scale(this._scaleX, this._scaleY);
        rel.skew(this._skewX, this._skewY);
        rel.rotate(this._rotation);
        if (this._pivoted) {
          rel.translate(this._pivotX * this._width, this._pivotY * this._height);
        }
        if (this._pivoted) {
          this._boxX = 0;
          this._boxY = 0;
          this._boxWidth = this._width;
          this._boxHeight = this._height;
        } else {
          var p = void 0;
          var q = void 0;
          if (rel.a > 0 && rel.c > 0 || rel.a < 0 && rel.c < 0) {
            p = 0;
            q = rel.a * this._width + rel.c * this._height;
          } else {
            p = rel.a * this._width;
            q = rel.c * this._height;
          }
          if (p > q) {
            this._boxX = q;
            this._boxWidth = p - q;
          } else {
            this._boxX = p;
            this._boxWidth = q - p;
          }
          if (rel.b > 0 && rel.d > 0 || rel.b < 0 && rel.d < 0) {
            p = 0;
            q = rel.b * this._width + rel.d * this._height;
          } else {
            p = rel.b * this._width;
            q = rel.d * this._height;
          }
          if (p > q) {
            this._boxY = q;
            this._boxHeight = p - q;
          } else {
            this._boxY = p;
            this._boxHeight = q - p;
          }
        }
        this._x = this._offsetX;
        this._y = this._offsetY;
        this._x -= this._boxX + this._handleX * this._boxWidth;
        this._y -= this._boxY + this._handleY * this._boxHeight;
        if (this._aligned && this._parent) {
          this._parent.relativeMatrix();
          this._x += this._alignX * this._parent._width;
          this._y += this._alignY * this._parent._height;
        }
        rel.translate(this._x, this._y);
        return this._relativeMatrix;
      };
      Pin2.prototype.get = function(key) {
        if (typeof getters[key] === "function") {
          return getters[key](this);
        }
      };
      Pin2.prototype.set = function(a, b) {
        if (typeof a === "string") {
          if (typeof setters[a] === "function" && typeof b !== "undefined") {
            setters[a](this, b);
          }
        } else if (typeof a === "object") {
          for (b in a) {
            if (typeof setters[b] === "function" && typeof a[b] !== "undefined") {
              setters[b](this, a[b], a);
            }
          }
        }
        if (this._owner) {
          this._owner._ts_pin = ++iid$1;
          this._owner.touch();
        }
        return this;
      };
      Pin2.prototype.fit = function(width, height, mode) {
        this._ts_transform = ++iid$1;
        if (mode === "contain") {
          mode = "in-pad";
        }
        if (mode === "cover") {
          mode = "out-crop";
        }
        if (typeof width === "number") {
          this._scaleX = width / this._unscaled_width;
          this._width = this._unscaled_width;
        }
        if (typeof height === "number") {
          this._scaleY = height / this._unscaled_height;
          this._height = this._unscaled_height;
        }
        if (typeof width === "number" && typeof height === "number" && typeof mode === "string") {
          if (mode === "fill")
            ;
          else if (mode === "out" || mode === "out-crop") {
            this._scaleX = this._scaleY = Math.max(this._scaleX, this._scaleY);
          } else if (mode === "in" || mode === "in-pad") {
            this._scaleX = this._scaleY = Math.min(this._scaleX, this._scaleY);
          }
          if (mode === "out-crop" || mode === "in-pad") {
            this._width = width / this._scaleX;
            this._height = height / this._scaleY;
          }
        }
      };
      return Pin2;
    }()
  );
  var getters = {
    alpha: function(pin) {
      return pin._alpha;
    },
    textureAlpha: function(pin) {
      return pin._textureAlpha;
    },
    width: function(pin) {
      return pin._width;
    },
    height: function(pin) {
      return pin._height;
    },
    boxWidth: function(pin) {
      return pin._boxWidth;
    },
    boxHeight: function(pin) {
      return pin._boxHeight;
    },
    // scale : function(pin: Pin) {
    // },
    scaleX: function(pin) {
      return pin._scaleX;
    },
    scaleY: function(pin) {
      return pin._scaleY;
    },
    // skew : function(pin: Pin) {
    // },
    skewX: function(pin) {
      return pin._skewX;
    },
    skewY: function(pin) {
      return pin._skewY;
    },
    rotation: function(pin) {
      return pin._rotation;
    },
    // pivot : function(pin: Pin) {
    // },
    pivotX: function(pin) {
      return pin._pivotX;
    },
    pivotY: function(pin) {
      return pin._pivotY;
    },
    // offset : function(pin: Pin) {
    // },
    offsetX: function(pin) {
      return pin._offsetX;
    },
    offsetY: function(pin) {
      return pin._offsetY;
    },
    // align : function(pin: Pin) {
    // },
    alignX: function(pin) {
      return pin._alignX;
    },
    alignY: function(pin) {
      return pin._alignY;
    },
    // handle : function(pin: Pin) {
    // },
    handleX: function(pin) {
      return pin._handleX;
    },
    handleY: function(pin) {
      return pin._handleY;
    }
  };
  var setters = {
    alpha: function(pin, value) {
      pin._alpha = value;
    },
    textureAlpha: function(pin, value) {
      pin._textureAlpha = value;
    },
    width: function(pin, value) {
      pin._unscaled_width = value;
      pin._width = value;
      pin._ts_transform = ++iid$1;
    },
    height: function(pin, value) {
      pin._unscaled_height = value;
      pin._height = value;
      pin._ts_transform = ++iid$1;
    },
    scale: function(pin, value) {
      pin._scaleX = value;
      pin._scaleY = value;
      pin._ts_transform = ++iid$1;
    },
    scaleX: function(pin, value) {
      pin._scaleX = value;
      pin._ts_transform = ++iid$1;
    },
    scaleY: function(pin, value) {
      pin._scaleY = value;
      pin._ts_transform = ++iid$1;
    },
    skew: function(pin, value) {
      pin._skewX = value;
      pin._skewY = value;
      pin._ts_transform = ++iid$1;
    },
    skewX: function(pin, value) {
      pin._skewX = value;
      pin._ts_transform = ++iid$1;
    },
    skewY: function(pin, value) {
      pin._skewY = value;
      pin._ts_transform = ++iid$1;
    },
    rotation: function(pin, value) {
      pin._rotation = value;
      pin._ts_transform = ++iid$1;
    },
    pivot: function(pin, value) {
      pin._pivotX = value;
      pin._pivotY = value;
      pin._pivoted = true;
      pin._ts_transform = ++iid$1;
    },
    pivotX: function(pin, value) {
      pin._pivotX = value;
      pin._pivoted = true;
      pin._ts_transform = ++iid$1;
    },
    pivotY: function(pin, value) {
      pin._pivotY = value;
      pin._pivoted = true;
      pin._ts_transform = ++iid$1;
    },
    offset: function(pin, value) {
      pin._offsetX = value;
      pin._offsetY = value;
      pin._ts_translate = ++iid$1;
    },
    offsetX: function(pin, value) {
      pin._offsetX = value;
      pin._ts_translate = ++iid$1;
    },
    offsetY: function(pin, value) {
      pin._offsetY = value;
      pin._ts_translate = ++iid$1;
    },
    align: function(pin, value) {
      this.alignX(pin, value);
      this.alignY(pin, value);
    },
    alignX: function(pin, value) {
      pin._alignX = value;
      pin._aligned = true;
      pin._ts_translate = ++iid$1;
      this.handleX(pin, value);
    },
    alignY: function(pin, value) {
      pin._alignY = value;
      pin._aligned = true;
      pin._ts_translate = ++iid$1;
      this.handleY(pin, value);
    },
    handle: function(pin, value) {
      this.handleX(pin, value);
      this.handleY(pin, value);
    },
    handleX: function(pin, value) {
      pin._handleX = value;
      pin._handled = true;
      pin._ts_translate = ++iid$1;
    },
    handleY: function(pin, value) {
      pin._handleY = value;
      pin._handled = true;
      pin._ts_translate = ++iid$1;
    },
    resizeMode: function(pin, value, all) {
      if (all) {
        if (value == "in") {
          value = "in-pad";
        } else if (value == "out") {
          value = "out-crop";
        }
        pin.fit(all.resizeWidth, all.resizeHeight, value);
      }
    },
    resizeWidth: function(pin, value, all) {
      if (!all || !all.resizeMode) {
        pin.fit(value, null);
      }
    },
    resizeHeight: function(pin, value, all) {
      if (!all || !all.resizeMode) {
        pin.fit(null, value);
      }
    },
    scaleMode: function(pin, value, all) {
      if (all) {
        pin.fit(all.scaleWidth, all.scaleHeight, value);
      }
    },
    scaleWidth: function(pin, value, all) {
      if (!all || !all.scaleMode) {
        pin.fit(value, null);
      }
    },
    scaleHeight: function(pin, value, all) {
      if (!all || !all.scaleMode) {
        pin.fit(null, value);
      }
    },
    matrix: function(pin, value) {
      this.scaleX(pin, value.a);
      this.skewX(pin, value.c / value.d);
      this.skewY(pin, value.b / value.a);
      this.scaleY(pin, value.d);
      this.offsetX(pin, value.e);
      this.offsetY(pin, value.f);
      this.rotation(pin, 0);
    }
  };
  function IDENTITY(x) {
    return x;
  }
  var LOOKUP_CACHE = {};
  var MODE_BY_NAME = {};
  var EASE_BY_NAME = {};
  var Easing = (
    /** @class */
    function() {
      function Easing2() {
      }
      Easing2.get = function(token, fallback) {
        fallback = fallback || IDENTITY;
        if (typeof token === "function") {
          return token;
        }
        if (typeof token !== "string") {
          return fallback;
        }
        var easeFn = LOOKUP_CACHE[token];
        if (easeFn) {
          return easeFn;
        }
        var tokens = /^(\w+)(-(in|out|in-out|out-in))?(\((.*)\))?$/i.exec(token);
        if (!tokens || !tokens.length) {
          return fallback;
        }
        var easeName = tokens[1];
        var easing = EASE_BY_NAME[easeName];
        var modeName = tokens[3];
        var modeFn = MODE_BY_NAME[modeName];
        var params = tokens[5];
        if (!easing) {
          easeFn = fallback;
        } else if ("fn" in easing && typeof easing.fn === "function") {
          easeFn = easing.fn;
        } else if ("fc" in easing && typeof easing.fc === "function") {
          var args = params ? params.replace(/\s+/, "").split(",") : void 0;
          easeFn = easing.fc.apply(easing.fc, args);
        } else {
          easeFn = fallback;
        }
        if (modeFn) {
          easeFn = modeFn(easeFn);
        }
        LOOKUP_CACHE[token] = easeFn;
        return easeFn;
      };
      return Easing2;
    }()
  );
  function addMode(name, fn) {
    MODE_BY_NAME[name] = fn;
  }
  function addEaseFn(data) {
    var names = data.name.split(/\s+/);
    for (var i = 0; i < names.length; i++) {
      var key = names[i];
      if (key) {
        EASE_BY_NAME[key] = data;
      }
    }
  }
  addMode("in", function(f) {
    return f;
  });
  addMode("out", function(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  });
  addMode("in-out", function(f) {
    return function(t) {
      return t < 0.5 ? f(2 * t) / 2 : 1 - f(2 * (1 - t)) / 2;
    };
  });
  addMode("out-in", function(f) {
    return function(t) {
      return t < 0.5 ? 1 - f(2 * (1 - t)) / 2 : f(2 * t) / 2;
    };
  });
  addEaseFn({
    name: "linear",
    fn: function(t) {
      return t;
    }
  });
  addEaseFn({
    name: "quad",
    fn: function(t) {
      return t * t;
    }
  });
  addEaseFn({
    name: "cubic",
    fn: function(t) {
      return t * t * t;
    }
  });
  addEaseFn({
    name: "quart",
    fn: function(t) {
      return t * t * t * t;
    }
  });
  addEaseFn({
    name: "quint",
    fn: function(t) {
      return t * t * t * t * t;
    }
  });
  addEaseFn({
    name: "sin sine",
    fn: function(t) {
      return 1 - Math.cos(t * Math.PI / 2);
    }
  });
  addEaseFn({
    name: "exp expo",
    fn: function(t) {
      return t == 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }
  });
  addEaseFn({
    name: "circle circ",
    fn: function(t) {
      return 1 - Math.sqrt(1 - t * t);
    }
  });
  addEaseFn({
    name: "bounce",
    fn: function(t) {
      return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + 0.75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375 : 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  });
  addEaseFn({
    name: "poly",
    fc: function(e) {
      return function(t) {
        return Math.pow(t, e);
      };
    }
  });
  addEaseFn({
    name: "elastic",
    fc: function(a, p) {
      p = p || 0.45;
      a = a || 1;
      var s = p / (2 * Math.PI) * Math.asin(1 / a);
      return function(t) {
        return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p);
      };
    }
  });
  addEaseFn({
    name: "back",
    fc: function(s) {
      s = typeof s !== "undefined" ? s : 1.70158;
      return function(t) {
        return t * t * ((s + 1) * t - s);
      };
    }
  });
  var Transition = (
    /** @class */
    function() {
      function Transition2(owner, options) {
        if (options === void 0) {
          options = {};
        }
        this.uid = "transition:" + uid();
        this._ending = [];
        this._end = {};
        this._duration = options.duration || 400;
        this._delay = options.delay || 0;
        this._owner = owner;
        this._time = 0;
      }
      Transition2.prototype.tick = function(node, elapsed, now, last) {
        this._time += elapsed;
        if (this._time < this._delay) {
          return;
        }
        var time = this._time - this._delay;
        if (!this._start) {
          this._start = {};
          for (var key in this._end) {
            this._start[key] = this._owner.pin(key);
          }
        }
        var p = Math.min(time / this._duration, 1);
        var ended = p >= 1;
        if (typeof this._easing == "function") {
          p = this._easing(p);
        }
        var q = 1 - p;
        for (var key in this._end) {
          this._owner.pin(key, this._start[key] * q + this._end[key] * p);
        }
        return ended;
      };
      Transition2.prototype.finish = function() {
        var _this = this;
        this._ending.forEach(function(callback) {
          try {
            callback.call(_this._owner);
          } catch (e) {
            console.error(e);
          }
        });
        return this._next;
      };
      Transition2.prototype.tween = function(a, b) {
        var options;
        if (typeof a === "object" && a !== null) {
          options = a;
        } else {
          options = {};
          if (typeof a === "number") {
            options.duration = a;
            if (typeof b === "number") {
              options.delay = b;
            }
          }
        }
        return this._next = new Transition2(this._owner, options);
      };
      Transition2.prototype.duration = function(duration) {
        this._duration = duration;
        return this;
      };
      Transition2.prototype.delay = function(delay) {
        this._delay = delay;
        return this;
      };
      Transition2.prototype.ease = function(easing) {
        this._easing = Easing.get(easing);
        return this;
      };
      Transition2.prototype.done = function(fn) {
        this._ending.push(fn);
        return this;
      };
      Transition2.prototype.hide = function() {
        this._ending.push(function() {
          this.hide();
        });
        this._hide = true;
        return this;
      };
      Transition2.prototype.remove = function() {
        this._ending.push(function() {
          this.remove();
        });
        this._remove = true;
        return this;
      };
      Transition2.prototype.pin = function(a, b) {
        if (typeof a === "object") {
          for (var attr in a) {
            pinning(this._owner, this._end, attr, a[attr]);
          }
        } else if (typeof b !== "undefined") {
          pinning(this._owner, this._end, a, b);
        }
        return this;
      };
      Transition2.prototype.then = function(fn) {
        this.done(fn);
        return this;
      };
      Transition2.prototype.clear = function(forward) {
        return this;
      };
      Transition2.prototype.size = function(w, h) {
        this.pin("width", w);
        this.pin("height", h);
        return this;
      };
      Transition2.prototype.width = function(w) {
        if (typeof w === "undefined") {
          return this.pin("width");
        }
        this.pin("width", w);
        return this;
      };
      Transition2.prototype.height = function(h) {
        if (typeof h === "undefined") {
          return this.pin("height");
        }
        this.pin("height", h);
        return this;
      };
      Transition2.prototype.offset = function(a, b) {
        if (typeof a === "object") {
          b = a.y;
          a = a.x;
        }
        this.pin("offsetX", a);
        this.pin("offsetY", b);
        return this;
      };
      Transition2.prototype.rotate = function(a) {
        this.pin("rotation", a);
        return this;
      };
      Transition2.prototype.skew = function(a, b) {
        if (typeof a === "object") {
          b = a.y;
          a = a.x;
        } else if (typeof b === "undefined") {
          b = a;
        }
        this.pin("skewX", a);
        this.pin("skewY", b);
        return this;
      };
      Transition2.prototype.scale = function(a, b) {
        if (typeof a === "object") {
          b = a.y;
          a = a.x;
        } else if (typeof b === "undefined") {
          b = a;
        }
        this.pin("scaleX", a);
        this.pin("scaleY", b);
        return this;
      };
      Transition2.prototype.alpha = function(a, ta) {
        this.pin("alpha", a);
        if (typeof ta !== "undefined") {
          this.pin("textureAlpha", ta);
        }
        return this;
      };
      return Transition2;
    }()
  );
  function pinning(node, map, key, value) {
    if (typeof node.pin(key) === "number") {
      map[key] = value;
    } else if (typeof node.pin(key + "X") === "number" && typeof node.pin(key + "Y") === "number") {
      map[key + "X"] = value;
      map[key + "Y"] = value;
    }
  }
  var iid = 0;
  stats.create = 0;
  function assertType(obj) {
    if (obj && obj instanceof Node) {
      return obj;
    }
    throw "Invalid node: " + obj;
  }
  function create() {
    return layout();
  }
  function layer() {
    return maximize();
  }
  function box() {
    return minimize();
  }
  function layout() {
    return new Node();
  }
  function row(align) {
    return layout().row(align).label("Row");
  }
  function column(align) {
    return layout().column(align).label("Column");
  }
  function minimize() {
    return layout().minimize().label("Minimize");
  }
  function maximize() {
    return layout().maximize().label("Maximize");
  }
  var Node = (
    /** @class */
    function() {
      function Node2() {
        var _this = this;
        this.uid = "node:" + uid();
        this._label = "";
        this._parent = null;
        this._next = null;
        this._prev = null;
        this._first = null;
        this._last = null;
        this._visible = true;
        this._alpha = 1;
        this._padding = 0;
        this._spacing = 0;
        this._pin = new Pin(this);
        this._listeners = {};
        this._attrs = {};
        this._flags = {};
        this._transitions = [];
        this._tickBefore = [];
        this._tickAfter = [];
        this.MAX_ELAPSE = Infinity;
        this._transitionTickInitied = false;
        this._transitionTickLastTime = 0;
        this._transitionTick = function(elapsed, now, last) {
          if (!_this._transitions.length) {
            return false;
          }
          var ignore = _this._transitionTickLastTime !== last;
          _this._transitionTickLastTime = now;
          if (ignore) {
            return true;
          }
          var head = _this._transitions[0];
          var ended = head.tick(_this, elapsed, now, last);
          if (ended) {
            if (head === _this._transitions[0]) {
              _this._transitions.shift();
            }
            var next = head.finish();
            if (next) {
              _this._transitions.unshift(next);
            }
          }
          return true;
        };
        stats.create++;
      }
      Node2.prototype.matrix = function(relative) {
        if (relative === void 0) {
          relative = false;
        }
        if (relative === true) {
          return this._pin.relativeMatrix();
        }
        return this._pin.absoluteMatrix();
      };
      Node2.prototype.getPixelRatio = function() {
        var _a;
        var m = (_a = this._parent) === null || _a === void 0 ? void 0 : _a.matrix();
        var pixelRatio = !m ? 1 : Math.max(Math.abs(m.a), Math.abs(m.b)) / getPixelRatio();
        return pixelRatio;
      };
      Node2.prototype.pin = function(a, b) {
        if (typeof a === "object") {
          this._pin.set(a);
          return this;
        } else if (typeof a === "string") {
          if (typeof b === "undefined") {
            return this._pin.get(a);
          } else {
            this._pin.set(a, b);
            return this;
          }
        } else if (typeof a === "undefined") {
          return this._pin;
        }
      };
      Node2.prototype.fit = function(a, b, c) {
        if (typeof a === "object") {
          c = b;
          b = a.y;
          a = a.x;
        }
        this._pin.fit(a, b, c);
        return this;
      };
      Node2.prototype.scaleTo = function(a, b, c) {
        return this.fit(a, b, c);
      };
      Node2.prototype.toString = function() {
        return "[" + this._label + "]";
      };
      Node2.prototype.id = function(id) {
        return this.label(id);
      };
      Node2.prototype.label = function(label) {
        if (typeof label === "undefined") {
          return this._label;
        }
        this._label = label;
        return this;
      };
      Node2.prototype.attr = function(name, value) {
        if (typeof value === "undefined") {
          return this._attrs !== null ? this._attrs[name] : void 0;
        }
        (this._attrs !== null ? this._attrs : this._attrs = {})[name] = value;
        return this;
      };
      Node2.prototype.visible = function(visible) {
        if (typeof visible === "undefined") {
          return this._visible;
        }
        this._visible = visible;
        this._parent && (this._parent._ts_children = ++iid);
        this._ts_pin = ++iid;
        this.touch();
        return this;
      };
      Node2.prototype.hide = function() {
        this.visible(false);
        return this;
      };
      Node2.prototype.show = function() {
        this.visible(true);
        return this;
      };
      Node2.prototype.parent = function() {
        return this._parent;
      };
      Node2.prototype.next = function(visible) {
        var next = this._next;
        while (next && visible && !next._visible) {
          next = next._next;
        }
        return next;
      };
      Node2.prototype.prev = function(visible) {
        var prev = this._prev;
        while (prev && visible && !prev._visible) {
          prev = prev._prev;
        }
        return prev;
      };
      Node2.prototype.first = function(visible) {
        var next = this._first;
        while (next && visible && !next._visible) {
          next = next._next;
        }
        return next;
      };
      Node2.prototype.last = function(visible) {
        var prev = this._last;
        while (prev && visible && !prev._visible) {
          prev = prev._prev;
        }
        return prev;
      };
      Node2.prototype.visit = function(visitor, payload) {
        var reverse = visitor.reverse;
        var visible = visitor.visible;
        if (visitor.start && visitor.start(this, payload)) {
          return;
        }
        var child;
        var next = reverse ? this.last(visible) : this.first(visible);
        while (child = next) {
          next = reverse ? child.prev(visible) : child.next(visible);
          if (child.visit(visitor, payload)) {
            return true;
          }
        }
        return visitor.end && visitor.end(this, payload);
      };
      Node2.prototype.append = function(child, more) {
        if (Array.isArray(child)) {
          for (var i = 0; i < child.length; i++) {
            Node2.append(this, child[i]);
          }
        } else if (typeof more !== "undefined") {
          for (var i = 0; i < arguments.length; i++) {
            Node2.append(this, arguments[i]);
          }
        } else if (typeof child !== "undefined")
          Node2.append(this, child);
        return this;
      };
      Node2.prototype.prepend = function(child, more) {
        if (Array.isArray(child)) {
          for (var i = child.length - 1; i >= 0; i--) {
            Node2.prepend(this, child[i]);
          }
        } else if (typeof more !== "undefined") {
          for (var i = arguments.length - 1; i >= 0; i--) {
            Node2.prepend(this, arguments[i]);
          }
        } else if (typeof child !== "undefined")
          Node2.prepend(this, child);
        return this;
      };
      Node2.prototype.appendTo = function(parent) {
        Node2.append(parent, this);
        return this;
      };
      Node2.prototype.prependTo = function(parent) {
        Node2.prepend(parent, this);
        return this;
      };
      Node2.prototype.insertNext = function(sibling, more) {
        if (Array.isArray(sibling)) {
          for (var i = 0; i < sibling.length; i++) {
            Node2.insertAfter(sibling[i], this);
          }
        } else if (typeof more !== "undefined") {
          for (var i = 0; i < arguments.length; i++) {
            Node2.insertAfter(arguments[i], this);
          }
        } else if (typeof sibling !== "undefined") {
          Node2.insertAfter(sibling, this);
        }
        return this;
      };
      Node2.prototype.insertPrev = function(sibling, more) {
        if (Array.isArray(sibling)) {
          for (var i = sibling.length - 1; i >= 0; i--) {
            Node2.insertBefore(sibling[i], this);
          }
        } else if (typeof more !== "undefined") {
          for (var i = arguments.length - 1; i >= 0; i--) {
            Node2.insertBefore(arguments[i], this);
          }
        } else if (typeof sibling !== "undefined") {
          Node2.insertBefore(sibling, this);
        }
        return this;
      };
      Node2.prototype.insertAfter = function(prev) {
        Node2.insertAfter(this, prev);
        return this;
      };
      Node2.prototype.insertBefore = function(next) {
        Node2.insertBefore(this, next);
        return this;
      };
      Node2.append = function(parent, child) {
        assertType(child);
        assertType(parent);
        child.remove();
        if (parent._last) {
          parent._last._next = child;
          child._prev = parent._last;
        }
        child._parent = parent;
        parent._last = child;
        if (!parent._first) {
          parent._first = child;
        }
        child._parent._flag(child, true);
        child._ts_parent = ++iid;
        parent._ts_children = ++iid;
        parent.touch();
      };
      Node2.prepend = function(parent, child) {
        assertType(child);
        assertType(parent);
        child.remove();
        if (parent._first) {
          parent._first._prev = child;
          child._next = parent._first;
        }
        child._parent = parent;
        parent._first = child;
        if (!parent._last) {
          parent._last = child;
        }
        child._parent._flag(child, true);
        child._ts_parent = ++iid;
        parent._ts_children = ++iid;
        parent.touch();
      };
      Node2.insertBefore = function(self, next) {
        assertType(self);
        assertType(next);
        self.remove();
        var parent = next._parent;
        var prev = next._prev;
        if (!parent) {
          return;
        }
        next._prev = self;
        prev && (prev._next = self) || parent && (parent._first = self);
        self._parent = parent;
        self._prev = prev;
        self._next = next;
        self._parent._flag(self, true);
        self._ts_parent = ++iid;
        self.touch();
      };
      Node2.insertAfter = function(self, prev) {
        assertType(self);
        assertType(prev);
        self.remove();
        var parent = prev._parent;
        var next = prev._next;
        if (!parent) {
          return;
        }
        prev._next = self;
        next && (next._prev = self) || parent && (parent._last = self);
        self._parent = parent;
        self._prev = prev;
        self._next = next;
        self._parent._flag(self, true);
        self._ts_parent = ++iid;
        self.touch();
      };
      Node2.prototype.remove = function(child, more) {
        if (typeof child !== "undefined") {
          if (Array.isArray(child)) {
            for (var i = 0; i < child.length; i++) {
              assertType(child[i]).remove();
            }
          } else if (typeof more !== "undefined") {
            for (var i = 0; i < arguments.length; i++) {
              assertType(arguments[i]).remove();
            }
          } else {
            assertType(child).remove();
          }
          return this;
        }
        if (this._prev) {
          this._prev._next = this._next;
        }
        if (this._next) {
          this._next._prev = this._prev;
        }
        if (this._parent) {
          if (this._parent._first === this) {
            this._parent._first = this._next;
          }
          if (this._parent._last === this) {
            this._parent._last = this._prev;
          }
          this._parent._flag(this, false);
          this._parent._ts_children = ++iid;
          this._parent.touch();
        }
        this._prev = this._next = this._parent = null;
        this._ts_parent = ++iid;
        return this;
      };
      Node2.prototype.empty = function() {
        var child = null;
        var next = this._first;
        while (child = next) {
          next = child._next;
          child._prev = child._next = child._parent = null;
          this._flag(child, false);
        }
        this._first = this._last = null;
        this._ts_children = ++iid;
        this.touch();
        return this;
      };
      Node2.prototype.touch = function() {
        this._ts_touch = ++iid;
        this._parent && this._parent.touch();
        return this;
      };
      Node2.prototype._flag = function(key, value) {
        if (typeof value === "undefined") {
          return this._flags !== null && this._flags[key] || 0;
        }
        if (typeof key === "string") {
          if (value) {
            this._flags = this._flags || {};
            if (!this._flags[key] && this._parent) {
              this._parent._flag(key, true);
            }
            this._flags[key] = (this._flags[key] || 0) + 1;
          } else if (this._flags && this._flags[key] > 0) {
            if (this._flags[key] == 1 && this._parent) {
              this._parent._flag(key, false);
            }
            this._flags[key] = this._flags[key] - 1;
          }
        }
        if (typeof key === "object") {
          if (key._flags) {
            for (var type in key._flags) {
              if (key._flags[type] > 0) {
                this._flag(type, value);
              }
            }
          }
        }
        return this;
      };
      Node2.prototype.hitTest = function(hit) {
        var width = this._pin._width;
        var height = this._pin._height;
        return hit.x >= 0 && hit.x <= width && hit.y >= 0 && hit.y <= height;
      };
      Node2.prototype.prerender = function() {
        if (!this._visible) {
          return;
        }
        var child;
        var next = this._first;
        while (child = next) {
          next = child._next;
          child.prerender();
        }
      };
      Node2.prototype.render = function(context) {
        if (!this._visible) {
          return;
        }
        stats.node++;
        var m = this.matrix();
        context.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        this._alpha = this._pin._alpha * (this._parent ? this._parent._alpha : 1);
        var alpha = this._pin._textureAlpha * this._alpha;
        if (context.globalAlpha != alpha) {
          context.globalAlpha = alpha;
        }
        if (this._textures) {
          for (var i = 0, n = this._textures.length; i < n; i++) {
            this._textures[i].draw(context);
          }
        }
        if (context.globalAlpha != this._alpha) {
          context.globalAlpha = this._alpha;
        }
        var child;
        var next = this._first;
        while (child = next) {
          next = child._next;
          child.render(context);
        }
      };
      Node2.prototype._tick = function(elapsed, now, last) {
        if (!this._visible) {
          return;
        }
        if (elapsed > this.MAX_ELAPSE) {
          elapsed = this.MAX_ELAPSE;
        }
        var ticked = false;
        if (this._tickBefore !== null) {
          for (var i = 0; i < this._tickBefore.length; i++) {
            stats.tick++;
            var tickFn = this._tickBefore[i];
            ticked = tickFn.call(this, elapsed, now, last) === true || ticked;
          }
        }
        var child;
        var next = this._first;
        while (child = next) {
          next = child._next;
          if (child._flag("_tick")) {
            ticked = child._tick(elapsed, now, last) === true ? true : ticked;
          }
        }
        if (this._tickAfter !== null) {
          for (var i = 0; i < this._tickAfter.length; i++) {
            stats.tick++;
            var tickFn = this._tickAfter[i];
            ticked = tickFn.call(this, elapsed, now, last) === true || ticked;
          }
        }
        return ticked;
      };
      Node2.prototype.tick = function(callback, before) {
        var _a, _b;
        if (before === void 0) {
          before = false;
        }
        if (typeof callback !== "function") {
          return;
        }
        if (before) {
          if (this._tickBefore === null) {
            this._tickBefore = [];
          }
          this._tickBefore.push(callback);
        } else {
          if (this._tickAfter === null) {
            this._tickAfter = [];
          }
          this._tickAfter.push(callback);
        }
        var hasTickListener = ((_a = this._tickAfter) === null || _a === void 0 ? void 0 : _a.length) > 0 || ((_b = this._tickBefore) === null || _b === void 0 ? void 0 : _b.length) > 0;
        this._flag("_tick", hasTickListener);
      };
      Node2.prototype.untick = function(callback) {
        if (typeof callback !== "function") {
          return;
        }
        var i;
        if (this._tickBefore !== null && (i = this._tickBefore.indexOf(callback)) >= 0) {
          this._tickBefore.splice(i, 1);
        }
        if (this._tickAfter !== null && (i = this._tickAfter.indexOf(callback)) >= 0) {
          this._tickAfter.splice(i, 1);
        }
      };
      Node2.prototype.timeout = function(callback, time) {
        this.setTimeout(callback, time);
      };
      Node2.prototype.setTimeout = function(callback, time) {
        function timer(t) {
          if ((time -= t) < 0) {
            this.untick(timer);
            callback.call(this);
          } else {
            return true;
          }
        }
        this.tick(timer);
        return timer;
      };
      Node2.prototype.clearTimeout = function(timer) {
        this.untick(timer);
      };
      Node2.prototype.on = function(type, listener) {
        if (!type || !type.length || typeof listener !== "function") {
          return this;
        }
        if (typeof type !== "string" && typeof type.join === "function") {
          for (var i = 0; i < type.length; i++) {
            this.on(type[i], listener);
          }
        } else if (typeof type === "string" && type.indexOf(" ") > -1) {
          type = type.match(/\S+/g);
          for (var i = 0; i < type.length; i++) {
            this._on(type[i], listener);
          }
        } else if (typeof type === "string") {
          this._on(type, listener);
        } else
          ;
        return this;
      };
      Node2.prototype._on = function(type, listener) {
        if (typeof type !== "string" && typeof listener !== "function") {
          return;
        }
        this._listeners[type] = this._listeners[type] || [];
        this._listeners[type].push(listener);
        this._flag(type, true);
      };
      Node2.prototype.off = function(type, listener) {
        if (!type || !type.length || typeof listener !== "function") {
          return this;
        }
        if (typeof type !== "string" && typeof type.join === "function") {
          for (var i = 0; i < type.length; i++) {
            this.off(type[i], listener);
          }
        } else if (typeof type === "string" && type.indexOf(" ") > -1) {
          type = type.match(/\S+/g);
          for (var i = 0; i < type.length; i++) {
            this._off(type[i], listener);
          }
        } else if (typeof type === "string") {
          this._off(type, listener);
        } else
          ;
        return this;
      };
      Node2.prototype._off = function(type, listener) {
        if (typeof type !== "string" && typeof listener !== "function") {
          return;
        }
        var listeners = this._listeners[type];
        if (!listeners || !listeners.length) {
          return;
        }
        var index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
          this._flag(type, false);
        }
      };
      Node2.prototype.listeners = function(type) {
        return this._listeners[type];
      };
      Node2.prototype.publish = function(name, args) {
        var listeners = this.listeners(name);
        if (!listeners || !listeners.length) {
          return 0;
        }
        for (var l = 0; l < listeners.length; l++) {
          listeners[l].apply(this, args);
        }
        return listeners.length;
      };
      Node2.prototype.trigger = function(name, args) {
        this.publish(name, args);
        return this;
      };
      Node2.prototype.size = function(w, h) {
        this.pin("width", w);
        this.pin("height", h);
        return this;
      };
      Node2.prototype.width = function(w) {
        if (typeof w === "undefined") {
          return this.pin("width");
        }
        this.pin("width", w);
        return this;
      };
      Node2.prototype.height = function(h) {
        if (typeof h === "undefined") {
          return this.pin("height");
        }
        this.pin("height", h);
        return this;
      };
      Node2.prototype.offset = function(a, b) {
        if (typeof a === "object") {
          b = a.y;
          a = a.x;
        }
        this.pin("offsetX", a);
        this.pin("offsetY", b);
        return this;
      };
      Node2.prototype.rotate = function(a) {
        this.pin("rotation", a);
        return this;
      };
      Node2.prototype.skew = function(a, b) {
        if (typeof a === "object") {
          b = a.y;
          a = a.x;
        } else if (typeof b === "undefined")
          b = a;
        this.pin("skewX", a);
        this.pin("skewY", b);
        return this;
      };
      Node2.prototype.scale = function(a, b) {
        if (typeof a === "object") {
          b = a.y;
          a = a.x;
        } else if (typeof b === "undefined")
          b = a;
        this.pin("scaleX", a);
        this.pin("scaleY", b);
        return this;
      };
      Node2.prototype.alpha = function(a, ta) {
        this.pin("alpha", a);
        if (typeof ta !== "undefined") {
          this.pin("textureAlpha", ta);
        }
        return this;
      };
      Node2.prototype.tween = function(a, b, c) {
        var options;
        if (typeof a === "object" && a !== null) {
          options = a;
        } else {
          options = {};
          if (typeof a === "number") {
            options.duration = a;
            if (typeof b === "number") {
              options.delay = b;
              if (typeof c === "boolean") {
                options.append = c;
              }
            } else if (typeof b === "boolean") {
              options.append = b;
            }
          } else if (typeof a === "boolean") {
            options.append = a;
          }
        }
        if (!this._transitionTickInitied) {
          this.tick(this._transitionTick, true);
          this._transitionTickInitied = true;
        }
        this.touch();
        if (!options.append) {
          this._transitions.length = 0;
        }
        var transition = new Transition(this, options);
        this._transitions.push(transition);
        return transition;
      };
      Node2.prototype.row = function(align) {
        this.align("row", align);
        return this;
      };
      Node2.prototype.column = function(align) {
        this.align("column", align);
        return this;
      };
      Node2.prototype.align = function(type, align) {
        var _this = this;
        this._padding = this._padding;
        this._spacing = this._spacing;
        this._layoutTicker && this.untick(this._layoutTicker);
        this.tick(this._layoutTicker = function() {
          if (_this._mo_seq == _this._ts_touch) {
            return;
          }
          _this._mo_seq = _this._ts_touch;
          var alignChildren = _this._mo_seqAlign != _this._ts_children;
          _this._mo_seqAlign = _this._ts_children;
          var width = 0;
          var height = 0;
          var child;
          var next = _this.first(true);
          var first = true;
          while (child = next) {
            next = child.next(true);
            child.matrix(true);
            var w = child.pin("boxWidth");
            var h = child.pin("boxHeight");
            if (type == "column") {
              !first && (height += _this._spacing);
              child.pin("offsetY") != height && child.pin("offsetY", height);
              width = Math.max(width, w);
              height = height + h;
              alignChildren && child.pin("alignX", align);
            } else if (type == "row") {
              !first && (width += _this._spacing);
              child.pin("offsetX") != width && child.pin("offsetX", width);
              width = width + w;
              height = Math.max(height, h);
              alignChildren && child.pin("alignY", align);
            }
            first = false;
          }
          width += 2 * _this._padding;
          height += 2 * _this._padding;
          _this.pin("width") != width && _this.pin("width", width);
          _this.pin("height") != height && _this.pin("height", height);
        });
        return this;
      };
      Node2.prototype.box = function() {
        return this.minimize();
      };
      Node2.prototype.layer = function() {
        return this.maximize();
      };
      Node2.prototype.minimize = function() {
        var _this = this;
        this._padding = this._padding;
        this._layoutTicker && this.untick(this._layoutTicker);
        this.tick(this._layoutTicker = function() {
          if (_this._mo_box == _this._ts_touch) {
            return;
          }
          _this._mo_box = _this._ts_touch;
          var width = 0;
          var height = 0;
          var child;
          var next = _this.first(true);
          while (child = next) {
            next = child.next(true);
            child.matrix(true);
            var w = child.pin("boxWidth");
            var h = child.pin("boxHeight");
            width = Math.max(width, w);
            height = Math.max(height, h);
          }
          width += 2 * _this._padding;
          height += 2 * _this._padding;
          _this.pin("width") != width && _this.pin("width", width);
          _this.pin("height") != height && _this.pin("height", height);
        });
        return this;
      };
      Node2.prototype.maximize = function() {
        var _this = this;
        this._layoutTicker && this.untick(this._layoutTicker);
        this.tick(this._layoutTicker = function() {
          var parent = _this.parent();
          if (parent) {
            var width = parent.pin("width");
            if (_this.pin("width") != width) {
              _this.pin("width", width);
            }
            var height = parent.pin("height");
            if (_this.pin("height") != height) {
              _this.pin("height", height);
            }
          }
        }, true);
        return this;
      };
      Node2.prototype.padding = function(pad) {
        this._padding = pad;
        return this;
      };
      Node2.prototype.spacing = function(space) {
        this._spacing = space;
        return this;
      };
      return Node2;
    }()
  );
  var __extends$4 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  function sprite(frame) {
    var sprite2 = new Sprite();
    frame && sprite2.texture(frame);
    return sprite2;
  }
  var Sprite = (
    /** @class */
    function(_super) {
      __extends$4(Sprite2, _super);
      function Sprite2() {
        var _this = _super.call(this) || this;
        _this._tiled = false;
        _this._stretched = false;
        _this.prerenderContext = {};
        _this.label("Sprite");
        _this._textures = [];
        _this._image = null;
        return _this;
      }
      Sprite2.prototype.texture = function(frame) {
        this._image = texture(frame).one();
        if (this._image) {
          this.pin("width", this._image.getWidth());
          this.pin("height", this._image.getHeight());
          if (this._tiled) {
            this._textures[0] = new ResizableTexture(this._image, "tile");
          } else if (this._stretched) {
            this._textures[0] = new ResizableTexture(this._image, "stretch");
          } else {
            this._textures[0] = new PipeTexture(this._image);
          }
          this._textures.length = 1;
        } else {
          this.pin("width", 0);
          this.pin("height", 0);
          this._textures.length = 0;
        }
        return this;
      };
      Sprite2.prototype.image = function(frame) {
        return this.texture(frame);
      };
      Sprite2.prototype.tile = function(inner) {
        this._tiled = true;
        var texture2 = new ResizableTexture(this._image, "tile");
        this._textures[0] = texture2;
        return this;
      };
      Sprite2.prototype.stretch = function(inner) {
        this._stretched = true;
        var texture2 = new ResizableTexture(this._image, "stretch");
        this._textures[0] = texture2;
        return this;
      };
      Sprite2.prototype.prerender = function() {
        if (!this._visible) {
          return;
        }
        if (this._image) {
          var pixelRatio = this.getPixelRatio();
          this.prerenderContext.pixelRatio = pixelRatio;
          var updated = this._image.prerender(this.prerenderContext);
          if (updated === true) {
            var w = this._image.getWidth();
            var h = this._image.getHeight();
            this.size(w, h);
          }
        }
        _super.prototype.prerender.call(this);
      };
      Sprite2.prototype.render = function(context) {
        var texture2 = this._textures[0];
        if (texture2 === null || texture2 === void 0 ? void 0 : texture2["_resizeMode"]) {
          texture2.dw = this.pin("width");
          texture2.dh = this.pin("height");
        }
        _super.prototype.render.call(this, context);
      };
      return Sprite2;
    }(Node)
  );
  var image = sprite;
  var Image$1 = Sprite;
  var __extends$3 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var CanvasTexture = (
    /** @class */
    function(_super) {
      __extends$3(CanvasTexture2, _super);
      function CanvasTexture2() {
        var _this = _super.call(this, document.createElement("canvas")) || this;
        _this._lastPixelRatio = 0;
        return _this;
      }
      CanvasTexture2.prototype.setSize = function(textureWidth, textureHeight, pixelRatio) {
        if (pixelRatio === void 0) {
          pixelRatio = 1;
        }
        this._source.width = textureWidth * pixelRatio;
        this._source.height = textureHeight * pixelRatio;
        this._pixelRatio = pixelRatio;
      };
      CanvasTexture2.prototype.getContext = function(type, attributes) {
        if (type === void 0) {
          type = "2d";
        }
        return this._source.getContext(type, attributes);
      };
      CanvasTexture2.prototype.getOptimalPixelRatio = function() {
        return Math.ceil(this._lastPixelRatio);
      };
      CanvasTexture2.prototype.setMemoizer = function(memoizer) {
        this._memoizer = memoizer;
      };
      CanvasTexture2.prototype.setDrawer = function(drawer) {
        this._drawer = drawer;
      };
      CanvasTexture2.prototype.prerender = function(context) {
        var newPixelRatio = context.pixelRatio;
        var lastPixelRatio = this._lastPixelRatio;
        var pixelRationChange = lastPixelRatio / newPixelRatio;
        var pixelRatioChanged = lastPixelRatio === 0 || pixelRationChange > 1.25 || pixelRationChange < 0.8;
        if (pixelRatioChanged) {
          this._lastPixelRatio = newPixelRatio;
        }
        var newMemoKey = this._memoizer ? this._memoizer.call(this) : null;
        var memoKeyChanged = this._lastMemoKey !== newMemoKey;
        if (pixelRatioChanged || memoKeyChanged) {
          this._lastMemoKey = newMemoKey;
          this._lastPixelRatio = newPixelRatio;
          if (typeof this._drawer === "function") {
            this._drawer.call(this);
          }
          return true;
        }
      };
      CanvasTexture2.prototype.size = function(width, height, pixelRatio) {
        this.setSize(width, height, pixelRatio);
        return this;
      };
      CanvasTexture2.prototype.context = function(type, attributes) {
        if (type === void 0) {
          type = "2d";
        }
        return this.getContext(type, attributes);
      };
      CanvasTexture2.prototype.canvas = function(legacyTextureDrawer) {
        if (typeof legacyTextureDrawer === "function") {
          legacyTextureDrawer.call(this, this.getContext());
        } else if (typeof legacyTextureDrawer === "undefined") {
          if (typeof this._drawer === "function") {
            this._drawer.call(this);
          }
        }
        return this;
      };
      return CanvasTexture2;
    }(ImageTexture)
  );
  function canvas(type, attributes, legacyTextureDrawer) {
    if (typeof type === "function") {
      var texture_1 = new CanvasTexture();
      legacyTextureDrawer = type;
      texture_1.setDrawer(function() {
        legacyTextureDrawer.call(texture_1, texture_1.getContext());
      });
      return texture_1;
    } else if (typeof attributes === "function") {
      var texture_2 = new CanvasTexture();
      legacyTextureDrawer = attributes;
      texture_2.setDrawer(function() {
        legacyTextureDrawer.call(texture_2, texture_2.getContext(type));
      });
      return texture_2;
    } else if (typeof legacyTextureDrawer === "function") {
      var texture_3 = new CanvasTexture();
      texture_3.setDrawer(function() {
        legacyTextureDrawer.call(texture_3, texture_3.getContext(type, attributes));
      });
      return texture_3;
    } else {
      var texture2 = new CanvasTexture();
      return texture2;
    }
  }
  function memoizeDraw(legacySpriteDrawer, legacySpriteMemoizer) {
    if (legacySpriteMemoizer === void 0) {
      legacySpriteMemoizer = function() {
        return null;
      };
    }
    var sprite2 = new Sprite();
    var texture2 = new CanvasTexture();
    sprite2.texture(texture2);
    texture2.setDrawer(function() {
      legacySpriteDrawer(2.5 * texture2._lastPixelRatio, texture2, sprite2);
    });
    texture2.setMemoizer(legacySpriteMemoizer);
    return sprite2;
  }
  var POINTER_CLICK = "click";
  var POINTER_START = "touchstart mousedown";
  var POINTER_MOVE = "touchmove mousemove";
  var POINTER_END = "touchend mouseup";
  var POINTER_CANCEL = "touchcancel mousecancel";
  var EventPoint = (
    /** @class */
    function() {
      function EventPoint2() {
      }
      EventPoint2.prototype.clone = function(obj) {
        if (obj) {
          obj.x = this.x;
          obj.y = this.y;
        } else {
          obj = {
            x: this.x,
            y: this.y
          };
        }
        return obj;
      };
      EventPoint2.prototype.toString = function() {
        return (this.x | 0) + "x" + (this.y | 0);
      };
      return EventPoint2;
    }()
  );
  var PointerSyntheticEvent = (
    /** @class */
    function() {
      function PointerSyntheticEvent2() {
        this.abs = new EventPoint();
      }
      PointerSyntheticEvent2.prototype.clone = function(obj) {
        if (obj) {
          obj.x = this.x;
          obj.y = this.y;
        } else {
          obj = {
            x: this.x,
            y: this.y
          };
        }
        return obj;
      };
      PointerSyntheticEvent2.prototype.toString = function() {
        return this.type + ": " + (this.x | 0) + "x" + (this.y | 0);
      };
      return PointerSyntheticEvent2;
    }()
  );
  var VisitPayload = (
    /** @class */
    function() {
      function VisitPayload2() {
        this.type = "";
        this.x = 0;
        this.y = 0;
        this.timeStamp = -1;
        this.event = null;
        this.root = null;
        this.collected = null;
      }
      VisitPayload2.prototype.toString = function() {
        return this.type + ": " + (this.x | 0) + "x" + (this.y | 0);
      };
      return VisitPayload2;
    }()
  );
  var syntheticEvent = new PointerSyntheticEvent();
  var PAYLOAD = new VisitPayload();
  var Pointer = (
    /** @class */
    function() {
      function Pointer2() {
        var _this = this;
        this.ratio = 1;
        this.clickList = [];
        this.cancelList = [];
        this.handleStart = function(event) {
          event.preventDefault();
          _this.localPoint(event);
          _this.dispatchEvent(event.type, event);
          _this.findTargets("click", _this.clickList);
          _this.findTargets("mousecancel", _this.cancelList);
        };
        this.handleMove = function(event) {
          event.preventDefault();
          _this.localPoint(event);
          _this.dispatchEvent(event.type, event);
        };
        this.handleEnd = function(event) {
          event.preventDefault();
          _this.dispatchEvent(event.type, event);
          if (_this.clickList.length) {
            _this.dispatchEvent("click", event, _this.clickList);
          }
          _this.cancelList.length = 0;
        };
        this.handleCancel = function(event) {
          if (_this.cancelList.length) {
            _this.dispatchEvent("mousecancel", event, _this.cancelList);
          }
          _this.clickList.length = 0;
        };
        this.visitStart = function(node, payload) {
          return !node._flag(payload.type);
        };
        this.visitEnd = function(node, payload) {
          syntheticEvent.raw = payload.event;
          syntheticEvent.type = payload.type;
          syntheticEvent.timeStamp = payload.timeStamp;
          syntheticEvent.abs.x = payload.x;
          syntheticEvent.abs.y = payload.y;
          var listeners = node.listeners(payload.type);
          if (!listeners) {
            return;
          }
          node.matrix().inverse().map(payload, syntheticEvent);
          var isEventTarget = node === payload.root || node.attr("spy") || node.hitTest(syntheticEvent);
          if (!isEventTarget) {
            return;
          }
          if (payload.collected) {
            payload.collected.push(node);
          }
          if (payload.event) {
            var cancel = false;
            for (var l = 0; l < listeners.length; l++) {
              cancel = listeners[l].call(node, syntheticEvent) ? true : cancel;
            }
            return cancel;
          }
        };
      }
      Pointer2.prototype.mount = function(stage, elem) {
        var _this = this;
        this.stage = stage;
        this.elem = elem;
        this.ratio = stage.viewport().ratio || 1;
        stage.on("viewport", function(viewport) {
          var _a;
          _this.ratio = (_a = viewport.ratio) !== null && _a !== void 0 ? _a : _this.ratio;
        });
        elem.addEventListener("touchstart", this.handleStart);
        elem.addEventListener("touchend", this.handleEnd);
        elem.addEventListener("touchmove", this.handleMove);
        elem.addEventListener("touchcancel", this.handleCancel);
        elem.addEventListener("mousedown", this.handleStart);
        elem.addEventListener("mouseup", this.handleEnd);
        elem.addEventListener("mousemove", this.handleMove);
        document.addEventListener("mouseup", this.handleCancel);
        window.addEventListener("blur", this.handleCancel);
        return this;
      };
      Pointer2.prototype.unmount = function() {
        var elem = this.elem;
        elem.removeEventListener("touchstart", this.handleStart);
        elem.removeEventListener("touchend", this.handleEnd);
        elem.removeEventListener("touchmove", this.handleMove);
        elem.removeEventListener("touchcancel", this.handleCancel);
        elem.removeEventListener("mousedown", this.handleStart);
        elem.removeEventListener("mouseup", this.handleEnd);
        elem.removeEventListener("mousemove", this.handleMove);
        document.removeEventListener("mouseup", this.handleCancel);
        window.removeEventListener("blur", this.handleCancel);
        return this;
      };
      Pointer2.prototype.localPoint = function(event) {
        var _a;
        var elem = this.elem;
        var x;
        var y;
        if ((_a = event.touches) === null || _a === void 0 ? void 0 : _a.length) {
          x = event.touches[0].clientX;
          y = event.touches[0].clientY;
        } else {
          x = event.clientX;
          y = event.clientY;
        }
        var rect = elem.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
        x -= elem.clientLeft | 0;
        y -= elem.clientTop | 0;
        PAYLOAD.x = x * this.ratio;
        PAYLOAD.y = y * this.ratio;
      };
      Pointer2.prototype.findTargets = function(type, result) {
        var payload = PAYLOAD;
        payload.type = type;
        payload.root = this.stage;
        payload.event = null;
        payload.collected = result;
        payload.collected.length = 0;
        this.stage.visit({
          reverse: true,
          visible: true,
          start: this.visitStart,
          end: this.visitEnd
        }, payload);
      };
      Pointer2.prototype.dispatchEvent = function(type, event, targets) {
        var payload = PAYLOAD;
        payload.type = type;
        payload.root = this.stage;
        payload.event = event;
        payload.timeStamp = Date.now();
        payload.collected = null;
        if (targets) {
          while (targets.length) {
            var node = targets.shift();
            if (this.visitEnd(node, payload)) {
              break;
            }
          }
          targets.length = 0;
        } else {
          this.stage.visit({
            reverse: true,
            visible: true,
            start: this.visitStart,
            end: this.visitEnd
          }, payload);
        }
      };
      return Pointer2;
    }()
  );
  var Mouse = {
    CLICK: "click",
    START: "touchstart mousedown",
    MOVE: "touchmove mousemove",
    END: "touchend mouseup",
    CANCEL: "touchcancel mousecancel"
  };
  var __extends$2 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var __assign = function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var ROOTS = [];
  function pause() {
    for (var i = ROOTS.length - 1; i >= 0; i--) {
      ROOTS[i].pause();
    }
  }
  function resume() {
    for (var i = ROOTS.length - 1; i >= 0; i--) {
      ROOTS[i].resume();
    }
  }
  function mount(configs) {
    if (configs === void 0) {
      configs = {};
    }
    var root = new Root();
    root.mount(configs);
    root.pointer = new Pointer().mount(root, root.dom);
    return root;
  }
  var Root = (
    /** @class */
    function(_super) {
      __extends$2(Root2, _super);
      function Root2() {
        var _this = _super.call(this) || this;
        _this.canvas = null;
        _this.dom = null;
        _this.context = null;
        _this.pixelWidth = -1;
        _this.pixelHeight = -1;
        _this.pixelRatio = 1;
        _this.drawingWidth = 0;
        _this.drawingHeight = 0;
        _this.mounted = false;
        _this.paused = false;
        _this.sleep = false;
        _this.mount = function(configs) {
          if (configs === void 0) {
            configs = {};
          }
          if (typeof configs.canvas === "string") {
            _this.canvas = document.getElementById(configs.canvas);
            if (!_this.canvas) {
              console.error("Canvas element not found: ", configs.canvas);
            }
          } else if (configs.canvas instanceof HTMLCanvasElement) {
            _this.canvas = configs.canvas;
          } else if (configs.canvas) {
            console.error("Unknown value for canvas:", configs.canvas);
          }
          if (!_this.canvas) {
            _this.canvas = document.getElementById("cutjs") || document.getElementById("stage");
          }
          if (!_this.canvas) {
            _this.canvas = document.createElement("canvas");
            Object.assign(_this.canvas.style, {
              position: "absolute",
              display: "block",
              top: "0",
              left: "0",
              bottom: "0",
              right: "0",
              width: "100%",
              height: "100%"
            });
            var body = document.body;
            body.insertBefore(_this.canvas, body.firstChild);
          }
          _this.dom = _this.canvas;
          _this.context = _this.canvas.getContext("2d");
          var devicePixelRatio = window.devicePixelRatio || 1;
          var backingStorePixelRatio = (
            // @ts-ignore
            _this.context.webkitBackingStorePixelRatio || // @ts-ignore
            _this.context.mozBackingStorePixelRatio || // @ts-ignore
            _this.context.msBackingStorePixelRatio || // @ts-ignore
            _this.context.oBackingStorePixelRatio || // @ts-ignore
            _this.context.backingStorePixelRatio || 1
          );
          _this.devicePixelRatio = devicePixelRatio;
          _this.backingStoreRatio = backingStorePixelRatio;
          _this.pixelRatio = _this.devicePixelRatio / _this.backingStoreRatio;
          _this.mounted = true;
          ROOTS.push(_this);
          _this.requestFrame();
        };
        _this.frameRequested = false;
        _this.requestFrame = function() {
          if (!_this.frameRequested) {
            _this.frameRequested = true;
            requestAnimationFrame(_this.onFrame);
          }
        };
        _this._lastFrameTime = 0;
        _this._mo_touch = null;
        _this.onFrame = function(now) {
          _this.frameRequested = false;
          if (!_this.mounted || !_this.canvas || !_this.context) {
            return;
          }
          _this.requestFrame();
          var newPixelWidth = _this.canvas.clientWidth;
          var newPixelHeight = _this.canvas.clientHeight;
          if (_this.pixelWidth !== newPixelWidth || _this.pixelHeight !== newPixelHeight) {
            _this.pixelWidth = newPixelWidth;
            _this.pixelHeight = newPixelHeight;
            _this.drawingWidth = newPixelWidth * _this.pixelRatio;
            _this.drawingHeight = newPixelHeight * _this.pixelRatio;
            if (_this.canvas.width !== _this.drawingWidth || _this.canvas.height !== _this.drawingHeight) {
              _this.canvas.width = _this.drawingWidth;
              _this.canvas.height = _this.drawingHeight;
              _this.viewport({
                width: _this.drawingWidth,
                height: _this.drawingHeight,
                ratio: _this.pixelRatio
              });
            }
          }
          var last = _this._lastFrameTime || now;
          var elapsed = now - last;
          if (!_this.mounted || _this.paused || _this.sleep) {
            return;
          }
          _this._lastFrameTime = now;
          _this.prerender();
          var tickRequest = _this._tick(elapsed, now, last);
          if (_this._mo_touch != _this._ts_touch) {
            _this._mo_touch = _this._ts_touch;
            _this.sleep = false;
            if (_this.drawingWidth > 0 && _this.drawingHeight > 0) {
              _this.context.setTransform(1, 0, 0, 1, 0, 0);
              _this.context.clearRect(0, 0, _this.drawingWidth, _this.drawingHeight);
              _this.render(_this.context);
            }
          } else if (tickRequest) {
            _this.sleep = false;
          } else {
            _this.sleep = true;
          }
          stats.fps = elapsed ? 1e3 / elapsed : 0;
        };
        _this.label("Root");
        return _this;
      }
      Root2.prototype.resume = function() {
        if (this.sleep || this.paused) {
          this.requestFrame();
        }
        this.paused = false;
        this.sleep = false;
        this.publish("resume");
        return this;
      };
      Root2.prototype.pause = function() {
        if (!this.paused) {
          this.publish("pause");
        }
        this.paused = true;
        return this;
      };
      Root2.prototype.touch = function() {
        if (this.sleep || this.paused) {
          this.requestFrame();
        }
        this.sleep = false;
        return _super.prototype.touch.call(this);
      };
      Root2.prototype.unmount = function() {
        var _a;
        this.mounted = false;
        var index = ROOTS.indexOf(this);
        if (index >= 0) {
          ROOTS.splice(index, 1);
        }
        (_a = this.pointer) === null || _a === void 0 ? void 0 : _a.unmount();
        return this;
      };
      Root2.prototype.background = function(color) {
        if (this.dom) {
          this.dom.style.backgroundColor = color;
        }
        return this;
      };
      Root2.prototype.viewport = function(width, height, ratio) {
        if (typeof width === "undefined") {
          return Object.assign({}, this._viewport);
        }
        if (typeof width === "object") {
          var options = width;
          width = options.width;
          height = options.height;
          ratio = options.ratio;
        }
        if (typeof width === "number" && typeof height === "number") {
          this._viewport = {
            width,
            height,
            ratio: typeof ratio === "number" ? ratio : 1
          };
          this.viewbox();
          var data_1 = Object.assign({}, this._viewport);
          this.visit({
            start: function(node) {
              if (!node._flag("viewport")) {
                return true;
              }
              node.publish("viewport", [data_1]);
            }
          });
        }
        return this;
      };
      Root2.prototype.viewbox = function(width, height, mode) {
        if (typeof width === "number" && typeof height === "number") {
          this._viewbox = {
            width,
            height,
            mode
          };
        } else if (typeof width === "object" && width !== null) {
          this._viewbox = __assign({}, width);
        }
        this.rescale();
        return this;
      };
      Root2.prototype.camera = function(matrix) {
        this._camera = matrix;
        this.rescale();
        return this;
      };
      Root2.prototype.rescale = function() {
        var viewbox = this._viewbox;
        var viewport = this._viewport;
        var camera = this._camera;
        if (viewport && viewbox) {
          var viewportWidth = viewport.width;
          var viewportHeight = viewport.height;
          var viewboxMode = isValidFitMode(viewbox.mode) ? viewbox.mode : "in-pad";
          var viewboxWidth = viewbox.width;
          var viewboxHeight = viewbox.height;
          this.pin({
            width: viewboxWidth,
            height: viewboxHeight
          });
          this.scaleTo(viewportWidth, viewportHeight, viewboxMode);
          var viewboxX = viewbox.x || 0;
          var viewboxY = viewbox.y || 0;
          var cameraZoom = (camera === null || camera === void 0 ? void 0 : camera.a) || 1;
          var cameraX = (camera === null || camera === void 0 ? void 0 : camera.e) || 0;
          var cameraY = (camera === null || camera === void 0 ? void 0 : camera.f) || 0;
          var scaleX = this.pin("scaleX");
          var scaleY = this.pin("scaleY");
          this.pin("scaleX", scaleX * cameraZoom);
          this.pin("scaleY", scaleY * cameraZoom);
          this.pin("offsetX", cameraX - viewboxX * scaleX * cameraZoom);
          this.pin("offsetY", cameraY - viewboxY * scaleY * cameraZoom);
        } else if (viewport) {
          this.pin({
            width: viewport.width,
            height: viewport.height
          });
        }
        return this;
      };
      return Root2;
    }(Node)
  );
  var __extends$1 = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  function anim(frames, fps) {
    var anim2 = new Anim();
    anim2.frames(frames).gotoFrame(0);
    fps && anim2.fps(fps);
    return anim2;
  }
  var FPS = 15;
  var Anim = (
    /** @class */
    function(_super) {
      __extends$1(Anim2, _super);
      function Anim2() {
        var _this = _super.call(this) || this;
        _this.label("Anim");
        _this._textures = [];
        _this._fps = FPS;
        _this._ft = 1e3 / _this._fps;
        _this._time = -1;
        _this._repeat = 0;
        _this._index = 0;
        _this._frames = [];
        var lastTime = 0;
        _this.tick(function(t, now, last) {
          if (this._time < 0 || this._frames.length <= 1) {
            return;
          }
          var ignore = lastTime != last;
          lastTime = now;
          if (ignore) {
            return true;
          }
          this._time += t;
          if (this._time < this._ft) {
            return true;
          }
          var n = this._time / this._ft | 0;
          this._time -= n * this._ft;
          this.moveFrame(n);
          if (this._repeat > 0 && (this._repeat -= n) <= 0) {
            this.stop();
            this._callback && this._callback();
            return false;
          }
          return true;
        }, false);
        return _this;
      }
      Anim2.prototype.fps = function(fps) {
        if (typeof fps === "undefined") {
          return this._fps;
        }
        this._fps = fps > 0 ? fps : FPS;
        this._ft = 1e3 / this._fps;
        return this;
      };
      Anim2.prototype.setFrames = function(frames) {
        return this.frames(frames);
      };
      Anim2.prototype.frames = function(frames) {
        this._index = 0;
        this._frames = texture(frames).array();
        this.touch();
        return this;
      };
      Anim2.prototype.length = function() {
        return this._frames ? this._frames.length : 0;
      };
      Anim2.prototype.gotoFrame = function(frame, resize) {
        if (resize === void 0) {
          resize = false;
        }
        this._index = math.wrap(frame, this._frames.length) | 0;
        resize = resize || !this._textures[0];
        this._textures[0] = this._frames[this._index];
        if (resize) {
          this.pin("width", this._textures[0].getWidth());
          this.pin("height", this._textures[0].getHeight());
        }
        this.touch();
        return this;
      };
      Anim2.prototype.moveFrame = function(move) {
        return this.gotoFrame(this._index + move);
      };
      Anim2.prototype.repeat = function(repeat, callback) {
        this._repeat = repeat * this._frames.length - 1;
        this._callback = callback;
        this.play();
        return this;
      };
      Anim2.prototype.play = function(frame) {
        if (typeof frame !== "undefined") {
          this.gotoFrame(frame);
          this._time = 0;
        } else if (this._time < 0) {
          this._time = 0;
        }
        this.touch();
        return this;
      };
      Anim2.prototype.stop = function(frame) {
        this._time = -1;
        if (typeof frame !== "undefined") {
          this.gotoFrame(frame);
        }
        return this;
      };
      return Anim2;
    }(Node)
  );
  var __extends = function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2)
          if (Object.prototype.hasOwnProperty.call(b2, p))
            d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  function monotype(chars) {
    return new Monotype().frames(chars);
  }
  var Monotype = (
    /** @class */
    function(_super) {
      __extends(Monotype2, _super);
      function Monotype2() {
        var _this = _super.call(this) || this;
        _this.label("String");
        _this._textures = [];
        return _this;
      }
      Monotype2.prototype.setFont = function(frames) {
        return this.frames(frames);
      };
      Monotype2.prototype.frames = function(frames) {
        this._textures = [];
        if (typeof frames == "string") {
          var selection_1 = texture(frames);
          this._font = function(value) {
            return selection_1.one(value);
          };
        } else if (typeof frames === "object") {
          this._font = function(value) {
            return frames[value];
          };
        } else if (typeof frames === "function") {
          this._font = frames;
        }
        return this;
      };
      Monotype2.prototype.setValue = function(value) {
        return this.value(value);
      };
      Monotype2.prototype.value = function(value) {
        if (typeof value === "undefined") {
          return this._value;
        }
        if (this._value === value) {
          return this;
        }
        this._value = value;
        if (value === null) {
          value = "";
        } else if (typeof value !== "string" && !Array.isArray(value)) {
          value = value.toString();
        }
        this._spacing = this._spacing || 0;
        var width = 0;
        var height = 0;
        for (var i = 0; i < value.length; i++) {
          var v = value[i];
          var texture_1 = this._textures[i] = this._font(typeof v === "string" ? v : v + "");
          width += i > 0 ? this._spacing : 0;
          texture_1.setDestinationCoordinate(width, 0);
          width = width + texture_1.getWidth();
          height = Math.max(height, texture_1.getHeight());
        }
        this.pin("width", width);
        this.pin("height", height);
        this._textures.length = value.length;
        return this;
      };
      return Monotype2;
    }(Node)
  );
  var string = monotype;
  var Str = Monotype;
  const Stage = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    Anim,
    Atlas,
    CanvasTexture,
    Image: Image$1,
    ImageTexture,
    Math: math,
    Matrix,
    Monotype,
    Mouse,
    Node,
    POINTER_CANCEL,
    POINTER_CLICK,
    POINTER_END,
    POINTER_MOVE,
    POINTER_START,
    Pin,
    PipeTexture,
    Pointer,
    ResizableTexture,
    Root,
    Sprite,
    Str,
    Texture,
    TextureSelection,
    Transition,
    anim,
    atlas,
    box,
    canvas,
    clamp,
    column,
    create,
    image,
    isValidFitMode,
    layer,
    layout,
    length,
    math,
    maximize,
    memoizeDraw,
    minimize,
    monotype,
    mount,
    pause,
    random,
    resume,
    row,
    sprite,
    string,
    texture,
    wrap
  }, Symbol.toStringTag, { value: "Module" }));

  const math_atan2 = Math.atan2;
  const math_abs = Math.abs;
  const math_sqrt = Math.sqrt;
  const math_PI = Math.PI;
  const math_max = Math.max;
  const math_min = Math.min;
  let mounted = null;
  /** @internal */
  function memo() {
      const memory = [];
      function recall(...rest) {
          let equal = memory.length === rest.length;
          for (let i = 0; equal && i < rest.length; i++) {
              equal = equal && memory[i] === rest[i];
              memory[i] = rest[i];
          }
          memory.length = rest.length;
          return equal;
      }
      function reset() {
          memory.length = 0;
          // void 0;
      }
      return {
          recall,
          reset,
      };
  }
  Testbed.mount = () => {
      if (mounted) {
          return mounted;
      }
      mounted = new StageTestbed();
      // todo: merge rest of this into StageTestbed
      // todo: should we create these elements if not exists?
      const playButton = document.getElementById('testbed-play');
      const statusElement = document.getElementById('testbed-status');
      const infoElement = document.getElementById('testbed-info');
      if (playButton) {
          playButton.addEventListener('click', () => {
              mounted.isPaused() ? mounted.resume() : mounted.pause();
          });
          mounted._pause = () => {
              playButton.classList.add('pause');
              playButton.classList.remove('play');
          };
          mounted._resume = () => {
              playButton.classList.add('play');
              playButton.classList.remove('pause');
          };
      }
      else {
          console.log("Please create a button with id='testbed-play'");
      }
      let lastStatus = '';
      if (statusElement) {
          statusElement.innerText = lastStatus;
      }
      mounted._status = (text) => {
          if (lastStatus === text) {
              return;
          }
          lastStatus = text;
          if (statusElement) {
              statusElement.innerText = text;
          }
      };
      let lastInfo = '';
      if (infoElement) {
          infoElement.innerText = lastInfo;
      }
      mounted._info = (text) => {
          if (lastInfo === text) {
              return;
          }
          lastInfo = text;
          if (infoElement) {
              infoElement.innerText = text;
          }
      };
      return mounted;
  };
  const getStyle = function (obj) {
      var _a, _b;
      return (_b = (_a = obj['render']) !== null && _a !== void 0 ? _a : obj['style']) !== null && _b !== void 0 ? _b : {};
  };
  function findBody(world, point) {
      let body = null;
      const aabb = {
          lowerBound: point,
          upperBound: point,
      };
      world.queryAABB(aabb, (fixture) => {
          if (!fixture.getBody().isDynamic() || !fixture.testPoint(point)) {
              return true;
          }
          body = fixture.getBody();
          return false;
      });
      return body;
  }
  /** @internal */
  class StageTestbed extends Testbed {
      constructor() {
          super(...arguments);
          this.paused = false;
          this.lastDrawHash = "";
          this.newDrawHash = "";
          this.buffer = [];
          this.drawSegment = this.drawEdge;
      }
      start(world) {
          const stage = this.stage = Stage.mount();
          const canvas = this.canvas = stage.dom;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const testbed = this;
          this.canvas = canvas;
          stage.on(Stage.POINTER_START, () => {
              var _a;
              window.focus();
              // @ts-ignore
              (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.blur();
              canvas.focus();
          });
          stage.MAX_ELAPSE = 1000 / 30;
          stage.on('resume', () => {
              this.paused = false;
              this._resume();
          });
          stage.on('pause', () => {
              this.paused = true;
              this._pause();
          });
          const drawingTexture = new Stage.CanvasTexture();
          drawingTexture.draw = (ctx) => {
              const pixelRatio = 2 * drawingTexture.getOptimalPixelRatio();
              ctx.save();
              ctx.transform(1, 0, 0, this.scaleY, -this.x, -this.y);
              ctx.lineWidth = 3 / pixelRatio;
              ctx.lineCap = 'round';
              for (let drawing = this.buffer.shift(); drawing; drawing = this.buffer.shift()) {
                  drawing(ctx, pixelRatio);
              }
              ctx.restore();
          };
          const drawingElement = Stage.sprite(drawingTexture);
          stage.append(drawingElement);
          stage.tick(() => {
              this.buffer.length = 0;
          }, true);
          stage.background(this.background);
          stage.viewbox(this.width, this.height);
          stage.pin('alignX', -0.5);
          stage.pin('alignY', -0.5);
          const worldNode = new WorldStageNode(world, this);
          // stage.empty();
          stage.prepend(worldNode);
          let lastX = 0;
          let lastY = 0;
          stage.tick((dt, t) => {
              // update camera position
              if (lastX !== this.x || lastY !== this.y) {
                  worldNode.offset(-this.x, -this.y);
                  lastX = this.x;
                  lastY = this.y;
              }
          });
          worldNode.tick((dt, t) => {
              this.step(dt, t);
              if (targetBody) {
                  this.drawSegment(targetBody.getPosition(), mouseMove, 'rgba(255,255,255,0.2)');
              }
              if (this.lastDrawHash !== this.newDrawHash) {
                  this.lastDrawHash = this.newDrawHash;
                  stage.touch();
              }
              this.newDrawHash = "";
              return true;
          });
          const mouseGround = world.createBody();
          let mouseJoint = null;
          let targetBody = null;
          const mouseMove = create$2(0, 0);
          worldNode.attr('spy', true);
          worldNode.on(Stage.POINTER_START, (point) => {
              const p = create$2(point.x, testbed.scaleY * point.y);
              if (targetBody) {
                  return;
              }
              const body = findBody(world, p);
              if (!body) {
                  return;
              }
              if (this.mouseForce) {
                  targetBody = body;
              }
              else {
                  mouseJoint = new MouseJoint({ maxForce: 1000 }, mouseGround, body, p);
                  world.createJoint(mouseJoint);
              }
          });
          worldNode.on(Stage.POINTER_MOVE, (point) => {
              const p = create$2(point.x, testbed.scaleY * point.y);
              if (mouseJoint) {
                  mouseJoint.setTarget(p);
              }
              copy(p, mouseMove);
          });
          worldNode.on(Stage.POINTER_END, (point) => {
              const p = create$2(point.x, testbed.scaleY * point.y);
              if (mouseJoint) {
                  world.destroyJoint(mouseJoint);
                  mouseJoint = null;
              }
              if (targetBody && this.mouseForce) {
                  const target = targetBody.getPosition();
                  const force = create$2((p[0] - target[0]) * this.mouseForce, (p[1] - target[1]) * this.mouseForce);
                  targetBody.applyForceToCenter(force, true);
                  targetBody = null;
              }
          });
          worldNode.on(Stage.POINTER_CANCEL, (point) => {
              if (mouseJoint) {
                  world.destroyJoint(mouseJoint);
                  mouseJoint = null;
              }
              if (targetBody) {
                  targetBody = null;
              }
          });
          const activeKeys = testbed.activeKeys;
          const downKeys = {};
          function updateActiveKeys(keyCode, down) {
              const char = String.fromCharCode(keyCode);
              if (/\w/.test(char)) {
                  activeKeys[char] = down;
              }
              activeKeys.right = downKeys[39] || activeKeys['D'];
              activeKeys.left = downKeys[37] || activeKeys['A'];
              activeKeys.up = downKeys[38] || activeKeys['W'];
              activeKeys.down = downKeys[40] || activeKeys['S'];
              activeKeys.fire = downKeys[32] || downKeys[13];
          }
          window.addEventListener("keydown", function (e) {
              const keyCode = e.keyCode;
              downKeys[keyCode] = true;
              updateActiveKeys(keyCode, true);
              testbed.keydown && testbed.keydown(keyCode, String.fromCharCode(keyCode));
          });
          window.addEventListener("keyup", function (e) {
              const keyCode = e.keyCode;
              downKeys[keyCode] = false;
              updateActiveKeys(keyCode, false);
              testbed.keyup && testbed.keyup(keyCode, String.fromCharCode(keyCode));
          });
          this.resume();
      }
      /** @private @internal */
      focus() {
          // @ts-ignore
          document.activeElement && document.activeElement.blur();
          this.canvas.focus();
      }
      /** @internal */
      _pause() {
      }
      /** @internal */
      _resume() {
      }
      /** @internal */
      _status(string) {
      }
      /** @internal */
      _info(text) {
      }
      /** @internal */
      isPaused() {
          return this.paused;
      }
      /** @internal */
      togglePause() {
          this.paused ? this.resume() : this.pause();
      }
      /** @internal */
      pause() {
          this.stage.pause();
      }
      /** @internal */
      resume() {
          this.stage.resume();
          this.focus();
      }
      drawPoint(p, r, color) {
          this.buffer.push(function (ctx, ratio) {
              ctx.beginPath();
              ctx.arc(p[0], p[1], 5 / ratio, 0, 2 * math_PI);
              ctx.strokeStyle = color;
              ctx.stroke();
          });
          this.newDrawHash += "point" + p[0] + ',' + p[1] + ',' + r + ',' + color;
      }
      drawCircle(p, r, color) {
          this.buffer.push(function (ctx) {
              ctx.beginPath();
              ctx.arc(p[0], p[1], r, 0, 2 * math_PI);
              ctx.strokeStyle = color;
              ctx.stroke();
          });
          this.newDrawHash += "circle" + p[0] + ',' + p[1] + ',' + r + ',' + color;
      }
      drawEdge(a, b, color) {
          this.buffer.push(function (ctx) {
              ctx.beginPath();
              ctx.moveTo(a[0], a[1]);
              ctx.lineTo(b[0], b[1]);
              ctx.strokeStyle = color;
              ctx.stroke();
          });
          this.newDrawHash += "segment" + a[0] + ',' + a[1] + ',' + b[0] + ',' + b[1] + ',' + color;
      }
      drawPolygon(points, color) {
          if (!points || !points.length) {
              return;
          }
          this.buffer.push(function (ctx) {
              ctx.beginPath();
              ctx.moveTo(points[0][0], points[0][1]);
              for (let i = 1; i < points.length; i++) {
                  ctx.lineTo(points[i][0], points[i][1]);
              }
              ctx.strokeStyle = color;
              ctx.closePath();
              ctx.stroke();
          });
          this.newDrawHash += "segment";
          for (let i = 1; i < points.length; i++) {
              this.newDrawHash += points[i][0] + ',' + points[i][1] + ',';
          }
          this.newDrawHash += color;
      }
      drawAABB(aabb, color) {
          this.buffer.push(function (ctx) {
              ctx.beginPath();
              ctx.moveTo(aabb.lowerBound[0], aabb.lowerBound[1]);
              ctx.lineTo(aabb.upperBound[0], aabb.lowerBound[1]);
              ctx.lineTo(aabb.upperBound[0], aabb.upperBound[1]);
              ctx.lineTo(aabb.lowerBound[0], aabb.upperBound[1]);
              ctx.strokeStyle = color;
              ctx.closePath();
              ctx.stroke();
          });
          this.newDrawHash += "aabb";
          this.newDrawHash += aabb.lowerBound[0] + ',' + aabb.lowerBound[1] + ',';
          this.newDrawHash += aabb.upperBound[0] + ',' + aabb.upperBound[1] + ',';
          this.newDrawHash += color;
      }
      findOne(query) {
          throw new Error("Not implemented");
      }
      findAll(query) {
          throw new Error("Not implemented");
      }
  }
  class WorldStageNode extends Stage.Node {
      constructor(world, opts = {}) {
          super();
          this.nodes = new WeakMap();
          this.options = {
              speed: 1,
              hz: 60,
              scaleY: -1,
              lineWidth: 3,
              stroke: undefined,
              fill: undefined
          };
          this.label('Planck');
          this.options = Object.assign(Object.assign({}, this.options), opts);
          if (math_abs(this.options.hz) < 1) {
              this.options.hz = 1 / this.options.hz;
          }
          this.world = world;
          this.testbed = opts;
          const timeStep = 1 / this.options.hz;
          let elapsedTime = 0;
          let errored = false;
          this.tick((dt) => {
              if (errored) {
                  return false;
              }
              try {
                  dt = dt * 0.001 * this.options.speed;
                  elapsedTime += dt;
                  while (elapsedTime > timeStep) {
                      world.step(timeStep);
                      elapsedTime -= timeStep;
                  }
                  this.renderWorld();
                  return true;
              }
              catch (error) {
                  errored = true;
                  console.error(error);
                  return false;
              }
          }, true);
          world.on('remove-fixture', (obj) => {
              var _a;
              (_a = this.nodes.get(obj)) === null || _a === void 0 ? void 0 : _a.remove();
          });
          world.on('remove-joint', (obj) => {
              var _a;
              (_a = this.nodes.get(obj)) === null || _a === void 0 ? void 0 : _a.remove();
          });
      }
      renderWorld() {
          const world = this.world;
          const options = this.options;
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const viewer = this;
          for (let b = world.getBodyList(); b; b = b.getNext()) {
              for (let f = b.getFixtureList(); f; f = f.getNext()) {
                  let node = this.nodes.get(f);
                  const fstyle = getStyle(f);
                  const bstyle = getStyle(b);
                  if (!node) {
                      if (fstyle && fstyle.stroke) {
                          options.stroke = fstyle.stroke;
                      }
                      else if (bstyle && bstyle.stroke) {
                          options.stroke = bstyle.stroke;
                      }
                      else if (b.isDynamic()) {
                          options.stroke = 'rgba(255,255,255,0.9)';
                      }
                      else if (b.isKinematic()) {
                          options.stroke = 'rgba(255,255,255,0.7)';
                      }
                      else if (b.isStatic()) {
                          options.stroke = 'rgba(255,255,255,0.5)';
                      }
                      if (fstyle && fstyle.fill) {
                          options.fill = fstyle.fill;
                      }
                      else if (bstyle && bstyle.fill) {
                          options.fill = bstyle.fill;
                      }
                      else {
                          options.fill = '';
                      }
                      const type = f.getType();
                      const shape = f.getShape();
                      if (type == 'circle') {
                          node = viewer.drawCircle(shape, options);
                      }
                      if (type == 'edge') {
                          node = viewer.drawEdge(shape, options);
                      }
                      if (type == 'polygon') {
                          node = viewer.drawPolygon(shape, options);
                      }
                      if (type == 'chain') {
                          node = viewer.drawChain(shape, options);
                      }
                      if (node) {
                          node.appendTo(viewer);
                          this.nodes.set(f, node);
                      }
                  }
                  if (node) {
                      const p = b.getPosition();
                      const r = b.getAngle();
                      // @ts-ignore
                      const isChanged = node.__lastX !== p[0] || node.__lastY !== p[1] || node.__lastR !== r;
                      if (isChanged) {
                          // @ts-ignore
                          node.__lastX = p[0];
                          // @ts-ignore
                          node.__lastY = p[1];
                          // @ts-ignore
                          node.__lastR = r;
                          node.offset(p[0], options.scaleY * p[1]);
                          node.rotate(options.scaleY * r);
                      }
                  }
              }
          }
          for (let j = world.getJointList(); j; j = j.getNext()) {
              const type = j.getType();
              if (type == 'pulley-joint') {
                  this.testbed.drawSegment(j.getAnchorA(), j.getGroundAnchorA(), 'rgba(255,255,255,0.5)');
                  this.testbed.drawSegment(j.getAnchorB(), j.getGroundAnchorB(), 'rgba(255,255,255,0.5)');
                  this.testbed.drawSegment(j.getGroundAnchorB(), j.getGroundAnchorA(), 'rgba(255,255,255,0.5)');
              }
              else {
                  this.testbed.drawSegment(j.getAnchorA(), j.getAnchorB(), 'rgba(255,255,255,0.5)');
              }
          }
      }
      drawCircle(shape, options) {
          let offsetX = 0;
          let offsetY = 0;
          const offsetMemo = memo();
          const texture = Stage.canvas();
          texture.setDrawer(function () {
              var _a;
              const ctx = this.getContext();
              const ratio = 2 * this.getOptimalPixelRatio();
              const lw = options.lineWidth / ratio;
              const r = shape.m_radius;
              const cx = r + lw;
              const cy = r + lw;
              const w = r * 2 + lw * 2;
              const h = r * 2 + lw * 2;
              offsetX = shape.m_p[0] - cx;
              offsetY = options.scaleY * shape.m_p[1] - cy;
              this.setSize(w, h, ratio);
              ctx.scale(ratio, ratio);
              ctx.arc(cx, cy, r, 0, 2 * math_PI);
              if (options.fill) {
                  ctx.fillStyle = options.fill;
                  ctx.fill();
              }
              ctx.lineTo(cx, cy);
              ctx.lineWidth = options.lineWidth / ratio;
              ctx.strokeStyle = (_a = options.stroke) !== null && _a !== void 0 ? _a : '';
              ctx.stroke();
          });
          const sprite = Stage.sprite(texture);
          sprite.tick(() => {
              if (!offsetMemo.recall(offsetX, offsetY)) {
                  sprite.offset(offsetX, offsetY);
              }
          });
          const node = Stage.layout().append(sprite);
          return node;
      }
      drawEdge(edge, options) {
          let offsetX = 0;
          let offsetY = 0;
          let offsetA = 0;
          const offsetMemo = memo();
          const texture = Stage.canvas();
          texture.setDrawer(function () {
              var _a;
              const ctx = this.getContext();
              const ratio = 2 * this.getOptimalPixelRatio();
              const lw = options.lineWidth / ratio;
              const v1 = edge.m_vertex1;
              const v2 = edge.m_vertex2;
              const dx = v2[0] - v1[0];
              const dy = v2[1] - v1[1];
              const length = math_sqrt(dx * dx + dy * dy);
              this.setSize(length + 2 * lw, 2 * lw, ratio);
              const minX = math_min(v1[0], v2[0]);
              const minY = math_min(options.scaleY * v1[1], options.scaleY * v2[1]);
              offsetX = minX - lw;
              offsetY = minY - lw;
              offsetA = options.scaleY * math_atan2(dy, dx);
              ctx.scale(ratio, ratio);
              ctx.beginPath();
              ctx.moveTo(lw, lw);
              ctx.lineTo(lw + length, lw);
              ctx.lineCap = 'round';
              ctx.lineWidth = options.lineWidth / ratio;
              ctx.strokeStyle = (_a = options.stroke) !== null && _a !== void 0 ? _a : '';
              ctx.stroke();
          });
          const sprite = Stage.sprite(texture);
          sprite.tick(() => {
              if (!offsetMemo.recall(offsetX, offsetY, offsetA)) {
                  sprite.offset(offsetX, offsetY);
                  sprite.rotate(offsetA);
              }
          });
          const node = Stage.layout().append(sprite);
          return node;
      }
      drawPolygon(shape, options) {
          let offsetX = 0;
          let offsetY = 0;
          const offsetMemo = memo();
          const texture = Stage.canvas();
          texture.setDrawer(function () {
              var _a;
              const ctx = this.getContext();
              const ratio = 2 * this.getOptimalPixelRatio();
              const lw = options.lineWidth / ratio;
              const vertices = shape.m_vertices;
              if (!vertices.length) {
                  return;
              }
              let minX = Infinity;
              let minY = Infinity;
              let maxX = -Infinity;
              let maxY = -Infinity;
              for (let i = 0; i < vertices.length; ++i) {
                  const v = vertices[i];
                  minX = math_min(minX, v[0]);
                  maxX = math_max(maxX, v[0]);
                  minY = math_min(minY, options.scaleY * v[1]);
                  maxY = math_max(maxY, options.scaleY * v[1]);
              }
              const width = maxX - minX;
              const height = maxY - minY;
              offsetX = minX;
              offsetY = minY;
              this.setSize(width + 2 * lw, height + 2 * lw, ratio);
              ctx.scale(ratio, ratio);
              ctx.beginPath();
              for (let i = 0; i < vertices.length; ++i) {
                  const v = vertices[i];
                  const x = v[0] - minX + lw;
                  const y = options.scaleY * v[1] - minY + lw;
                  if (i == 0)
                      ctx.moveTo(x, y);
                  else
                      ctx.lineTo(x, y);
              }
              if (vertices.length > 2) {
                  ctx.closePath();
              }
              if (options.fill) {
                  ctx.fillStyle = options.fill;
                  ctx.fill();
                  ctx.closePath();
              }
              ctx.lineCap = 'round';
              ctx.lineWidth = options.lineWidth / ratio;
              ctx.strokeStyle = (_a = options.stroke) !== null && _a !== void 0 ? _a : '';
              ctx.stroke();
          });
          const sprite = Stage.sprite(texture);
          sprite.tick(() => {
              if (!offsetMemo.recall(offsetX, offsetY)) {
                  sprite.offset(offsetX, offsetY);
              }
          });
          const node = Stage.layout().append(sprite);
          return node;
      }
      drawChain(shape, options) {
          let offsetX = 0;
          let offsetY = 0;
          const offsetMemo = memo();
          const texture = Stage.canvas();
          texture.setDrawer(function () {
              var _a;
              const ctx = this.getContext();
              const ratio = 2 * this.getOptimalPixelRatio();
              const lw = options.lineWidth / ratio;
              const vertices = shape.m_vertices;
              if (!vertices.length) {
                  return;
              }
              let minX = Infinity;
              let minY = Infinity;
              let maxX = -Infinity;
              let maxY = -Infinity;
              for (let i = 0; i < vertices.length; ++i) {
                  const v = vertices[i];
                  minX = math_min(minX, v[0]);
                  maxX = math_max(maxX, v[0]);
                  minY = math_min(minY, options.scaleY * v[1]);
                  maxY = math_max(maxY, options.scaleY * v[1]);
              }
              const width = maxX - minX;
              const height = maxY - minY;
              offsetX = minX;
              offsetY = minY;
              this.setSize(width + 2 * lw, height + 2 * lw, ratio);
              ctx.scale(ratio, ratio);
              ctx.beginPath();
              for (let i = 0; i < vertices.length; ++i) {
                  const v = vertices[i];
                  const x = v[0] - minX + lw;
                  const y = options.scaleY * v[1] - minY + lw;
                  if (i == 0)
                      ctx.moveTo(x, y);
                  else
                      ctx.lineTo(x, y);
              }
              // TODO: if loop
              if (vertices.length > 2) ;
              if (options.fill) {
                  ctx.fillStyle = options.fill;
                  ctx.fill();
                  ctx.closePath();
              }
              ctx.lineCap = 'round';
              ctx.lineWidth = options.lineWidth / ratio;
              ctx.strokeStyle = (_a = options.stroke) !== null && _a !== void 0 ? _a : '';
              ctx.stroke();
          });
          const sprite = Stage.sprite(texture);
          sprite.tick(() => {
              if (!offsetMemo.recall(offsetX, offsetY)) {
                  sprite.offset(offsetX, offsetY);
              }
          });
          const node = Stage.layout().append(sprite);
          return node;
      }
  }

  var planck = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Math: math$1,
    Vec2: Vec2,
    Testbed: Testbed,
    testbed: testbed,
    create: create$1,
    zero: zero,
    clone: clone,
    isValid: isValid,
    assert: assert,
    setZero: setZero,
    scale: scale,
    set: set,
    areEqual: areEqual,
    dot: dot,
    cross: cross,
    add: add,
    sub: sub,
    mul: mul,
    neg: neg,
    Mat22: Mat22,
    Mat33: Mat33,
    Transform: Transform,
    Rot: Rot,
    AABB: AABB,
    Shape: Shape,
    FixtureProxy: FixtureProxy,
    Fixture: Fixture,
    Body: Body,
    ContactEdge: ContactEdge,
    mixFriction: mixFriction,
    mixRestitution: mixRestitution,
    VelocityConstraintPoint: VelocityConstraintPoint,
    Contact: Contact,
    JointEdge: JointEdge,
    Joint: Joint,
    World: World,
    CircleShape: CircleShape,
    Circle: CircleShape,
    EdgeShape: EdgeShape,
    Edge: EdgeShape,
    PolygonShape: PolygonShape,
    Polygon: PolygonShape,
    ChainShape: ChainShape,
    Chain: ChainShape,
    BoxShape: BoxShape,
    Box: BoxShape,
    CollideCircles: CollideCircles,
    CollideEdgeCircle: CollideEdgeCircle,
    CollidePolygons: CollidePolygons,
    CollidePolygonCircle: CollidePolygonCircle,
    CollideEdgePolygon: CollideEdgePolygon,
    DistanceJoint: DistanceJoint,
    FrictionJoint: FrictionJoint,
    GearJoint: GearJoint,
    MotorJoint: MotorJoint,
    MouseJoint: MouseJoint,
    PrismaticJoint: PrismaticJoint,
    PulleyJoint: PulleyJoint,
    RevoluteJoint: RevoluteJoint,
    RopeJoint: RopeJoint,
    WeldJoint: WeldJoint,
    WheelJoint: WheelJoint,
    Settings: Settings,
    SettingsInternal: SettingsInternal,
    Sweep: Sweep,
    get ManifoldType () { return exports.ManifoldType; },
    get ContactFeatureType () { return exports.ContactFeatureType; },
    get PointState () { return exports.PointState; },
    ClipVertex: ClipVertex,
    Manifold: Manifold,
    ManifoldPoint: ManifoldPoint,
    ContactID: ContactID,
    WorldManifold: WorldManifold,
    getPointStates: getPointStates,
    clipSegmentToLine: clipSegmentToLine,
    DistanceInput: DistanceInput,
    DistanceOutput: DistanceOutput,
    SimplexCache: SimplexCache,
    Distance: Distance,
    DistanceProxy: DistanceProxy,
    testOverlap: testOverlap,
    ShapeCastInput: ShapeCastInput,
    ShapeCastOutput: ShapeCastOutput,
    ShapeCast: ShapeCast,
    TOIInput: TOIInput,
    get TOIOutputState () { return exports.TOIOutputState; },
    TOIOutput: TOIOutput,
    TimeOfImpact: TimeOfImpact,
    TreeNode: TreeNode,
    DynamicTree: DynamicTree,
    stats: stats$1,
    internal: internal
  });

  exports.AABB = AABB;
  exports.Body = Body;
  exports.Box = BoxShape;
  exports.BoxShape = BoxShape;
  exports.Chain = ChainShape;
  exports.ChainShape = ChainShape;
  exports.Circle = CircleShape;
  exports.CircleShape = CircleShape;
  exports.ClipVertex = ClipVertex;
  exports.CollideCircles = CollideCircles;
  exports.CollideEdgeCircle = CollideEdgeCircle;
  exports.CollideEdgePolygon = CollideEdgePolygon;
  exports.CollidePolygonCircle = CollidePolygonCircle;
  exports.CollidePolygons = CollidePolygons;
  exports.Contact = Contact;
  exports.ContactEdge = ContactEdge;
  exports.ContactID = ContactID;
  exports.Distance = Distance;
  exports.DistanceInput = DistanceInput;
  exports.DistanceJoint = DistanceJoint;
  exports.DistanceOutput = DistanceOutput;
  exports.DistanceProxy = DistanceProxy;
  exports.DynamicTree = DynamicTree;
  exports.Edge = EdgeShape;
  exports.EdgeShape = EdgeShape;
  exports.Fixture = Fixture;
  exports.FixtureProxy = FixtureProxy;
  exports.FrictionJoint = FrictionJoint;
  exports.GearJoint = GearJoint;
  exports.Joint = Joint;
  exports.JointEdge = JointEdge;
  exports.Manifold = Manifold;
  exports.ManifoldPoint = ManifoldPoint;
  exports.Mat22 = Mat22;
  exports.Mat33 = Mat33;
  exports.Math = math$1;
  exports.MotorJoint = MotorJoint;
  exports.MouseJoint = MouseJoint;
  exports.Polygon = PolygonShape;
  exports.PolygonShape = PolygonShape;
  exports.PrismaticJoint = PrismaticJoint;
  exports.PulleyJoint = PulleyJoint;
  exports.RevoluteJoint = RevoluteJoint;
  exports.RopeJoint = RopeJoint;
  exports.Rot = Rot;
  exports.Settings = Settings;
  exports.SettingsInternal = SettingsInternal;
  exports.Shape = Shape;
  exports.ShapeCast = ShapeCast;
  exports.ShapeCastInput = ShapeCastInput;
  exports.ShapeCastOutput = ShapeCastOutput;
  exports.SimplexCache = SimplexCache;
  exports.Sweep = Sweep;
  exports.TOIInput = TOIInput;
  exports.TOIOutput = TOIOutput;
  exports.Testbed = Testbed;
  exports.TimeOfImpact = TimeOfImpact;
  exports.Transform = Transform;
  exports.TreeNode = TreeNode;
  exports.Vec2 = Vec2;
  exports.VelocityConstraintPoint = VelocityConstraintPoint;
  exports.WeldJoint = WeldJoint;
  exports.WheelJoint = WheelJoint;
  exports.World = World;
  exports.WorldManifold = WorldManifold;
  exports.add = add;
  exports.areEqual = areEqual;
  exports.assert = assert;
  exports.clipSegmentToLine = clipSegmentToLine;
  exports.clone = clone;
  exports.create = create$1;
  exports.cross = cross;
  exports["default"] = planck;
  exports.dot = dot;
  exports.getPointStates = getPointStates;
  exports.internal = internal;
  exports.isValid = isValid;
  exports.mixFriction = mixFriction;
  exports.mixRestitution = mixRestitution;
  exports.mul = mul;
  exports.neg = neg;
  exports.scale = scale;
  exports.set = set;
  exports.setZero = setZero;
  exports.stats = stats$1;
  exports.sub = sub;
  exports.testOverlap = testOverlap;
  exports.testbed = testbed;
  exports.zero = zero;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=planck-with-testbed.js.map
