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
  
  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `roles_admin/${user.uid}`);
  }, [firestore, user]);

  const { data: adminDoc, isLoading: isRoleLoading } = useDoc(adminRoleRef);

  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Determine the overall loading state
    const checking = isUserLoading || isRoleLoading;
    setIsCheckingAdmin(checking);

    if (!checking) {
      // If not loading, determine admin status
      // `adminDoc` will be `null` if the document doesn't exist.
      // It will have data if it does exist.
      setIsAdmin(!!adminDoc);
    }
  }, [isUserLoading, isRoleLoading, adminDoc]);

  return { isAdmin, isCheckingAdmin };
}
