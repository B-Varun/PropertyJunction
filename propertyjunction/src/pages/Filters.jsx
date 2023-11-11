import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { toast } from "react-toastify";

export default function ApplyFilters() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  const [filters, setFilters] = useState({
    propertyType: '',
    type: '',
    priceMin: '',
    priceMax: '',
    bathrooms: '',
    bedrooms: '',
    furnish: '',
  });

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  console.log('7');
  async function applyFilters() {
    setLoading(true);
    console.log('1');
    try {
      // Perform Firestore query using the filters
      const db = getFirestore();
      const listingsCollection = collection(db, 'listings');
      let filteredQuery = query(listingsCollection);
      console.log('2');
      // Apply filters to the query
      if (filters.propertyType) {
        filteredQuery = where(listingsCollection, 'propertyType', '==', filters.propertyType);
      }

      if (filters.type) {
        filteredQuery = where(listingsCollection, 'type', '==', filters.type);
      }

      if (filters.priceMin) {
        filteredQuery = query(listingsCollection, where('regularPrice', '>=', parseInt(filters.priceMin, 10)));
      }

      if (filters.priceMax) {
        filteredQuery = query(listingsCollection, where('regularPrice', '<=', parseInt(filters.priceMax, 10)));
      }

      if (filters.bathrooms) {
        filteredQuery = query(listingsCollection, where('bathrooms', '==', filters.bathrooms));
      }

      if (filters.bedrooms) {
        filteredQuery = query(listingsCollection, where('bedrooms', '==', filters.bedrooms));
      }
      
      if (filters.furnish) {
        filteredQuery = query(listingsCollection, where('furnish', '==', filters.furnish));
      }
      console.log('3');
      // Execute the query
      const querySnapshot = await getDocs(filteredQuery);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastFetchListing(lastVisible);
      console.log('4');
      // Extract listing data from the query snapshot
      const listings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      console.log('5');
      setListings(listings);
      console.log('6');
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error('Error fetching listings:', error);
      setLoading(false);
    }
  };
  console.log('8');
  return (
    
    <div className="max-w-6xl mx-auto pt-4 space-y-6">
      <label className={`ml-2 mt-3  py-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Property Type:
        <select className={'ml-1 mt-3 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.propertyType}
          onChange={(e) => handleFilterChange('propertyType', e.target.value)} >
          <option value="">Any</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="condo">Commercial</option>
        </select>
      </label>

      <label className={`ml-4 mt-3  py-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Listing Type:
        <select className={'ml-1 mt-3 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)} >
          <option value="">Any</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
          <option value="lease">Lease</option>
        </select>
      </label>

      <label className={`ml-2 mb-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Price Range:
        <input className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out'}
          type="number"
          placeholder="Min"
          value={filters.priceMin}
          onChange={(e) => handleFilterChange('priceMin', e.target.value)}
        />
        <input className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out'}
          type="number"
          placeholder="Max"
          value={filters.priceMax}
          onChange={(e) => handleFilterChange('priceMax', e.target.value)}
        />
      </label>

      <label className={`ml-3 ml-2 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Baths:
        <select className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.bathrooms}
          onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          {/* Add more bath options as needed */}
        </select>
      </label>

      <label className={`ml-2 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Bedrooms:
        <select className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.bedrooms}
          onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          {/* Add more bath options as needed */}
        </select>
      </label>

      <label className={`ml-2 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Baths:
        <select className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.bathrooms}
          onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
        >
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          {/* Add more bath options as needed */}
        </select>
      </label>

      <label className={`ml-2 py-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Furnish:
        <select className={'ml-1 mt-4 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.furnish}
          onChange={(e) => handleFilterChange('furnish', e.target.value)}
        >
          <option value="">Any</option>
          <option value="furnished">Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </label>

      <button onClick={applyFilters} className="ml-2 bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800">Apply</button>
      
      <div className="max-w-6xl mx-auto px-3">
      <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-800 after:border-t after:flex-1 after:border-gray-800">
      </div>
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">Results</h1>
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
        <p>No results found</p>
      )}
        </div>
    </div>
    

  );
};

