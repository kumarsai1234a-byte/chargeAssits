import { AppLayout } from "@/components/layout/app-layout";
import { stations, Station } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingForm } from "@/components/booking-form";
import { Zap, Plug, Power, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StationDetailPage({ params }: { params: { id: string } }) {
  const station = stations.find(s => s.id === params.id);

  if (!station) {
    notFound();
  }

  const stationImage = PlaceHolderImages.find(p => p.id === station.image);
  const availableSlots = station.slots.filter(s => s.status === 'available').length;

  return (
    <AppLayout>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="overflow-hidden">
            {stationImage && (
              <div className="relative w-full h-80">
                <Image
                  src={stationImage.imageUrl}
                  alt={station.name}
                  data-ai-hint={stationImage.imageHint}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-headline text-3xl">{station.name}</CardTitle>
              <CardDescription>{station.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={availableSlots > 0 ? 'default' : 'destructive'} className="bg-accent text-accent-foreground text-base">
                {availableSlots} / {station.slots.length} slots available
              </Badge>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Available Slots</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {station.slots.map(slot => (
                <Card key={slot.id} className={cn("p-4 flex flex-col gap-2", {
                  "bg-muted/30 border-dashed": slot.status === "unavailable",
                  "border-destructive/50": slot.status === "occupied"
                })}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold">Slot {slot.id.split('-')[1]}</h4>
                    <Badge variant={slot.status === 'available' ? 'secondary' : 'destructive'} className={cn({
                      "bg-accent text-accent-foreground": slot.status === 'available',
                      "bg-destructive text-destructive-foreground": slot.status === 'occupied',
                      "bg-muted text-muted-foreground": slot.status === 'unavailable',
                    })}>
                      {slot.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2"><Plug className="size-4" /> {slot.charger.connector}</div>
                    <div className="flex items-center gap-2"><Zap className="size-4" /> {slot.charger.type}</div>
                    <div className="flex items-center gap-2"><Power className="size-4" /> {slot.charger.power}</div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Book a Slot</CardTitle>
              <CardDescription>
                Secure your spot and avoid wait times. Booking is fast and easy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingForm station={station} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
