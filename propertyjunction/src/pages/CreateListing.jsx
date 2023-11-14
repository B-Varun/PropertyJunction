import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const navigate = useNavigate();
  const auth = getAuth();
  //const sftPrice = regularPrice / builtArea;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyType: "",
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: "",
    address: "",
    offer: false,
    regularPrice: "",
    builtArea: "",
    sqftPrice: "",
    discountedPrice: "",
    securityDeposit: "",
    maintenanceCharges: "",
    locality: "",
    pincode: 123456,
    amenities: "",
    securitySafety: "",
    images: {},
  });
  const {
    propertyType,
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    address,
    furnished,
    offer,
    regularPrice,
    builtArea,
    sqftPrice,
    discountedPrice,
    images,
    locality,
    pincode,
    amenities,
    securitySafety,
    securityDeposit,
    maintenanceCharges,
  } = formData;
  // Calculate the price per square feet of a property
  const calculateSqftPrice = () => {
    const calculatedSqftPrice = Number(
      ((regularPrice / builtArea) * 10).toFixed(2)
    );
    setFormData((prevState) => ({
      ...prevState,
      sqftPrice: calculatedSqftPrice,
    }));
  };

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    // Text/Boolean/Number //
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));

      // Calculate sqft price

      if (e.target.id === "regularPrice" || e.target.id === "builtArea") {
        calculateSqftPrice();
      }
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      return;
    }
    // Maximum 6 images to be updated.
    if (images.length > 6) {
      setLoading(false);
      toast.error("maximum 6 images are allowed");
      return;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }
    // Iterates through images if there are multiple
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });
    // Copy all data in to formDataCopy
    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    // Add the data to firestore collection
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }

  if (loading) {
    return <Spinner />;
  }
  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Create a Listing</h1>
      <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-800 after:border-t after:flex-1 after:border-gray-800"></div>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">
          Property Type
          <select
            className={
              "ml-1 mt-3 bg-white border-gray-300 rounded transition ease-in-out"
            }
            id="propertyType"
            value={propertyType}
            required
            onChange={(e) =>
              setFormData({ ...formData, propertyType: e.target.value })
            }
          >
            <option value="">Any</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
            <option value="commercial">Commercial</option>
          </select>
        </p>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "sale"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            rent
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Name</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          placeholder="Name"
          maxLength="32"
          minLength="10"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-lg font-semibold">Built Area</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="builtArea"
                value={builtArea}
                onChange={onChange}
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
              <div className="">
                <p className="text-md w-full whitespace-nowrap">SQ FT</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
        </div>
        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            no
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">
          Furnish:
          <select
            className={
              "ml-1 mt-3 bg-white border-gray-300 rounded transition ease-in-out"
            }
            id="furnished"
            required
            value={furnished}
            onChange={(e) =>
              setFormData({ ...formData, furnished: e.target.value })
            }
          >
            <option value="">Any</option>
            <option value="fully">Fully</option>
            <option value="semi">Semi</option>
            <option value="no">No</option>
          </select>
        </p>

        <p className="text-lg mt-6 font-semibold">Security & Safety</p>
        <div className="ml-1 mt-3 space-y-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              value="surveillancecameras"
              checked={securitySafety.includes("surveillance cameras")}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  securitySafety: isChecked
                    ? [...prevFormData.securitySafety, "surveillance cameras"]
                    : prevFormData.securitySafety.filter(
                        (value) => value !== "surveillance cameras"
                      ),
                }));
              }}
            />
            <span className="ml-2">Surveillance Cameras</span>
          </label>

          <label className="ml-2 inline-flex items-center">
            <input
              type="checkbox"
              value="firealarm"
              checked={securitySafety.includes("fire alarm")}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  securitySafety: isChecked
                    ? [...prevFormData.securitySafety, "fire alarm"]
                    : prevFormData.securitySafety.filter(
                        (value) => value !== "fire alarm"
                      ),
                }));
              }}
            />
            <span className="ml-2">Fire Alarm</span>
          </label>

          <label className="ml-1 inline-flex items-center">
            <input
              type="checkbox"
              value="smokedetectors"
              checked={securitySafety.includes("smoke detectors")}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  securitySafety: isChecked
                    ? [...prevFormData.securitySafety, "smoke detectors"]
                    : prevFormData.securitySafety.filter(
                        (value) => value !== "smoke detectors"
                      ),
                }));
              }}
            />
            <span className="ml-2">Smoke Detectors</span>
          </label>
        </div>

        <p className="text-lg mt-6 font-semibold">Amenities</p>
        <div className="ml-1 mt-3 space-y-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              value="swimming pool"
              checked={amenities.includes("swimming pool")}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  amenities: isChecked
                    ? [...prevFormData.amenities, "swimming pool"]
                    : prevFormData.amenities.filter(
                        (value) => value !== "swimming pool"
                      ),
                }));
              }}
            />
            <span className="ml-2">Swimming Pool</span>
          </label>

          <label className="ml-2 inline-flex items-center">
            <input
              type="checkbox"
              value="lift"
              checked={amenities.includes("lift")}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  amenities: isChecked
                    ? [...prevFormData.amenities, "lift"]
                    : prevFormData.amenities.filter(
                        (value) => value !== "lift"
                      ),
                }));
              }}
            />
            <span className="ml-2">Lift</span>
          </label>

          <label className="ml-1 inline-flex items-center">
            <input
              type="checkbox"
              value="gymnasium"
              checked={amenities.includes("gymnasium")}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData((prevFormData) => ({
                  ...prevFormData,
                  amenities: isChecked
                    ? [...prevFormData.amenities, "gymnasium"]
                    : prevFormData.amenities.filter(
                        (value) => value !== "gymnasium"
                      ),
                }));
              }}
            />
            <span className="ml-2">Gymnasium</span>
          </label>
        </div>

        <p className="text-lg mt-6 font-semibold">Address</p>
        <input
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          maxLength="256"
          minLength="5"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Locality</p>
            <input
              type="text"
              id="locality"
              value={locality}
              onChange={onChange}
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Pincode</p>
            <input
              type="number"
              id="pincode"
              value={pincode}
              onChange={onChange}
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
        </div>
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            no
          </button>
        </div>
        <div className="flex space-x-6 mb-6">
          <div className="">
            <p className="text-lg font-semibold">Regular price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
              {type === "rent" && (
                <div className="">
                  <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
          {type === "rent" && (
            <div>
              <p className="text-lg font-semibold">Security Deposit</p>
              <input
                type="number"
                id="securityDeposit"
                value={securityDeposit}
                onChange={onChange}
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
            </div>
          )}
          {type === "sale" && (
            <div>
              <p className="text-lg font-semibold">Price/SqFt</p>
              <input
                type="disabled"
                id="sqftPrice"
                value={sqftPrice}
                onChange={onChange}
                disabled
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
            </div>
          )}
        </div>

        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-lg font-semibold">Maintenance Charges</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="maintenanceCharges"
                value={maintenanceCharges}
                onChange={onChange}
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
              <p className="text-md w-full whitespace-nowrap">$ / Year</p>
            </div>
          </div>
        </div>

        {offer && (
          <div className="flex items-center mb-6">
            <div className="">
              <p className="text-lg font-semibold">Discounted price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                />
                {type === "rent" && (
                  <div className="">
                    <p className="text-md w-full whitespace-nowrap">
                      $ / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600"
          />
        </div>
        <button
          type="submit"
          className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
        >
          Create Listing
        </button>
      </form>
    </main>
  );
}
