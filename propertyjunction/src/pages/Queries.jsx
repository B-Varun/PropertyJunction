import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { toast } from "react-toastify";
// The queries webpage is the component that is exported by default to get accessed to execute multiple queries
// There are queries which retrieve the most number of bedrooms or bathrooms for a house.
export default function ApplyFilters() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState("query1");
  // Handle the query change in dropdown
  const handleFilterChange = (value) => {
    console.log("Inside handle filter change function");
    setSelectedQuery(value);
  };
  // Connect with firestore
  const db = getFirestore();
  const listingsCollection = collection(db, "listings");

  // Query1
  // Query to fetch commercial rent properties that have maximum bathrooms
  const query1Logic = () => {
    const propertyQuery = query(
      listingsCollection,
      where("propertyType", "==", "commercial"),
      orderBy("bathrooms", "desc"),
      limit(1)
    );
    const propertyTypeQ = query(propertyQuery, where("type", "==", "rent"));
    return propertyTypeQ;
  };

  // Query2
  // Query to get properties in hyderabad with max bedrooms and amenities that has gymnasium
  const query2Logic = () => {
    //step1: Get the maximum number of bedrooms
    const maxBedrooms = query(
      listingsCollection,
      where("locality", "==", "Hyderabad"),
      orderBy("bedrooms", "desc"),
      limit(1)
    );
    //step2: from above collection get the properties that has gymnasium
    const offerQuery = query(
      maxBedrooms,
      where("amenities", "array-contains", "gymnasium")
    );
    return offerQuery;
  };

  // Query3
  // Fetch Houses on sale with offer and has more than 2 bedrooms
  const query3Logic = () => {
    const fetchHouses = query(
      listingsCollection,
      where("propertyType", "==", "house"),
      where("type", "==", "sale"),
      where("offer", "==", true),
      where("bedrooms", ">=", "2"),
      orderBy("bedrooms")
    );
    return fetchHouses;
  };

  // Query4
  // Fetch commercial properties with specific sqft price, located in pincode, with lift, safety features - smoke detector
  // and without offers
  const query4Logic = () => {
    const sqftQuery = query(
      listingsCollection,
      where("sqftPrice", ">=", 1425),
      where("propertyType", "==", "commercial"),
      where("pincode", "==", "500097"),
      where("securitySafety", "array-contains", "smokedetectors"),
      limit(2)
    );
    return sqftQuery;
  };

  //Query5
  // Fetch commercial properties with lowest security deposit, and offer is false, order by security deposit.
  const query5Logic = () => {
    const depositQ = query(
      listingsCollection,
      where("propertyType", "==", "commercial"),
      where("offer", "==", false),
      orderBy("securityDeposit", "asc"),
      limit(3)
    );
    // const maxBedrooms = query(listingsCollection,where("locality", "==", "Hyderabad"), orderBy("bedrooms","desc"),limit(1));
    // const offerQuery = query(maxBedrooms,where("amenities", "array-contains", "gymnasium"));
    return depositQ;
  };

  async function applyFilters() {
    setLoading(true);
    console.log("Inside apply filters function");
    try {
      const selectedQueryLogic = getQueryLogic(selectedQuery);

      // Execute the query
      const querySnapshot = await getDocs(selectedQueryLogic);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastFetchListing(lastVisible);
      console.log("results fetched");

      // Extract listing data from the query snapshot
      const listings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setListings(listings);
      console.log("Listings updated");
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching listings");
      setLoading(false);
    }
  }

  const getQueryLogic = (query) => {
    switch (query) {
      case "query1":
        return query1Logic();
      case "query2":
        return query2Logic();
      case "query3":
        return query3Logic();
      case "query4":
        return query4Logic();
      case "query5":
        return query5Logic();

      default:
        throw new Error(`Unsupported query: ${query}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-4 space-y-6">
      <label
        className={`ml-2 mt-3 py-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}
      >
        QUERIES
        <select
          className={
            "ml-1 mt-3 bg-white border-gray-300 rounded transition ease-in-out"
          }
          value={selectedQuery}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="query1">Query 1</option>
          <option value="query2">Query 2</option>
          <option value="query3">Query 3</option>
          <option value="query4">Query 4</option>
          <option value="query5">Query 5</option>
        </select>
      </label>

      <button
        onClick={applyFilters}
        className="ml-2 bg-blue-600 text-white px-7 py-2.5 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
      >
        Execute Query
      </button>

      <div className="max-w-6xl mx-auto px-3">
        <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-800 after:border-t after:flex-1 after:border-gray-800"></div>
        <h1 className="text-3xl text-center mt-6 font-bold mb-6">Results</h1>
        {loading ? (
          <Spinner />
        ) : listings && listings.length > 0 ? (
          <>
            <main>
              <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <p>No results found</p>
        )}
      </div>
    </div>
  );
}
