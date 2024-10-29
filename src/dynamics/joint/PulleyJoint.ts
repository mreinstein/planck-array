/*
 * Planck.js
 * The MIT License
 * Copyright (c) 2021 Erin Catto, Ali Shakiba
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { options } from '../../util/options';
import { SettingsInternal as Settings } from '../../Settings';
import { EPSILON } from '../../common/Math';
import { Vec2Value } from '../../common/Vec2';
import * as Vec2 from '../../common/Vec2';
import { Rot } from '../../common/Rot';
import { Joint, JointOpt, JointDef } from '../Joint';
import { Body } from '../Body';
import { TimeStep } from "../Solver";


/** @internal */ const _ASSERT = typeof ASSERT === 'undefined' ? false : ASSERT;
/** @internal */ const math_abs = Math.abs;


/**
 * Pulley joint definition. This requires two ground anchors, two dynamic body
 * anchor points, and a pulley ratio.
 */
// tslint:disable-next-line:no-empty-interface
export interface PulleyJointOpt extends JointOpt {
}

/**
 * Pulley joint definition. This requires two ground anchors, two dynamic body
 * anchor points, and a pulley ratio.
 */
export interface PulleyJointDef extends JointDef, PulleyJointOpt {
  /**
   * The first ground anchor in world coordinates. This point never moves.
   */
  groundAnchorA: Vec2Value;
  /**
   * The second ground anchor in world coordinates. This point never moves.
   */
  groundAnchorB: Vec2Value;
  /**
   * The local anchor point relative to bodyA's origin.
   */
  localAnchorA: Vec2Value;
  /**
   * The local anchor point relative to bodyB's origin.
   */
  localAnchorB: Vec2Value;
  /**
   * The reference length for the segment attached to bodyA.
   */
  lengthA: number;
  /**
   * The reference length for the segment attached to bodyB.
   */
  lengthB: number;
  /**
   * The pulley ratio, used to simulate a block-and-tackle.
   */
  ratio: number;

  /** @hidden */ anchorA?: Vec2Value;
  /** @hidden */ anchorB?: Vec2Value;
}

/** @internal */ const DEFAULTS = {
  collideConnected : true
};

/**
 * The pulley joint is connected to two bodies and two fixed ground points. The
 * pulley supports a ratio such that: length1 + ratio * length2 <= constant
 *
 * Yes, the force transmitted is scaled by the ratio.
 *
 * Warning: the pulley joint can get a bit squirrelly by itself. They often work
 * better when combined with prismatic joints. You should also cover the the
 * anchor points with static shapes to prevent one side from going to zero
 * length.
 */
export class PulleyJoint extends Joint {
  static TYPE = 'pulley-joint' as const;
  // static MIN_PULLEY_LENGTH: number = 2.0; // TODO where this is used?

  /** @internal */ m_type: 'pulley-joint';
  /** @internal */ m_groundAnchorA: Vec2Value;
  /** @internal */ m_groundAnchorB: Vec2Value;
  /** @internal */ m_localAnchorA: Vec2Value;
  /** @internal */ m_localAnchorB: Vec2Value;
  /** @internal */ m_lengthA: number;
  /** @internal */ m_lengthB: number;
  /** @internal */ m_ratio: number;
  /** @internal */ m_constant: number;
  /** @internal */ m_impulse: number;

  // Solver temp
  /** @internal */ m_uA: Vec2Value;
  /** @internal */ m_uB: Vec2Value;
  /** @internal */ m_rA: Vec2Value;
  /** @internal */ m_rB: Vec2Value;
  /** @internal */ m_localCenterA: Vec2Value;
  /** @internal */ m_localCenterB: Vec2Value;
  /** @internal */ m_invMassA: number;
  /** @internal */ m_invMassB: number;
  /** @internal */ m_invIA: number;
  /** @internal */ m_invIB: number;
  /** @internal */ m_mass: number;

