import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { async } from "@firebase/util";

// Component is rendered when the offers page is clicked. It gets the offers from firestore
// and displays them to the user screen
export default function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  useEffect(() => {
    // Fetch listings based on the query
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");
        // Query to fetch the listings if they have offer on it
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc")
        );
        // Update the listings in real-time on UI, Realtime listener

        const unsubscribe = onSnapshot(q, (querySnap) => {
          const lastVisible = querySnap.docs[querySnap.docs.length - 1];
          setLastFetchListing(lastVisible);

          const updatedListings = querySnap.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          setListings(updatedListings);
          setLoading(false);
        });

        // Cleanup function
        return () => unsubscribe();
      } catch (error) {
        toast.error("Could not fetch listing");
      }
    }
    fetchListings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">Offers</h1>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
}
