# @footgun/planck

This is an independently maintained fork of Planck.js at v1.0.6 


## Why the fork?

There are 2 main reasons:

1. Use array notation for Vectors instead of Objects.
2. Vectors should be pure data, rather than having every single vector instance a class with dozens of methods attached.

Planck way:
```javascript
import { Vec2 } from 'planck'

const p = new Vec2(50, 50)   // generates an Object Oriented monstrosity
console.log(x)    // { x: 50, y: 50 }
```

I use array notation in my projects, so I want to declare vectors like this:
```javascript
import { Vec2 } from '@footgun/planck'

const p = Vec2.create(50, 50)  // generates pure data
console.log(p)   // 50, 50
```

These 2 changes make it possible t to re-use other popular libraries for vector/matrix math.
Vectors produced by `gl-matrix` and `wgpu-matrix` are fully interoperable with this physics engine. 


## References

You can find the original library [here](https://piqnt.com/planck.js/).

All of the same [examples](https://piqnt.com/planck.js/) and [documentation](https://piqnt.com/planck.js/docs/) should be the same for this port,
except for constructing `Vec2` and `Vec3` instances.
