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

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userId: string;
  busId: string;
  routeId?: string;
  amount: number; // gross amount in LKR
  currency: "LKR";
  method: "card" | "wallet" | "cash";
  status: "succeeded" | "failed";
  last4?: string;
  createdAt: Date;
}

export interface OwnerEarning {
  id: string;
  ownerId: string;
  busId: string;
  bookingId: string;
  route?: string;
  travelDate?: string;
  seatCount: number;
  grossFare: number; // full fare paid by passenger
  percentage: number; // e.g., 10
  amount: number; // earnings to owner
  createdAt: Date;
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

export interface Tour {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  startDateTime: Date;
  endDateTime: Date;
  isWeekly: boolean;
  status: "scheduled" | "started" | "in-progress" | "completed" | "cancelled";
  currentStopIndex?: number; // Index of current stop in route.stops array
  createdAt: Date;
  updatedAt?: Date;
}

export interface TourProgress {
  id: string;
  tourId: string;
  stopIndex: number;
  stopName: string;
  arrivedAt: Date;
  latitude?: number;
  longitude?: number;
}

export interface DriverNotification {
  id: string;
  driverId: string;
  tourId: string;
  type: "tour_starting_soon" | "tour_assigned" | "tour_updated";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}
