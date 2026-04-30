import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AddExpenseModal from './AddExpenseModal';

export default function Layout() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This can be used by child pages to trigger a specific refresh logic
  // if they need to update after a successful add.
  const [refreshSeed, setRefreshSeed] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const triggerRefresh = () => setRefreshSeed(prev => prev + 1);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar openModal={openModal} />
      
      {/* Main canvas offset by sidebar width */}
      <main className="ml-64 flex-1 min-h-screen">
        <Outlet context={{ openModal, triggerRefresh, refreshSeed }} />
      </main>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={triggerRefresh}
      />
    </div>
  );
}
