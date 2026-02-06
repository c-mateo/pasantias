// Mock API for frontend development without backend

// Simulate a delay for API responses
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockData = {
  notifications: [
    { id: 1, message: "Welcome to the platform!", read: false },
    { id: 2, message: "Your application has been approved.", read: true },
    { id: 3, message: "New offers are available now!", read: false },
  ],
  offers: [
    { id: 1, title: "Frontend Developer", company: "Tech Corp", location: "Remote" },
    { id: 2, title: "Backend Developer", company: "Code Inc.", location: "On-site" },
  ],
};

// Mock API functions
export const fetchNotifications = async () => {
  await simulateDelay(500); // Simulate network delay
  return mockData.notifications;
};

export const fetchOffers = async () => {
  await simulateDelay(500); // Simulate network delay
  return mockData.offers;
};

export const markNotificationAsRead = async (id: number) => {
  await simulateDelay(300); // Simulate network delay
  const notification = mockData.notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
  }
  return notification;
};

export const createOffer = async (offer: { title: string; company: string; location: string }) => {
  await simulateDelay(300); // Simulate network delay
  const newOffer = { id: mockData.offers.length + 1, ...offer };
  mockData.offers.push(newOffer);
  return newOffer;
};