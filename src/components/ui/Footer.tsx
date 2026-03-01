import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-50 border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-lg font-semibold text-gray-900">Form Builder</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create and manage beautiful forms easily.
                        </p>
                    </div>
                    <div className="flex space-x-6 text-sm text-gray-500">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Form Builder Team. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
