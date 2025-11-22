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

export type User = {
    id: string;
    name: string;
    email: string;
    joinedDate: string;
};

export type EmergencyRequest = {
    id: string;
    userId: string;
    userName: string;
    location: string;
    vehicle: string;
    status: 'pending' | 'approved' | 'denied' | 'completed';
    requestDate: string;
};

export type Payment = {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    date: string;
    status: 'succeeded' | 'failed' | 'pending';
};

export const stations: Station[] = [
  {
    id: "station-1",
    name: "Downtown Supercharge",
    address: "123 Electric Ave, Metropolis, 10001",
    location: { lat: 40.7128, lng: -74.006 },
    image: "station-1",
    slots: [
      { id: "s1-1", status: "available", charger: { type: "DC", connector: "CCS", power: "150kW" } },
      { id: "s1-2", status: "occupied", charger: { type: "DC", connector: "CCS", power: "150kW" } },
      { id: "s1-3", status: "available", charger: { type: "DC", connector: "CHAdeMO", power: "50kW" } },
      { id: "s1-4", status: "unavailable", charger: { type: "AC", connector: "Type 2", power: "22kW" } },
    ],
  },
  {
    id: "station-2",
    name: "Uptown Juice Point",
    address: "456 Bolt St, Metropolis, 10025",
    location: { lat: 40.792, lng: -73.9694 },
    image: "station-2",
    slots: [
      { id: "s2-1", status: "available", charger: { type: "AC", connector: "Type 2", power: "22kW" } },
      { id: "s2-2", status: "available", charger: { type: "AC", connector: "Type 2", power: "22kW" } },
    ],
  },
  {
    id: "station-3",
    name: "Midtown Power Hub",
    address: "789 Ampere Rd, Metropolis, 10018",
    location: { lat: 40.7549, lng: -73.984 },
    image: "station-3",
    slots: [
      { id: "s3-1", status: "occupied", charger: { type: "DC", connector: "CCS", power: "350kW" } },
      { id: "s3-2", status: "occupied", charger: { type: "DC", connector: "CCS", power: "350kW" } },
      { id: "s3-3", status: "occupied", charger: { type: "DC", connector: "CCS", power: "350kW" } },
      { id: "s3-4", status: "occupied", charger: { type: "DC", connector: "CCS", power: "350kW" } },
    ],
  },
  {
    id: "station-4",
    name: "Westside Energy Stop",
    address: "101 Volt Ln, Metropolis, 10023",
    location: { lat: 40.7761, lng: -73.9824 },
    image: "station-4",
    slots: [
      { id: "s4-1", status: "available", charger: { type: "AC", connector: "Type 2", power: "11kW" } },
      { id: "s4-2", status: "available", charger: { type: "DC", connector: "CHAdeMO", power: "50kW" } },
    ],
  },
];

export const users: User[] = [
    { id: "user-1", name: "Alice Johnson", email: "alice@example.com", joinedDate: "2023-01-15" },
    { id: "user-2", name: "Bob Williams", email: "bob@example.com", joinedDate: "2023-02-20" },
    { id: "user-3", name: "Charlie Brown", email: "charlie@example.com", joinedDate: "2023-03-10" },
    { id: "user-4", name: "Diana Miller", email: "diana@example.com", joinedDate: "2023-04-05" },
];

export const emergencyRequests: EmergencyRequest[] = [
    { id: "er-1", userId: "user-2", userName: "Bob Williams", location: "Near Central Park", vehicle: "Tesla Model 3", status: 'pending', requestDate: "2024-07-20" },
    { id: "er-2", userId: "user-4", userName: "Diana Miller", location: "Brooklyn Bridge", vehicle: "Nissan Leaf", status: 'approved', requestDate: "2024-07-19" },
    { id: "er-3", userId: "user-1", userName: "Alice Johnson", location: "Times Square", vehicle: "Ford Mustang Mach-E", status: 'completed', requestDate: "2024-07-18" },
];

export const payments: Payment[] = [
    { id: "pay-1", userId: "user-1", userName: "Alice Johnson", amount: 25.50, date: "2024-07-19", status: 'succeeded' },
    { id: "pay-2", userId: "user-2", userName: "Bob Williams", amount: 15.75, date: "2024-07-18", status: 'succeeded' },
    { id: "pay-3", userId: "user-3", userName: "Charlie Brown", amount: 32.00, date: "2024-07-17", status: 'failed' },
    { id: "pay-4", userId: "user-4", userName: "Diana Miller", amount: 18.20, date: "2024-07-16", status: 'succeeded' },
];
