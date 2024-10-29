import Stage from 'stage-js';

import * as Vec2          from '../src/common/Vec2';
import type { Vec2Value } from '../src/common/Vec2';
import type { World } from "../src/dynamics/World";
import type { Joint } from "../src/dynamics/Joint";
import type { Fixture } from "../src/dynamics/Fixture";
import type { Body } from "../src/dynamics/Body";
import type { AABBValue } from "../src/collision/AABB";
import type { Style } from '../src/util/Testbed';
import { Testbed } from '../src/util/Testbed';
import type { EdgeShape } from "../src/collision/shape/EdgeShape";
import type { PolygonShape } from "../src/collision/shape/PolygonShape";
import type { ChainShape } from "../src/collision/shape/ChainShape";
import type { CircleShape } from "../src/collision/shape/CircleShape";
import type { PulleyJoint } from "../src/dynamics/joint/PulleyJoint";
import { MouseJoint } from "../src/dynamics/joint/MouseJoint";

const math_atan2 = Math.atan2;
const math_abs = Math.abs;
const math_sqrt = Math.sqrt;
const math_PI = Math.PI;
const math_max = Math.max;
const math_min = Math.min;


let mounted: StageTestbed | null = null;

/** @internal */
function memo() {
  const memory: any = [];
  function recall(...rest: any[]) {
    let equal = memory.length === rest.length;
    for (let i = 0; equal && i < rest.length; i++) {
      equal = equal && memory[i] === rest[i];
      memory[i] = rest[i];
    }
    memory.length = rest.length;
    return equal;
  }
  function reset() {
    memory.length = 0;
    // void 0;
  }
  return {
    recall,
    reset,
  };
}

Testbed.mount = () => {
  if (mounted) {
    return mounted;
  }

  mounted = new StageTestbed();

  // todo: merge rest of this into StageTestbed

  // todo: should we create these elements if not exists?
  const playButton = document.getElementById('testbed-play');
  const statusElement = document.getElementById('testbed-status');
  const infoElement = document.getElementById('testbed-info');

  if (playButton) {
    playButton.addEventListener('click', () => {
      mounted.isPaused() ? mounted.resume() : mounted.pause();
    });

    mounted._pause = () => {
      playButton.classList.add('pause');
      playButton.classList.remove('play');
    };

    mounted._resume = () => {
      playButton.classList.add('play');
      playButton.classList.remove('pause');
    };
  } else {
    console.log("Please create a button with id='testbed-play'");
  }

  let lastStatus = '';
  if (statusElement) {
    statusElement.innerText = lastStatus;
  }
  mounted._status = (text: string) => {
    if (lastStatus === text) {
      return;
    }
    lastStatus = text;
    if (statusElement) {
      statusElement.innerText = text;
    }
  };

  let lastInfo = '';
  if (infoElement) {
    infoElement.innerText = lastInfo;
  }
  mounted._info = (text: string) => {
    if (lastInfo === text) {
      return;
    }
    lastInfo = text;
    if (infoElement) {
      infoElement.innerText = text;
    }
  };

  return mounted;
};

const getStyle = function(obj: Body | Fixture | Joint): Style {
  return obj['render'] ?? obj['style'] ?? {};
};

function findBody(world: World, point: Vec2Value) {
  let body: Body | null = null;
  const aabb = {
    lowerBound: point,
    upperBound: point,
  };
  world.queryAABB(aabb, (fixture: Fixture) => {
    if (!fixture.getBody().isDynamic() || !fixture.testPoint(point)) {
      return true;
    }
    body = fixture.getBody();
    return false;
  });
  return body;
}

/** @internal */
class StageTestbed extends Testbed {
  private canvas: HTMLCanvasElement;
  private stage: Stage.Root;
  private paused: boolean = false;
  private lastDrawHash = "";
  private newDrawHash = "";
  private buffer: ((context: CanvasRenderingContext2D, ratio: number)=> void)[] = [];

