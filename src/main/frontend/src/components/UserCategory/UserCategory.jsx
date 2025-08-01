import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const UserCategory = ({ categories, onAddCategory, onDeleteCategory, onUpdateCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdateCategory(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <CategoryContainer>
      <CategoryHeader>
        <h3>내 카테고리</h3>
        <AddCategoryForm>
          <CategoryInput
            type="text"
            placeholder="새 카테고리 이름"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <AddButton onClick={handleAddCategory}>
            <FaPlus />
          </AddButton>
        </AddCategoryForm>
      </CategoryHeader>

      <CategoryList>
        {categories.map((category) => (
          <CategoryItem key={category.id}>
            {editingId === category.id ? (
              <EditForm>
                <EditInput
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                />
                <EditButton onClick={handleSaveEdit}>
                  <FaCheck />
                </EditButton>
                <CancelButton onClick={handleCancelEdit}>
                  <FaTimes />
                </CancelButton>
              </EditForm>
            ) : (
              <>
                <CategoryName>{category.name}</CategoryName>
                <CategoryActions>
                  <EditButton onClick={() => handleStartEdit(category)}>
                    <FaEdit />
                  </EditButton>
                  <DeleteButton onClick={() => onDeleteCategory(category.id)}>
                    <FaTrash />
                  </DeleteButton>
                </CategoryActions>
              </>
            )}
          </CategoryItem>
        ))}
      </CategoryList>
    </CategoryContainer>
  );
};

const CategoryContainer = styled.div`
  margin-bottom: 20px;
`;

const CategoryHeader = styled.div`
  margin-bottom: 15px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
`;

const AddCategoryForm = styled.div`
  display: flex;
  gap: 8px;
`;

const CategoryInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const AddButton = styled.button`
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #0056b3;
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const CategoryName = styled.span`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 4px;
`;

const EditForm = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const EditInput = styled.input`
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const EditButton = styled.button`
  padding: 6px 8px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  &:hover {
    background: #218838;
  }
`;

const CancelButton = styled.button`
  padding: 6px 8px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  &:hover {
    background: #5a6268;
  }
`;

const DeleteButton = styled.button`
  padding: 6px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  &:hover {
    background: #c82333;
  }
`;

export default UserCategory; 