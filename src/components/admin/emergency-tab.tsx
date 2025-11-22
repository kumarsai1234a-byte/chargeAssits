'use client';

import React from "react";
import { BookingRequest, Station } from "@/lib/data";
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
import { Check, X, Phone, Car, Clock, Pin, User, ShieldCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useAdmin } from "@/firebase";
import { collection, doc, query, orderBy, runTransaction } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

export function EmergencyTab() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin, isCheckingAdmin } = useAdmin();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'bookingRequests'), orderBy('timestamp', 'desc'));
  }, [firestore, isAdmin]);

  const { data: requests, isLoading } = useCollection<BookingRequest>(requestsQuery);

  const handleStatusUpdate = async (request: BookingRequest, newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    
    const requestRef = doc(firestore, 'bookingRequests', request.id);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const requestDoc = await transaction.get(requestRef);
            if (!requestDoc.exists()) throw "Request document does not exist!";
            
            const currentRequestData = requestDoc.data();
            if (currentRequestData.status !== 'pending') throw "This request has already been processed.";

            if (newStatus === 'approved' && currentRequestData.type === 'booking') {
                const stationId = currentRequestData.stationId;
                const slotId = currentRequestData.slotId;
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
            
            transaction.update(requestRef, { status: newStatus });
        });

        const statusText = newStatus === 'approved' ? 'Approved' : 'Rejected';
        toast({ 
            title: `Request ${statusText}`,
            description: `The request has been updated. The user will see the status change.`,
            variant: 'default',
            className: newStatus === 'approved' ? 'bg-accent text-accent-foreground border-accent' : 'border-primary',
            duration: 8000,
        });

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: typeof error === 'string' ? error : "Could not update request status.",
        });
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM dd, yyyy - h:mm a');
  }
  
  if (isCheckingAdmin) {
    return <Skeleton className="h-64 w-full" />
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

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const processedRequests = requests?.filter(r => r.status !== 'pending') || [];

  const renderRequestRows = (reqs: BookingRequest[]) => {
    return reqs.map(request => (
         <TableRow key={request.id}>
             <TableCell className="font-medium">
                 <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span>{request.userName}</span>
                 </div>
              </TableCell>
             <TableCell><Badge variant={request.type === 'emergency' ? 'destructive': 'secondary'}>{request.type}</Badge></TableCell>
             <TableCell>
                 <div className="flex flex-col gap-1 text-sm">
                     {request.type === 'booking' && (
                         <>
                             <span>{request.stationName}</span>
                             <span className="text-xs text-muted-foreground">Slot {request.slotId?.split('-')[1]}</span>
                         </>
                     )}
                     {request.type === 'emergency' && (
                         <span className="flex items-center gap-2"><Pin /> {request.location}</span>
                     )}
                     <span className="flex items-center gap-2"><Car /> {request.vehicleNumber || request.vehicleType}</span>
                     {request.message && <span className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="shrink-0" /> <p className="truncate italic">"{request.message}"</p></span>}
                 </div>
             </TableCell>
             <TableCell>{formatDate(request.timestamp)}</TableCell>
             <TableCell className="text-center">
                <Badge variant="outline" className={cn({ "text-yellow-400 border-yellow-400": request.status === 'pending', "text-accent border-accent": request.status === 'approved', "text-destructive border-destructive": request.status === 'rejected', })}>{request.status}</Badge>
             </TableCell>
             <TableCell className="text-center">
                 {request.status === 'pending' && (
                     <div className="flex gap-2 justify-center">
                         <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate(request, 'approved')}><Check className="h-4 w-4" /></Button>
                         <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(request, 'rejected')}><X className="h-4 w-4" /></Button>
                     </div>
                 )}
             </TableCell>
         </TableRow>
     ))
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Pending Requests</h2>
         <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {isLoading && [...Array(2)].map((_, i) => (
                       <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                   ))}
                   {renderRequestRows(pendingRequests)}
                   { !isLoading && pendingRequests.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No pending requests.</TableCell></TableRow>}
                </TableBody>
            </Table>
         </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-bold mb-4">Processed Requests</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && [...Array(3)].map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))}
              {renderRequestRows(processedRequests)}
              {!isLoading && processedRequests.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No processed requests.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
