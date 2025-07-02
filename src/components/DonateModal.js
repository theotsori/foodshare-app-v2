import React, { useState } from 'react';
import { X, Image, Package, Clock, MapPin, Tag, ChevronRight, CircleCheck, Truck, UtensilsCrossed, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const DonateModal = ({ setShowModal }) => {
  const { user, categories } = useFoodSharingContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    expiry_date: '',
    photo_url: '',
    pickup_address: user?.address || '',
    latitude: user?.location?.latitude || '',
    longitude: user?.location?.longitude || '',
    category_id: categories.length > 0 ? categories[0].category_id : '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
    setFormData({ ...formData, photo_url: '' }); // Clear URL if a file is chosen
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user || !user.user_id) {
        throw new Error("User not logged in or user ID is missing.");
      }

      const submissionData = new FormData();
      submissionData.append('user_id', user.user_id);
      Object.keys(formData).forEach(key => {
        if (key === 'expiry_date') {
          submissionData.append(key, new Date(formData[key]).toISOString());
        } else {
          submissionData.append(key, formData[key]);
        }
      });

      if (photoFile) {
        submissionData.append('photo_file', photoFile);
      }

      await axios.post('http://localhost:4000/api/donations', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowModal(null);
      }, 2000);

    } catch (err) {
      console.error('Error posting donation:', err.message, err.stack);
      setError('Failed to post donation: ' + (err.response?.data?.error || err.message));
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col items-center justify-center text-center transform scale-95 animate-scale-in">
          <CircleCheck className="h-24 w-24 text-green-500 mb-6 animate-bounce-in" />
          <h2 className="text-3xl font-extrabold text-gray-800 mb-3">Donation Posted!</h2>
          <p className="text-gray-600 text-lg mb-6">Thank you for your generosity.</p>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center space-x-2 mb-6">
      {[1, 2, 3].map(step => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              currentStep >= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 3 && <div className={`h-1 w-12 transition-all duration-300 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 sm:p-6 z-50 font-inter animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl transform scale-95 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Post Food Donation</h2>
          <button
            onClick={() => setShowModal(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close donation form"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        {renderStepIndicator()}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl relative mb-4 text-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Carousel Content */}
          <div className="overflow-hidden">
            {currentStep === 1 && (
              <div className="animate-fade-in space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <div className="relative">
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" required placeholder="e.g., Fresh Apples" />
                    <UtensilsCrossed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" placeholder="Briefly describe the food item and its condition."></textarea>
                </div>
                {/* Category */}
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <select id="category_id" name="category_id" value={formData.category_id} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" required>
                      {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
                    </select>
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="animate-fade-in space-y-5">
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <div className="relative">
                    <input type="text" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" required placeholder="e.g., 5 kg, 10 units" />
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {/* Expiry Date */}
                <div>
                  <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <div className="relative">
                    <input type="datetime-local" id="expiry_date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" required />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                 {/* Pickup Address */}
                <div>
                  <label htmlFor="pickup_address" className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                  <div className="relative">
                    <input type="text" id="pickup_address" name="pickup_address" value={formData.pickup_address} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" required placeholder="e.g., 123 Main St, City" />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="animate-fade-in space-y-5">
                 {/* Photo Upload */}
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Image className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-gray-500">PNG, JPG, or GIF</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                  </div>
                  {photoFile && <p className="text-sm text-gray-600 mt-2">File selected: {photoFile.name}</p>}
                  <div className="relative flex items-center justify-center my-2">
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                  </div>
                   <div className="relative">
                    <input type="url" id="photo_url" name="photo_url" value={formData.photo_url} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" placeholder="Paste an image URL" disabled={!!photoFile} />
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {/* Latitude & Longitude */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className='relative'>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input type="number" id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" step="any" required placeholder="e.g., 34.05" />
                     <MapPin className="absolute left-3 bottom-3 h-5 w-5 text-gray-400" />
                  </div>
                  <div className='relative'>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input type="number" id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all duration-200" step="any" required placeholder="e.g., -118.25" />
                     <MapPin className="absolute left-3 bottom-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>
            ) : <div />}

            {currentStep < 3 && (
              <button type="button" onClick={nextStep} className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2">
                <span>Next</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="submit"
                className="w-auto bg-green-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-600 transition-colors duration-200 shadow-md flex items-center justify-center space-x-2 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5" />
                    <span>Post Donation</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonateModal;