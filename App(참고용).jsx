import React, { useState, useRef, useEffect } from 'react';

// --- 데이터 정의 ---
const capabilities = [
  {
    id: '01',
    category: 'OPERATION',
    title: '글로벌 라이브 서비스 운영',
    mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    desc: [
      'KR·EN·JP·TW·TH 5개 권역 라이브 서비스 운영 실무',
      '영어 전공 기반 현지 톤앤매너 맞춤 영문 공지·가이드·FAQ 직접 현지화',
      '글로벌 공식 SNS 채널 약 242건 게시물 운영'
    ]
  },
  {
    id: '02',
    category: 'DATA ANALYSIS',
    title: '데이터 기반 운영 분석',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    desc: [
      '포럼 이벤트 지표 대시보드 직접 구축·운영',
      'DAU·UV·VOC 정량 지표 분석으로 이벤트 운영 개선에 기여',
      'MBA 과정을 통한 SQL·Python·R 기반 데이터 분석 방법론 학습 및 실습 적용'
    ]
  },
  {
    id: '03',
    category: 'INSIGHT',
    title: 'VOC 분석 및 커뮤니티 인사이트',
    mediaUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    desc: [
      '글로벌 5개 권역 VOC를 유형별·감성별로 정량화',
      '세븐나이츠2 업데이트 분석 리포트로 팀 내 긍정 평가',
      '유저 인사이트를 사업팀 공유 자료로 구조화'
    ]
  },
  {
    id: '04',
    category: 'RISK MGT',
    title: '사전 리스크 검토 및 리포팅',
    mediaUrl: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&q=80&w=800',
    desc: [
      '신규 파이터 출시 전 메타 부적합 리스크 감지 및 의견 제시',
      '콜라보 BM 보상 구조 검토 의견 반영 사례 보유',
      '라이브 운영 기간 내 운영 사고 0건 유지'
    ]
  },
  {
    id: '05',
    category: 'PROCESS',
    title: '운영 프로세스 개선 제안',
    mediaUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    desc: [
      '운영툴 기능 개선 25건 제안, 핵심 항목 실제 반영',
      '포럼 기능 개선 제안 4건 중 1건 실적용',
      'SNS 운영 실무 가이드 제작으로 팀 내 업무 표준화에 기여'
    ]
  },
  {
    id: '06',
    category: 'AI AUTOMATION',
    title: 'AI 활용 업무 자동화',
    mediaUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
    desc: [
      'Make·n8n·Gemini API 기반 AI 뉴스레터(AIGS TIMES) 자동화 구축 (44호+ 발행)',
      'SNS 게시물 디스크립션·해시태그 자동 생성으로 콘텐츠 작성 시간 단축',
      '공지 초안·FAQ 템플릿 자동화로 반복 업무 효율화'
    ]
  }
];

// --- 3D 공간 배치 좌표 (카드들이 떠 있을 고유 위치) - 간격 대폭 확대 ---
const spatialPositions = [
  { x: -480, y: -240, z: -300, rotY: 15,  rotX: 5 },  // 1. 좌상단 (뒤)
  { x: 0,    y: -320, z: -500, rotY: 0,   rotX: 10 }, // 2. 중앙상단 (가장 뒤)
  { x: 480,  y: -240, z: -300, rotY: -15, rotX: 5 },  // 3. 우상단 (뒤)
  { x: -420, y: 220,  z: -50,  rotY: 20,  rotX: -5 }, // 4. 좌하단 (중간)
  { x: 0,    y: 280,  z: 150,  rotY: 0,   rotX: -10 },// 5. 중앙하단 (가장 앞)
  { x: 420,  y: 220,  z: -50,  rotY: -20, rotX: -5 }, // 6. 우하단 (중간)
];

