'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

/**
 * A hook to check if the current user has admin privileges.
 * It checks for the existence of a document in the `/roles_admin/{userId}` collection.
 *
 * @returns An object containing `isAdmin` (boolean) and `isCheckingAdmin` (boolean).
 */
export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const adminUID = 'DKuV0fBn8YZca566HVejtUh73Ii1';
  
  // The admin check should only proceed if we are NOT loading the user and the user object exists.
  const adminRoleRef = useMemoFirebase(() => {
    if (isUserLoading || !user || !firestore) return null;
    return doc(firestore, `roles_admin/${user.uid}`);
  }, [firestore, user, isUserLoading]);

  const { data: adminDoc, isLoading: isRoleLoading } = useDoc(adminRoleRef);

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // The overall check is happening if the user is loading OR if the role document is loading.
    const checking = isUserLoading || isRoleLoading;
    setIsCheckingAdmin(checking);

    if (!checking) {
      // If we are no longer in a loading state, we can determine the admin status.
      if (user?.uid === adminUID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(!!adminDoc);
      }
    }
  }, [isUserLoading, isRoleLoading, adminDoc, user, adminUID]);

  return { isAdmin, isCheckingAdmin };
}
