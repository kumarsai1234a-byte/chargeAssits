
'use client';

import { EmergencyRequest } from "@/lib/data";
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
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { format } from 'date-fns';

export function EmergencyTab() {
  const firestore = useFirestore();
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'emergency_charging_requests');
  }, [firestore]);
  const { data: emergencyRequests, isLoading } = useCollection<EmergencyRequest>(requestsQuery);

  const handleStatusUpdate = (id: string, status: 'approved' | 'denied') => {
    if (!firestore) return;
    const requestRef = doc(firestore, 'emergency_charging_requests', id);
    updateDocumentNonBlocking(requestRef, { status });
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMMM dd, yyyy');
  }

  return (
    <>
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
            {isLoading && [...Array(3)].map((_, i) => (
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
                  <Badge
                    variant="outline"
                    className={cn({
                      "text-yellow-400 border-yellow-400": request.status === 'pending',
                      "text-accent border-accent": request.status === 'approved',
                      "text-red-400 border-red-400": request.status === 'denied',
                    })}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2 justify-center">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate(request.id, 'approved')}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(request.id, 'denied')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {isLoading && [...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-20" />
                        <div className="flex gap-2">
                           <Skeleton className="h-8 w-8" />
                           <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
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
                <Badge
                    variant="outline"
                    className={cn({
                      "text-yellow-400 border-yellow-400": request.status === 'pending',
                      "text-accent border-accent": request.status === 'approved',
                      "text-red-400 border-red-400": request.status === 'denied',
                    })}
                  >
                    {request.status}
                </Badge>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10" onClick={() => handleStatusUpdate(request.id, 'approved')}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusUpdate(request.id, 'denied')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
