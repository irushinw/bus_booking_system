import { 
  fetchTours, 
  createDriverNotification,
  fetchRouteById 
} from "@/lib/firebase/firestore";

export class TourNotificationService {
  private static instance: TourNotificationService;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute

  public static getInstance(): TourNotificationService {
    if (!TourNotificationService.instance) {
      TourNotificationService.instance = new TourNotificationService();
    }
    return TourNotificationService.instance;
  }

  public startMonitoring() {
    if (this.intervalId) return; // Already monitoring

    this.intervalId = setInterval(async () => {
      await this.checkUpcomingTours();
    }, this.CHECK_INTERVAL);

    // Check immediately on start
    void this.checkUpcomingTours();
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkUpcomingTours() {
    try {
      const tours = await fetchTours();
      const now = new Date();
      
      for (const tour of tours) {
        if (tour.status !== "scheduled") continue;

        const timeUntilStart = tour.startDateTime.getTime() - now.getTime();
        const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

        // Notify 5 minutes before start
        if (minutesUntilStart === 5) {
          const route = await fetchRouteById(tour.routeId);
          
          await createDriverNotification({
            driverId: tour.driverId,
            tourId: tour.id,
            type: "tour_starting_soon",
            title: "Tour Starting Soon",
            message: `Your tour ${route?.start} → ${route?.end} starts in 5 minutes. Please prepare to begin.`,
          });
        }
      }
    } catch (error) {
      console.error("Error checking upcoming tours:", error);
    }
  }
}

// Auto-start monitoring when imported
if (typeof window !== "undefined") {
  TourNotificationService.getInstance().startMonitoring();
}
