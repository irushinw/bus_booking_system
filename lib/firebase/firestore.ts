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
import type { Alert, Booking, Bus, Route, UserProfile, UserRole, PaymentRecord, OwnerEarning } from "@/types/firestore";

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