  start(world: World) {
    const stage = this.stage = Stage.mount();
    const canvas = this.canvas = stage.dom as HTMLCanvasElement;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const testbed = this;
    this.canvas = canvas;

    stage.on(Stage.POINTER_START, () => {
      window.focus();
      // @ts-ignore
      document.activeElement?.blur();
      canvas.focus();
    });

    stage.MAX_ELAPSE = 1000 / 30;

    stage.on('resume', () => {
      this.paused = false;
      this._resume();
    });
    stage.on('pause', () => {
      this.paused = true;
      this._pause();
    });

    const drawingTexture = new Stage.CanvasTexture();
    drawingTexture.draw = (ctx: CanvasRenderingContext2D) => {
      const pixelRatio = 2 * drawingTexture.getOptimalPixelRatio();
      ctx.save();
      ctx.transform(1, 0, 0, this.scaleY, -this.x, -this.y);
      ctx.lineWidth = 3 / pixelRatio;
      ctx.lineCap = 'round';
      for (let drawing = this.buffer.shift(); drawing; drawing = this.buffer.shift()) {
        drawing(ctx, pixelRatio);
      }
      ctx.restore();
    };

    const drawingElement = Stage.sprite(drawingTexture);
    stage.append(drawingElement);
    stage.tick(() => {
      this.buffer.length = 0;
    }, true);


    stage.background(this.background);
    stage.viewbox(this.width, this.height);
    stage.pin('alignX', -0.5);
    stage.pin('alignY', -0.5);

    const worldNode = new  WorldStageNode(world, this);

    // stage.empty();
    stage.prepend(worldNode);

    let lastX = 0;
    let lastY = 0;
    stage.tick((dt: number, t: number) => {
      // update camera position
      if (lastX !== this.x || lastY !== this.y) {
        worldNode.offset(-this.x, -this.y);
        lastX = this.x;
        lastY = this.y;
      }
    });

    worldNode.tick((dt: number, t: number) => {
      this.step(dt, t);

      if (targetBody) {
        this.drawSegment(targetBody.getPosition(), mouseMove, 'rgba(255,255,255,0.2)');
      }

      if (this.lastDrawHash !== this.newDrawHash) {
        this.lastDrawHash = this.newDrawHash;
        stage.touch();
      }
      this.newDrawHash = "";

      return true;
    });

    const mouseGround = world.createBody();
    let mouseJoint: MouseJoint | null = null;
    let targetBody: Body | null = null;
    const mouseMove = Vec2.create(0, 0);

    worldNode.attr('spy', true);

    worldNode.on(Stage.POINTER_START, (point: Vec2Value) => {
      point = [ point.x, testbed.scaleY * point.y ];

      if (targetBody) {
        return;
      }

      const body = findBody(world, point);
      if (!body) {
        return;
      }

      if (this.mouseForce) {
        targetBody = body;

      } else {
        mouseJoint = new MouseJoint({maxForce: 1000}, mouseGround, body, [ point[0], point[1] ]);
        world.createJoint(mouseJoint);
      }
    });

    worldNode.on(Stage.POINTER_MOVE, (point: Vec2Value) => {
      point = [ point.x, testbed.scaleY * point.y ];

      if (mouseJoint) {
        mouseJoint.setTarget(point);
      }

      mouseMove[0] = point[0];
      mouseMove[1] = point[1];
    });

    worldNode.on(Stage.POINTER_END, (point: Vec2Value) => {
      point = [ point.x, testbed.scaleY * point.y ];

      if (mouseJoint) {
        world.destroyJoint(mouseJoint);
        mouseJoint = null;
      }
      if (targetBody && this.mouseForce) {
        const target = targetBody.getPosition();
        const force = Vec2.create(
          (point[0] - target[0]) * this.mouseForce,
          (point[1] - target[1]) * this.mouseForce
        );
        targetBody.applyForceToCenter(force, true);
        targetBody = null;
      }
    });

    worldNode.on(Stage.POINTER_CANCEL, (point: Vec2Value) => {
      point = [ point.x, testbed.scaleY * point.y ];

      if (mouseJoint) {
        world.destroyJoint(mouseJoint);
        mouseJoint = null;
      }
      if (targetBody) {
        targetBody = null;
      }
    });

    const activeKeys = testbed.activeKeys;
    const downKeys: Record<number, boolean> = {};
    function updateActiveKeys(keyCode: number, down: boolean) {
      const char = String.fromCharCode(keyCode);
      if (/\w/.test(char)) {
        activeKeys[char] = down;
      }
      activeKeys.right = downKeys[39] || activeKeys['D'];
      activeKeys.left = downKeys[37] || activeKeys['A'];
      activeKeys.up = downKeys[38] || activeKeys['W'];
      activeKeys.down = downKeys[40] || activeKeys['S'];
      activeKeys.fire = downKeys[32] || downKeys[13] ;
    }

    window.addEventListener("keydown", function(e) {
      const keyCode = e.keyCode;
      downKeys[keyCode] = true;
      updateActiveKeys(keyCode, true);
      testbed.keydown && testbed.keydown(keyCode, String.fromCharCode(keyCode));
    });
    window.addEventListener("keyup", function(e) {
      const keyCode = e.keyCode;
      downKeys[keyCode] = false;
      updateActiveKeys(keyCode, false);
      testbed.keyup && testbed.keyup(keyCode, String.fromCharCode(keyCode));
    });

    this.resume();
  }