// --- 3D 인터랙티브 카드 컴포넌트 ---
const InteractiveCard = ({ data, index, isGridVisible, hoveredIndex, setHoveredIndex }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const isHovered = hoveredIndex === index;
  const anyHovered = hoveredIndex !== null;
  const pos = spatialPositions[index];

  const handleMouseMove = (e) => {
    // 선택되어 앞으로 튀어나온 상태에서만 마우스 틸트 반응
    if (!isHovered || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  // 상태별 3D Transform 계산
  // 1. 초기 진입 전 상태 (화면 밖 저 멀리)
  const initialTransform = `translate(-50%, -50%) translate3d(0px, 400px, -1500px) rotateX(30deg) rotateY(${index % 2 === 0 ? 30 : -30}deg)`;
  
  // 2. 기본 공간 배치 상태 (각자의 위치에서 둥둥 떠있음)
  const baseTransform = `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg)`;
  
  // 3. 마우스 호버 시 중앙 앞으로 튀어나오는 상태
  const hoveredTransform = `translate(-50%, -50%) translate3d(0px, 0px, 300px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.15)`;
  
  // 4. 다른 카드가 호버되었을 때 배경으로 밀려나는 상태
  const pushedBackTransform = `translate(-50%, -50%) translate3d(${pos.x * 1.5}px, ${pos.y * 1.5}px, ${pos.z - 500}px) rotateX(${pos.rotX}deg) rotateY(${pos.rotY}deg)`;

  let currentTransform = baseTransform;
  if (!isGridVisible) currentTransform = initialTransform;
  else if (isHovered) currentTransform = hoveredTransform;
  else if (anyHovered) currentTransform = pushedBackTransform;

  // 트랜지션 딜레이: 화면 첫 등장 시에만 파도치듯 딜레이 적용
  const transitionDelay = !isGridVisible && !anyHovered ? `${index * 80}ms` : '0ms';

  return (
    <div 
      className={`absolute left-1/2 top-1/2 w-[320px] h-[400px] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isHovered ? 'z-50' : 'z-10'}`}
      style={{ 
        transform: currentTransform,
        transitionDelay: transitionDelay,
        transformStyle: 'preserve-3d',
        opacity: isGridVisible ? (anyHovered && !isHovered ? 0.3 : 1) : 0,
        filter: anyHovered && !isHovered ? 'blur(4px)' : 'blur(0px)'
      }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => {
        setHoveredIndex(null);
        setRotation({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      {/* 플로팅 애니메이션 래퍼 (선택 시에는 플로팅 정지) */}
      <div 
        className={`w-full h-full ${!anyHovered && isGridVisible ? 'animate-floating' : ''}`}
        style={{ animationDelay: `${index * 0.15}s`, transformStyle: 'preserve-3d' }}
      >
        {/* 카드 본체 */}
        <div
          ref={cardRef}
          className={`relative w-full h-full rounded-2xl p-8 overflow-hidden cursor-pointer flex flex-col justify-start border bg-white/90 backdrop-blur-md transition-shadow duration-500 ${
            isHovered 
              ? 'border-transparent shadow-[0_30px_60px_rgba(251,146,60,0.3)]' 
              : 'border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 상단 액센트 라인 */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500 transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`} />

          {/* 미디어 배경 */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-700 ease-in-out ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-gray-900/80 z-10 transition-opacity duration-500 mix-blend-multiply" />
            <img src={data.mediaUrl} alt="background" className={`w-full h-full object-cover transition-transform duration-[15s] ease-linear ${isHovered ? 'scale-125' : 'scale-100'}`} />
          </div>
          
          {/* 배경 숫자 */}
          <div 
            className="absolute right-[-5%] top-[0%] z-0 font-black text-[10rem] leading-none select-none transition-all duration-700 ease-out pointer-events-none"
            style={{
              transform: isHovered ? `translateZ(60px) translateX(${rotation.y * -2}px) translateY(${rotation.x * 2}px)` : 'translateZ(0px)',
              WebkitTextStroke: isHovered ? '0px transparent' : '2px rgba(209, 213, 219, 0.4)',
              color: isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
            }}
          >
            {data.id}
          </div>

          {/* 컨텐츠 영역 */}
          <div className="relative z-10 flex flex-col h-full pointer-events-none" style={{ transform: 'translateZ(30px)' }}>
            <span className={`inline-block px-3 py-1 text-[0.65rem] font-black tracking-widest rounded-full w-max mb-4 transition-colors duration-300 ${
              isHovered ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-100 text-gray-500'
            }`}>
              {data.category}
            </span>

            <h3 className={`text-xl font-bold mb-6 tracking-tight transition-colors duration-300 ${isHovered ? 'text-white' : 'text-gray-900'}`}>
              {data.title}
            </h3>
            
            <ul className="flex-1 flex flex-col gap-3.5">
              {data.desc.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-2 block w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300 ${
                    isHovered ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'bg-gray-300'
                  }`} />
                  <span className={`text-sm leading-relaxed transition-colors duration-300 ${
                    isHovered ? 'text-gray-200' : 'text-gray-600'
                  }`}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="absolute bottom-0 right-0 overflow-hidden w-8 h-8 flex items-center justify-center">
              <span className={`text-xl transition-all duration-300 transform ${isHovered ? 'translate-x-full -translate-y-full opacity-0' : 'translate-x-0 translate-y-0 opacity-100 text-gray-300'}`}>+</span>
              <span className={`absolute text-xl transition-all duration-300 transform ${isHovered ? 'translate-x-0 translate-y-0 opacity-100 text-orange-400' : '-translate-x-full translate-y-full opacity-0'}`}>↗</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Gemini API 기반 AI 챗봇 컴포넌트 (변경 없음) ---
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: '안녕하세요! Kevin의 AI 어시스턴트입니다. 제 포트폴리오나 핵심 역량에 대해 궁금한 점이 있으신가요?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const apiKey = ""; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const systemPrompt = `너는 Kevin Im의 포트폴리오를 안내하는 친절하고 똑똑한 AI 챗봇이야. 방문자가 Kevin의 역량에 대해 물어보면 다음 정보를 바탕으로 답변해줘: ${JSON.stringify(capabilities)}. 방문자에게 Kevin을 긍정적으로 어필하고, 답변은 너무 길지 않게 2~3문장 이내의 한국어로 자연스럽게 작성해.`;

    try {
      let retries = 5;
      let delay = 1000;
      let data = null;
      
      while (retries > 0) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userMsg }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          });
          if (!response.ok) throw new Error('API Request Failed');
          data = await response.json();
          break;
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(res => setTimeout(res, delay));
          delay *= 2;
        }
      }

      const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "죄송합니다. 현재 응답할 수 없습니다.";
      setMessages(prev => [...prev, { role: 'model', text: botReply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 sm:w-96 h-[400px] mb-4 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">
          <div className="bg-black text-white p-4 flex justify-between items-center font-bold">
            <span className="flex items-center gap-2">Ask Kevin AI <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /></span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 text-xl leading-none">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-orange-500 text-white self-end rounded-tr-sm shadow-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-gray-200 text-gray-500 self-start p-3 rounded-2xl rounded-tl-sm text-sm flex gap-1.5 items-center shadow-sm">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Kevin의 AI 관련 역량이 뭐야?"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()} 
              className="bg-black text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-black/20 flex items-center gap-2 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-105 hover:-translate-y-1'
        }`}
      >
        <span className="text-xl">💬</span> Ask Kevin
      </button>
    </div>
  );
};

// --- 메인 App 컴포넌트 ---
export default function App() {
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null); // 호버된 카드 추적용 상태
  const gridRef = useRef(null);

  // 스크롤 감지: 영역에 진입/이탈할 때마다 상태 업데이트
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsGridVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } 
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-[#f4f5f7] font-sans overflow-x-hidden">
      
      {/* 스타일 태그 */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .bg-pattern {
          background-image: radial-gradient(#d1d5db 1px, transparent 1px);
          background-size: 24px 24px;
        }

        /* 둥둥 떠다니는 호버링 애니메이션 추가 */
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-floating {
          animation: floating 4s ease-in-out infinite;
        }
      `}} />

      {/* 왼쪽 사이드바 */}
      <aside className="w-64 bg-[#111111] text-white flex flex-col justify-between hidden md:flex flex-shrink-0 z-30 fixed h-screen">
        <div className="p-10">
          <h1 className="text-3xl font-black tracking-wider mb-16 uppercase">Kevin Im</h1>
          <nav className="flex flex-col gap-6 text-sm font-bold tracking-widest text-gray-400">
            <a href="#" className="hover:text-white transition-colors">HOME</a>
            <a href="#" className="hover:text-white transition-colors">ABOUT</a>
            <a href="#" className="hover:text-white transition-colors">STORY</a>
            <a href="#" className="text-white border-b-2 border-orange-500 pb-1 w-max">CAPABILITIES</a>
            <a href="#" className="hover:text-white transition-colors">EXPERIENCE</a>
            <a href="#" className="hover:text-white transition-colors">PROJECTS</a>
            <a href="#" className="hover:text-white transition-colors">METRICS</a>
            <a href="#" className="hover:text-white transition-colors">SKILLS</a>
            <a href="#" className="hover:text-white transition-colors">CONTACT</a>
          </nav>
        </div>
        <div className="p-8 text-xs text-gray-500">
          <p>© 2026 Kevin Im.<br/>All rights reserved.</p>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 md:ml-64 relative bg-pattern min-h-screen">
        
        {/* 인트로(Hero) 섹션: 텍스트 삭제 및 간결화 */}
        <div className="h-screen w-full flex flex-col items-center justify-center text-center px-4 relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 text-sm font-bold tracking-widest mb-6 bg-white/50 backdrop-blur-sm">
            SCROLL TO EXPLORE
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">
            Discover My <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Capabilities</span>
          </h1>
          
          <div className="absolute bottom-16 w-8 h-12 border-2 border-gray-400 rounded-full flex justify-center p-1">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce mt-1"></div>
          </div>
        </div>

        {/* 역량(Capabilities) 3D 갤러리 섹션 */}
        <div ref={gridRef} className="w-full mx-auto px-4 md:px-16 lg:px-24 py-20 min-h-screen relative overflow-hidden flex flex-col items-center">
          <div className="mb-20 w-full max-w-7xl z-20 pointer-events-none">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <span className="w-12 h-1.5 bg-orange-500 inline-block"></span>
              CORE CAPABILITIES
            </h2>
            <p className="mt-6 text-lg text-gray-500 font-medium tracking-wide">
              데이터와 유저의 목소리를 기반으로 글로벌 서비스의 성장을 이끕니다.
            </p>
          </div>

          {/* 3D 씬 컨테이너: 기존 그리드 대신 하나의 입체 공간으로 통합 */}
          <div 
            className="relative w-full h-[850px] mt-10"
            style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
          >
            {/* 반응형 크기 조절을 위한 내부 래퍼 (넓어진 간격에 맞춰 스케일 세밀 조정) */}
            <div 
              className="absolute inset-0 flex items-center justify-center transform scale-[0.55] sm:scale-75 lg:scale-90 xl:scale-100"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {capabilities.map((cap, index) => (
                <InteractiveCard 
                  key={cap.id} 
                  data={cap} 
                  index={index} 
                  isGridVisible={isGridVisible}
                  hoveredIndex={hoveredIndex}
                  setHoveredIndex={setHoveredIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
}