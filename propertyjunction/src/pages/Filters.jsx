import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs,orderBy } from 'firebase/firestore';
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
    builtAreaMax:'',
    builtAreaMin:'',
    bathrooms: '',
    bedrooms: '',
    furnish: '',
  });

  const handleFilterChange = (filterName, value) => {
    console.log('Inside handle filter change function');
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  
  async function applyFilters() {
    setLoading(true);
    console.log('Inside apply filters function');
    try {
      // Perform Firestore query using the filters
      const db = getFirestore();
      const listingsCollection = collection(db, 'listings');
      let bathroomEmptyQ = query(listingsCollection);
      let filteredQuery1 = query(listingsCollection);
      let filteredQuery2 = query(listingsCollection);
      console.log('In the try block of apply filters');
      // Apply filters to the query
      

      if (filters.propertyType || filters.type || filters.furnish || filters.bathrooms || filters.bedrooms){
        console.log('inside filters check condition')
        if(filters.bathrooms == "" ){
          console.log('inside if bathrooms is empty condition')
          bathroomEmptyQ = query(listingsCollection,where('bathrooms','>=','0'))
        }
        console.log('querying the filters1')
        filteredQuery1 = query(bathroomEmptyQ, where('propertyType', '==', filters.propertyType),
                                                  where('type', '==', filters.type),
                                                  where('furnished', '==', filters.furnish),
                                                  //where('bathrooms', '==', filters.bathrooms),
                                                  //where('bedrooms', '==', filters.bedrooms),
                                                  );
        console.log('querying the filters2')
      }

      if (filters.priceMin || filters.priceMax){											
        // if(filters.bathrooms.trim() == "" ){
        //   filters.bathrooms = "0";
        // }
        // if(filters.bedrooms.trim() == "" ){
        //   filters.bedrooms = "0";
        // }
        filteredQuery2 = query(listingsCollection,where('reqularPrice', '>=', filters.priceMin),
                                                  where('reqularPrice', '<=', filters.priceMax));
      }
      

      // if (filters.type) {
      //   filteredQuery = query(listingsCollection, where('type', '==', filters.type));
      // }

      // if (filters.priceMin) {
      //   filteredQuery = query(listingsCollection, where('regularPrice', '>=', parseInt(filters.priceMin, 10)));
      // }

      // if (filters.priceMax) {
      //   filteredQuery = query(listingsCollection, where('regularPrice', '<=', parseInt(filters.priceMax, 10)));
      // }

      // if (filters.builtAreaMin) {
      //   filteredQuery = query(listingsCollection, where('builtArea', '<=', parseInt(filters.builtAreaMin, 10)));
      // }

      // if (filters.builtAreaMax) {
      //   filteredQuery = query(listingsCollection, where('builtArea', '<=', parseInt(filters.builtAreaMax, 10)));
      // }

      // if (filters.bathrooms) {
      //   filteredQuery = query(listingsCollection, where('bathrooms', '==', filters.bathrooms));
      // }

      // if (filters.bedrooms) {
      //   filteredQuery = query(listingsCollection, where('bedrooms', '==', filters.bedrooms));
      // }
      
      // if (filters.furnish) {
      //   filteredQuery = query(listingsCollection, where('furnished', '==', filters.furnish));
      // }

      console.log('End of filters in apply filters block');

      // Execute the query
      const querySnapshot = await getDocs(filteredQuery2,filteredQuery1);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastFetchListing(lastVisible);
      console.log('results fetched');

      // Extract listing data from the query snapshot
      const listings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setListings(listings);
      console.log('Listings updated');
      setLoading(false);

    } catch (error) {
      console.log(error);
      toast.error('Error fetching listings:', error);
      setLoading(false);
    }
  };



  return (
    
    <div className="max-w-7xl mx-auto pt-4 space-y-6">
      <label className={`ml-2 mt-3  py-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Property Type:
        <select className={'ml-1 mt-3 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.propertyType}
          onChange={(e) => handleFilterChange('propertyType', e.target.value)} >
          <option value="">Any</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="commercial">Commercial</option>
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

      <label className={`ml-2 mb-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Built Area:
        <input className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out w-20'}
          type="number"
          placeholder="Min"
          value={filters.builtAreaMin}
          onChange={(e) => handleFilterChange('builtAreaMin', e.target.value)}
        />
        <input className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out w-20'}
          type="number"
          placeholder="Max"
          value={filters.builtAreaMax}
          onChange={(e) => handleFilterChange('builtAreaMax', e.target.value)}
        />
      </label>

      <label className={`ml-2 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Bedrooms:
        <input className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out w-20'}
          type="number"
          value={filters.bedrooms}
          onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
        />
      </label>

      <label className={`ml-2 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Baths:
        <input className={'ml-1 bg-white border-gray-300 rounded transition ease-in-out w-20'}
          type="number"
          value={filters.bathrooms}
          onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
        />
      </label>

      <label className={`ml-2 py-4 text-sm font-semibold text-black-400 border-b-[3px] border-b-transparent`}>
        Furnish:
        <select className={'ml-1 mt-4 bg-white border-gray-300 rounded transition ease-in-out'}
          value={filters.furnish}
          onChange={(e) => handleFilterChange('furnish', e.target.value)}
        >
          <option value="">Any</option>
          <option value="fully">Fully</option>
          <option value="semi">Semi</option>
          <option value="no">Unfurnished</option>
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

