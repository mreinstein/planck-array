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

// A basic slider crank created for GDC tutorial: Understanding Constraints

const { Vec2, World, Box, RevoluteJoint, PrismaticJoint, Testbed } = planck;

let world = new World(Vec2.create(0, -10));

const testbed = Testbed.mount();
testbed.y = -15;
testbed.start(world);

let ground = world.createBody(Vec2.create(0.0, 17.0));

// Define crank.
let crank = world.createDynamicBody(Vec2.create(-8.0, 20.0));
crank.createFixture(new Box(4.0, 1.0), 2.0);
world.createJoint(new RevoluteJoint({}, ground, crank, Vec2.create(-12.0, 20.0)));

// Define connecting rod
let rod = world.createDynamicBody(Vec2.create(4.0, 20.0));
rod.createFixture(new Box(8.0, 1.0), 2.0);
world.createJoint(new RevoluteJoint({}, crank, rod, Vec2.create(-4.0, 20.0)));

// Define piston
let piston = world.createDynamicBody({
  fixedRotation : true,
  position : Vec2.create(12.0, 20.0)
});
piston.createFixture(new Box(3.0, 3.0), 2.0);
world.createJoint(new RevoluteJoint({}, rod, piston, Vec2.create(12.0, 20.0)));
world.createJoint(new PrismaticJoint({}, ground, piston, Vec2.create(12.0, 17.0), Vec2.create(1.0, 0.0)));
