import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaHeart, FaShare, FaMapMarkerAlt, FaUser, FaCalendar, FaEye, FaArrowLeft, FaPhone, FaComment, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const DetailContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  padding-top: 96px;
  background: #f8f9fa;
  min-height: 100vh;
  @media (max-width: 900px) {
    padding-top: 72px;
    padding: 1rem;
  }
  @media (max-width: 600px) {
    padding-top: 56px;
    padding: 0.5rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  margin-bottom: 1rem;

  &:hover {
    background: #5a6268;
  }
`;

const BookDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 1rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BookImage = styled.div`
  width: 100%;
  height: 300px;
  background: #667eea;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const BookImageLarge = styled.div`
  width: 100%;
  height: 400px;
  background: #667eea;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  margin-bottom: 20px;
  overflow: hidden;
`;

const MainImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
`;

const Thumbnail = styled.div`
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.5rem;
  max-width: 120px;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BookTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BookAuthor = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const PriceSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #007bff;
`;

const PriceLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const Price = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
  margin-bottom: 0.5rem;
`;

const DiscountRate = styled.div`
  font-size: 1rem;
  color: #e74c3c;
  font-weight: 600;
`;

const OverallConditionSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const OverallConditionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const OverallConditionBadge = styled.div`
  background: ${props => props.$bgColor};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$color};
  margin-bottom: 0.5rem;
`;

const OverallConditionDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ConditionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConditionTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const ConditionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const ConditionItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const ConditionLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const ConditionValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => {
    if (props.value === '상') return '#28a745';
    if (props.value === '중') return '#ffc107';
    return '#dc3545';
  }};
`;

const BookInfoSection = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #333;
  font-weight: 500;
`;

const SellerSection = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 1.5rem;
`;

const SellerTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SellerAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const SellerDetails = styled.div`
  flex: 1;
`;

const SellerName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const SellerLocation = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const SellerRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Stars = styled.div`
  display: flex;
  align-items: center;
  gap: 0.1rem;
`;

const Star = styled(FaStar)`
  color: ${props => props.filled ? '#ffc107' : '#e0e0e0'};
  font-size: 0.9rem;
`;

const RatingText = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const SalesCount = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ViewOtherBooksButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }
`;

const OtherBooksSection = styled.div`
  margin-top: 2rem;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  background: var(--surface);
`;

const OtherBooksTitle = styled.h3`
  font-size: 1.3rem;
  color: var(--text);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;



const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ChatButton = styled(ActionButton)`
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
`;

const CallButton = styled(ActionButton)`
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
  }
`;

const LikeButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: ${props => props.liked ? '#ff4757' : '#666'};
  font-size: 1.2rem;

  &:hover {
    background: white;
    transform: scale(1.1);
    border-color: #ff4757;
  }
`;

// 팝업 모달 스타일 컴포넌트들
const ModalOverlay = styled.div`
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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

// 팝업 모달용 스타일 컴포넌트들
const OtherBooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const OtherBookCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #007bff;
  }
`;

const OtherBookImage = styled.div`
  width: 100%;
  height: 120px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: center;
  padding: 0.5rem;
`;

const OtherBookTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.3rem;
  line-height: 1.3;
`;

const OtherBookPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #007bff;
  margin-bottom: 0.5rem;