  /** @private @internal */
  focus() {
    // @ts-ignore
    document.activeElement && document.activeElement.blur();
    this.canvas.focus();
  }

  /** @internal */
  _pause() {
  }

  /** @internal */
  _resume() {
  }

  /** @internal */
  _status(string: string) {
  }

  /** @internal */  
  _info(text: string) {
  }

  /** @internal */
  isPaused() {
    return this.paused;
  }

  /** @internal */
  togglePause() {
    this.paused ? this.resume() : this.pause();
  }

  /** @internal */
  pause() {
    this.stage.pause();
  }

  /** @internal */
  resume() {
    this.stage.resume();
    this.focus();
  }

  drawPoint(p: Vec2Value, r: number, color: string): void {
    this.buffer.push(function(ctx, ratio) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5  / ratio, 0, 2 * math_PI);
      ctx.strokeStyle = color;
      ctx.stroke();
    });
    this.newDrawHash += "point" + p[0] + ',' + p[1] + ',' + r + ',' + color;
  }

  drawCircle(p: Vec2Value, r: number, color: string): void {
    this.buffer.push(function(ctx) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, 2 * math_PI);
      ctx.strokeStyle = color;
      ctx.stroke();
    });
    this.newDrawHash += "circle" + p[0] + ',' + p[1] + ',' + r + ',' + color;
  }

  drawEdge(a: Vec2Value, b: Vec2Value, color: string): void {
    this.buffer.push(function(ctx) {
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.strokeStyle = color;
      ctx.stroke();
    });
    this.newDrawHash += "segment" + a[0] + ',' + a[1] + ',' + b[0] + ',' + b[1] + ',' + color;
  }

  drawSegment = this.drawEdge;

  drawPolygon(points: Array<Vec2Value>, color: string): void {
    if (!points || !points.length) {
      return;
    }
    this.buffer.push(function(ctx) {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.strokeStyle = color;
      ctx.closePath();
      ctx.stroke();
    });
    this.newDrawHash += "segment";
    for (let i = 1; i < points.length; i++) {
      this.newDrawHash += points[i][0] + ',' + points[i][1] + ',';
    }
    this.newDrawHash += color;
  }

  drawAABB(aabb: AABBValue, color: string): void {
    this.buffer.push(function(ctx) {
      ctx.beginPath();
      ctx.moveTo(aabb.lowerBound[0], aabb.lowerBound[1]);
      ctx.lineTo(aabb.upperBound[0], aabb.lowerBound[1]);
      ctx.lineTo(aabb.upperBound[0], aabb.upperBound[1]);
      ctx.lineTo(aabb.lowerBound[0], aabb.upperBound[1]);
      ctx.strokeStyle = color;
      ctx.closePath();
      ctx.stroke();
    });
    this.newDrawHash += "aabb";
    this.newDrawHash += aabb.lowerBound[0] + ',' + aabb.lowerBound[1] + ',';
    this.newDrawHash += aabb.upperBound[0] + ',' + aabb.upperBound[1] + ',';
    this.newDrawHash += color;
  }

  findOne(query: string): (Body | Joint | Fixture | null) {
    throw new Error("Not implemented");
  }

  findAll(query: string): (Body | Joint | Fixture)[] {
    throw new Error("Not implemented");
  }
}

