/*
 * MIT License
 * Copyright (c) 2019 Erin Catto
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

const { World, Transform, Box, TimeOfImpact, Sweep, TOIInput, TOIOutput, stats, Testbed, Vec2 } = planck;

let world = new World();

const testbed = Testbed.mount();
testbed.width = 80;
testbed.height = 60;
testbed.x = 0;
testbed.y = 0;
testbed.start(world);

let shapeA = new Box(25.0, 5.0);
let sweepA = new Sweep();
Vec2.set(0, 0, sweepA.c0);
sweepA.a0 = 0.1;
Vec2.copy(sweepA.c0, sweepA.c);
sweepA.a = sweepA.a0;
Vec2.setZero(sweepA.localCenter);

let shapeB = new Box(2.5, 2.5);
let sweepB = new Sweep();
Vec2.set(20, 20, sweepB.c0);
sweepB.a0 = 0.1; // - 162.0 * Math.PI;
Vec2.set(-20, -20, sweepB.c);
sweepB.a = 3.1; // - 162.0 * Math.PI;
Vec2.setZero(sweepB.localCenter);

// sweepB.a0 -= 300.0 * Math.PI;
// sweepB.a -= 300.0 * Math.PI;

let input = new TOIInput();
input.proxyA.set(shapeA, 0);
input.sweepA.set(sweepA);
input.proxyB.set(shapeB, 0);
input.sweepB.set(sweepB);
input.tMax = 1.0;

let output = new TOIOutput();

TimeOfImpact(output, input);

testbed.step = function() {
  // "max toi iters = %d, max root iters = %d", b2_toiMaxIters, b2_toiMaxRootIters

  testbed.status('toi', output.t);
  testbed.status(stats);

  let vertices = [];

  let transformB = new Transform();

  for (let t = 0.1; t < 1.0; t += 0.1) {
    sweepB.getTransform(transformB, t);
    vertices = shapeB.m_vertices.map(v => Transform.mul(transformB, v));
    testbed.drawPolygon(vertices, testbed.color(0.2, 0.2, 0.2));
  }

  let transformA = new Transform();
  sweepA.getTransform(transformA, 0.0);
  vertices = shapeA.m_vertices.map(v => Transform.mul(transformA, v));
  testbed.drawPolygon(vertices, testbed.color(0.7, 0.7, 0.7));

  sweepB.getTransform(transformB, 0.0);
  vertices = shapeB.m_vertices.map(v => Transform.mul(transformB, v));
  testbed.drawPolygon(vertices, testbed.color(1, 1, 1));

  sweepB.getTransform(transformB, output.t);
  vertices = shapeB.m_vertices.map(v => Transform.mul(transformB, v));
  testbed.drawPolygon(vertices, testbed.color(1, 0, 0));

  sweepB.getTransform(transformB, 1.0);
  vertices = shapeB.m_vertices.map(v => Transform.mul(transformB, v));
  testbed.drawPolygon(vertices, testbed.color(1, 1, 1));
};
