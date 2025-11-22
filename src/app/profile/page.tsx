'use client';

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Booking } from "@/lib/data";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/bookings`), orderBy('bookingTime', 'desc'));
    }, [user, firestore]);

    const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

    if (isUserLoading || !user) {
        return (
            <AppLayout>
                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-10 w-36" />
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                <Skeleton className="w-24 h-24 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-40" />
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-56" />
                            <Skeleton className="h-5 w-full" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i}><Skeleton className="h-12 w-full" /><Separator className="my-4"/></div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </AppLayout>
        )
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'MMMM dd, yyyy - h:mm a');
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-headline font-bold">My Profile</h1>
                    <Button variant="outline" className="w-full sm:w-auto"><Pencil className="mr-2 size-4" /> Edit Profile</Button>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <Avatar className="w-24 h-24">
                                {userAvatar && <AvatarImage src={user.photoURL || userAvatar.imageUrl} alt="User" />}
                                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">{user.displayName || 'New User'}</h2>
                                <p className="text-muted-foreground">{user.email}</p>
                                <p className="text-sm text-muted-foreground">
                                    {user.metadata.creationTime ? `Joined on ${format(new Date(user.metadata.creationTime), 'MMMM dd, yyyy')}` : ''}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Booking History</CardTitle>
                        <CardDescription>Check the status of your recent charging sessions below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {areBookingsLoading && (
                            <ul className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <li key={i}><Skeleton className="h-12 w-full" /><Separator className="my-4"/></li>
                                ))}
                            </ul>
                        )}
                        {!areBookingsLoading && bookings && bookings.length > 0 ? (
                             <ul className="space-y-4">
                                {bookings.map((booking, index) => (
                                    <React.Fragment key={booking.id}>
                                        <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                            <div>
                                                <p className="font-semibold">{booking.stationName} - Slot {booking.slotId.split('-')[1]}</p>
                                                <p className="text-sm text-muted-foreground">{formatDate(booking.bookingTime)}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <Badge variant={booking.status === 'upcoming' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}
                                                    className={cn({
                                                        'bg-accent text-accent-foreground': booking.status === 'upcoming',
                                                        'bg-destructive text-destructive-foreground': booking.status === 'cancelled',
                                                    })}>
                                                    {booking.status}
                                                </Badge>
                                            </div>
                                        </li>
                                        {index < bookings.length - 1 && <Separator />}
                                    </React.Fragment>
                                ))}
                            </ul>
                        ) : (
                           !areBookingsLoading && <p className="text-muted-foreground">You have no booking history.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