interface WorldStageOptions {
  speed: number;
  hz: number;
  scaleY: number;
  lineWidth: number;
  stroke: string | undefined;
  fill: string | undefined;
}

class  WorldStageNode extends Stage.Node {
  private nodes = new WeakMap<Body | Fixture | Joint, Stage.Node>();

  private options: WorldStageOptions = {
    speed: 1,
    hz: 60,
    scaleY: -1,
    lineWidth: 3,
    stroke: undefined,
    fill: undefined
  };

  private world: World;
  private testbed: Testbed;

  constructor(world: World, opts: Partial<WorldStageOptions> = {}) {
    super();
    this.label('Planck');

    this.options = { ...this.options, ...opts };

    if (math_abs(this.options.hz) < 1) {
      this.options.hz = 1 / this.options.hz;
    }

    this.world = world;
    this.testbed = opts as Testbed;

    const timeStep = 1 / this.options.hz;
    let elapsedTime = 0;
    let errored = false;
    this.tick((dt: number) => {
      if (errored) {
        return false;
      }
      try {
        dt = dt * 0.001 * this.options.speed;
        elapsedTime += dt;
        while (elapsedTime > timeStep) {
          world.step(timeStep);
          elapsedTime -= timeStep;
        }
        this.renderWorld();
        return true;          
      } catch (error) {
        errored = true;
        console.error(error);
        return false;
      }
    }, true);

    world.on('remove-fixture', (obj: Fixture) => {
      this.nodes.get(obj)?.remove();
    });

    world.on('remove-joint', (obj: Joint) => {
      this.nodes.get(obj)?.remove();
    });
  }

  renderWorld() {
    const world = this.world;
    const options = this.options;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const viewer = this;

    for (let b = world.getBodyList(); b; b = b.getNext()) {
      for (let f = b.getFixtureList(); f; f = f.getNext()) {

        let node = this.nodes.get(f);
        const fstyle = getStyle(f);
        const bstyle = getStyle(b);
        if (!node) {
          if (fstyle && fstyle.stroke) {
            options.stroke = fstyle.stroke;
          } else if (bstyle && bstyle.stroke) {
            options.stroke = bstyle.stroke;
          } else if (b.isDynamic()) {
            options.stroke = 'rgba(255,255,255,0.9)';
          } else if (b.isKinematic()) {
            options.stroke = 'rgba(255,255,255,0.7)';
          } else if (b.isStatic()) {
            options.stroke = 'rgba(255,255,255,0.5)';
          }

          if (fstyle && fstyle.fill) {
            options.fill = fstyle.fill;
          } else if (bstyle && bstyle.fill) {
            options.fill = bstyle.fill;
          } else {
            options.fill = '';
          }

          const type = f.getType();
          const shape = f.getShape();
          if (type == 'circle') {
            node = viewer.drawCircle(shape as CircleShape, options);
          }
          if (type == 'edge') {
            node = viewer.drawEdge(shape as EdgeShape, options);
          }
          if (type == 'polygon') {
            node = viewer.drawPolygon(shape as PolygonShape, options);
          }
          if (type == 'chain') {
            node = viewer.drawChain(shape as ChainShape, options);
          }

          if (node) {
            node.appendTo(viewer);
            this.nodes.set(f, node);
          }
        }

        if (node) {
          const p = b.getPosition();
          const r = b.getAngle();
          // @ts-ignore
          const isChanged = node.__lastX !== p[0] || node.__lastY !== p[1] || node.__lastR !== r;
          if (isChanged) {
            // @ts-ignore
            node.__lastX = p[0];
            // @ts-ignore
            node.__lastY = p[1];
            // @ts-ignore
            node.__lastR = r;
            node.offset(p[0], options.scaleY * p[1]);
            node.rotate(options.scaleY * r);
          }
        }

      }
    }

    for (let j = world.getJointList(); j; j = j.getNext()) {
      const type = j.getType();
      if (type == 'pulley-joint') {
        this.testbed.drawSegment(j.getAnchorA(), (j as PulleyJoint).getGroundAnchorA(), 'rgba(255,255,255,0.5)');
        this.testbed.drawSegment(j.getAnchorB(), (j as PulleyJoint).getGroundAnchorB(), 'rgba(255,255,255,0.5)');
        this.testbed.drawSegment((j as PulleyJoint).getGroundAnchorB(), (j as PulleyJoint).getGroundAnchorA(), 'rgba(255,255,255,0.5)');
      } else {
        this.testbed.drawSegment(j.getAnchorA(), j.getAnchorB(), 'rgba(255,255,255,0.5)');
      }
    }
  }

