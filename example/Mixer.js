const { Vec2, World, Edge, Circle, Box, Chain, Math, Testbed } = planck;

let world = new World(Vec2.create(0, -10));

const testbed = Testbed.mount();
testbed.y = 0;
testbed.start(world);

let container = world.createKinematicBody();
container.createFixture(new Edge(Vec2.create(15, -5), Vec2.create(25, 5)));
container.createFixture(new Circle(Vec2.create(-10, -10), 3));
container.createFixture(new Circle(Vec2.create(10, 10), 3));
container.createFixture(new Box(3, 3, Vec2.create(-10, 10)));
container.createFixture(new Box(3, 3, Vec2.create(10, -10)));

container.createFixture(new Chain(
  [
    Vec2.create(-20, -20),
    Vec2.create(20, -20),
    Vec2.create(20, 20),
    Vec2.create(-20, 20)
  ],
  true
));

const n = 15;

for (let i = -n; i <= n; i++) {
  for (let j = -n; j <= n; j++) {
    let particle = world.createDynamicBody(Vec2.create(i * 1, j * 1));
    particle.createFixture(Math.random() > 0.5 ? new Circle(0.4) : new Box(0.4, 0.4));
    particle.setMassData({
      mass : 2,
      center : Vec2.create(),
      I : 0.4
    });
    particle.applyForceToCenter(Vec2.create(Math.random(-100, 100), Math.random(-100, 100)));
  }
}

container.setAngularVelocity(0.3);
