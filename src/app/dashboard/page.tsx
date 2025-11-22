import { AppLayout } from "@/components/layout/app-layout";
import { MapView } from "@/components/dashboard/map-view";
import { stations } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { List, Map } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-headline font-bold">Station Locator</h1>
        <Tabs defaultValue="map" className="w-full">
          <div className="flex justify-end">
            <TabsList>
              <TabsTrigger value="map"><Map className="mr-2 size-4"/> Map View</TabsTrigger>
              <TabsTrigger value="list"><List className="mr-2 size-4"/> List View</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="map">
            <Card>
              <CardContent className="p-0">
                <MapView stations={stations} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list">
             <Card>
              <CardHeader>
                <CardTitle>Nearby Stations</CardTitle>
                <CardDescription>All available charging stations in your area.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stations.map(station => {
                      const availableSlots = station.slots.filter(s => s.status === 'available').length;
                      return (
                          <Card key={station.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">{station.name}</CardTitle>
                              <CardDescription>{station.address}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                              <Badge variant={availableSlots > 0 ? 'default' : 'destructive'} className="w-fit bg-accent text-accent-foreground">
                                {availableSlots} / {station.slots.length} slots available
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
    </AppLayout>
  );
}
