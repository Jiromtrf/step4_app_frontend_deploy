// frontend/src/app/components/BackButton.tsx
"use client";

import { useRouter } from 'next/navigation';
import React from 'react';

const BackButton: React.FC = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button onClick={handleBack} style={buttonStyle}>
      戻る
    </button>
  );
};

const buttonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '5px',
  padding: '5px 10px',
  cursor: 'pointer',
  fontSize: '16px',
};

export default BackButton;
