import { describe, it, expect } from 'vitest';

import { Vec2 } from '../common/Vec2';
import { Transform } from '../common/Transform';
import { CircleShape } from '../collision/shape/CircleShape';
import { TimeOfImpact, TOIInput, TOIOutput } from '../collision/TimeOfImpact';
import { Distance, SimplexCache, DistanceOutput, DistanceInput } from '../collision/Distance';

describe('CCD', function(): void {

  it('Distance', function(): void {
    var c1 = new CircleShape(1);

    var input = new DistanceInput();
    input.proxyA.set(c1, 0);
    input.proxyB.set(c1, 0);
    Vec2.set(1.9, 0, input.transformB.p);
    input.useRadii = true;
    var cache = new SimplexCache();
    var output = new DistanceOutput();
    Distance(output, cache, input);

    expect(output.distance).equal(0);
    console.log(output);

    var input = new DistanceInput();
    input.proxyA.set(c1, 0);
    input.proxyB.set(c1, 0);
    Vec2.set(2.1, 0, input.transformB.p);

    input.useRadii = true;
    var cache = new SimplexCache();
    var output = new DistanceOutput();
    Distance(output, cache, input);

    expect(output.distance).closeTo(0.1, 1e-12)
    console.log(output);
  });

  it('TimeOfImpact', function(): void {
    var c1 = new CircleShape(1);

    var input = new TOIInput();
    input.proxyA.set(c1, 0);
    input.proxyB.set(c1, 0);

    input.sweepA.setTransform(new Transform(Vec2.create(0, 0), 0));
    input.sweepB.setTransform(new Transform(Vec2.create(1.9, 0), 0));

    input.tMax = 1.0;

    var output = new TOIOutput();

    TimeOfImpact(output, input);
    console.log(output.t, output.state);

    input.sweepB.setTransform(new Transform(Vec2.create(2, 0), 0));

    TimeOfImpact(output, input);
    console.log(output.t, output.state);

    input.sweepB.setTransform(new Transform(Vec2.create(2.1, 0), 0));

    TimeOfImpact(output, input);
    console.log(output.t, output.state);
  });
});
