## 0.3.1
* re-add dist to module so esm.sh builds still work


## 0.3.0
Ported from upstream planck.js 1.0.7 – 1.5.0 (bug fixes and features only, no object-oriented Vec2/serializer/testbed changes):
* Fix `AABB.rayCast` (was indexing array vectors with `'x'`/`'y'`, always returned false; upstream also fixed an axis bug here)
* Fix `matrix.addVec2` using `v[0]` for the y component
* Fix `ChainShape._reset` on loops duplicating the closing vertex
* Add `world.queueUpdate(callback)` to defer mutations until after the current step
* Publish `add-body`, `add-fixture`, `add-joint` world events
* Add `body.setTransform(xf)` overload
* Export shape aliases (`Box`, `Circle`, ...) as classes so they can be used as types
* Make joint constructor anchor params and `referenceAngle` optional in types
* `internal.Settings` now exposes public `Settings`
* Remove `style` dev-tool field and Testbed import from `Body`, `Fixture`, `Joint`, `Shape` (testbed reads styling dynamically; engine no longer depends on testbed)


## 1.0.0-alpha
* Migrated the code to typescript


## 0.2
* TypeScript definitions added
* wSet/wAdd/wSub(a, v, b, w) replaced with combine/setCombine/addCombine/subCombine(a, v, b, w)
* wSet/wAdd/wSub(a, v) replaced with mul/setMul/addMul/subMul(a, v)
* Joints constructors cleanup


## 0.1
* source code directory layout changed, classes moved around!
* b2Class renamed to Class
* Dumping is removed, Drawing is moved to tesbed
* GrowableStack replaced with native array, Timer is changed
* Math is changed and split
* Contact and Collide classes merged, Contact registration/creation is changes
* Shape.computeDistanceProxy is added
* Collision and WorldCallback files merged with others
* TestOverlap moved from Collision to Distance
* Manifold files is added, WorldManifold.Initialize moved to Manifold.getWorldManifold
* ContactFilter.ShouldCollide moved to Fixture?
* ContactSolver/VelocityConstraint/PositionConstraint merged with Contact
* ContactManager/ContactListener merged into World (and Contact)
* Island/World.Solve/SolveTOI moved to new Solver
* Position/Velocity correction objects assigned to owner bodies
* binary flags changes to boolean fields (awakeFlag, autoSleepFlag, bulletFlag, fixedRotationFlag, activeFlag, enabledFlag, islandFlag, touchingFlag, filterFlag, bulletHitFlag, toiFlag, clearForces, newFixture, locked)
* Body.Is[Type]/Set[Type] added
* Shape, Body and Joint string types ('circle', 'dynamic', 'mouse-joint', etc.)
* Vec2.Min/Max renamed to Vec2.Upper/Lower and several other methods added
* Distance method, DistanceInput/Output and SimplexCache merged into a stateful Distance class
* Fixture.Filter merged with Fixture
* World listeners changed to events: PostSolve, PreSolve, EndContact, BeginContact, SayGoodby to post-solve, pre-solve, end-contact, begin-contact, remove-body, remove-joint, remove-fixture
* Callbacks classes changed to functions: DynamicTree.query DynamicTree.rayCast BroadPhase.updatePairs BroadPhase.rayCast BroadPhase.query World.queryAAB World.rayCast
