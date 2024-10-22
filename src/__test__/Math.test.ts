import { describe, it, expect } from 'vitest';

import * as Vec2 from '../common/Vec2';
import { Vec3 } from '../common/Vec3';

describe('Math', function(): void {
  it('Vec2', function(): void {
    var r, v = Vec2.create();
    expect(v.x).equal(0);
    expect(v.y).equal(0);

    Vec2.set(3, 4, v);
    expect(v.x).equal(3);
    expect(v.y).equal(4);
    expect(Vec2.length(v)).equal(5);
    expect(Vec2.lengthSquared(v)).equal(25);

    Vec2.normalize(v, v);
    expect(v.x).closeTo(3 / 5, 1e-12);
    expect(v.y).closeTo(4 / 5, 1e-12);

    Vec2.setZero(v);
    expect(v.x).equal(0);
    expect(v.y).equal(0);

    Vec2.add(v, Vec2.create(3, 2), v);
    expect(v.x).equal(3);
    expect(v.y).equal(2);

    Vec2.sub(v, Vec2.create(2, 1), v);
    expect(v.x).equal(1);
    expect(v.y).equal(1);

    Vec2.scale(v, 5, v);
    expect(v.x).equal(5);
    expect(v.y).equal(5);

    Vec2.set(2, 3, v);
    expect(v.x).equal(2);
    expect(v.y).equal(3);

    r = Vec2.skew(v);
    expect(r.x).equal(-3);
    expect(r.y).equal(2);

    r = Vec2.dot(v, Vec2.create(2, 3));
    expect(r).equal(13);

    r = Vec2.crossVec2Vec2(v, Vec2.create(2, 3));
    expect(r).equal(0);

    r = Vec2.crossVec2Num(v, 5);
    expect(r.x).equal(15);
    expect(r.y).equal(-10);

    r = Vec2.clamp(Vec2.create(6, 8), 5);
    expect(r.x).closeTo(3, 1e-12);
    expect(r.y).closeTo(4, 1e-12);

  });

  it('Vec3', function(): void {
    return;

    let r, v = Vec3.create();
    expect(v.x).equal(0);
    expect(v.y).equal(0);
    expect(v.z).equal(0);

    v = Vec3.create(3, 4, 5);
    expect(v.x).equal(3);
    expect(v.y).equal(4);
    expect(v.z).equal(5);

    v.setZero();
    expect(v.x).equal(0);
    expect(v.y).equal(0);
    expect(v.z).equal(0);

    v.add(Vec3.create(3, 2, 1));
    expect(v.x).equal(3);
    expect(v.y).equal(2);
    expect(v.z).equal(1);

    v.sub(Vec3.create(0, 1, 2));
    expect(v.x).equal(3);
    expect(v.y).equal(1);
    expect(v.z).equal(-1);

    v.mul(5);
    expect(v.x).equal(15);
    expect(v.y).equal(5);
    expect(v.z).equal(-5);

    v.set(2, 3, 4);
    expect(v.x).equal(2);
    expect(v.y).equal(3);
    expect(v.z).equal(4);

    r = Vec3.dot(v, Vec3.create(2, 0, -1));
    expect(r).equal(0);

    r = Vec3.cross(v, Vec3.create(2, 0, -1));
    expect(r.x).equal(-3);
    expect(r.y).equal(10);
    expect(r.z).equal(-6);
  });
});
