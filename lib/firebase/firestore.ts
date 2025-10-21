"use client";

import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./client";
import type { Alert, Booking, Bus, Route, UserProfile, UserRole, PaymentRecord, OwnerEarning, Tour, TourProgress, DriverNotification } from "@/types/firestore";

export async function fetchRoutes() {
  const snapshot = await getDocs(collection(db, "routes"));
  const routes: Route[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    routes.push({
      id: docSnap.id,
      start: data.start,
      end: data.end,
      fare: Number(data.fare ?? 0),
      stops: data.stops ?? [],
      busId: data.busId,
    });
  });
  return routes;
}

export async function fetchRouteById(routeId: string) {
  const routeRef = doc(db, "routes", routeId);
  const routeSnap = await getDoc(routeRef);
  if (!routeSnap.exists()) return null;
  const data = routeSnap.data();
  return {
    id: routeSnap.id,
    start: data.start,
    end: data.end,
    fare: Number(data.fare ?? 0),
    stops: data.stops ?? [],
    busId: data.busId,
  } as Route;
}

export async function fetchBusById(busId: string) {
  const busRef = doc(db, "buses", busId);
  const busSnap = await getDoc(busRef);
  if (!busSnap.exists()) return null;
  const data = busSnap.data();
  return {
    id: busSnap.id,
    routeId: data.routeId,
    route: data.route,
    driverId: data.driverId,
    ownerId: data.ownerId,
    seats: Number(data.seats ?? 0),
    licenseInfo: data.licenseInfo,
    imageUrl: data.imageUrl,
  } as Bus;
}

export async function fetchBusForRoute(routeId?: string) {
  if (!routeId) return null;
  const busesQuery = query(collection(db, "buses"), where("routeId", "==", routeId), limit(1));
  const snapshot = await getDocs(busesQuery);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    routeId: data.routeId,
    route: data.route,
    driverId: data.driverId,
    ownerId: data.ownerId,
    seats: Number(data.seats ?? 0),
    licenseInfo: data.licenseInfo,
    imageUrl: data.imageUrl,
  } as Bus;
}

export async function fetchBusByDriver(driverId: string) {
  const busesQuery = query(collection(db, "buses"), where("driverId", "==", driverId), limit(1));
  const snapshot = await getDocs(busesQuery);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    routeId: data.routeId,
    route: data.route,
    driverId: data.driverId,
    ownerId: data.ownerId,
    seats: Number(data.seats ?? 0),
    licenseInfo: data.licenseInfo,
    imageUrl: data.imageUrl,
  } as Bus;
}

export async function fetchBusesByOwner(ownerId: string) {
  const busesQuery = query(collection(db, "buses"), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(busesQuery);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      routeId: data.routeId,
      route: data.route,
      driverId: data.driverId,
      ownerId: data.ownerId,
      seats: Number(data.seats ?? 0),
      licenseInfo: data.licenseInfo,
      imageUrl: data.imageUrl,
    } as Bus;
  });
}

export async function fetchUserProfile(userId: string) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    role: data.role,
    displayName: data.displayName,
    email: data.email,
    phone: data.phone,
    photoURL: data.photoURL,
  } as UserProfile;
}

