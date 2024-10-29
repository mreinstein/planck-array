/*
 * MIT License
 * Copyright (c) 2019 Erin Catto
 */

const { World, Vec2, DynamicTree, AABB, Math, Testbed } = planck;

let world = new World();

const testbed = Testbed.mount();
testbed.start(world);

let ACTOR_COUNT = 128;
let worldExtent = 15.0;
let proxyExtent = 0.5;

let tree = new DynamicTree();
let queryAABB = new AABB();
let rayCastInput = { };
let rayCastOutput = { };
let rayActor;
let actors = [ ]; // Actor[e_actorCount];
let automated = false;

for (let i = 0; i < ACTOR_COUNT; ++i) {
  let actor = actors[i] = new Actor();
  getRandomAABB(actor.aabb);
  actor.proxyId = tree.createProxy(actor.aabb, actor);
}

let h = worldExtent;
Vec2.set(-3.0, -4.0 + h, queryAABB.lowerBound);
Vec2.set(5.0, 6.0 + h, queryAABB.upperBound);

rayCastInput.p1 = Vec2.create(-5.0, 5.0 + h);
rayCastInput.p2 = Vec2.create(7.0, -4.0 + h);
// rayCastInput.p1 = Vec2.create(0.0, 2.0 + h);
// rayCastInput.p2 = Vec2.create(0.0, -2.0 + h);
rayCastInput.maxFraction = 1.0;

testbed.step = function() {
  rayActor = null;
  for (let i = 0; i < ACTOR_COUNT; ++i) {
    actors[i].fraction = 1.0;
    actors[i].overlap = false;
  }

  if (automated == true) {
    let actionCount = Math.max(1, ACTOR_COUNT >> 2);

    for (let i = 0; i < actionCount; ++i) {
      Action();
    }
  }

  runQuery();
  rayCast();

  for (let i = 0; i < ACTOR_COUNT; ++i) {
    let actor = actors[i];
    if (actor.proxyId == null)
      continue;

    let c = testbed.color(0.9, 0.9, 0.9);
    if (actor == rayActor && actor.overlap) {
      c = testbed.color(0.9, 0.6, 0.6);
    } else if (actor == rayActor) {
      c = testbed.color(0.6, 0.9, 0.6);
    } else if (actor.overlap) {
      c = testbed.color(0.6, 0.6, 0.9);
    }

    testbed.drawAABB(actor.aabb, c);
  }

  testbed.drawAABB(queryAABB, testbed.color(0.7, 0.7, 0.7));
  testbed.drawSegment(rayCastInput.p1, rayCastInput.p2, testbed.color(0.9, 0.9, 0.9));
  testbed.drawPoint(rayCastInput.p1, 6.0, testbed.color(0.2, 0.9, 0.2));
  testbed.drawPoint(rayCastInput.p2, 6.0, testbed.color(0.9, 0.2, 0.2));

  if (rayActor) {
    let p = Vec2.combine(1 - rayActor.fraction, rayCastInput.p1, rayActor.fraction, rayCastInput.p2);
    testbed.drawPoint(p, 6.0, testbed.color(0.2, 0.2, 0.9));
  }

  let height = tree.getHeight();
  testbed.status('dynamic tree height', height);
};

testbed.keydown = function(code, char) {
  switch (char) {
  case 'Z':
    automated = !automated;
    break;

  case 'C':
    createProxy();
    break;

  case 'X':
    destroyProxy();
    break;

  case 'M':
    moveProxy();
    break;
  }
};

function queryCallback(proxyId) {
  let actor = tree.getUserData(proxyId); // Actor
  actor.overlap = AABB.testOverlap(queryAABB, actor.aabb);
  return true;
}

function rayCastCallback(input, proxyId) {
  let actor = tree.getUserData(proxyId);

  let output = {}; // RayCastOutput
  let hit = actor.aabb.rayCast(output, input);

  if (hit) {
    rayCastOutput = output;
    rayActor = actor;
    rayActor.fraction = output.fraction;
    return output.fraction;
  }

  return input.maxFraction;
}

