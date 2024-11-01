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

const { Vec2, World, Edge, Box, Testbed } = planck;

let world = new World(Vec2.create(0, -10));

const testbed = Testbed.mount();
testbed.start(world);

let COUNT = 20;

let ground = world.createBody();
ground.createFixture(new Edge(Vec2.create(-40.0, 0.0), Vec2.create(40.0, 0.0)), 0.0);

let a = 0.5;
let box = new Box(a, a);

let x = Vec2.create(-7.0, 0.75);
let y = Vec2.create();
let deltaX = Vec2.create(0.5625, 1.25);
let deltaY = Vec2.create(1.125, 0.0);

for (let i = 0; i < COUNT; ++i) {
  
  Vec2.copy(x, y);
  
  for (let j = i; j < COUNT; ++j) {

    world.createDynamicBody(y).createFixture(box, 5.0);

    Vec2.add(y, deltaY, y);
  }
  Vec2.add(x, deltaX, x);
}

testbed.step = function() {
  // let tree = world.m_broadPhase.m_tree;
  // if (stepCount++ == 400) {
  // tree.rebuildBottomUp();
  // }
};