export async function updateUserProfile(userId: string, payload: Partial<UserProfile>) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function createOrUpdateRoute(routeId: string | null, payload: Partial<Route>) {
  if (routeId) {
    const routeRef = doc(db, "routes", routeId);
    await updateDoc(routeRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return routeId;
  }

  const docRef = await addDoc(collection(db, "routes"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createOrUpdateBus(busId: string | null, payload: Partial<Bus>) {
  if (busId) {
    const busRef = doc(db, "buses", busId);
    await updateDoc(busRef, {
      ...payload,
      updatedAt: serverTimestamp(),
    });
    return busId;
  }

  const docRef = await addDoc(collection(db, "buses"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteRoute(routeId: string) {
  await deleteDoc(doc(db, "routes", routeId));
}

export async function deleteBus(busId: string) {
  await deleteDoc(doc(db, "buses", busId));
}

export async function createBooking({
  userId,
  busId,
  seats,
  date,
  fare,
}: {
  userId: string;
  busId: string;
  seats: number[];
  date: string;
  fare: number;
}) {
  const bookingRef = await addDoc(collection(db, "bookings"), {
    userId,
    busId,
    seats,
    date,
    fare,
    status: "confirmed",
    createdAt: serverTimestamp(),
  });
  return bookingRef.id;
}

export async function recordPayment(payload: {
  bookingId: string;
  userId: string;
  busId: string;
  routeId?: string;
  amount: number;
  currency?: "LKR";
  method: "card" | "wallet" | "cash";
  status: "succeeded" | "failed";
  last4?: string;
}) {
  const docRef = await addDoc(collection(db, "payments"), {
    ...payload,
    currency: payload.currency ?? "LKR",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function recordOwnerEarning(payload: {
  ownerId: string;
  busId: string;
  bookingId: string;
  route?: string;
  travelDate?: string;
  seatCount: number;
  grossFare: number;
  percentage: number;
  amount: number;
}) {
  const docRef = await addDoc(collection(db, "ownerEarnings"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function cancelBooking(bookingId: string) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

export async function fetchBookingsForUser(userId: string) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(bookingsQuery);
  const bookings: Booking[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    bookings.push({
      id: docSnap.id,
      userId: data.userId,
      busId: data.busId,
      seats: data.seats ?? [],
      date: data.date,
      fare: Number(data.fare ?? 0),
      status: data.status ?? "confirmed",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    });
  });
  return bookings;
}

export function listenToAlerts(callback: (alerts: Alert[]) => void) {
  return onSnapshot(
    query(collection(db, "alerts"), orderBy("timestamp", "desc")),
    (snapshot) => {
      const alerts: Alert[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        alerts.push({
          id: docSnap.id,
          fromDriverId: data.fromDriverId,
          message: data.message,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
          resolved: data.resolved,
        });
      });
      callback(alerts);
    }
  );
}

export async function createAlert(driverId: string, message: string) {
  await addDoc(collection(db, "alerts"), {
    fromDriverId: driverId,
    message,
    timestamp: serverTimestamp(),
  });
}

export async function fetchBookingsForBus(busId: string) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("busId", "==", busId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(bookingsQuery);
  const bookings: Booking[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    bookings.push({
      id: docSnap.id,
      userId: data.userId,
      busId: data.busId,
      seats: data.seats ?? [],
      date: data.date,
      fare: Number(data.fare ?? 0),
      status: data.status ?? "confirmed",
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
    });
  });
  return bookings;
}

export async function fetchEarningsForOwner(ownerId: string) {
  const q = query(collection(db, "ownerEarnings"), where("ownerId", "==", ownerId));
  const snapshot = await getDocs(q);
  const items: OwnerEarning[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as any;
    items.push({
      id: docSnap.id,
      ownerId: data.ownerId,
      busId: data.busId,
      bookingId: data.bookingId,
      route: data.route,
      travelDate: data.travelDate,
      seatCount: Number(data.seatCount ?? 0),
      grossFare: Number(data.grossFare ?? 0),
      percentage: Number(data.percentage ?? 10),
      amount: Number(data.amount ?? 0),
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    });
  });
  // sort in memory by createdAt desc to avoid composite index during demo
  return items.sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
}

export async function recordFeedback(payload: {
  userId?: string;
  email: string;
  category: "complaint" | "feedback" | "support";
  message: string;
}) {
  await addDoc(collection(db, "feedback"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function fetchUsersByRole(role: UserRole) {
  const usersQuery = query(collection(db, "users"), where("role", "==", role));
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      role: data.role,
      displayName: data.displayName,
      email: data.email,
      phone: data.phone,
      photoURL: data.photoURL,
    } as UserProfile;
  });
}

export async function fetchAllBuses() {
  const snapshot = await getDocs(collection(db, "buses"));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      routeId: data.routeId,
      route: data.route,
      driverId: data.driverId,
      ownerId: data.ownerId,
      seats: Number(data.seats ?? 0),
      licenseInfo: data.licenseInfo,
      imageUrl: data.imageUrl,
    } as Bus;
  });
}

export async function updateUserRole(userId: string, role: UserRole) {
  await updateDoc(doc(db, "users", userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}

// Tour Management Functions
export async function createTour(payload: {
  routeId: string;
  busId: string;
  driverId: string;
  startDateTime: Date;
  endDateTime: Date;
  isWeekly: boolean;
}) {
  const docRef = await addDoc(collection(db, "tours"), {
    ...payload,
    status: "scheduled",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchTours() {
  const snapshot = await getDocs(collection(db, "tours"));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      routeId: data.routeId,
      busId: data.busId,
      driverId: data.driverId,
      startDateTime: data.startDateTime instanceof Timestamp ? data.startDateTime.toDate() : new Date(data.startDateTime),
      endDateTime: data.endDateTime instanceof Timestamp ? data.endDateTime.toDate() : new Date(data.endDateTime),
      isWeekly: data.isWeekly ?? false,
      status: data.status ?? "scheduled",
      currentStopIndex: data.currentStopIndex,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
    };
  });
}

export async function fetchToursByDriver(driverId: string) {
  const toursQuery = query(collection(db, "tours"), where("driverId", "==", driverId));
  const snapshot = await getDocs(toursQuery);
  const tours = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      routeId: data.routeId,
      busId: data.busId,
      driverId: data.driverId,
      startDateTime: data.startDateTime instanceof Timestamp ? data.startDateTime.toDate() : new Date(data.startDateTime),
      endDateTime: data.endDateTime instanceof Timestamp ? data.endDateTime.toDate() : new Date(data.endDateTime),
      isWeekly: data.isWeekly ?? false,
      status: data.status ?? "scheduled",
      currentStopIndex: data.currentStopIndex,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
    };
  });
  
  // Sort in memory by startDateTime descending
  return tours.sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());
}

export async function updateTour(tourId: string, payload: Partial<any>) {
  await updateDoc(doc(db, "tours", tourId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTour(tourId: string) {
  await deleteDoc(doc(db, "tours", tourId));
}

export async function startTour(tourId: string) {
  await updateDoc(doc(db, "tours", tourId), {
    status: "started",
    updatedAt: serverTimestamp(),
  });
}

export async function updateTourProgress(tourId: string, stopIndex: number, stopName: string) {
  // Update tour current stop
  await updateDoc(doc(db, "tours", tourId), {
    currentStopIndex: stopIndex,
    status: "in-progress",
    updatedAt: serverTimestamp(),
  });

  // Record progress
  await addDoc(collection(db, "tourProgress"), {
    tourId,
    stopIndex,
    stopName,
    arrivedAt: serverTimestamp(),
  });
}

export async function completeTour(tourId: string) {
  await updateDoc(doc(db, "tours", tourId), {
    status: "completed",
    updatedAt: serverTimestamp(),
  });
}

export async function fetchTourProgress(tourId: string) {
  const progressQuery = query(
    collection(db, "tourProgress"), 
    where("tourId", "==", tourId)
  );
  const snapshot = await getDocs(progressQuery);
  const progress = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      tourId: data.tourId,
      stopIndex: data.stopIndex,
      stopName: data.stopName,
      arrivedAt: data.arrivedAt instanceof Timestamp ? data.arrivedAt.toDate() : new Date(),
      latitude: data.latitude,
      longitude: data.longitude,
    };
  });
  
  // Sort in memory by arrivedAt ascending
  return progress.sort((a, b) => a.arrivedAt.getTime() - b.arrivedAt.getTime());
}

// Driver Notifications
export async function createDriverNotification(payload: {
  driverId: string;
  tourId: string;
  type: "tour_starting_soon" | "tour_assigned" | "tour_updated";
  title: string;
  message: string;
}) {
  await addDoc(collection(db, "driverNotifications"), {
    ...payload,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export async function fetchDriverNotifications(driverId: string) {
  const notificationsQuery = query(
    collection(db, "driverNotifications"),
    where("driverId", "==", driverId)
  );
  const snapshot = await getDocs(notificationsQuery);
  const notifications = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      driverId: data.driverId,
      tourId: data.tourId,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: data.isRead ?? false,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
  
  // Sort in memory by createdAt descending
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationAsRead(notificationId: string) {
  await updateDoc(doc(db, "driverNotifications", notificationId), {
    isRead: true,
  });
}
