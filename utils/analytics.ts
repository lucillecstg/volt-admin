import { adminDb } from '../config/firebase-admin';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function getReservationsData() {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      start: startOfDay(date),
      end: endOfDay(date),
    };
  });

  const reservationsData = await Promise.all(
    last7Days.map(async ({ start, end }) => {
      const snapshot = await adminDb
        .collection('reservations')
        .where('createdAt', '>=', start)
        .where('createdAt', '<=', end)
        .count()
        .get();

      return {
        date: start.toISOString(),
        count: snapshot.data().count,
      };
    })
  );

  return reservationsData.reverse();
}

export async function getPopularActivities() {
  const snapshot = await adminDb
    .collection('activities')
    .orderBy('reservationCount', 'desc')
    .limit(5)
    .get();

  return snapshot.docs.map(doc => ({
    name: doc.data().title,
    count: doc.data().reservationCount || 0,
  }));
}

export async function getUserGrowthData() {
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    };
  });

  const userGrowthData = await Promise.all(
    last6Months.map(async ({ start, end }) => {
      const snapshot = await adminDb
        .collection('users')
        .where('createdAt', '>=', start)
        .where('createdAt', '<=', end)
        .count()
        .get();

      return {
        date: start.toISOString(),
        count: snapshot.data().count,
      };
    })
  );

  return userGrowthData.reverse();
}

export async function getRecentActivity() {
  const snapshot = await adminDb
    .collection('reservations')
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  const activities = await Promise.all(
    snapshot.docs.map(async doc => {
      const [user, activity] = await Promise.all([
        adminDb.collection('users').doc(doc.data().userId).get(),
        adminDb.collection('activities').doc(doc.data().activityId).get(),
      ]);

      return {
        id: doc.id,
        user: user.data()?.name || 'Unknown User',
        activity: activity.data()?.title || 'Unknown Activity',
        date: doc.data().createdAt.toDate(),
      };
    })
  );

  return activities;
}
