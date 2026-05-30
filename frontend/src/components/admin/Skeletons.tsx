'use client';

import React from 'react';

export const MenuSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex items-center gap-3">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const CategorySkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
          </div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

export const OrderSkeleton: React.FC = () => (
  <>
    {[1, 2, 3].map((i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-3">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
        </td>
        <td className="px-6 py-4 text-center">
          <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="h-8 bg-gray-200 rounded-xl w-20 ml-auto"></div>
        </td>
      </tr>
    ))}
  </>
);

export const DashboardStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);
