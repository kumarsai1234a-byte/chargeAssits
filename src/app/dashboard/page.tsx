
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { MapView } from "@/components/dashboard/map-view";
import type { Station } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const firestore = useFirestore();
  const stationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'charging_stations');
  }, [firestore]);
  const { data: stations, isLoading } = useCollection<Station>(stationsQuery);

  const station = stations?.[0]; // We only have one station

  const renderStationCard = (station: Station) => {
    const availableSlots = station.slots?.filter(s => s.status === 'available').length || 0;
    return (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{station.name}</CardTitle>
            <CardDescription>{station.address}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <div>
                <p className="text-sm font-medium">Availability</p>
                <Badge variant={availableSlots > 0 ? 'default' : 'destructive'} className="mt-1 bg-accent text-accent-foreground">
                    {availableSlots} / {station.slots?.length || 0} slots available
                </Badge>
              </div>
            
            <Button asChild className="w-full">
              <Link href={`/station/${station.id}`}>View Details & Book</Link>
            </Button>
          </CardContent>
        </Card>
    )
  }

  const renderSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
            <Skeleton className="h-4 w-1/4 mb-1" />
            <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-headline font-bold">Station Locator</h1>
        <div className="grid lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <MapView stations={stations || []} isLoading={isLoading} />
              </CardContent>
            </Card>
            <div className="space-y-4">
                {isLoading && renderSkeleton()}
                {station && station.id && renderStationCard(station)}
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
