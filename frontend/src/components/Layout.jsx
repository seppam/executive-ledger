import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AddExpenseModal from './AddExpenseModal';

export default function Layout() {
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editTarget, setEditTarget]         = useState(null);
  const [refreshSeed, setRefreshSeed]       = useState(0);

  const openModal = () => {
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditTarget(expense);
    setIsModalOpen(true);
  };

  const triggerRefresh = () => setRefreshSeed((s) => s + 1);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar openModal={openModal} />

      <main className="ml-64 flex-1 min-h-screen">
        <Outlet context={{ openModal, openEditModal, triggerRefresh, refreshSeed }} />
      </main>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTarget(null); }}
        onSuccess={triggerRefresh}
        editExpense={editTarget}
      />
    </div>
  );
}
