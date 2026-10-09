import { describe, it, expect } from 'vitest';

import * as Vec2 from '../common/Vec2';
import * as matrix from '../common/Matrix';
import { AABB, RayCastInput, RayCastOutput } from '../collision/AABB';
import { Transform } from '../common/Transform';
import { ChainShape } from '../collision/shape/ChainShape';
import { World } from '../dynamics/World';
import { BoxShape } from '../collision/shape/BoxShape';
import { RevoluteJoint } from '../dynamics/joint/RevoluteJoint';

// registers Box-Box collision
import '../collision/shape/CollidePolygon';

describe('Ported upstream fixes', function(): void {

  it('matrix.addVec2 adds both components', function(): void {
    const out = Vec2.create();
    matrix.addVec2(out, Vec2.create(1, 2), Vec2.create(10, 20));
    expect(out[0]).equal(11);
    expect(out[1]).equal(22);
  });

  it('AABB.rayCast hits box from the left and from below', function(): void {
    const aabb = new AABB(Vec2.create(-1, -1), Vec2.create(1, 1));
    const output = {} as RayCastOutput;

    const fromLeft: RayCastInput = { p1: Vec2.create(-5, 0), p2: Vec2.create(5, 0), maxFraction: 1 };
    expect(aabb.rayCast(output, fromLeft)).equal(true);
    expect(output.fraction).closeTo(0.4, 1e-12);
    expect(output.normal[0]).equal(-1);
    expect(output.normal[1]).equal(0);

    const fromBelow: RayCastInput = { p1: Vec2.create(0, -5), p2: Vec2.create(0, 5), maxFraction: 1 };
    expect(aabb.rayCast(output, fromBelow)).equal(true);
    expect(output.fraction).closeTo(0.4, 1e-12);
    expect(output.normal[0]).equal(0);
    expect(output.normal[1]).equal(-1);

    const miss: RayCastInput = { p1: Vec2.create(-5, 3), p2: Vec2.create(5, 3), maxFraction: 1 };
    expect(aabb.rayCast(output, miss)).equal(false);

    const tooShort: RayCastInput = { p1: Vec2.create(-5, 0), p2: Vec2.create(5, 0), maxFraction: 0.1 };
    expect(aabb.rayCast(output, tooShort)).equal(false);
  });

  it('ChainShape loop keeps vertex count across _reset', function(): void {
    const chain = new ChainShape([Vec2.create(0, 0), Vec2.create(1, 0), Vec2.create(1, 1)], true);
    expect(chain.m_count).equal(4);
    chain._reset();
    expect(chain.m_count).equal(4);
    expect(chain.m_vertices.length).equal(4);
  });

  it('world.queueUpdate defers until after step', function(): void {
    const world = new World();
    const order: string[] = [];

    world.queueUpdate(() => order.push('immediate'));
    expect(order).deep.equal(['immediate']);

    // two overlapping boxes so begin-contact fires inside the locked step
    const ground = world.createBody();
    ground.createFixture(new BoxShape(5, 1), 0);
    const box = world.createBody({ type: 'dynamic', position: Vec2.create(0, 1) });
    box.createFixture(new BoxShape(1, 1), 1);

    world.on('begin-contact', () => {
      expect(world.isLocked()).equal(true);
      world.queueUpdate(() => order.push('first'));
      world.queueUpdate(() => order.push('second'));
      order.push('begin-contact');
    });
    world.on('post-step', () => order.push('post-step'));

    world.step(1 / 60);
    expect(order).deep.equal(['immediate', 'begin-contact', 'first', 'second', 'post-step']);
  });

  it('world publishes add-body, add-fixture, add-joint', function(): void {
    const world = new World();
    const added: string[] = [];
    world.on('add-body', () => added.push('body'));
    world.on('add-fixture', () => added.push('fixture'));
    world.on('add-joint', () => added.push('joint'));

    const a = world.createBody({ type: 'dynamic' });
    const b = world.createBody({ type: 'dynamic' });
    a.createFixture(new BoxShape(1, 1), 1);
    world.createJoint(new RevoluteJoint({}, a, b, Vec2.create(0, 0)));

    expect(added).deep.equal(['body', 'body', 'fixture', 'joint']);
  });

  it('body.setTransform accepts a transform', function(): void {
    const world = new World();
    const body = world.createBody({ type: 'dynamic' });
    body.setTransform(new Transform(Vec2.create(3, 4), Math.PI / 2));
    expect(body.getPosition()[0]).closeTo(3, 1e-12);
    expect(body.getPosition()[1]).closeTo(4, 1e-12);
    expect(body.getAngle()).closeTo(Math.PI / 2, 1e-12);
  });

});
