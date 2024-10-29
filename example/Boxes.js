const { Vec2, World, Edge, Box, Testbed } = planck;

let world = new World(Vec2.create(0, -10));

const testbed = Testbed.mount();
testbed.start(world);

let bar = world.createBody();
bar.createFixture(new Edge(Vec2.create(-20, 5), Vec2.create(20, 5)));
bar.setAngle(0.2);

for (let i = -2; i <= 2; i++) {
  for (let j = -2; j <= 2; j++) {
    let box = world.createBody().setDynamic();
    box.createFixture(new Box(0.5, 0.5));
    box.setPosition(Vec2.create(i * 1, -j * 1 + 20));
    box.setMassData({
      mass : 1,
      center : Vec2.create(),
      I : 1
    });
  }
}
