export interface FirebaseAdminConfig {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  createdAt: Date;
}

export interface Reservation {
  id: string;
  userId: string;
  activityId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  date: Date;
  createdAt: Date;
}
