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
import { Vec2Value } from '../../common/Vec2';
import * as Vec2 from '../../common/Vec2';
import * as Vec3 from '../../common/Vec3';
import { Vec3Value } from '../../common/Vec3';
import { Mat33 } from '../../common/Mat33';
import { Rot } from '../../common/Rot';
import { Joint, JointOpt, JointDef } from '../Joint';
import { Body } from '../Body';
import { TimeStep } from "../Solver";


/** @internal */ const math_abs = Math.abs;
/** @internal */ const math_PI = Math.PI;


/**
 * Weld joint definition. You need to specify local anchor points where they are
 * attached and the relative body angle. The position of the anchor points is
 * important for computing the reaction torque.
 */
export interface WeldJointOpt extends JointOpt {
  /**
   * The mass-spring-damper frequency in Hertz. Rotation only. Disable softness
   * with a value of 0.
   */
  frequencyHz?: number;
  /**
   * The damping ratio. 0 = no damping, 1 = critical damping.
   */
  dampingRatio?: number;
  /**
   * The bodyB angle minus bodyA angle in the reference state (radians).
   */
  referenceAngle?: number;
}

/**
 * Weld joint definition. You need to specify local anchor points where they are
 * attached and the relative body angle. The position of the anchor points is
 * important for computing the reaction torque.
 */
export interface WeldJointDef extends JointDef, WeldJointOpt {
  /**
   * The local anchor point relative to bodyA's origin.
   */
  localAnchorA: Vec2Value;
  /**
   * The local anchor point relative to bodyB's origin.
   */
  localAnchorB: Vec2Value;

  /** @internal */ anchorA?: Vec2Value;
  /** @internal */ anchorB?: Vec2Value;
}

/** @internal */ const DEFAULTS = {
  frequencyHz : 0.0,
  dampingRatio : 0.0,
};

/**
 * A weld joint essentially glues two bodies together. A weld joint may distort
 * somewhat because the island constraint solver is approximate.
 */
export class WeldJoint extends Joint {
  static TYPE = 'weld-joint' as const

  /** @internal */ m_type: 'weld-joint';
  /** @internal */ m_localAnchorA: Vec2Value;
  /** @internal */ m_localAnchorB: Vec2Value;
  /** @internal */ m_referenceAngle: number;

  /** @internal */ m_frequencyHz: number;
  /** @internal */ m_dampingRatio: number;

  /** @internal */ m_impulse: Vec3Value;

  /** @internal */ m_bias: number;
  /** @internal */ m_gamma: number;

  // Solver temp
  /** @internal */ m_rA: Vec2Value;
  /** @internal */ m_rB: Vec2Value;
  /** @internal */ m_localCenterA: Vec2Value;
  /** @internal */ m_localCenterB: Vec2Value;
  /** @internal */ m_invMassA: number;
  /** @internal */ m_invMassB: number;
  /** @internal */ m_invIA: number;
  /** @internal */ m_invIB: number;
  /** @internal */ m_mass: Mat33;

  constructor(def: WeldJointDef);
  constructor(def: WeldJointOpt, bodyA: Body, bodyB: Body, anchor: Vec2Value);
  constructor(def: WeldJointDef, bodyA?: Body, bodyB?: Body, anchor?: Vec2Value) {

    def = options(def, DEFAULTS);
    super(def, bodyA, bodyB);
    bodyA = this.m_bodyA;
    bodyB = this.m_bodyB;

    this.m_type = WeldJoint.TYPE;

    this.m_localAnchorA = Vec2.clone(anchor ? bodyA.getLocalPoint(anchor) : def.localAnchorA || Vec2.zero());
    this.m_localAnchorB = Vec2.clone(anchor ? bodyB.getLocalPoint(anchor) : def.localAnchorB || Vec2.zero());
    this.m_referenceAngle = Number.isFinite(def.referenceAngle) ? def.referenceAngle : bodyB.getAngle() - bodyA.getAngle();

    this.m_frequencyHz = def.frequencyHz;
    this.m_dampingRatio = def.dampingRatio;

    this.m_impulse = Vec3.create();

    this.m_bias = 0.0;
    this.m_gamma = 0.0;

    // Solver temp
    this.m_rA;
    this.m_rB;
    this.m_localCenterA;
    this.m_localCenterB;
    this.m_invMassA;
    this.m_invMassB;
    this.m_invIA;
    this.m_invIB;
    this.m_mass = new Mat33();

    // Point-to-point constraint
    // C = p2 - p1
    // Cdot = v2 - v1
    // / = v2 + cross(w2, r2) - v1 - cross(w1, r1)
    // J = [-I -r1_skew I r2_skew ]
    // Identity used:
    // w k % (rx i + ry j) = w * (-ry i + rx j)

    // Angle constraint
    // C = angle2 - angle1 - referenceAngle
    // Cdot = w2 - w1
    // J = [0 0 -1 0 0 1]
    // K = invI1 + invI2
  }

