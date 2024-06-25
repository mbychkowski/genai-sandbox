'use client';

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged as _onAuthStateChanged, signInWithPopup, signOut as _signOut, Auth, NextOrObserver, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { firebaseConfig } from '@/lib/firebaseConfig'; // Your Firebase config
import { auth } from '@/lib/firebaseClientApp';

const googleProvider = new GoogleAuthProvider();

function onAuthStateChanged(cb: NextOrObserver<User>) {
	return _onAuthStateChanged(auth, cb);
}

export const useAuth = (initialUser: User | null): User | null => {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();

	// Register the service worker that sends auth state back to server
	// The service worker is built with npm run build-service-worker
	useEffect(() => {
    if ("serviceWorker" in navigator) {
      const serializedFirebaseConfig = encodeURIComponent(JSON.stringify(firebaseConfig));
			const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`

		  navigator.serviceWorker
			.register(serviceWorkerUrl)
			.then((registration) => console.log("scope is: ", registration.scope));
		}
	  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

	useEffect(() => {
		onAuthStateChanged((authUser) => {
			if (user === undefined) return

			// refresh when user changed to ease testing
			if (user?.email !== authUser?.email) {
				router.refresh()
			}
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

  return user;
};

export const signInWithGoogle = async () => {
  console.log(auth)
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error('Error signing in with Google:', error);
  }
};

export const signOut = async () => {
  await _signOut(auth)
};