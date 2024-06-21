'use client';

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "@/lib/firebaseConfig";
import { getAuth } from "firebase/auth";

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);