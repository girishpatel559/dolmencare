import { createContext, useContext, useState } from "react";
import BookingModal from "./BookingModal";
import TrackModal from "./TrackModal";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  return (
    <BookingContext.Provider value={{ openBooking: () => setBookingOpen(true), openTrack: () => setTrackOpen(true) }}>
      {children}
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} />}
      {trackOpen && <TrackModal onClose={() => setTrackOpen(false)} />}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
