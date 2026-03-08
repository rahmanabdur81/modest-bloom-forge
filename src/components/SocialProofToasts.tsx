import { useEffect, useRef } from "react";
import { toast } from "sonner";

const sampleNotifications = [
  { name: "Ayesha from Mumbai", product: "Premium Georgette Hijab" },
  { name: "Fatima from Delhi", product: "Silk Satin Hijab" },
  { name: "Zara from Hyderabad", product: "Jersey Hijab" },
  { name: "Mariam from Bangalore", product: "Chiffon Hijab" },
  { name: "Noor from Chennai", product: "Turkish Cotton Hijab" },
  { name: "Sana from Kolkata", product: "Modal Hijab" },
  { name: "Huda from Lucknow", product: "Embroidered Georgette Hijab" },
  { name: "Amira from Pune", product: "Ombre Jersey Hijab" },
  { name: "Ruqaiya from Jaipur", product: "Khimar" },
  { name: "Safiya from Ahmedabad", product: "Gift Hamper" },
];

function getRandomNotification() {
  return sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
}

function getTimeAgo() {
  const minutes = Math.floor(Math.random() * 30) + 2;
  return `${minutes} min ago`;
}

export default function SocialProofToasts() {
  const shown = useRef(0);

  useEffect(() => {
    // Show first one after 15-25 seconds
    const initialDelay = 15000 + Math.random() * 10000;

    const showToast = () => {
      if (shown.current >= 3) return; // max 3 per session
      const { name, product } = getRandomNotification();
      toast(`${name} just purchased`, {
        description: `${product} — ${getTimeAgo()}`,
        duration: 4000,
        position: "bottom-left",
        icon: "🛍️",
      });
      shown.current++;
    };

    const firstTimer = setTimeout(() => {
      showToast();
      // Then show every 30-50 seconds
      const interval = setInterval(() => {
        showToast();
      }, 30000 + Math.random() * 20000);

      return () => clearInterval(interval);
    }, initialDelay);

    return () => clearTimeout(firstTimer);
  }, []);

  return null;
}
