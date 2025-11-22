import { emergencyRequests } from "@/lib/data";
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

export function EmergencyTab() {
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
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emergencyRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.userName}</TableCell>
                <TableCell>{request.location}</TableCell>
                <TableCell>{request.vehicle}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn({
                      "text-yellow-400 border-yellow-400": request.status === 'pending',
                      "text-accent border-accent": request.status === 'approved' || request.status === 'completed',
                      "text-red-400 border-red-400": request.status === 'denied',
                    })}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2 justify-center">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10">
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
        {emergencyRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle>{request.userName}</CardTitle>
              <p className="text-sm text-muted-foreground">{request.vehicle}</p>
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
                      "text-accent border-accent": request.status === 'approved' || request.status === 'completed',
                      "text-red-400 border-red-400": request.status === 'denied',
                    })}
                  >
                    {request.status}
                </Badge>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 text-accent hover:text-accent border-accent hover:bg-accent/10">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive border-destructive hover:bg-destructive/10">
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
