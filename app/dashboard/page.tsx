import { adminDb } from '../../config/firebase-admin';
import ReservationsChart from '../../components/charts/ReservationsChart';
import PopularActivitiesChart from '../../components/charts/PopularActivitiesChart';
import UserGrowthChart from '../../components/charts/UserGrowthChart';
import { getReservationsData, getPopularActivities, getUserGrowthData, getRecentActivity } from '../../utils/analytics';
import { format } from 'date-fns';

async function getDashboardData() {
  const [usersSnapshot, activitiesSnapshot, reservationsSnapshot] = await Promise.all([
    adminDb.collection('users').count().get(),
    adminDb.collection('activities').count().get(),
    adminDb.collection('reservations').count().get(),
  ]);

  const [reservationsData, popularActivities, userGrowthData, recentActivity] = await Promise.all([
    getReservationsData(),
    getPopularActivities(),
    getUserGrowthData(),
    getRecentActivity(),
  ]);

  return {
    stats: {
      users: usersSnapshot.data().count,
      activities: activitiesSnapshot.data().count,
      reservations: reservationsSnapshot.data().count,
    },
    reservationsData,
    popularActivities,
    userGrowthData,
    recentActivity,
  };
}

export default async function DashboardPage() {
  const { stats, reservationsData, popularActivities, userGrowthData, recentActivity } = await getDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Utilisateurs</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.users}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Activités</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.activities}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Réservations</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{stats.reservations}</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <ReservationsChart data={reservationsData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <PopularActivitiesChart data={popularActivities} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <UserGrowthChart data={userGrowthData} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Activités récentes</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {activity.activityName}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {activity.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {activity.userName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {format(activity.date, 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
