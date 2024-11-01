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

const { Vec2, World, Box, RevoluteJoint, Testbed } = planck;

let world = new World(Vec2.create(0, -1));

const testbed = Testbed.mount();
testbed.y = -15;
testbed.width = 20;
testbed.height = 20;
testbed.start(world);

let DEPTH = 4;
let DENSITY = 20.0;

let ground = world.createBody(Vec2.create(0.0, 20.0));

let a = 0.5;
let h = Vec2.create(0.0, a);

let root = addNode(ground, Vec2.create(), 0, 3.0, a);

world.createJoint(new RevoluteJoint({
  bodyA: ground,
  bodyB: root,
  localAnchorA: Vec2.create(0, 0),
  localAnchorB: h,
}, ground, root));

function addNode(parent, localAnchor, depth, offset, a) {

  let h = Vec2.create(0.0, a);

  const p = Vec2.add(parent.getPosition(), localAnchor);
  Vec2.sub(p, h, p);

  let node = world.createBody({
    type : 'dynamic',
    position : p
  });

  node.createFixture(new Box(0.25 * a, a), DENSITY);

  if (depth === DEPTH) {
    return node;
  }

  let left = Vec2.create(offset, -a);
  let right = Vec2.create(-offset, -a);
  let leftChild = addNode(node, left, depth + 1, 0.5 * offset, a);
  let rightChild = addNode(node, right, depth + 1, 0.5 * offset, a);

  world.createJoint(new RevoluteJoint({
    bodyA: node,
    bodyB: leftChild,
    localAnchorA: left,
    localAnchorB: h,
  }, node, leftChild));

  world.createJoint(new RevoluteJoint({
    bodyA: node,
    bodyB: rightChild,
    localAnchorA: right,
    localAnchorB: h,
  }, node, rightChild));

  return node;
}