  constructor(def: PulleyJointDef);
  constructor(def: PulleyJointOpt, bodyA: Body, bodyB: Body, groundA: Vec2Value, groundB: Vec2Value, anchorA: Vec2Value, anchorB: Vec2Value, ratio: number);
  constructor(def: PulleyJointDef, bodyA?: Body, bodyB?: Body, groundA?: Vec2Value, groundB?: Vec2Value, anchorA?: Vec2Value, anchorB?: Vec2Value, ratio?: number) {
  
    def = options(def, DEFAULTS);
    super(def, bodyA, bodyB);
    bodyA = this.m_bodyA;
    bodyB = this.m_bodyB;

    this.m_type = PulleyJoint.TYPE;
    this.m_groundAnchorA = Vec2.clone(groundA ? groundA : def.groundAnchorA || Vec2.create(-1.0, 1.0));
    this.m_groundAnchorB = Vec2.clone(groundB ? groundB : def.groundAnchorB || Vec2.create(1.0, 1.0));
    this.m_localAnchorA = Vec2.clone(anchorA ? bodyA.getLocalPoint(anchorA) : def.localAnchorA || Vec2.create(-1.0, 0.0));
    this.m_localAnchorB = Vec2.clone(anchorB ? bodyB.getLocalPoint(anchorB) : def.localAnchorB || Vec2.create(1.0, 0.0));
    this.m_lengthA = Number.isFinite(def.lengthA) ? def.lengthA : Vec2.distance(anchorA, groundA);
    this.m_lengthB = Number.isFinite(def.lengthB) ? def.lengthB : Vec2.distance(anchorB, groundB);
    this.m_ratio = Number.isFinite(ratio) ? ratio : def.ratio;

    _ASSERT && console.assert(ratio > EPSILON);

    this.m_constant = this.m_lengthA + this.m_ratio * this.m_lengthB;

    this.m_impulse = 0.0;

    // Pulley:
    // length1 = norm(p1 - s1)
    // length2 = norm(p2 - s2)
    // C0 = (length1 + ratio * length2)_initial
    // C = C0 - (length1 + ratio * length2)
    // u1 = (p1 - s1) / norm(p1 - s1)
    // u2 = (p2 - s2) / norm(p2 - s2)
    // Cdot = -dot(u1, v1 + cross(w1, r1)) - ratio * dot(u2, v2 + cross(w2, r2))
    // J = -[u1 cross(r1, u1) ratio * u2 ratio * cross(r2, u2)]
    // K = J * invM * JT
    // = invMass1 + invI1 * cross(r1, u1)^2 + ratio^2 * (invMass2 + invI2 *
    // cross(r2, u2)^2)
  }

  /** @internal */
  _serialize(): object {
    return {
      type: this.m_type,
      bodyA: this.m_bodyA,
      bodyB: this.m_bodyB,
      collideConnected: this.m_collideConnected,

      groundAnchorA: this.m_groundAnchorA,
      groundAnchorB: this.m_groundAnchorB,
      localAnchorA: this.m_localAnchorA,
      localAnchorB: this.m_localAnchorB,
      lengthA: this.m_lengthA,
      lengthB: this.m_lengthB,
      ratio: this.m_ratio,
    };
  }

  /** @internal */
  static _deserialize(data: any, world: any, restore: any): PulleyJoint {
    data = {...data};
    data.bodyA = restore(Body, data.bodyA, world);
    data.bodyB = restore(Body, data.bodyB, world);
    const joint = new PulleyJoint(data);
    return joint;
  }

  /** @hidden */
  _reset(def: Partial<PulleyJointDef>): void {
    if (Vec2.isValid(def.groundAnchorA)) {
      Vec2.copy(def.groundAnchorA, this.m_groundAnchorA);
    }
    if (Vec2.isValid(def.groundAnchorB)) {
      Vec2.copy(def.groundAnchorB, this.m_groundAnchorB);
    }
    if (Vec2.isValid(def.localAnchorA)) {
      Vec2.copy(def.localAnchorA, this.m_localAnchorA);
    } else if (Vec2.isValid(def.anchorA)) {
      Vec2.copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
    }
    if (Vec2.isValid(def.localAnchorB)) {
      Vec2.copy(def.localAnchorB, this.m_localAnchorB);
    } else if (Vec2.isValid(def.anchorB)) {
      Vec2.copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
    }
    if (Number.isFinite(def.lengthA)) {
      this.m_lengthA = def.lengthA;
    }
    if (Number.isFinite(def.lengthB)) {
      this.m_lengthB = def.lengthB;
    }
    if (Number.isFinite(def.ratio)) {
      this.m_ratio = def.ratio;
    }
  }

  /**
   * Get the first ground anchor.
   */
  getGroundAnchorA(): Vec2Value {
    return this.m_groundAnchorA;
  }

  /**
   * Get the second ground anchor.
   */
  getGroundAnchorB(): Vec2Value {
    return this.m_groundAnchorB;
  }

