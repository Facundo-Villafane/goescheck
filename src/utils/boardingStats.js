// src/utils/boardingStats.js

export function calculateBoardingStats(flightId, boardedPassengers, pendingPassengers) {
    // Filter passengers for the specific flight
    const flightBoardedPassengers = boardedPassengers.filter(p => p.flightId === flightId);
    const flightPendingPassengers = pendingPassengers.filter(p => p.flightId === flightId);
    
    const totalCheckedIn = flightBoardedPassengers.length + flightPendingPassengers.length;
    const boardedCount = flightBoardedPassengers.length;
    
    const boardingPercentage = totalCheckedIn > 0
      ? Math.round((boardedCount / totalCheckedIn) * 100)
      : 0;
    
    return {
      totalCheckedIn,
      boardedCount,
      pendingCount: flightPendingPassengers.length,
      boardingPercentage
    };
  }