  /** @internal */
  _serialize(): object {
    return {
      type: this.m_type,
      bodyA: this.m_bodyA,
      bodyB: this.m_bodyB,
      collideConnected: this.m_collideConnected,

      frequencyHz: this.m_frequencyHz,
      dampingRatio: this.m_dampingRatio,

      localAnchorA: this.m_localAnchorA,
      localAnchorB: this.m_localAnchorB,
      referenceAngle: this.m_referenceAngle,
    };
  }

  /** @internal */
  static _deserialize(data: any, world: any, restore: any): WeldJoint {
    data = {...data};
    data.bodyA = restore(Body, data.bodyA, world);
    data.bodyB = restore(Body, data.bodyB, world);
    const joint = new WeldJoint(data);
    return joint;
  }

  /** @hidden */
  _reset(def: Partial<WeldJointDef>): void {
    if (def.anchorA) {
      Vec2.copy(this.m_bodyA.getLocalPoint(def.anchorA), this.m_localAnchorA);
    } else if (def.localAnchorA) {
      Vec2.copy(def.localAnchorA, this.m_localAnchorA);
    }
    if (def.anchorB) {
      Vec2.copy(this.m_bodyB.getLocalPoint(def.anchorB), this.m_localAnchorB);
    } else if (def.localAnchorB) {
      Vec2.copy(def.localAnchorB, this.m_localAnchorB);
    }
    if (Number.isFinite(def.frequencyHz)) {
      this.m_frequencyHz = def.frequencyHz;
    }
    if (Number.isFinite(def.dampingRatio)) {
      this.m_dampingRatio = def.dampingRatio;
    }
  }

  /**
   * The local anchor point relative to bodyA's origin.
   */
  getLocalAnchorA(): Vec2Value {
    return this.m_localAnchorA;
  }

  /**
   * The local anchor point relative to bodyB's origin.
   */
  getLocalAnchorB(): Vec2Value {
    return this.m_localAnchorB;
  }

  /**
   * Get the reference angle.
   */
  getReferenceAngle(): number {
    return this.m_referenceAngle;
  }

  /**
   * Set frequency in Hz.
   */
  setFrequency(hz: number): void {
    this.m_frequencyHz = hz;
  }

  /**
   * Get frequency in Hz.
   */
  getFrequency(): number {
    return this.m_frequencyHz;
  }

  /**
   * Set damping ratio.
   */
  setDampingRatio(ratio: number): void {
    this.m_dampingRatio = ratio;
  }

  /**
   * Get damping ratio.
   */
  getDampingRatio(): number {
    return this.m_dampingRatio;
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
    return Vec2.create(this.m_impulse[0] * inv_dt, this.m_impulse[1] * inv_dt);
  }

  /**
   * Get the reaction torque on bodyB in N*m.
   */
  getReactionTorque(inv_dt: number): number {
    return inv_dt * this.m_impulse[2];
  }