  /**
   * Get the current length of the segment attached to bodyA.
   */
  getLengthA(): number {
    return this.m_lengthA;
  }

  /**
   * Get the current length of the segment attached to bodyB.
   */
  getLengthB(): number {
    return this.m_lengthB;
  }

  /**
   * Get the pulley ratio.
   */
  getRatio(): number {
    return this.m_ratio;
  }

  /**
   * Get the current length of the segment attached to bodyA.
   */
  getCurrentLengthA(): number {
    const p = this.m_bodyA.getWorldPoint(this.m_localAnchorA);
    const s = this.m_groundAnchorA;
    return Vec2.distance(p, s);
  }

  /**
   * Get the current length of the segment attached to bodyB.
   */
  getCurrentLengthB(): number {
    const p = this.m_bodyB.getWorldPoint(this.m_localAnchorB);
    const s = this.m_groundAnchorB;
    return Vec2.distance(p, s);
  }

  /**
   * Shift the origin for any points stored in world coordinates.
   *
   * @param newOrigin
   */
  shiftOrigin(newOrigin: Vec2Value): void {
    Vec2.sub(this.m_groundAnchorA, newOrigin, this.m_groundAnchorA);
    Vec2.sub(this.m_groundAnchorB, newOrigin, this.m_groundAnchorB);
  }

  /**
   * Get the anchor point on bodyA in world coordinates.
   */
  getAnchorA(): Vec2Value {
    return this.m_bodyA.getWorldPoint(this.m_localAnchorA);
  }

  /**
   * Get the anchor point on bodyB in world coordinates.
   */
  getAnchorB(): Vec2Value {
    return this.m_bodyB.getWorldPoint(this.m_localAnchorB);
  }

  /**
   * Get the reaction force on bodyB at the joint anchor in Newtons.
   */
  getReactionForce(inv_dt: number): Vec2Value {
    const f = Vec2.mulNumVec2(this.m_impulse, this.m_uB);
    return Vec2.scale(f, inv_dt, f);
  }

  /**
   * Get the reaction torque on bodyB in N*m.
   */
  getReactionTorque(inv_dt: number): number {
    return 0.0;
  }

