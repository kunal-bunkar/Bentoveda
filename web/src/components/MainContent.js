import React from 'react';

function MainContent({ isAppView, onSyncWithDevice, deviceData }) {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Bentoveda Hybrid Bridge
        </h1>
        
        <p className="text-base md:text-lg text-gray-600 mb-8">
          {isAppView 
            ? 'Running in BentoShell App' 
            : 'Running in Web Browser'}
        </p>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Platform Detection</h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium">User Agent:</span>{' '}
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {navigator.userAgent}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Platform:</span>{' '}
              <span className={`px-3 py-1 rounded text-white ${
                isAppView ? 'bg-green-600' : 'bg-blue-600'
              }`}>
                {isAppView ? 'BentoShell App' : 'Web Browser'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Device Sync</h2>
          <button
            onClick={onSyncWithDevice}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Sync with Device
          </button>
        </div>

        {deviceData && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow-md p-4 md:p-6 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-green-800">
              Device Data Received
            </h2>
            <pre className="bg-white p-4 rounded border border-green-200 overflow-auto">
              {JSON.stringify(deviceData, null, 2)}
            </pre>
          </div>
        )}

        {!isAppView && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Sign Up</h2>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
              Sign Up
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default MainContent;
