import React from 'react';

export default function LoadingOverlay({ show }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] px-4">
      <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-sm w-full">
        <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#004b23] mx-auto mb-4"></div>
        <h3 className="font-bold text-lg text-[#004b23] mb-2">A Processar...</h3>
        <p className="text-sm text-gray-600 font-medium">A registrar os dados na Base de Dados Oficial.</p>
      </div>
    </div>
  );
}
