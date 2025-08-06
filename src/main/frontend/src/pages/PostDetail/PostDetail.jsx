import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaHeart, FaShare, FaMapMarkerAlt, FaUser, FaCalendar, FaEye, FaArrowLeft, FaPhone, FaComment, FaStar, FaTimes } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import { AuthCtx } from '../../contexts/AuthContext';
import { getOrCreateChatRoom } from '../../api/chat';
import axios from 'axios';

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

const PostDetailGrid = styled.div`
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

const MainImage = styled.div`
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1;
  background: #eee;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
`;

const MainImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  max-width: 400px;
  margin: 0 auto;
`;

const Thumbnail = styled.div`
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? '#007bff' : 'transparent'};
  overflow: hidden;
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
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
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
  padding: 1.5rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: #333;
  margin: 0;
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
  background: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

// 인증 토큰을 가져오는 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 백엔드 Enum(HIGH, MEDIUM, LOW)을 프론트엔드 텍스트(상, 중, 하)로 변환하는 헬퍼
const conditionMap = {
  'HIGH': '상',
  'MEDIUM': '중',
  'LOW': '하'
};

// 백엔드 Enum을 프론트엔드 텍스트로 변환하는 헬퍼
const statusMap = {
  'FOR_SALE': '판매중',
  'RESERVED': '예약중',
  'SOLD_OUT': '판매완료'
};

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
  if (discountRate <= 20) return { text: conditionMap.HIGH, color: '#28a745', bgColor: '#d4edda' };
  if (discountRate <= 40) return { text: conditionMap.MEDIUM, color: '#ffc107', bgColor: '#fff3cd' };
  return { text: conditionMap.LOW, color: '#dc3545', bgColor: '#f8d7da' };
};

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [showOtherBooks, setShowOtherBooks] = useState(false);

  // 컴포넌트가 처음 렌더링될 때 API를 호출하는 로직
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError(err);
        console.error("게시글 정보를 불러오는 데 실패했습니다.", err);
      } finally {
        setLoading(false);
      }
    };

      const fetchMyLikes = async () => {
      if (!localStorage.getItem('accessToken')) return;
      try {
        const response = await axios.get('/api/my/likes', { headers: getAuthHeader() });
        const likedIds = new Set(response.data.map(p => p.postId));
        setLiked(likedIds.has(parseInt(id)));
      } catch (error) {
        console.error("찜 목록을 불러오는 데 실패했습니다.", error);
      }
    };

    fetchPost();
    fetchMyLikes();
  }, [id]);

  // 찜하기/찜취소 핸들러
  const handleLikeToggle = async () => {
    if (!localStorage.getItem('accessToken')) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/login');
      return;
    }

    const newLikedState = !liked;
    setLiked(newLikedState); // UI 낙관적 업데이트

    try {
      if (newLikedState) {
        await axios.post(`/api/posts/${id}/like`, null, { headers: getAuthHeader() });
      } else {
        await axios.delete(`/api/posts/${id}/like`, { headers: getAuthHeader() });
      }
    } catch (error) {
      console.error("찜 처리 실패:", error);
      setLiked(!newLikedState); // API 실패 시 UI 원상 복구
      alert("오류가 발생했습니다.");
    }
  };

  const { user } = useContext(AuthCtx);

  const handleChat = async () => {
    try {
      const salePostId = id;           // 책 게시글 ID
      const buyerId = user?.id;        // ✅ 현재 로그인 사용자 ID 가져오기

      if (!buyerId) {
        alert('로그인이 필요합니다.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      console.log("🔥 accessToken:", token);
      console.log("✅ 현재 buyerId:", buyerId);

      const res = await fetch(`/api/chat/rooms?salePostId=${salePostId}&buyerId=${buyerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("🔥 fetch status:", res.status);
      const text = await res.text();
      console.log("🔥 response body:", text);

      if (!res.ok) throw new Error('채팅방 생성 실패!');
      const chatRoom = JSON.parse(text);

      navigate(`/chat/${chatRoom.id}`);

    } catch (err) {
      console.error(err);
      alert('채팅방 생성 실패!');
    }
  };

  const handleCall = () => {
    // 실제로는 전화 연결 로직
    alert('전화 연결 기능은 준비 중입니다.');
  };

  // 로딩 및 에러 처리
  if (loading) return <DetailContainer><h2>로딩 중...</h2></DetailContainer>;
  if (error || !post) return <DetailContainer><h2>게시글 정보를 불러올 수 없습니다.</h2></DetailContainer>;

  // 할인율 계산 로직
  const discountRate = post.originalPrice > 0 
    ? Math.round(((post.originalPrice - post.price) / post.originalPrice) * 100)
    : 0;

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

        <PostDetailGrid>
          <ImageSection>
            <MainImage>
              {post.postImageUrls && post.postImageUrls.length > 0 ? (
                <MainImageImg src={post.postImageUrls[selectedImageIndex]} alt={post.bookTitle} />
              ) : (
                <span>이미지 없음</span>
              )}
            </MainImage>
            {post.postImageUrls && post.postImageUrls.length > 1 && (
              <ThumbnailGrid>
                {post.postImageUrls.map((imageUrl, index) => (
                  <Thumbnail 
                    key={index} 
                    $active={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <ThumbnailImg src={imageUrl} alt={`${post.bookTitle} ${index + 1}`} />
                  </Thumbnail>
                ))}
              </ThumbnailGrid>
            )}
          </ImageSection>

          <InfoSection>
            <div>
              <BookTitle>
                {post.bookTitle}
                <LikeButton liked={liked} onClick={handleLikeToggle}>♥</LikeButton>
              </BookTitle>
              <BookAuthor>{post.author}</BookAuthor>
            </div>

            <PriceSection>
              <PriceLabel>판매 가격</PriceLabel>
              <Price>{post.price.toLocaleString()}원</Price>
              {post.originalPrice && (
                <>
                  <OriginalPrice>{post.originalPrice.toLocaleString()}원</OriginalPrice>
                  <DiscountRate>{discountRate}% 할인</DiscountRate>
                </>
              )}
            </PriceSection>

            <OverallConditionSection>
              <OverallConditionTitle>
                📊 전체 책 상태
              </OverallConditionTitle>
              <OverallConditionBadge 
                $bgColor={getBookCondition(post.discountRate).bgColor}
                $color={getBookCondition(post.discountRate).color}
              >
                {getBookCondition(post.discountRate).text}
              </OverallConditionBadge>
              <OverallConditionDescription>
                할인율 {post.discountRate}%에 따른 전체 상태 평가입니다.
                {post.discountRate <= 20 && ' 책이 양호한 상태입니다.'}
                {post.discountRate > 20 && post.discountRate <= 40 && ' 책이 보통 상태입니다.'}
                {post.discountRate > 40 && ' 책에 일부 손상이 있습니다.'}
              </OverallConditionDescription>
            </OverallConditionSection>

            <ConditionSection>
              <ConditionTitle>책 상태</ConditionTitle>
              <ConditionGrid>
                <ConditionItem>
                  <ConditionLabel>필기 상태</ConditionLabel>
                  <ConditionValue value={conditionMap[post.writingCondition]}>{conditionMap[post.writingCondition]}</ConditionValue>
                </ConditionItem>
                <ConditionItem>
                  <ConditionLabel>찢어짐 정도</ConditionLabel>
                  <ConditionValue value={conditionMap[post.tearCondition]}>{conditionMap[post.tearCondition]}</ConditionValue>
                </ConditionItem>
                <ConditionItem>
                  <ConditionLabel>물흘림 정도</ConditionLabel>
                  <ConditionValue value={conditionMap[post.waterCondition]}>{conditionMap[post.waterCondition]}</ConditionValue>
                </ConditionItem>
              </ConditionGrid>
            </ConditionSection>

            <BookInfoSection>
              <InfoTitle>추가 정보</InfoTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>가격 협의</InfoLabel>
                  <InfoValue>{post.negotiable ? '가능' : '불가능'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>등록일</InfoLabel>
                  <InfoValue>{new Date(post.createdAt).toLocaleDateString()}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>조회수</InfoLabel>
                  <InfoValue>{post.views}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </BookInfoSection>

            <BookInfoSection>
              <InfoTitle>책 정보</InfoTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>카테고리</InfoLabel>
                  <InfoValue>컴퓨터공학</InfoValue> {/* TODO: 카테고리 정보 DTO에 추가 필요 */}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>거래 지역</InfoLabel>
                  <InfoValue>교내</InfoValue> {/* TODO: 거래 지역 정보 DTO에 추가 필요 */}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>가격 협의</InfoLabel>
                  <InfoValue>{post.negotiable ? '가능' : '불가능'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>등록일</InfoLabel>
                  <InfoValue>{new Date(post.createdAt).toLocaleDateString()}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>조회수</InfoLabel>
                  <InfoValue>{post.views}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </BookInfoSection>

            <SellerSection>
              <SellerTitle><FaUser /> 판매자 정보</SellerTitle>
              <SellerInfo>
                <SellerAvatar>
                  {post.sellerProfileImageUrl ? (
                    <img src={post.sellerProfileImageUrl} alt={post.sellerNickname} />
                  ) : (
                    post.sellerNickname.charAt(0)
                  )}
                </SellerAvatar>
                <SellerDetails>
                  <SellerName>{post.sellerNickname}</SellerName>
                  {/* TODO: 판매자 위치, 평점, 판매횟수, 다른 책 등은 별도 기능 구현 후 DTO에 추가 필요 */}
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
        </PostDetailGrid>
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

export default PostDetail; 