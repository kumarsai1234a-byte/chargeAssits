
// This file contains type definitions for our Firestore data structures.

export type Charger = {
  type: "AC" | "DC";
  connector: "Type 2" | "CCS" | "CHAdeMO";
  power: string;
};

export type Slot = {
  id: string;
  status: "available" | "occupied" | "unavailable";
  charger: Charger;
};

export type Station = {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  slots: Slot[];
  image: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  createdAt: any; // Firestore Timestamp
};

export type EmergencyRequest = {
  id: string;
  userId: string;
  userName: string;
  location: string;
  vehicleType: string;
  status: 'pending' | 'approved' | 'denied';
  requestTime: any; // Firestore Timestamp
  description?: string;
};

export type Payment = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'succeeded' | 'failed' | 'pending';
};

export type Booking = {
    id: string;
    userId: string;
    chargingStationId: string;
    stationName: string;
    slotId: string;
    vehicleNumber: string;
    bookingTime: any; // Firestore Timestamp
    status: 'pending' | 'approved' | 'denied' | 'completed' | 'cancelled';
}

export type FriendsBooking = {
    id: string;
    name: string;
    phoneNumber: string;
    vehicleNumber: string;
    duration: string;
    stationId: string;
    slotId: string;
    type: 'standard' | 'emergency';
    status: 'pending' | 'approved' | 'denied';
    createdAt: any; // Firestore Timestamp
    location?: string; // Optional, only for emergency
}


// Mock data is no longer used for most things, but keeping one for the payments tab as an example.
export const payments: Payment[] = [
    { id: "pay-1", userId: "user-1", userName: "Alice Johnson", amount: 25.50, date: "2024-07-19", status: 'succeeded' },
    { id: "pay-2", userId: "user-2", userName: "Bob Williams", amount: 15.75, date: "2024-07-18", status: 'succeeded' },
    { id: "pay-3", userId: "user-3", userName: "Charlie Brown", amount: 32.00, date: "2024-07-17", status: 'failed' },
    { id: "pay-4", userId: "user-4", userName: "Diana Miller", amount: 18.20, date: "2024-07-16", status: 'succeeded' },
];
