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

// This stress tests the dynamic tree broad-phase. This also shows that tile
// based collision is _not_ smooth due to Box2D not knowing about adjacency.

const { World, Vec2, Box, Testbed } = planck;

let world = new World(Vec2.create(0, -10));

const testbed = Testbed.mount();
testbed.start(world);

let COUNT = 20;

let fixtureCount = 0;

{
  let a = 0.5;
  let ground = world.createBody(Vec2.create(0, -a));

  if (true) {
    let N = 200;
    let M = 10;
    let position = Vec2.create();
    position[1] = 0.0;
    for (let j = 0; j < M; ++j) {
      position[0] = -N * a;
      for (let i = 0; i < N; ++i) {
        ground.createFixture(new Box(a, a, position, 0.0), 0.0);
        ++fixtureCount;
        position[0] += 2.0 * a;
      }
      position[1] -= 2.0 * a;
    }

  } else {
    let N = 200;
    let M = 10;
    let position = Vec2.create();
    position[0] = -N * a;
    for (let i = 0; i < N; ++i) {
      position[1] = 0.0;
      for (let j = 0; j < M; ++j) {
        ground.createFixture(new Box(a, a, position, 0.0), 0.0);
        position[1] -= 2.0 * a;
      }
      position[0] += 2.0 * a;
    }
  }
}
{
  let a = 0.5;
  let shape = new Box(a, a);

  let x = Vec2.create(-7.0, 0.75);
  let y = Vec2.create();
  let deltaX = Vec2.create(0.5625, 1.25);
  let deltaY = Vec2.create(1.125, 0.0);

  for (let i = 0; i < COUNT; ++i) {
    Vec2.copy(x, y);

    for (let j = i; j < COUNT; ++j) {

      // bd.allowSleep = !(i == 0 && j == 0)

      let body = world.createDynamicBody(y);
      body.createFixture(shape, 5.0);
      ++fixtureCount;
      Vec2.add(y, deltaY, y);
    }

    Vec2.add(x, deltaX, x);
  }
}
let createTime = Date.now();

testbed.step = function() {
  let height = world.getTreeHeight();
  let leafCount = world.getProxyCount();
  let minimumNodeCount = 2 * leafCount - 1;
  let minimumHeight = Math.ceil(Math.log(minimumNodeCount) / Math.log(2.0));

  testbed.status('dynamic tree height', height);
  testbed.status('min', minimumHeight);
  testbed.status('create time', createTime + 'ms');
  testbed.status('fixture count', fixtureCount);

  // let tree = world.m_broadPhase.m_tree;
  // if (stepCount++ == 400) {
  // tree.rebuildBottomUp();
  // }
};
