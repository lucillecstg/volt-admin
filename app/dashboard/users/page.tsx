import { adminAuth, adminDb } from '../../../config/firebase-admin';

async function getUsers() {
  const usersSnapshot = await adminDb.collection('users').get();
  const users = await Promise.all(
    usersSnapshot.docs.map(async (doc) => {
      const userData = doc.data();
      const authUser = await adminAuth.getUser(doc.id);
      return {
        id: doc.id,
        email: authUser.email,
        displayName: userData.displayName || authUser.displayName,
        createdAt: userData.createdAt?.toDate().toLocaleDateString() || 'N/A',
        lastLogin: authUser.metadata.lastSignInTime
          ? new Date(authUser.metadata.lastSignInTime).toLocaleDateString()
          : 'N/A',
      };
    })
  );
  return users;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Utilisateurs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste de tous les utilisateurs de l'application VOLT.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nom
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Date d'inscription
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Dernière connexion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {user.displayName || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.createdAt}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
