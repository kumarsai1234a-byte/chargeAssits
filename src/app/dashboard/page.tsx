
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { MapView } from "@/components/dashboard/map-view";
import type { Station } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { List, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-2xl font-headline font-bold">Station Locator</h1>
            <Tabs defaultValue="map" className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="map"><Map className="mr-2 size-4"/> Map View</TabsTrigger>
                <TabsTrigger value="list"><List className="mr-2 size-4"/> List View</TabsTrigger>
              </TabsList>
              <TabsContent value="map" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <MapView stations={stations || []} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="list" className="mt-4">
                 <Card>
                  <CardHeader>
                    <CardTitle>Nearby Stations</CardTitle>
                    <CardDescription>All available charging stations in your area.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                           <Card key={i}>
                             <CardHeader>
                               <Skeleton className="h-6 w-48" />
                               <Skeleton className="h-4 w-full mt-1" />
                             </CardHeader>
                             <CardContent className="grid gap-2">
                               <Skeleton className="h-6 w-24" />
                               <Skeleton className="h-10 w-full mt-2" />
                             </CardContent>
                           </Card>
                        ))}
                      </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {stations?.map(station => {
                          const availableSlots = station.slots?.filter(s => s.status === 'available').length || 0;
                          return (
                              <Card key={station.id}>
                                <CardHeader>
                                  <CardTitle className="text-lg">{station.name}</CardTitle>
                                  <CardDescription>{station.address}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                  <Badge variant={availableSlots > 0 ? 'default' : 'destructive'} className="w-fit bg-accent text-accent-foreground">
                                    {availableSlots} / {station.slots?.length || 0} slots available
                                  </Badge>
                                  <Button asChild className="mt-2">
                                    <Link href={`/station/${station.id}`}>View Details</Link>
                                  </Button>
                                </CardContent>
                              </Card>
                          )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
