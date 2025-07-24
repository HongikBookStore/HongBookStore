import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { ModalOverlay, ModalContent, ModalIcon, ModalTitle, ModalMessage, ButtonGroup, ModalButton } from '../ui/Modal';



const WarningModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel, 
  onSaveDraft,
  type = 'wanted', // 'wanted' or 'sale'
  title = '',
  message = '',
  showSaveDraft = false 
}) => {
  if (!isOpen) return null;

  const getDefaultContent = () => {
    if (type === 'wanted') {
      return {
        title: '작성 중인 내용이 있습니다',
        message: '현재 작성 중인 구해요 글이 저장되지 않습니다. 정말 나가시겠습니까?'
      };
    } else {
      return {
        title: '작성 중인 내용이 있습니다',
        message: '현재 작성 중인 판매 글이 저장되지 않습니다. 어떻게 하시겠습니까?'
      };
    }
  };

  const content = {
    title: title || getDefaultContent().title,
    message: message || getDefaultContent().message
  };

  return (
    <ModalOverlay style={{ display: isOpen ? 'flex' : 'none' }} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalIcon color="#ffc107">
          <FaExclamationTriangle />
        </ModalIcon>
        
        <ModalTitle>{content.title}</ModalTitle>
        <ModalMessage>{content.message}</ModalMessage>
        
        <ButtonGroup>
          {showSaveDraft && type === 'sale' && onSaveDraft && (
            <ModalButton 
              className="success" 
              onClick={onSaveDraft}
            >
              임시저장
            </ModalButton>
          )}
          
          <ModalButton 
            className="cancel" 
            onClick={onCancel}
          >
            계속 작성
          </ModalButton>
          
          <ModalButton 
            className="danger" 
            onClick={onConfirm}
          >
            나가기
          </ModalButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default WarningModal; 