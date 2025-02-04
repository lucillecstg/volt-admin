import { adminDb } from '../../../config/firebase-admin';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

async function getDetailedAnalytics() {
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 6);

  // Récupérer les statistiques mensuelles
  const monthlyStats = [];
  for (let i = 0; i < 6; i++) {
    const currentMonth = subMonths(now, i);
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);

    const [users, reservations, activities] = await Promise.all([
      adminDb.collection('users')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .count()
        .get(),
      adminDb.collection('reservations')
        .where('reservationDate', '>=', startDate)
        .where('reservationDate', '<=', endDate)
        .count()
        .get(),
      adminDb.collection('activities')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .count()
        .get(),
    ]);

    monthlyStats.push({
      month: format(currentMonth, 'MMMM yyyy', { locale: fr }),
      users: users.data().count,
      reservations: reservations.data().count,
      activities: activities.data().count,
    });
  }

  // Récupérer les statistiques par catégorie d'activité
  const categoriesSnapshot = await adminDb.collection('activities').get();
  const categoriesStats = new Map();

  for (const doc of categoriesSnapshot.docs) {
    const activity = doc.data();
    const category = activity.category || 'Non catégorisé';
    
    if (!categoriesStats.has(category)) {
      categoriesStats.set(category, {
        total: 0,
        reservations: 0,
        averagePrice: 0,
      });
    }

    const stats = categoriesStats.get(category);
    stats.total += 1;
    stats.averagePrice += activity.price || 0;
  }

  // Calculer la moyenne des prix
  for (const [category, stats] of categoriesStats) {
    stats.averagePrice = Math.round(stats.averagePrice / stats.total);
  }

  // Récupérer les statistiques de réservation par catégorie
  const reservationsSnapshot = await adminDb.collection('reservations').get();
  for (const doc of reservationsSnapshot.docs) {
    const reservation = doc.data();
    const activity = await adminDb.collection('activities').doc(reservation.activityId).get();
    if (activity.exists) {
      const category = activity.data()?.category || 'Non catégorisé';
      if (categoriesStats.has(category)) {
        categoriesStats.get(category).reservations += 1;
      }
    }
  }

  return {
    monthlyStats: monthlyStats.reverse(),
    categoriesStats: Array.from(categoriesStats.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    })),
  };
}

export default async function AnalyticsPage() {
  const { monthlyStats, categoriesStats } = await getDetailedAnalytics();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Analyses détaillées</h1>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques mensuelles</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mois
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nouveaux utilisateurs
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réservations
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nouvelles activités
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyStats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.reservations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.activities}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques par catégorie</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre d'activités
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réservations
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix moyen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de réservation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoriesStats.map((stat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.reservations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.averagePrice}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round((stat.reservations / stat.total) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
