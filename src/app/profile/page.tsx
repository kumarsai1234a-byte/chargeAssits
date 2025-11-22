'use client';

import React from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pencil, CheckCircle, XCircle, Clock, Hourglass } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import type { BookingRequest } from "@/lib/data";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        // Correctly filter requests to only what the user owns.
        return query(collection(firestore, 'bookingRequests'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
    }, [user, firestore]);

    const { data: bookings, isLoading: areBookingsLoading } = useCollection<BookingRequest>(bookingsQuery);

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
    
    const getStatusInfo = (status: BookingRequest['status']) => {
        switch (status) {
            case 'approved':
                return { icon: <CheckCircle className="text-accent" />, text: "Approved", className: 'bg-accent text-accent-foreground border-accent' };
            case 'rejected':
                return { icon: <XCircle className="text-destructive" />, text: 'Rejected', className: 'bg-destructive text-destructive-foreground border-destructive' };
            case 'pending':
                 return { icon: <Hourglass className="text-yellow-500" />, text: "Pending", className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' };
            default:
                return { icon: <Clock className="text-muted-foreground" />, text: "Unknown", className: '' };
        }
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
                        <CardTitle className="font-headline">Request History & Status</CardTitle>
                        <CardDescription>Check the status of your recent requests below. Updates from the admin will appear here in real-time.</CardDescription>
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
                                {bookings.map((booking, index) => {
                                    const statusInfo = getStatusInfo(booking.status);
                                    const isBooking = booking.type === 'booking';
                                    const title = isBooking 
                                        ? `${booking.stationName} - Slot ${booking.slotId?.split('-')[1]}`
                                        : `Emergency Request`;

                                    return (
                                        <React.Fragment key={booking.id}>
                                            <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="hidden sm:block">
                                                        {statusInfo.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{title}</p>
                                                        <p className="text-sm text-muted-foreground">{formatDate(booking.timestamp)}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline"
                                                    className={cn('w-full sm:w-auto justify-center', statusInfo.className)}>
                                                    {statusInfo.text}
                                                </Badge>
                                            </li>
                                            {index < bookings.length - 1 && <Separator />}
                                        </React.Fragment>
                                    )
                                })}
                            </ul>
                        ) : (
                           !areBookingsLoading && 
                           <div className="text-center py-8">
                                <p className="text-muted-foreground">You have no request history.</p>
                                <Button variant="link" asChild><Link href="/dashboard">Book a slot to get started.</Link></Button>
                           </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
