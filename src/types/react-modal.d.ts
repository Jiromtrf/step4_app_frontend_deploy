// frontend/src/types/react-modal.d.ts

declare module 'react-modal' {
    import { Component } from 'react';
  
    interface ModalProps {
      isOpen: boolean;
      onRequestClose: () => void;
      contentLabel?: string;
      // 他に必要なプロパティを追加
    }
  
    export default class Modal extends Component<ModalProps> {}
  }
  