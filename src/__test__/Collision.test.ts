import * as sinon from 'sinon';
import { describe, it, expect, vi } from 'vitest';

import * as Vec2 from '../common/Vec2';
import { AABB } from '../collision/AABB';
import { DynamicTree } from '../collision/DynamicTree';
import { BroadPhase } from '../collision/BroadPhase';


describe('Collision', function(): void {

  it('AABB', function(): void {
    var r, o = new AABB();
    expect(o.isValid()).equal(true);

    Vec2.set(10, 6, o.upperBound);
    Vec2.set(6, 4, o.lowerBound);

    r = o.getCenter();
    expect(r[0]).equal(8);
    expect(r[1]).equal(5);

    r = o.getExtents();
    expect(r[0]).equal(2);
    expect(r[1]).equal(1);

    r = o.getPerimeter();
    expect(r).equal(12);

    o.combine(new AABB(Vec2.create(7, 4), Vec2.create(9, 6)));
    expect(o.upperBound[0]).equal(10);
    expect(o.upperBound[1]).equal(6);
    expect(o.lowerBound[0]).equal(6);
    expect(o.lowerBound[1]).equal(4);

    o.combine(new AABB(Vec2.create(5, 3), Vec2.create(11, 7)));
    expect(o.upperBound[0]).equal(11);
    expect(o.upperBound[1]).equal(7);
    expect(o.lowerBound[0]).equal(5);
    expect(o.lowerBound[1]).equal(3);

    expect(o.contains(new AABB(Vec2.create(5, 3), Vec2.create(11, 7)))).equal(true);
    expect(o.contains(new AABB(Vec2.create(5, 2), Vec2.create(11, 7)))).equal(false);
    expect(o.contains(new AABB(Vec2.create(4, 2), Vec2.create(11, 7)))).equal(false);
    expect(o.contains(new AABB(Vec2.create(5, 3), Vec2.create(11, 8)))).equal(false);
    expect(o.contains(new AABB(Vec2.create(5, 3), Vec2.create(12, 7)))).equal(false);

    // rayCast
  });

  it('DynamicTree', function(): void {
    var tree = new DynamicTree();

    var foo = tree.createProxy(new AABB(Vec2.create(0, 0), Vec2.create(1, 1)), 'foo');
    var bar = tree.createProxy(new AABB(Vec2.create(1, 1), Vec2.create(2, 2)), 'bar');
    var baz = tree.createProxy(new AABB(Vec2.create(2, 2), Vec2.create(3, 3)), 'baz');

    expect(tree.getHeight()).equal(2);

    expect(tree.getUserData(foo)).equal('foo');
    expect(tree.getUserData(bar)).equal('bar');
    expect(tree.getUserData(baz)).equal('baz');

    expect(tree.getFatAABB(foo).upperBound[0]).be.above(1);
    expect(tree.getFatAABB(foo).upperBound[1]).be.above(1);
    expect(tree.getFatAABB(foo).lowerBound[0]).be.below(0);
    expect(tree.getFatAABB(foo).lowerBound[1]).be.below(0);

    var QueryCallback = sinon.spy();
    var callback = QueryCallback;

    tree.query(new AABB(Vec2.create(1, 1), Vec2.create(2, 2)), callback);
    expect(QueryCallback.calledWith(foo)).equal(true);
    expect(QueryCallback.calledWith(bar)).equal(true);
    expect(QueryCallback.calledWith(baz)).equal(true);

    tree.query(new AABB(Vec2.create(0.3, 0.3), Vec2.create(0.7, 0.7)),callback);
    expect(QueryCallback.lastCall.calledWith(foo)).equal(true);

    tree.query(new AABB(Vec2.create(1.3, 1.3), Vec2.create(1.7, 1.7)), callback);
    expect(QueryCallback.lastCall.calledWith(bar)).equal(true);

    tree.query(new AABB(Vec2.create(2.3, 2.3), Vec2.create(2.7, 2.7)), callback);
    expect(QueryCallback.lastCall.calledWith(baz)).equal(true);

    expect(tree.moveProxy(foo, new AABB(Vec2.create(0, 0), Vec2.create(1, 1)), Vec2.create(0.01, 0.01))).equal(false);

    expect(tree.moveProxy(baz, new AABB(Vec2.create(3, 3), Vec2.create(4, 4)), Vec2.create(0, 0))).equal(true);

    tree.query(new AABB(Vec2.create(3.3, 3.3), Vec2.create(3.7, 3.7)), callback);
    expect(QueryCallback.lastCall.calledWith(baz)).equal(true);

    tree.destroyProxy(foo);
    expect(tree.getHeight()).equal(1);

    tree.destroyProxy(bar);
    expect(tree.getHeight()).equal(0);

    tree.destroyProxy(baz);
    expect(tree.getHeight()).equal(0);

  });

  it('BroadPhase', function(): void {
    var bp = new BroadPhase();

    var AddPair = sinon.spy();
    var callback = AddPair;

    // @ts-ignore
    var foo = bp.createProxy(new AABB(Vec2.create(0, 0), Vec2.create(1, 1)), 'foo');
    // @ts-ignore
    var bar = bp.createProxy(new AABB(Vec2.create(2, 2), Vec2.create(3, 3)), 'bar');

    bp.updatePairs(callback);
    expect(AddPair.callCount).equal(0);

    // @ts-ignore
    var baz = bp.createProxy(new AABB(Vec2.create(1, 1), Vec2.create(2, 2)), 'baz');

    AddPair.resetHistory();
    bp.updatePairs(callback);
    expect(AddPair.callCount).equal(2);
    expect(AddPair.calledWith('bar', 'baz')).equal(true);
    expect(AddPair.calledWith('foo', 'baz')).equal(true);

    bp.moveProxy(baz, new AABB(Vec2.create(0.5, 0.5), Vec2.create(1.5, 1.5)), Vec2.create());

    AddPair.resetHistory();
    bp.updatePairs(callback);
    expect(AddPair.callCount).equal(1);
    expect(AddPair.calledWith('foo', 'baz')).equal(true);

  });

});
