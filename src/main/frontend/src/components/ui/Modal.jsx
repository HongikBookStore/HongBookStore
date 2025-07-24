import styled from 'styled-components';

// 모달 오버레이
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// 모달 박스
export const ModalBox = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
`;

// 모달 제목
export const ModalTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #333;
`;

// 모달 내용
export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

// 모달 텍스트 영역
export const ModalTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  font-size: 1rem;
  resize: vertical;
`;

// 모달 액션
export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

// 모달 버튼
export const ModalButton = styled.button`
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  background: #007bff;
  color: #fff;
  
  &:hover {
    background: #0056b3;
  }
  
  &.cancel {
    background: #ccc;
    color: #333;
    
    &:hover {
      background: #aaa;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: #fff;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.success {
    background: #28a745;
    color: #fff;
    
    &:hover {
      background: #218838;
    }
  }
`;

// 모달 메시지
export const ModalMessage = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

// 모달 아이콘
export const ModalIcon = styled.div`
  color: ${props => props.color || '#ffc107'};
  font-size: 3rem;
  margin-bottom: 1rem;
`;

// 버튼 그룹
export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`; 