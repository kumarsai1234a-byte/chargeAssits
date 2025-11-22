
'use client';

import { EmergencyRequest, FriendsBooking } from "@/lib/data";
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
import { Check, X, Phone, Car, Clock, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, where, orderBy } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { format } from 'date-fns';
import { Separator } from "../ui/separator";

export function EmergencyTab() {
  const firestore = useFirestore();
  
  const emergencyRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'emergency_charging_requests'), orderBy('requestTime', 'desc'));
  }, [firestore]);

  const friendsBookingsQuery = useMemoFirebase(() => {
    if(!firestore) return null;
    return query(collection(firestore, 'friendsBookings'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: emergencyRequests, isLoading: emergencyLoading } = useCollection<EmergencyRequest>(emergencyRequestsQuery);
  const { data: friendsBookings, isLoading: friendsLoading } = useCollection<FriendsBooking>(friendsBookingsQuery);

  const handleStatusUpdate = (collectionName: string, id: string, status: 'approved' | 'denied') => {
    if (!firestore) return;
    const requestRef = doc(firestore, collectionName, id);
    updateDocumentNonBlocking(requestRef, { status });
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM dd, yyyy');
  }

  const isLoading = emergencyLoading || friendsLoading;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Friends Bookings</h2>
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
                   {friendsLoading && [...Array(2)].map((_, i) => (
                       <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                   ))}
                   {friendsBookings?.map(booking => (
                       <TableRow key={booking.id}>
                           <TableCell className="font-medium">{booking.name}</TableCell>
                           <TableCell>
                               <div className="flex flex-col gap-1 text-sm">
                                   <span className="flex items-center gap-2"><Phone /> {booking.phoneNumber}</span>
                                   <span className="flex items-center gap-2"><Car /> {booking.vehicleNumber}</span>
                                   <span className="flex items-center gap-2"><Clock /> {booking.duration} mins</span>
                                   {booking.type === 'emergency' && <span className="flex items-center gap-2"><Pin /> {booking.location}</span>}
                               </div>
                           </TableCell>
                           <TableCell><Badge variant={booking.type === 'emergency' ? 'destructive': 'secondary'}>{booking.type}</Badge></TableCell>
                           <TableCell>{formatDate(booking.createdAt)}</TableCell>
                           <TableCell className="text-center"><Badge variant="outline" className={cn({ "text-yellow-400 border-yellow-400": booking.status === 'pending', "text-accent border-accent": booking.status === 'approved', "text-red-400 border-red-400": booking.status === 'denied' })}>{booking.status}</Badge></TableCell>
                           <TableCell className="text-center">
                               {booking.status === 'pending' && (
                                   <div className="flex gap-2 justify-center">
                                       <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate('friendsBookings', booking.id, 'approved')}><Check className="h-4 w-4" /></Button>
                                       <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate('friendsBookings', booking.id, 'denied')}><X className="h-4 w-4" /></Button>
                                   </div>
                               )}
                           </TableCell>
                       </TableRow>
                   ))}
                </TableBody>
            </Table>
         </div>
         <div className="grid gap-4 md:hidden">
            {friendsLoading && [...Array(2)].map((_, i) => (<Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>))}
            {friendsBookings?.map(booking => (
                <Card key={booking.id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{booking.name}</span>
                            <Badge variant="outline" className={cn({ "text-yellow-400 border-yellow-400": booking.status === 'pending', "text-accent border-accent": booking.status === 'approved', "text-red-400 border-red-400": booking.status === 'denied' })}>{booking.status}</Badge>
                        </CardTitle>
                        <CardDescription>{formatDate(booking.createdAt)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2 text-sm">
                            <Badge variant={booking.type === 'emergency' ? 'destructive': 'secondary'} className="w-fit">{booking.type}</Badge>
                            <span className="flex items-center gap-2"><Phone /> {booking.phoneNumber}</span>
                            <span className="flex items-center gap-2"><Car /> {booking.vehicleNumber}</span>
                            <span className="flex items-center gap-2"><Clock /> {booking.duration} mins</span>
                            {booking.type === 'emergency' && <span className="flex items-center gap-2"><Pin /> {booking.location}</span>}
                        </div>
                        {booking.status === 'pending' && (
                             <div className="flex gap-2 justify-end">
                                <Button variant="outline" className="text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate('friendsBookings', booking.id, 'approved')}><Check className="mr-2 h-4 w-4" />Approve</Button>
                                <Button variant="outline" className="text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate('friendsBookings', booking.id, 'denied')}><X className="mr-2 h-4 w-4" />Deny</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
         </div>
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
                        <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate('emergency_charging_requests', request.id, 'approved')}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate('emergency_charging_requests', request.id, 'denied')}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (<span>-</span>)}
                  </TableCell>
                </TableRow>
              ))}
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
                      <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate('emergency_charging_requests', request.id, 'approved')}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate('emergency_charging_requests', request.id, 'denied')}><X className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
