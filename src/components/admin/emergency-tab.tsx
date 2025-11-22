
'use client';

import { Booking, EmergencyRequest, FriendsBooking, Station, UserProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Phone, Car, Clock, Pin, User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useAdmin } from "@/firebase";
import { collection, doc, query, where, orderBy, getDoc, runTransaction, writeBatch } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { format } from 'date-fns';
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import React from "react";

type CombinedBooking = (FriendsBooking & { bookingSource: 'friends' }) | (Booking & { bookingSource: 'users' });

export function EmergencyTab() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin, isCheckingAdmin } = useAdmin();
  
  const emergencyRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'emergency_charging_requests'), orderBy('requestTime', 'desc'));
  }, [firestore, isAdmin]);

  const friendsBookingsQuery = useMemoFirebase(() => {
    if(!firestore || !isAdmin) return null;
    return query(collection(firestore, 'friendsBookings'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const userBookingsQuery = useMemoFirebase(() => {
      if(!firestore || !isAdmin) return null;
      return query(collection(firestore, 'bookings'), where('status', '==', 'pending'));
  }, [firestore, isAdmin])

  const { data: emergencyRequests, isLoading: emergencyLoading } = useCollection<EmergencyRequest>(emergencyRequestsQuery);
  const { data: friendsBookings, isLoading: friendsLoading } = useCollection<FriendsBooking>(friendsBookingsQuery);
  const { data: userBookings, isLoading: userBookingsLoading } = useCollection<Booking>(userBookingsQuery);

 const combinedBookings: CombinedBooking[] = React.useMemo(() => {
    const friendData = friendsBookings ? friendsBookings.map(b => ({ ...b, bookingSource: 'friends' as const })) : [];
    const userData = userBookings ? userBookings.map(b => ({ ...b, name: b.userName || 'Registered User', phoneNumber: 'N/A', duration: 'N/A', type: 'standard' as const, bookingSource: 'users' as const })) : [];
    
    const allBookings = [...friendData, ...userData];

    return allBookings.sort((a, b) => {
        const timeA = (a as FriendsBooking).createdAt || (a as Booking).bookingTime;
        const timeB = (b as FriendsBooking).createdAt || (b as Booking).bookingTime;
        if (!timeA || !timeB) return 0;
        
        const dateA = timeA.toDate ? timeA.toDate() : new Date(timeA);
        const dateB = timeB.toDate ? timeB.toDate() : new Date(timeB);

        return dateB.getTime() - dateA.getTime();
    });
 }, [friendsBookings, userBookings]);

  const handleStatusUpdate = async (booking: CombinedBooking, newStatus: 'approved' | 'denied') => {
    if (!firestore) return;
    
    const isUserBooking = booking.bookingSource === 'users';
    const baseCollection = isUserBooking ? 'bookings' : 'friendsBookings';
    const adminBookingRef = doc(firestore, baseCollection, booking.id);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const bookingDoc = await transaction.get(adminBookingRef);
            if (!bookingDoc.exists()) throw "Booking document does not exist!";
            
            const currentBookingData = bookingDoc.data();
            if (currentBookingData.status !== 'pending') throw "This booking has already been processed.";

            if (newStatus === 'approved' && currentBookingData.type !== 'emergency') {
                const stationId = currentBookingData.stationId || currentBookingData.chargingStationId;
                const slotId = currentBookingData.slotId;
                const stationRef = doc(firestore, 'charging_stations', stationId);

                const stationDoc = await transaction.get(stationRef);
                if (!stationDoc.exists()) throw "Station document does not exist!";

                const stationData = stationDoc.data() as Station;
                const slotIndex = stationData.slots.findIndex(s => s.id === slotId);

                if (slotIndex === -1) throw `Slot ${slotId} not found in station.`;
                if (stationData.slots[slotIndex].status !== 'available') {
                    throw `Slot ${stationData.slots[slotIndex].id.split('-')[1]} is no longer available.`;
                }
                const updatedSlots = [...stationData.slots];
                updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], status: 'occupied' };
                transaction.update(stationRef, { slots: updatedSlots });
            }
            
            // Update admin-facing booking
            transaction.update(adminBookingRef, { status: newStatus });
            
            // If it's a user booking, also update their private record
            if (isUserBooking) {
                const userBookingRef = doc(firestore, 'users', (booking as Booking).userId, 'bookings', booking.id);
                transaction.update(userBookingRef, { status: newStatus });
            }
        });

        const userNotification = booking.bookingSource === 'friends'
            ? `Please notify ${booking.name} at ${booking.phoneNumber}.`
            : `User will see the status update in their profile.`;

        toast({ 
            title: `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
            description: `The request has been updated. ${userNotification}`,
            variant: 'default',
            className: newStatus === 'approved' ? 'bg-accent text-accent-foreground border-accent' : 'border-primary',
            duration: 10000,
        });

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: typeof error === 'string' ? error : "Could not update booking status.",
        });
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM dd, yyyy');
  }

  const isLoading = emergencyLoading || friendsLoading || userBookingsLoading;
  
  if (isCheckingAdmin) {
    return (
        <div className="flex flex-col gap-8">
            <section>
                <h2 className="text-2xl font-headline font-bold mb-4">Pending Booking Requests</h2>
                <div className="rounded-md border p-4 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </section>
            <Separator />
            <section>
                <h2 className="text-2xl font-headline font-bold mb-4">User Emergency Requests</h2>
                <div className="rounded-md border p-4 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </section>
        </div>
    )
  }
  
   if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Denied</CardTitle>
          <CardDescription>You do not have permission to view this page.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Pending Booking Requests</h2>
         <div className="hidden md:block rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoading && [...Array(2)].map((_, i) => (
                       <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                   ))}
                   {combinedBookings.map(booking => (
                       <TableRow key={booking.id}>
                           <TableCell className="font-medium">
                               <div className="flex items-center gap-2">
                                {booking.bookingSource === 'users' ? <User className="size-4 text-muted-foreground" /> : <Phone className="size-4 text-muted-foreground" />}
                                <span>{booking.name}</span>
                               </div>
                            </TableCell>
                           <TableCell>
                               <div className="flex flex-col gap-1 text-sm">
                                   {booking.bookingSource === 'friends' && <span className="flex items-center gap-2"><Phone /> {booking.phoneNumber}</span>}
                                   <span className="flex items-center gap-2"><Car /> {booking.vehicleNumber}</span>
                                   {booking.bookingSource === 'friends' && <span className="flex items-center gap-2"><Clock /> {booking.duration} mins</span>}
                                   {booking.type === 'emergency' && <span className="flex items-center gap-2"><Pin /> {booking.location}</span>}
                               </div>
                           </TableCell>
                           <TableCell><Badge variant={booking.type === 'emergency' ? 'destructive': 'secondary'}>{booking.type}</Badge></TableCell>
                           <TableCell>{formatDate((booking as FriendsBooking).createdAt || (booking as Booking).bookingTime)}</TableCell>
                           <TableCell className="text-center"><Badge variant="outline" className="text-yellow-400 border-yellow-400">{booking.status}</Badge></TableCell>
                           <TableCell className="text-center">
                               {booking.status === 'pending' && (
                                   <div className="flex gap-2 justify-center">
                                       <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate(booking, 'approved')}><Check className="h-4 w-4" /></Button>
                                       <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(booking, 'denied')}><X className="h-4 w-4" /></Button>
                                   </div>
                               )}
                           </TableCell>
                       </TableRow>
                   ))}
                </TableBody>
            </Table>
         </div>
         <div className="grid gap-4 md:hidden">
            {isLoading && [...Array(2)].map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>))}
            {combinedBookings.map(booking => (
                <Card key={booking.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                {booking.bookingSource === 'users' ? <User className="size-5 text-muted-foreground" /> : <Phone className="size-5 text-muted-foreground" />}
                                <span>{booking.name}</span>
                               </div>
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400">{booking.status}</Badge>
                        </CardTitle>
                        <CardDescription>{formatDate((booking as FriendsBooking).createdAt || (booking as Booking).bookingTime)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 text-sm">
                            <Badge variant={booking.type === 'emergency' ? 'destructive': 'secondary'} className="w-fit">{booking.type}</Badge>
                            {booking.bookingSource === 'friends' && <span className="flex items-center gap-2"><Phone /> {booking.phoneNumber}</span>}
                            <span className="flex items-center gap-2"><Car /> {booking.vehicleNumber}</span>
                            {booking.bookingSource === 'friends' && <span className="flex items-center gap-2"><Clock /> {booking.duration} mins</span>}
                            {booking.type === 'emergency' && <span className="flex items-center gap-2"><Pin /> {booking.location}</span>}
                        </div>
                        {booking.status === 'pending' && (
                             <div className="flex gap-2 justify-end">
                                <Button variant="outline" className="text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate(booking, 'approved')}><Check className="mr-2 h-4 w-4" />Approve</Button>
                                <Button variant="outline" className="text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(booking, 'denied')}><X className="mr-2 h-4 w-4" />Deny</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
         </div>
         { !isLoading && combinedBookings.length === 0 && <p className="text-center text-muted-foreground py-4">No pending requests.</p>}
      </section>

      <Separator />
      
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">User Emergency Requests</h2>
        {/* Desktop View */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emergencyLoading && [...Array(2)].map((_, i) => (
                  <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                      <TableCell className="text-center"><div className="flex gap-2 justify-center"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                  </TableRow>
              ))}
              {emergencyRequests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.userName}</TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>{request.vehicleType}</TableCell>
                  <TableCell>{formatDate(request.requestTime)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn({ "text-yellow-400 border-yellow-400": request.status === 'pending', "text-accent border-accent": request.status === 'approved', "text-red-400 border-red-400": request.status === 'denied', })}>{request.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {request.status === 'pending' ? (
                      <div className="flex gap-2 justify-center">
                        <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => updateDocumentNonBlocking(doc(firestore, 'emergency_charging_requests', request.id), { status: 'approved' })}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => updateDocumentNonBlocking(doc(firestore, 'emergency_charging_requests', request.id), { status: 'denied' })}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (<span>-</span>)}
                  </TableCell>
                </TableRow>
              ))}
                {!emergencyLoading && emergencyRequests?.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-4">No emergency requests.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
          {emergencyLoading && [...Array(2)].map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>))}
          {emergencyRequests?.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>{request.userName}</CardTitle>
                <p className="text-sm text-muted-foreground">{request.vehicleType} - {formatDate(request.requestTime)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-muted-foreground">{request.location}</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn({ "text-yellow-400 border-yellow-400": request.status === 'pending', "text-accent border-accent": request.status === 'approved', "text-red-400 border-red-400": request.status === 'denied', })}>{request.status}</Badge>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => updateDocumentNonBlocking(doc(firestore, 'emergency_charging_requests', request.id), { status: 'approved' })}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => updateDocumentNonBlocking(doc(firestore, 'emergency_charging_requests', request.id), { status: 'denied' })}><X className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
           {!emergencyLoading && emergencyRequests?.length === 0 && <p className="text-center text-muted-foreground py-4">No emergency requests.</p>}
        </div>
      </section>
    </div>
  );
}