`;

const OtherBookCondition = styled.div`
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-block;
`;

// 할인율에 따른 책 상태 반환 함수
const getBookCondition = (discountRate) => {
  if (discountRate <= 20) return { text: '상', color: '#28a745', bgColor: '#d4edda' };
  if (discountRate <= 40) return { text: '중', color: '#ffc107', bgColor: '#fff3cd' };
  return { text: '하', color: '#dc3545', bgColor: '#f8d7da' };
};

const BookDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showOtherBooks, setShowOtherBooks] = useState(false);

  // URL 파라미터가 변경될 때마다 상태 초기화
  useEffect(() => {
    setSelectedImage(0);
    setLiked(false);
    setShowOtherBooks(false);
    console.log('BookDetail 컴포넌트 마운트/업데이트, ID:', id);
  }, [id]);

  // Mock 데이터 (실제로는 API에서 가져올 데이터)
  const bookData = {
    id: parseInt(id),
    title: "자바의 정석",
    author: "남궁성",
    originalPrice: 25000,
    price: 15000,
    discountRate: 40,
    bookType: "정식 도서",
    major: "공과대학",
    subMajor: "컴퓨터공학",
    writingCondition: "중",
    tearCondition: "상",
    waterCondition: "상",
    location: "교내",
    negotiable: true,
    createdAt: "2024-01-15",
    views: 120,
    images: [
      "https://via.placeholder.com/400x400/667eea/ffffff?text=책+사진+1",
      "https://via.placeholder.com/400x400/764ba2/ffffff?text=책+사진+2",
      "https://via.placeholder.com/400x400/f093fb/ffffff?text=책+사진+3"
    ],
    seller: {
      name: "홍길동",
      location: "서울시 마포구",
      rating: 4.8,
      salesCount: 15
    }
  };

  // 판매자의 다른 책들 Mock 데이터
  const sellerOtherBooks = [
    {
      id: 101,
      title: "알고리즘 문제해결전략",
      author: "구종만",
      price: 20000,
      discountRate: 25,
      image: "https://via.placeholder.com/200x200/667eea/ffffff?text=알고리즘"
    },
    {
      id: 102,
      title: "데이터구조론",
      author: "이석호",
      price: 18000,
      discountRate: 30,
      image: "https://via.placeholder.com/200x200/764ba2/ffffff?text=데이터구조"
    },
    {
      id: 103,
      title: "운영체제",
      author: "Abraham Silberschatz",
      price: 22000,
      discountRate: 15,
      image: "https://via.placeholder.com/200x200/f093fb/ffffff?text=운영체제"
    },
    {
      id: 104,
      title: "네트워크 프로그래밍",
      author: "김성우",
      price: 16000,
      discountRate: 35,
      image: "https://via.placeholder.com/200x200/4facfe/ffffff?text=네트워크"
    },
    {
      id: 105,
      title: "데이터베이스 시스템",
      author: "Ramez Elmasri",
      price: 25000,
      discountRate: 20,
      image: "https://via.placeholder.com/200x200/667eea/ffffff?text=데이터베이스"
    },
    {
      id: 106,
      title: "소프트웨어 공학",
      author: "Roger S. Pressman",
      price: 19000,
      discountRate: 40,
      image: "https://via.placeholder.com/200x200/764ba2/ffffff?text=소프트웨어공학"
    }
  ];

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleChat = () => {
    navigate(`/chat?bookId=${id}`);
  };

  const handleCall = () => {
    // 실제로는 전화 연결 로직
    alert('전화 연결 기능은 준비 중입니다.');
  };

  const handleViewOtherBooks = () => {
    setShowOtherBooks(!showOtherBooks);
  };

  const handleOtherBookClick = (bookId) => {
    console.log('다른 책 클릭:', bookId, '현재 ID:', id);
    // 현재 URL의 id와 다른 경우에만 네비게이션
    if (bookId !== parseInt(id)) {
      console.log('페이지 이동:', `/book/${bookId}`);
      // replace: true로 현재 페이지를 대체
      navigate(`/book/${bookId}`, { replace: true });
    } else {
      console.log('현재 책과 동일하므로 이동하지 않음');
    }
  };

  return (
    <>
      <div className="header-spacer" />
      <DetailContainer>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> 뒤로가기
        </BackButton>

        <BookDetailGrid>
          <ImageSection>
            <BookImageLarge>
              <MainImageImg src={bookData.images[selectedImage]} alt={bookData.title} />
            </BookImageLarge>
            
            {bookData.images.length > 1 && (
              <ThumbnailGrid>
                {bookData.images.map((image, index) => (
                  <Thumbnail 
                    key={index} 
                    active={selectedImage === index}
                    onClick={() => setSelectedImage(index)}
                  >
                    <ThumbnailImg src={image} alt={`${bookData.title} ${index + 1}`} />
                  </Thumbnail>
                ))}
              </ThumbnailGrid>
            )}
          </ImageSection>

          <InfoSection>
            <div>
              <BookTitle>
                {bookData.title}
                <LikeButton liked={liked} onClick={handleLike}>
                  ♥
                </LikeButton>
              </BookTitle>
              <BookAuthor>{bookData.author}</BookAuthor>
            </div>

            <PriceSection>
              <PriceLabel>판매 가격</PriceLabel>
              <Price>{bookData.price.toLocaleString()}원</Price>
              <OriginalPrice>{bookData.originalPrice.toLocaleString()}원</OriginalPrice>
              <DiscountRate>{bookData.discountRate}% 할인</DiscountRate>
            </PriceSection>

            <OverallConditionSection>
              <OverallConditionTitle>
                📊 전체 책 상태
              </OverallConditionTitle>
              <OverallConditionBadge 
                $bgColor={getBookCondition(bookData.discountRate).bgColor}
                $color={getBookCondition(bookData.discountRate).color}
              >
                {getBookCondition(bookData.discountRate).text}
              </OverallConditionBadge>
              <OverallConditionDescription>
                할인율 {bookData.discountRate}%에 따른 전체 상태 평가입니다.
                {bookData.discountRate <= 20 && ' 책이 양호한 상태입니다.'}
                {bookData.discountRate > 20 && bookData.discountRate <= 40 && ' 책이 보통 상태입니다.'}
                {bookData.discountRate > 40 && ' 책에 일부 손상이 있습니다.'}
              </OverallConditionDescription>
            </OverallConditionSection>

            <ConditionSection>
              <ConditionTitle>책 상태</ConditionTitle>
              <ConditionGrid>
                <ConditionItem>
                  <ConditionLabel>필기 상태</ConditionLabel>
                  <ConditionValue value={bookData.writingCondition}>{bookData.writingCondition}</ConditionValue>
                </ConditionItem>
                <ConditionItem>
                  <ConditionLabel>찢어짐 정도</ConditionLabel>
                  <ConditionValue value={bookData.tearCondition}>{bookData.tearCondition}</ConditionValue>
                </ConditionItem>
                <ConditionItem>
                  <ConditionLabel>물흘림 정도</ConditionLabel>
                  <ConditionValue value={bookData.waterCondition}>{bookData.waterCondition}</ConditionValue>
                </ConditionItem>
              </ConditionGrid>
            </ConditionSection>

            <BookInfoSection>
              <InfoTitle>책 정보</InfoTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>책 종류</InfoLabel>
                  <InfoValue>{bookData.bookType}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>카테고리</InfoLabel>
                  <InfoValue>{bookData.major} - {bookData.subMajor}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>거래 지역</InfoLabel>
                  <InfoValue>{bookData.location}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>가격 협의</InfoLabel>
                  <InfoValue>{bookData.negotiable ? '가능' : '불가능'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>등록일</InfoLabel>
                  <InfoValue>{bookData.createdAt}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>조회수</InfoLabel>
                  <InfoValue>{bookData.views}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </BookInfoSection>

            <SellerSection>
              <SellerTitle>
                <FaUser /> 판매자 정보
              </SellerTitle>
              <SellerInfo>
                <SellerAvatar>
                  {bookData.seller.name.charAt(0)}
                </SellerAvatar>
                <SellerDetails>
                  <SellerName>{bookData.seller.name}</SellerName>
                  <SellerLocation>
                    <FaMapMarkerAlt />
                    {bookData.seller.location}
                  </SellerLocation>
                  <SellerRating>
                    <Stars>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          filled={star <= Math.floor(bookData.seller.rating)} 
                        />
                      ))}
                    </Stars>
                    <RatingText>{bookData.seller.rating}</RatingText>
                  </SellerRating>
                  <SalesCount>판매 {bookData.seller.salesCount}회</SalesCount>
                </SellerDetails>
              </SellerInfo>
              <ActionButtons>
                <ChatButton onClick={handleChat}>
                  <FaComment />
                  채팅하기
                </ChatButton>
                <ViewOtherBooksButton onClick={handleViewOtherBooks}>
                  <FaUser />
                  다른 책 보기
                </ViewOtherBooksButton>
              </ActionButtons>
            </SellerSection>


          </InfoSection>
        </BookDetailGrid>
      </DetailContainer>

      {/* 팝업 모달 */}
      {showOtherBooks && (
        <ModalOverlay onClick={() => setShowOtherBooks(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FaUser /> {bookData.seller.name}님이 판매하는 다른 책들
              </ModalTitle>
              <CloseButton onClick={() => setShowOtherBooks(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <OtherBooksGrid>
              {sellerOtherBooks.map(book => (
                <OtherBookCard 
                  key={book.id} 
                  onClick={() => handleOtherBookClick(book.id)}
                  style={{ 
                    borderColor: book.id === parseInt(id) ? '#007bff' : '#e0e0e0',
                    backgroundColor: book.id === parseInt(id) ? '#f8f9fa' : 'white',
                    position: 'relative'
                  }}
                >
                  {book.id === parseInt(id) && (
                    <div style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: '#007bff',
                      color: 'white',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      zIndex: 1
                    }}>
                      현재
                    </div>
                  )}
                  <OtherBookImage>
                    {book.title}
                  </OtherBookImage>
                  <OtherBookTitle>{book.title}</OtherBookTitle>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                    {book.author}
                  </div>
                  <OtherBookPrice>{book.price.toLocaleString()}원</OtherBookPrice>
                  <OtherBookCondition 
                    $bgColor={getBookCondition(book.discountRate).bgColor}
                    $color={getBookCondition(book.discountRate).color}
                  >
                    {getBookCondition(book.discountRate).text}
                  </OtherBookCondition>
                </OtherBookCard>
              ))}
            </OtherBooksGrid>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default BookDetail; 