  initVelocityConstraints(step: TimeStep): void {
    this.m_localCenterA = this.m_bodyA.m_sweep.localCenter;
    this.m_localCenterB = this.m_bodyB.m_sweep.localCenter;
    this.m_invMassA = this.m_bodyA.m_invMass;
    this.m_invMassB = this.m_bodyB.m_invMass;
    this.m_invIA = this.m_bodyA.m_invI;
    this.m_invIB = this.m_bodyB.m_invI;

    const aA = this.m_bodyA.c_position.a;
    const vA = this.m_bodyA.c_velocity.v;
    let wA = this.m_bodyA.c_velocity.w;

    const aB = this.m_bodyB.c_position.a;
    const vB = this.m_bodyB.c_velocity.v;
    let wB = this.m_bodyB.c_velocity.w;

    const qA = Rot.neo(aA);
    const qB = Rot.neo(aB);

    this.m_rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
    this.m_rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));

    // J = [-I -r1_skew I r2_skew]
    // [ 0 -1 0 1]
    // r_skew = [-ry; rx]

    // Matlab
    // K = [ mA+r1y^2*iA+mB+r2y^2*iB, -r1y*iA*r1x-r2y*iB*r2x, -r1y*iA-r2y*iB]
    // [ -r1y*iA*r1x-r2y*iB*r2x, mA+r1x^2*iA+mB+r2x^2*iB, r1x*iA+r2x*iB]
    // [ -r1y*iA-r2y*iB, r1x*iA+r2x*iB, iA+iB]

    const mA = this.m_invMassA;
    const mB = this.m_invMassB;
    const iA = this.m_invIA;
    const iB = this.m_invIB;

    const K = new Mat33();
    K.ex[0] = mA + mB + this.m_rA[1] * this.m_rA[1] * iA + this.m_rB[1] * this.m_rB[1]
        * iB;
    K.ey[0] = -this.m_rA[1] * this.m_rA[0] * iA - this.m_rB[1] * this.m_rB[0] * iB;
    K.ez[0] = -this.m_rA[1] * iA - this.m_rB[1] * iB;
    K.ex[1] = K.ey[0];
    K.ey[1] = mA + mB + this.m_rA[0] * this.m_rA[0] * iA + this.m_rB[0] * this.m_rB[0]
        * iB;
    K.ez[1] = this.m_rA[0] * iA + this.m_rB[0] * iB;
    K.ex[2] = K.ez[0];
    K.ey[2] = K.ez[1];
    K.ez[2] = iA + iB;

    if (this.m_frequencyHz > 0.0) {
      K.getInverse22(this.m_mass);

      let invM = iA + iB;
      const m = invM > 0.0 ? 1.0 / invM : 0.0;

      const C = aB - aA - this.m_referenceAngle;

      // Frequency
      const omega = 2.0 * math_PI * this.m_frequencyHz;

      // Damping coefficient
      const d = 2.0 * m * this.m_dampingRatio * omega;

      // Spring stiffness
      const k = m * omega * omega;

      // magic formulas
      const h = step.dt;
      this.m_gamma = h * (d + h * k);
      this.m_gamma = this.m_gamma != 0.0 ? 1.0 / this.m_gamma : 0.0;
      this.m_bias = C * h * k * this.m_gamma;

      invM += this.m_gamma;
      this.m_mass.ez[2] = invM != 0.0 ? 1.0 / invM : 0.0;
    } else if (K.ez[2] == 0.0) {
      K.getInverse22(this.m_mass);
      this.m_gamma = 0.0;
      this.m_bias = 0.0;
    } else {
      K.getSymInverse33(this.m_mass);
      this.m_gamma = 0.0;
      this.m_bias = 0.0;
    }

    if (step.warmStarting) {
      // Scale impulses to support a variable time step.
      Vec3.set(this.m_impulse[0] * step.dtRatio, this.m_impulse[1] * step.dtRatio, this.m_impulse[2], this.m_impulse);

      const P = Vec2.create(this.m_impulse[0], this.m_impulse[1]);

      Vec2.subMul(vA, mA, P, vA);
      wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P) + this.m_impulse[2]);

      Vec2.addMul(vB, mB, P, vB);
      wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P) + this.m_impulse[2]);

    } else {
      Vec3.setZero(this.m_impulse);
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

    const mA = this.m_invMassA;
    const mB = this.m_invMassB;
    const iA = this.m_invIA;
    const iB = this.m_invIB;

    if (this.m_frequencyHz > 0.0) {
      const Cdot2 = wB - wA;

      const impulse2 = -this.m_mass.ez[2] * (Cdot2 + this.m_bias + this.m_gamma * this.m_impulse[2]);
      this.m_impulse[2] += impulse2;

      wA -= iA * impulse2;
      wB += iB * impulse2;

      const Cdot1 = Vec2.zero();
      Vec2.addCombine(Cdot1, 1, vB, 1, Vec2.crossNumVec2(wB, this.m_rB), Cdot1);
      Vec2.subCombine(Cdot1, 1, vA, 1, Vec2.crossNumVec2(wA, this.m_rA), Cdot1);

      const impulse1 = Vec2.neg(Mat33.mulVec2(this.m_mass, Cdot1));
      this.m_impulse[0] += impulse1[0];
      this.m_impulse[1] += impulse1[1];

      const P = Vec2.clone(impulse1);

      Vec2.subMul(vA, mA, P, vA);
      wA -= iA * Vec2.crossVec2Vec2(this.m_rA, P);

      Vec2.addMul(vB, mB, P, vB);
      wB += iB * Vec2.crossVec2Vec2(this.m_rB, P);
    } else {
      const Cdot1 = Vec2.zero();
      Vec2.addCombine(Cdot1, 1, vB, 1, Vec2.crossNumVec2(wB, this.m_rB), Cdot1);
      Vec2.subCombine(Cdot1, 1, vA, 1, Vec2.crossNumVec2(wA, this.m_rA), Cdot1);

      const Cdot2 = wB - wA;
      const Cdot = Vec3.create(Cdot1[0], Cdot1[1], Cdot2);

      const impulse = Vec3.neg(Mat33.mulVec3(this.m_mass, Cdot));
      Vec3.add(this.m_impulse, impulse, this.m_impulse);

      const P = Vec2.create(impulse[0], impulse[1]);

      Vec2.subMul(vA, mA, P, vA);
      wA -= iA * (Vec2.crossVec2Vec2(this.m_rA, P) + impulse[2]);

      Vec2.addMul(vB, mB, P, vB);
      wB += iB * (Vec2.crossVec2Vec2(this.m_rB, P) + impulse[2]);
    }

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

    const mA = this.m_invMassA;
    const mB = this.m_invMassB;
    const iA = this.m_invIA;
    const iB = this.m_invIB;

    const rA = Rot.mulVec2(qA, Vec2.sub(this.m_localAnchorA, this.m_localCenterA));
    const rB = Rot.mulVec2(qB, Vec2.sub(this.m_localAnchorB, this.m_localCenterB));

    let positionError: number;
    let angularError: number;

    const K = new Mat33();
    K.ex[0] = mA + mB + rA[1] * rA[1] * iA + rB[1] * rB[1] * iB;
    K.ey[0] = -rA[1] * rA[0] * iA - rB[1] * rB[0] * iB;
    K.ez[0] = -rA[1] * iA - rB[1] * iB;
    K.ex[1] = K.ey[0];
    K.ey[1] = mA + mB + rA[0] * rA[0] * iA + rB[0] * rB[0] * iB;
    K.ez[1] = rA[0] * iA + rB[0] * iB;
    K.ex[2] = K.ez[0];
    K.ey[2] = K.ez[1];
    K.ez[2] = iA + iB;

    if (this.m_frequencyHz > 0.0) {
      const C1 = Vec2.zero();
      Vec2.addCombine(C1, 1, cB, 1, rB, C1);
      Vec2.subCombine(C1, 1, cA, 1, rA, C1);

      positionError = Vec2.length(C1);
      angularError = 0.0;

      const P = Vec2.neg(K.solve22(C1));

      Vec2.subMul(cA, mA, P, cA);
      aA -= iA * Vec2.crossVec2Vec2(rA, P);

      Vec2.addMul(cB, mB, P, cB);
      aB += iB * Vec2.crossVec2Vec2(rB, P);
    } else {
      const C1 = Vec2.zero();
      Vec2.addCombine(C1, 1, cB, 1, rB, C1);
      Vec2.subCombine(C1, 1, cA, 1, rA, C1);

      const C2 = aB - aA - this.m_referenceAngle;

      positionError = Vec2.length(C1);
      angularError = math_abs(C2);

      const C = Vec3.create(C1[0], C1[1], C2);

      let impulse = Vec3.create();
      if (K.ez[2] > 0.0) {
        impulse = Vec3.neg(K.solve33(C));
      } else {
        const impulse2 = Vec2.neg(K.solve22(C1));
        Vec3.set(impulse2[0], impulse2[1], 0.0, impulse);
      }

      const P = Vec2.create(impulse[0], impulse[1]);

      Vec2.subMul(cA, mA, P, cA);
      aA -= iA * (Vec2.crossVec2Vec2(rA, P) + impulse[2]);

      Vec2.addMul(cB, mB, P, cB);
      aB += iB * (Vec2.crossVec2Vec2(rB, P) + impulse[2]);
    }

    this.m_bodyA.c_position.c = cA;
    this.m_bodyA.c_position.a = aA;
    this.m_bodyB.c_position.c = cB;
    this.m_bodyB.c_position.a = aB;

    return positionError <= Settings.linearSlop && angularError <= Settings.angularSlop;
  }

}
