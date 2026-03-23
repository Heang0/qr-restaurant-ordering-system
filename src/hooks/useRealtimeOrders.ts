'use client';

import { useEffect, useRef } from 'react';

export const useRealtimeOrders = (
  fetchOrders: () => Promise<void>,
  enabled: boolean = true
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastOrderIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sounds/new-order.mp3');
    audioRef.current.volume = 0.5;
    audioRef.current.preload = 'auto';

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = async () => {
    if (!audioRef.current) return;
    
    try {
      // Try to play sound
      await audioRef.current.play();
    } catch (error) {
      // Auto-play might be blocked, try after user interaction
      console.log('Sound autoplay blocked, will play on next interaction');
    }
  };

  const checkForNewOrders = async (orders: any[]) => {
    const currentOrderIds = new Set(orders.map(o => o._id));
    
    // Check if there are new orders
    const hasNewOrder = orders.some(order => 
      !lastOrderIdsRef.current.has(order._id) && order.status === 'pending'
    );

    if (hasNewOrder) {
      await playNotificationSound();
    }

    lastOrderIdsRef.current = currentOrderIds;
  };

  const startListening = async () => {
    if (!enabled) return;

    // Initial fetch
    await fetchOrders();

    // Set up polling every 10 seconds
    intervalRef.current = setInterval(async () => {
      await fetchOrders();
    }, 10000);
  };

  const stopListening = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    startListening,
    stopListening,
    checkForNewOrders
  };
};
