import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";

export default function ProfilePage() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-headline font-bold">My Profile</h1>
                    <Button variant="outline"><Pencil className="mr-2 size-4" /> Edit Profile</Button>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="w-24 h-24">
                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />}
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold">Alex Rider</h2>
                                <p className="text-muted-foreground">user@example.com</p>
                                <p className="text-sm text-muted-foreground">Joined on January 15, 2023</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Booking History</CardTitle>
                        <CardDescription>Your recent charging sessions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Downtown Supercharge - Slot 2</p>
                                    <p className="text-sm text-muted-foreground">July 20, 2024 - 4:30 PM</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">$15.75</p>
                                    <Badge>Completed</Badge>
                                </div>
                            </li>
                            <Separator />
                            <li className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Uptown Juice Point - Slot 1</p>
                                    <p className="text-sm text-muted-foreground">July 18, 2024 - 10:00 AM</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">$8.50</p>
                                    <Badge>Completed</Badge>
                                </div>
                            </li>
                            <Separator />
                             <li className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Westside Energy Stop - Slot 2</p>
                                    <p className="text-sm text-muted-foreground">July 15, 2024 - 7:00 PM</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">$12.25</p>
                                    <Badge>Completed</Badge>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
