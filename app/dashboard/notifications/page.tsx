import { adminDb } from '../../../config/firebase-admin';

async function sendNotification(title: string, body: string, userIds: string[]) {
  // Récupérer les tokens des utilisateurs
  const tokens = await Promise.all(
    userIds.map(async (userId) => {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      return userDoc.data()?.pushToken;
    })
  );

  // Filtrer les tokens null ou undefined
  const validTokens = tokens.filter(Boolean);

  // Envoyer la notification via Firebase Cloud Messaging
  const message = {
    notification: {
      title,
      body,
    },
    tokens: validTokens,
  };

  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de la notification');
    }

    return true;
  } catch (error) {
    console.error('Erreur:', error);
    return false;
  }
}

export default async function NotificationsPage() {
  const usersSnapshot = await adminDb.collection('users').get();
  const users = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Envoyez des notifications push aux utilisateurs de l'application.
          </p>
        </div>
      </div>

      <form className="mt-8 space-y-6" action={async (formData: FormData) => {
        'use server';
        const title = formData.get('title') as string;
        const body = formData.get('body') as string;
        const selectedUsers = formData.getAll('users') as string[];

        await sendNotification(title, body, selectedUsers);
      }}>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="title"
              id="title"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <div className="mt-1">
            <textarea
              id="body"
              name="body"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Destinataires
          </label>
          <div className="mt-1 max-h-60 overflow-y-auto">
            {users.map((user: any) => (
              <div key={user.id} className="relative flex items-start py-2">
                <div className="min-w-0 flex-1 text-sm">
                  <label htmlFor={`user-${user.id}`} className="select-none font-medium text-gray-700">
                    {user.displayName || user.email}
                  </label>
                </div>
                <div className="ml-3 flex h-5 items-center">
                  <input
                    id={`user-${user.id}`}
                    name="users"
                    value={user.id}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Envoyer la notification
          </button>
        </div>
      </form>
    </div>
  );
}