  initVelocityConstraints(step: TimeStep): void {
    this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
    this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const cA = this.m_bodyA.c_position.c;
    const aA = this.m_bodyA.c_position.a;
    const vA = this.m_bodyA.c_velocity.v;
    let wA = this.m_bodyA.c_velocity.w;

    const cB = this.m_bodyB.c_position.c;
    const aB = this.m_bodyB.c_position.a;
    const vB = this.m_bodyB.c_velocity.v;
    let wB = this.m_bodyB.c_velocity.w;

    const qA = Rot.neo(aA);
    const qB = Rot.neo(aB);

    this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
    this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));

    // Get the pulley axes.
    this.m_uA = Vec2.sub(Vec2.add(cA, this.m_rA), this.m_groundAnchorA);
    this.m_uB = Vec2.sub(Vec2.add(cB, this.m_rB), this.m_groundAnchorB);

    const lengthA = Vec2.length(this.m_uA);
    const lengthB = Vec2.length(this.m_uB);

    if (lengthA > 10.0 * Settings.linearSlop) {
      Vec2.scale(this.m_uA, 1.0 / lengthA, this.m_uA);
    } else {
      Vec2.setZero(this.m_uA);
    }

    if (lengthB > 10.0 * Settings.linearSlop) {
      Vec2.scale(this.m_uB, 1.0 / lengthB, this.m_uB);
    } else {
      Vec2.setZero(this.m_uB);
    }

    // Compute effective mass.
    const ruA = Vec2.crossVec2Vec2(this.m_rA, this.m_uA);
    const ruB = Vec2.crossVec2Vec2(this.m_rB, this.m_uB);

    const mA = this.m_invMassA + this.m_invIA * ruA * ruA;
    const mB = this.m_invMassB + this.m_invIB * ruB * ruB;

    this.m_mass = mA + this.m_ratio * this.m_ratio * mB;

    if (this.m_mass > 0.0) {
      this.m_mass = 1.0 / this.m_mass;
    }

    if (step.warmStarting) {
      // Scale impulses to support variable time steps.
      this.m_impulse *= step.dtRatio;

      // Warm starting.
      const PA = Vec2.mulNumVec2(-this.m_impulse, this.m_uA);
      const PB = Vec2.mulNumVec2(-this.m_ratio * this.m_impulse, this.m_uB);

      Vec2.addMul(vA, this.m_invMassA, PA, vA);
      wA += this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, PA);

      Vec2.addMul(vB, this.m_invMassB, PB, vB);
      wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, PB);

    } else {
      this.m_impulse = 0.0;
    }

    this.m_bodyA.c_velocity.v = vA;
    this.m_bodyA.c_velocity.w = wA;
    this.m_bodyB.c_velocity.v = vB;
    this.m_bodyB.c_velocity.w = wB;
  }

  solveVelocityConstraints(step: TimeStep): void {
    const vA = this.m_bodyA.c_velocity.v;
    let wA = this.m_bodyA.c_velocity.w;
    const vB = this.m_bodyB.c_velocity.v;
    let wB = this.m_bodyB.c_velocity.w;

    const vpA = Vec2.add(vA, Vec2.crossNumVec2(wA, this.m_rA));
    const vpB = Vec2.add(vB, Vec2.crossNumVec2(wB, this.m_rB));

    const Cdot = -Vec2.dot(this.m_uA, vpA) - this.m_ratio * Vec2.dot(this.m_uB, vpB);
    const impulse = -this.m_mass * Cdot;
    this.m_impulse += impulse;

    const PA = Vec2.mulNumVec2(-impulse, this.m_uA);
    const PB = Vec2.mulNumVec2(-this.m_ratio * impulse, this.m_uB);
    Vec2.addMul(vA, this.m_invMassA, PA, vA);
    wA += this.m_invIA * Vec2.crossVec2Vec2(this.m_rA, PA);
    Vec2.addMul(vB, this.m_invMassB, PB, vB);
    wB += this.m_invIB * Vec2.crossVec2Vec2(this.m_rB, PB);

    this.m_bodyA.c_velocity.v = vA;
    this.m_bodyA.c_velocity.w = wA;
    this.m_bodyB.c_velocity.v = vB;
    this.m_bodyB.c_velocity.w = wB;
  }

  /**
   * This returns true if the position errors are within tolerance.
   */
  solvePositionConstraints(step: TimeStep): boolean {
    const cA = this.m_bodyA.c_position.c;
    let aA = this.m_bodyA.c_position.a;
    const cB = this.m_bodyB.c_position.c;
    let aB = this.m_bodyB.c_position.a;

    const qA = Rot.neo(aA);
    const qB = Rot.neo(aB);

    const rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
    const rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));

    // Get the pulley axes.
    const uA = Vec2.sub(Vec2.add(cA, this.m_rA), this.m_groundAnchorA);
    const uB = Vec2.sub(Vec2.add(cB, this.m_rB), this.m_groundAnchorB);

    const lengthA = Vec2.length(uA);
    const lengthB = Vec2.length(uB);

    if (lengthA > 10.0 * Settings.linearSlop) {
      Vec2.scale(uA, 1.0 / lengthA, uA);
    } else {
      Vec2.setZero(uA);
    }

    if (lengthB > 10.0 * Settings.linearSlop) {
      Vec2.scale(uB, 1.0 / lengthB, uB);
    } else {
      Vec2.setZero(uB);
    }

    // Compute effective mass.
    const ruA = Vec2.crossVec2Vec2(rA, uA);
    const ruB = Vec2.crossVec2Vec2(rB, uB);

    const mA = this.m_invMassA + this.m_invIA * ruA * ruA;
    const mB = this.m_invMassB + this.m_invIB * ruB * ruB;

    let mass = mA + this.m_ratio * this.m_ratio * mB;

    if (mass > 0.0) {
      mass = 1.0 / mass;
    }

    const C = this.m_constant - lengthA - this.m_ratio * lengthB;
    const linearError = math_abs(C);

    const impulse = -mass * C;

    const PA = Vec2.mulNumVec2(-impulse, uA);
    const PB = Vec2.mulNumVec2(-this.m_ratio * impulse, uB);

    Vec2.addMul(cA, this.m_invMassA, PA, cA);
    aA += this.m_invIA * Vec2.crossVec2Vec2(rA, PA);
    Vec2.addMul(cB, this.m_invMassB, PB, cB);
    aB += this.m_invIB * Vec2.crossVec2Vec2(rB, PB);

    this.m_bodyA.c_position.c = cA;
    this.m_bodyA.c_position.a = aA;
    this.m_bodyB.c_position.c = cB;
    this.m_bodyB.c_position.a = aB;

    return linearError < Settings.linearSlop;
  }

}