  drawCircle(shape: CircleShape, options: WorldStageOptions) {
    let offsetX = 0;
    let offsetY = 0;
    const offsetMemo = memo();

    const texture = Stage.canvas();
    texture.setDrawer(function () {
      const ctx = this.getContext();
      const ratio = 2 * this.getOptimalPixelRatio();
      const lw = options.lineWidth / ratio;

      const r = shape.m_radius;
      const cx = r + lw;
      const cy = r + lw;
      const w = r * 2 + lw * 2;
      const h = r * 2 + lw * 2;

      offsetX = shape.m_p[0] - cx;
      offsetY = options.scaleY * shape.m_p[1] - cy

      this.setSize(w, h, ratio);

      ctx.scale(ratio, ratio);
      ctx.arc(cx, cy, r, 0, 2 * math_PI);
      if (options.fill) {
        ctx.fillStyle = options.fill;
        ctx.fill();
      }
      ctx.lineTo(cx, cy);
      ctx.lineWidth = options.lineWidth / ratio;
      ctx.strokeStyle = options.stroke ?? '';
      ctx.stroke();
    });

    const sprite = Stage.sprite(texture);
    sprite.tick(() => {
      if (!offsetMemo.recall(offsetX, offsetY)) {
        sprite.offset(offsetX, offsetY);
      }
    });

    const node = Stage.layout().append(sprite);
    return node;
  }

  drawEdge(edge: EdgeShape, options: WorldStageOptions) {
    let offsetX = 0;
    let offsetY = 0;
    let offsetA = 0
    const offsetMemo = memo();

    const texture = Stage.canvas();
    texture.setDrawer(function () {
      const ctx = this.getContext();
      const ratio = 2 * this.getOptimalPixelRatio();
      const lw = options.lineWidth / ratio;

      const v1 = edge.m_vertex1;
      const v2 = edge.m_vertex2;

      const dx = v2[0] - v1[0];
      const dy = v2[1] - v1[1];

      const length = math_sqrt(dx * dx + dy * dy);

      this.setSize(length + 2 * lw, 2 * lw, ratio);

      const minX = math_min(v1[0], v2[0]);
      const minY = math_min(options.scaleY * v1[1], options.scaleY * v2[1]);
  
      offsetX = minX - lw;
      offsetY = minY - lw;
      offsetA = options.scaleY * math_atan2(dy, dx);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      ctx.moveTo(lw, lw);
      ctx.lineTo(lw + length, lw);

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth / ratio;
      ctx.strokeStyle = options.stroke ?? '';
      ctx.stroke();
    });

    const sprite = Stage.sprite(texture);
    sprite.tick(() => {
      if(!offsetMemo.recall(offsetX, offsetY, offsetA)) {
        sprite.offset(offsetX, offsetY);
        sprite.rotate(offsetA);
      }
    });
    const node = Stage.layout().append(sprite);
    return node;
  }

