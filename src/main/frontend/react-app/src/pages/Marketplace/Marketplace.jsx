import { useState } from 'react';
import styled from 'styled-components';

const MarketplaceContainer = styled.div`
  padding: 8rem 2rem 4rem;
  max-width: 1440px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 400px;
  position: relative;

  input {
    width: 100%;
    padding: 1rem 1.5rem;
    padding-left: 3rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    transition: var(--transition);
    background: var(--surface);

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
  }

  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
  }
`;

const FilterButton = styled.button`
  padding: 1rem 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  i {
    font-size: 1.25rem;
  }
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const BookCard = styled.div`
  background: var(--surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

const BookImage = styled.div`
  width: 100%;
  height: 300px;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BookInfo = styled.div`
  padding: 1.5rem;
`;

const BookTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
`;

const BookAuthor = styled.p`
  color: var(--text-light);
  margin-bottom: 1rem;
`;

const BookPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
`;

const BookStatus = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.status === 'available' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(249, 115, 22, 0.1)'};
  color: ${props => props.status === 'available' ? 'var(--primary)' : 'var(--accent)'};
`;

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample book data
  const books = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: "15,000",
      status: "available",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: "12,000",
      status: "reserved",
      image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&auto=format&fit=crop&q=60"
    },
    // Add more sample books here
  ];

  return (
    <MarketplaceContainer>
      <Header>
        <Title>Book Marketplace</Title>
        <Description>
          Discover and trade books with fellow readers. Find your next favorite book or sell your collection.
        </Description>
      </Header>

      <Controls>
        <SearchBar>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
        <FilterButton>
          <i className="fas fa-filter"></i>
          Filter
        </FilterButton>
      </Controls>

      <BookGrid>
        {books.map(book => (
          <BookCard key={book.id}>
            <BookImage>
              <img src={book.image} alt={book.title} />
            </BookImage>
            <BookInfo>
              <BookTitle>{book.title}</BookTitle>
              <BookAuthor>{book.author}</BookAuthor>
              <BookPrice>₩{book.price}</BookPrice>
              <BookStatus status={book.status}>
                {book.status === 'available' ? 'Available' : 'Reserved'}
              </BookStatus>
            </BookInfo>
          </BookCard>
        ))}
      </BookGrid>
    </MarketplaceContainer>
  );
};

export default Marketplace; 