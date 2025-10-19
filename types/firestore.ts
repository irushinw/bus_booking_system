export type UserRole = "passenger" | "driver" | "owner" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  email?: string | null;
  displayName?: string | null;
  phone?: string | null;
  photoURL?: string | null;
}

export interface Route {
  id: string;
  start: string;
  end: string;
  fare: number;
  stops: string[];
  busId?: string;
}

export interface Bus {
  id: string;
  routeId?: string;
  route?: string;
  driverId: string;
  ownerId: string;
  seats: number;
  licenseInfo?: string;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  userId: string;
  busId: string;
  seats: number[];
  date: string;
  fare: number;
  status: "confirmed" | "cancelled";
  createdAt?: Date;
}

export interface Alert {
  id: string;
  fromDriverId: string;
  message: string;
  timestamp: Date;
  resolved?: boolean;
}

export interface Feedback {
  id: string;
  userId?: string;
  email: string;
  category: "complaint" | "feedback" | "support";
  message: string;
  createdAt: Date;
}