  drawPolygon(shape: PolygonShape, options: WorldStageOptions) {
    let offsetX = 0;
    let offsetY = 0;
    const offsetMemo = memo();

    const texture = Stage.canvas();
    texture.setDrawer(function () {
      const ctx = this.getContext();
      const ratio = 2 * this.getOptimalPixelRatio();
      const lw = options.lineWidth / ratio;

      const vertices = shape.m_vertices;

      if (!vertices.length) {
        return;
      }
  
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        minX = math_min(minX, v[0]);
        maxX = math_max(maxX, v[0]);
        minY = math_min(minY, options.scaleY * v[1]);
        maxY = math_max(maxY, options.scaleY * v[1]);
      }
  
      const width = maxX - minX;
      const height = maxY - minY;

      offsetX = minX;
      offsetY = minY;

      this.setSize(width + 2 * lw, height + 2 * lw, ratio);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        const x = v[0] - minX + lw;
        const y = options.scaleY * v[1] - minY + lw;
        if (i == 0)
          ctx.moveTo(x, y);

        else
          ctx.lineTo(x, y);
      }

      if (vertices.length > 2) {
        ctx.closePath();
      }

      if (options.fill) {
        ctx.fillStyle = options.fill;
        ctx.fill();
        ctx.closePath();
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth / ratio;
      ctx.strokeStyle = options.stroke ?? '';
      ctx.stroke();
    });

    const sprite = Stage.sprite(texture);
    sprite.tick(() => {
      if(!offsetMemo.recall(offsetX, offsetY)) {
        sprite.offset(offsetX, offsetY);
      }
    });

    const node = Stage.layout().append(sprite);
    return node;
  }

  drawChain(shape: ChainShape, options: WorldStageOptions) {
    let offsetX = 0;
    let offsetY = 0;
    const offsetMemo = memo();

    const texture = Stage.canvas();
    texture.setDrawer(function () {
      const ctx = this.getContext();
      const ratio = 2 * this.getOptimalPixelRatio();
      const lw = options.lineWidth / ratio;

      const vertices = shape.m_vertices;

      if (!vertices.length) {
        return;
      }
  
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        minX = math_min(minX, v[0]);
        maxX = math_max(maxX, v[0]);
        minY = math_min(minY, options.scaleY * v[1]);
        maxY = math_max(maxY, options.scaleY * v[1]);
      }
  
      const width = maxX - minX;
      const height = maxY - minY;

      offsetX = minX;
      offsetY = minY;

      this.setSize(width + 2 * lw, height + 2 * lw, ratio);

      ctx.scale(ratio, ratio);
      ctx.beginPath();
      for (let i = 0; i < vertices.length; ++i) {
        const v = vertices[i];
        const x = v[0] - minX + lw;
        const y = options.scaleY * v[1] - minY + lw;
        if (i == 0)
          ctx.moveTo(x, y);

        else
          ctx.lineTo(x, y);
      }

      // TODO: if loop
      if (vertices.length > 2) {
        // ctx.closePath();
      }

      if (options.fill) {
        ctx.fillStyle = options.fill;
        ctx.fill();
        ctx.closePath();
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = options.lineWidth / ratio;
      ctx.strokeStyle = options.stroke ?? '';
      ctx.stroke();
    });

    const sprite = Stage.sprite(texture);
    sprite.tick(() => {
      if(!offsetMemo.recall(offsetX, offsetY)) {
        sprite.offset(offsetX, offsetY);
      }
    });

    const node = Stage.layout().append(sprite);
    return node;
  }
}
