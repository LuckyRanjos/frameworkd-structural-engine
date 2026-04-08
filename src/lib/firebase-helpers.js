// ============================================================
// src/lib/firebase-helpers.js
// All Firebase helper functions (plan limits + decisions)
// ============================================================

import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

import { db, decisionsRef, usersRef } from "@/lib/firebase";

const PLAN_LIMITS = {
  free: 5,
  individual: 30,
  team: 200,
  org: 999,
};

const DAILY_LIMITS = {
  free: 8,        // ← your requested 5-10 range (I chose 8)
  individual: 20,
  team: 50,
  org: 999,
};

async function incrementDailyUsage(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const dailyRef = doc(db, "users", userId, "dailyUsage", today);

    await setDoc(dailyRef, {
      count: increment(1),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("incrementDailyUsage failed:", error.message);
  }
}

// ============================================================
// DECISION FUNCTIONS
// ============================================================

export async function saveDecision(userId, decisionData) {
  try {
    const docRef = await addDoc(decisionsRef, {
      userId,
      decisionText:     decisionData.decisionText,
      mode:             decisionData.mode,
      verdict:          decisionData.verdict,
      score:            decisionData.score,
      summary:          decisionData.summary,
      requiredActions:  decisionData.requiredActions,
      keyInsight:       decisionData.keyInsight,
      pivotSuggestions: decisionData.pivotSuggestions,
      auditors:         decisionData.auditors,
      synthesis:        decisionData.synthesis,
      totalCostUSD:     decisionData.totalCostUSD || 0,   // ← new cost field
      createdAt:        serverTimestamp(),
    });

    await incrementUserDecisionCount(userId);
    await incrementDailyUsage(userId);        // ← daily counter

    return docRef.id;
  } catch (error) {
    console.error("saveDecision failed:", error.message);
    throw error;
  }
}

export async function getDecisionById(decisionId) {
  try {
    const docRef  = doc(db, "decisions", decisionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };

  } catch (error) {
    console.error("getDecisionById failed:", error.message);
    throw error;
  }
}

export async function getUserDecisions(userId, maxResults = 50) {
  try {
    const q = query(
      decisionsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

  } catch (error) {
    console.error("getUserDecisions failed:", error.message);
    throw error;
  }
}

export async function getUserStats(userId) {
  try {
    const decisions = await getUserDecisions(userId, 500);

    const total       = decisions.length;
    const passed      = decisions.filter(d => d.verdict === "PASS").length;
    const conditional = decisions.filter(d => d.verdict === "CONDITIONAL").length;
    const failed      = decisions.filter(d => d.verdict === "FAIL").length;
    const passRate    = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, conditional, failed, passRate };

  } catch (error) {
    console.error("getUserStats failed:", error.message);
    return { total: 0, passed: 0, conditional: 0, failed: 0, passRate: 0 };
  }
}

// ============================================================
// USER FUNCTIONS
// ============================================================

export async function createUserProfile(userId, email, displayName = "") {
  try {
    const userDocRef = doc(db, "users", userId);

    await setDoc(userDocRef, {
      userId,
      email,
      displayName,
      plan:          "free",
      decisionCount: 0,
      createdAt:     serverTimestamp(),
      updatedAt:     serverTimestamp(),
    });

    console.log("User profile created for:", userId);

  } catch (error) {
    console.error("createUserProfile failed:", error.message);
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap    = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() };

  } catch (error) {
    console.error("getUserProfile failed:", error.message);
    throw error;
  }
}

export async function updateUserPlan(userId, newPlan) {
  try {
    const userDocRef = doc(db, "users", userId);

    await updateDoc(userDocRef, {
      plan:      newPlan,
      updatedAt: serverTimestamp(),
    });

    console.log(`Updated plan for ${userId} to: ${newPlan}`);

  } catch (error) {
    console.error("updateUserPlan failed:", error.message);
    throw error;
  }
}

export async function incrementUserDecisionCount(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      decisionCount: increment(1),
      updatedAt:     serverTimestamp(),
    });
  } catch (error) {
    console.error("incrementUserDecisionCount failed:", error.message);
  }
}

// ============================================================
// PLAN LIMITS
// ============================================================


export async function checkPlanLimit(userId) {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      return { allowed: false, reason: "User profile not found." };
    }

    const plan = profile.plan || "free";

    // Monthly check
    const monthlyCap = PLAN_LIMITS[plan] ?? 5;
    const monthlyCount = profile.decisionCount || 0;

    if (monthlyCount >= monthlyCap) {
      return {
        allowed: false,
        reason: `You have used ${monthlyCount} of ${monthlyCap} decisions this month on the ${plan} plan. Upgrade to continue.`,
      };
    }

  // Daily check
    const today = new Date().toISOString().split("T")[0];
    const dailyRef = doc(db, "users", userId, "dailyUsage", today);
    const dailySnap = await getDoc(dailyRef);
    const dailyCount = dailySnap.exists() ? dailySnap.data().count || 0 : 0;
    const dailyCap = DAILY_LIMITS[plan] ?? 8;

    if (dailyCount >= dailyCap) {
      return {
        allowed: false,
        reason: `Daily limit reached (${dailyCount}/${dailyCap} checks today). Come back tomorrow or upgrade your plan.`,
      };
    }

    return {
      allowed: true,
      currentPlan: plan,
      monthlyCount,
      monthlyLimit: monthlyCap,
      dailyCount,
      dailyLimit: dailyCap,
    };

  } catch (error) {
    console.error("checkPlanLimit failed:", error.message);
    return { allowed: true };
  }
}

export async function getDailyRemaining(userId) {
  try {
    const limitCheck = await checkPlanLimit(userId);
    if (!limitCheck.allowed && limitCheck.reason?.includes("Daily limit")) {
      return {
        remaining: 0,
        used: limitCheck.dailyCount || 0,
        limit: limitCheck.dailyLimit || 8,
        isBlocked: true,
      };
    }
    return {
      remaining: limitCheck.dailyLimit - limitCheck.dailyCount,
      used: limitCheck.dailyCount || 0,
      limit: limitCheck.dailyLimit || 8,
      isBlocked: false,
    };
  } catch (error) {
    console.error("getDailyRemaining failed:", error.message);
    return { remaining: 0, used: 0, limit: 8, isBlocked: true };
  }
}