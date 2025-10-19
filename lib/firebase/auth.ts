"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./client";
import type { UserRole } from "@/types/firestore";

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = "passenger",
  additionalData?: Partial<{ phone: string; photoURL: string }>
) {
  const credentials = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(credentials.user, { displayName });
  }

  const userRef = doc(db, "users", credentials.user.uid);
  await setDoc(
    userRef,
    {
      id: credentials.user.uid,
      role,
      email,
      displayName,
      phone: additionalData?.phone ?? null,
      photoURL: additionalData?.photoURL ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return credentials.user;
}

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const userRef = doc(db, "users", result.user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(
      userRef,
      {
        id: result.user.uid,
        role: "passenger",
        email: result.user.email,
        displayName: result.user.displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return result.user;
}

export function logout() {
  return signOut(auth);
}
