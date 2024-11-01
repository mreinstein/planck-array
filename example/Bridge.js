/*
 * MIT License
 * Copyright (c) 2019 Erin Catto
 */

const { Vec2, World, Edge, Box, Polygon, Circle, RevoluteJoint, Testbed } = planck;

let world = new World(Vec2.create(0, -4));

const testbed = Testbed.mount();
testbed.start(world);

let COUNT = 30;

let middle;

let ground = world.createBody();
ground.createFixture(new Edge(Vec2.create(-40.0, 0.0), Vec2.create(40.0, 0.0)), 0.0);

let bridgeRect = new Box(0.5, 0.125);

let bridgeFD = {
  density: 20.0,
  friction: 0.2
};

let prevBody = ground;
for (let i = 0; i < COUNT; ++i) {
  const body = world.createDynamicBody(Vec2.create(-14.5 + 1.0 * i, 5.0));
  body.createFixture(bridgeRect, bridgeFD);

  const anchor = Vec2.create(-15.0 + 1.0 * i, 5.0);
  world.createJoint(new RevoluteJoint({}, prevBody, body, anchor));

  if (i * 2 === COUNT) {
    middle = body;
  }
  prevBody = body;
}

const anchor = Vec2.create(-15.0 + 1.0 * COUNT, 5.0);
world.createJoint(new RevoluteJoint({}, prevBody, ground, anchor));

for (let i = 0; i < 2; ++i) {
  const body = world.createDynamicBody(Vec2.create(-8.0 + 8.0 * i, 12.0));

  let vertices = [Vec2.create(-0.5, 0.0), Vec2.create(0.5, 0.0), Vec2.create(0.0, 1.5)];
  body.createFixture(new Polygon(vertices), 1.0);
}

let shape = new Circle(0.5);
for (let i = 0; i < 3; ++i) {
  const body = world.createDynamicBody(Vec2.create(-6.0 + 6.0 * i, 10.0));
  body.createFixture(shape, 1.0);
}
