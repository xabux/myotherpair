export interface Listing {
  id: string;
  userId: string;
  brand: string;
  model: string;
  size: number;
  side: "Left" | "Right";
  condition: "New" | "Good" | "Used";
  price: number;
  photo: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  leftFootSize: number;
  rightFootSize: number;
  avatar: string;
  isAmputee?: boolean;
  reviews: Review[];
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  listingId: string;
  messages: Message[];
}

export const sampleUsers: User[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    location: "London, UK",
    leftFootSize: 7,
    rightFootSize: 6,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    reviews: [
      { id: "r1", fromUserId: "u2", fromUserName: "James O.", rating: 5, text: "Great seller, shoes arrived perfectly!", date: "2025-12-10" },
    ],
  },
  {
    id: "u2",
    name: "James Okafor",
    email: "james@example.com",
    location: "Manchester, UK",
    leftFootSize: 9,
    rightFootSize: 9,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    isAmputee: true,
    reviews: [
      { id: "r2", fromUserId: "u1", fromUserName: "Sarah C.", rating: 4, text: "Quick and friendly communication.", date: "2025-11-20" },
    ],
  },
  {
    id: "u3",
    name: "Priya Patel",
    email: "priya@example.com",
    location: "Birmingham, UK",
    leftFootSize: 5,
    rightFootSize: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    reviews: [],
  },
];

export const sampleListings: Listing[] = [
  {
    id: "l1",
    userId: "u1",
    brand: "Nike",
    model: "Air Force 1",
    size: 7,
    side: "Left",
    condition: "New",
    price: 45,
    photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    description: "Brand new Nike Air Force 1, never worn. Selling the left shoe only.",
    category: "Sneakers",
    createdAt: "2026-02-15",
  },
  {
    id: "l2",
    userId: "u2",
    brand: "Adidas",
    model: "Samba OG",
    size: 7,
    side: "Right",
    condition: "Good",
    price: 35,
    photo: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
    description: "Adidas Samba in great condition. Right shoe only, lightly worn.",
    category: "Sneakers",
    createdAt: "2026-02-20",
  },
  {
    id: "l3",
    userId: "u3",
    brand: "Clarks",
    model: "Wallabee",
    size: 5,
    side: "Left",
    condition: "Good",
    price: 30,
    photo: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    description: "Classic Clarks Wallabee, left shoe. Comfortable and stylish.",
    category: "Casual",
    createdAt: "2026-01-28",
  },
  {
    id: "l4",
    userId: "u1",
    brand: "New Balance",
    model: "574",
    size: 8,
    side: "Right",
    condition: "New",
    price: 50,
    photo: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop",
    description: "New Balance 574, brand new with tags. Right shoe only.",
    category: "Sneakers",
    createdAt: "2026-03-01",
  },
  {
    id: "l5",
    userId: "u2",
    brand: "Dr. Martens",
    model: "1461",
    size: 9,
    side: "Left",
    condition: "Used",
    price: 25,
    photo: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=400&h=400&fit=crop",
    description: "Dr. Martens 1461, well loved but still sturdy. Left shoe.",
    category: "Boots",
    createdAt: "2026-02-05",
  },
  {
    id: "l6",
    userId: "u3",
    brand: "Converse",
    model: "Chuck Taylor",
    size: 6,
    side: "Right",
    condition: "Good",
    price: 20,
    photo: "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=400&h=400&fit=crop",
    description: "Classic black Converse Chuck Taylor. Right shoe, barely worn.",
    category: "Sneakers",
    createdAt: "2026-02-25",
  },
];

export const sampleConversations: Conversation[] = [
  {
    id: "c1",
    participants: ["u1", "u2"],
    listingId: "l1",
    messages: [
      { id: "m1", senderId: "u2", receiverId: "u1", listingId: "l1", text: "Hi! I have the right shoe in size 7. Would you be interested in matching?", timestamp: "2026-03-01T10:00:00" },
      { id: "m2", senderId: "u1", receiverId: "u2", listingId: "l1", text: "That sounds perfect! What condition is it in?", timestamp: "2026-03-01T10:15:00" },
      { id: "m3", senderId: "u2", receiverId: "u1", listingId: "l1", text: "It's in great condition, only worn a couple of times. Happy to send photos!", timestamp: "2026-03-01T10:20:00" },
    ],
  },
];

export function findMatches(listing: Listing, allListings: Listing[]): Listing[] {
  return allListings.filter(
    (l) =>
      l.id !== listing.id &&
      l.size === listing.size &&
      l.side !== listing.side
  );
}