function Actor() {
  this.aabb = new AABB();
  this.fraction;
  this.overlap;
  this.proxyId;
}

function getRandomAABB(aabb) {
  let w = Vec2.create(2.0 * proxyExtent, 2.0 * proxyExtent);
  // aabb.lowerBound[0] = -proxyExtent;
  // aabb.lowerBound[1] = -proxyExtent + worldExtent;
  aabb.lowerBound[0] = Math.random(-worldExtent, worldExtent);
  aabb.lowerBound[1] = Math.random(0.0, 2.0 * worldExtent);
  aabb.upperBound = Vec2.add(w, aabb.lowerBound);
}

function moveAABB(aabb) {
  let d = Vec2.create(Math.random(-0.5, 0.5), Math.random(-0.5, 0.5));
  // d[0] = 2.0;
  // d[1] = 0.0;
  Vec2.add(aabb.lowerBound, d, aabb.lowerBound);
  Vec2.add(aabb.upperBound, d, aabb.upperBound);

  let c0 = Vec2.mid(aabb.lowerBound, aabb.upperBound);
  let min = Vec2.create(-worldExtent, 0.0);
  let max = Vec2.create(worldExtent, 2.0 * worldExtent);
  let c = Vec2.clamp(c0, min, max);

  Vec2.add(aabb.lowerBound, c, aabb.lowerBound);
  Vec2.sub(aabb.lowerBound, c0, aabb.lowerBound);

  Vec2.add(aabb.upperBound, c, aabb.upperBound);
  Vec2.sub(aabb.upperBound, c0, aabb.upperBound);
}

function createProxy() {
  for (let i = 0; i < ACTOR_COUNT; ++i) {
    let j = Math.random() * ACTOR_COUNT | 0;
    let actor = actors[j];
    if (actor.proxyId == null) {
      getRandomAABB(actor.aabb);
      actor.proxyId = tree.createProxy(actor.aabb, actor);
      return;
    }
  }
}

function destroyProxy() {
  for (let i = 0; i < ACTOR_COUNT; ++i) {
    let j = Math.random() * ACTOR_COUNT | 0;
    let actor = actors[j];
    if (actor.proxyId != null) {
      tree.destroyProxy(actor.proxyId);
      actor.proxyId = null;
      return;
    }
  }
}

function moveProxy() {
  for (let i = 0; i < ACTOR_COUNT; ++i) {
    let j = Math.random() * ACTOR_COUNT | 0;
    const actor = actors[j];
    if (actor.proxyId == null) {
      continue;
    }

    let aabb0 = actor.aabb;
    moveAABB(actor.aabb);
    let displacement = Vec2.sub(actor.aabb.getCenter(), aabb0.getCenter());
    tree.moveProxy(actor.proxyId, actor.aabb, displacement);
    return;
  }
}

function Action() {
  let choice = Math.random() * 20 | 0;

  switch (choice) {
  case 0:
    createProxy();
    break;

  case 1:
    destroyProxy();
    break;

  default:
    moveProxy();
  }
}

function runQuery() {
  tree.query(queryAABB, queryCallback);

  for (let i = 0; i < ACTOR_COUNT; ++i) {
    if (actors[i].proxyId == null) {
      continue;
    }

    let overlap = AABB.testOverlap(queryAABB, actors[i].aabb);
    // assert(overlap == actors[i].overlap);
  }
}

function rayCast() {
  rayActor = null;

  let input = rayCastInput; // RayCastInput

  // Ray cast against the dynamic tree.
  tree.rayCast(input, rayCastCallback);

  // Brute force ray cast.
  let bruteActor = null; // Actor
  let bruteOutput = {}; // RayCastOutput
  for (let i = 0; i < ACTOR_COUNT; ++i) {
    if (actors[i].proxyId == null) {
      continue;
    }

    let output = {}; // RayCastOutput
    let hit = actors[i].aabb.rayCast(output, input);
    if (hit) {
      bruteActor = actors[i];
      bruteOutput = output;
      input.maxFraction = output.fraction;
    }
  }

  if (bruteActor != null) {
    // Assert(bruteOutput.fraction == rayCastOutput.fraction);
  }
}
