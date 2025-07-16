import React, { useState } from "react";

const OPTIONS = [
  { label: "책을 어떻게 등록하나요?", answer: "책 등록은 '책 거래 게시판'에서 '책 등록' 버튼을 눌러 진행할 수 있습니다." },
  { label: "거래는 어떻게 하나요?", answer: "관심 있는 책의 게시글에서 판매자와 채팅 또는 연락처로 거래를 진행하세요." },
  { label: "지도에서 거래장소를 어떻게 찾나요?", answer: "상단 메뉴의 '지도'를 클릭하면, 거래 가능한 장소가 지도에 표시됩니다. 원하는 장소를 클릭해 상세 정보를 확인할 수 있습니다." },
  { label: "지도에 내 위치가 안 나와요.", answer: "브라우저 위치 권한이 허용되어 있는지 확인해 주세요. 위치 권한이 꺼져 있으면 내 위치가 표시되지 않습니다." },
  { label: "지도에서 거래장소를 추가할 수 있나요?", answer: "현재는 거래장소 추가 기능을 지원하지 않습니다. 공식 거래장소만 이용해 주세요." },
  { label: "나의 거래 내역은 어디서 볼 수 있나요?", answer: "'나의 거래' 메뉴에서 내역을 확인할 수 있습니다." },
  { label: "비밀번호를 잊어버렸어요.", answer: "로그인 화면의 '비밀번호 찾기'를 이용해 주세요." },
  { label: "회원가입/탈퇴는 어떻게 하나요?", answer: "회원가입은 로그인 화면에서, 탈퇴는 '마이페이지'에서 가능합니다." },
  { label: "학과 공지사항을 보고 싶어요.", answer: "현재 학과 공지사항 자동 제공 기능은 지원하지 않습니다. 학교 홈페이지를 참고해 주세요." },
  { label: "학교생활 관련 정보가 궁금해요.", answer: "학식, 동아리, 시설 이용 등은 학교 공식 홈페이지 또는 커뮤니티를 참고해 주세요." },
];

function ChatBotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 궁금한 점을 선택하거나 직접 입력해 주세요." }
  ]);
  const [input, setInput] = useState("");

  const handleOptionClick = (option) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: option.label },
      { sender: "bot", text: option.answer }
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input },
      { sender: "bot", text: "죄송해요, 해당 질문에 대한 답변은 준비 중입니다. 선택지에서 골라보세요!" }
    ]);
    setInput("");
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, border: "1px solid #ddd", borderRadius: 12, background: "#fff" }}>
      <h2>AI 챗봇 도움말</h2>
      <div style={{ minHeight: 200, marginBottom: 16, background: "#f9f9f9", padding: 12, borderRadius: 8 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "bot" ? "left" : "right", margin: "8px 0" }}>
            <b>{msg.sender === "bot" ? "챗봇" : "나"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {OPTIONS.map((option, idx) => (
          <button key={idx} onClick={() => handleOptionClick(option)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #aaa", background: "#f3f3f3", cursor: "pointer" }}>{option.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="직접 질문해보세요!"
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button onClick={handleSend} style={{ padding: "8px 16px", borderRadius: 6, background: "#1976d2", color: "#fff", border: "none" }}>전송</button>
      </div>
    </div>
  );
}

export default ChatBotPage; 