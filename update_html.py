import re

def update_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Replace cap-grid with the 3D scene HTML
    new_scene = '''      <!-- 3D 갤러리 씬 -->
      <div class="cap-3d-scene" id="cap-3d-scene">
        <div class="cap-3d-wrapper" id="cap-3d-wrapper">
          <!-- 01 -->
          <div class="cap-3d-card" data-index="0">
            <div class="cap-3d-float">
              <div class="cap-3d-inner">
                <div class="cap-3d-accent"></div>
                <div class="cap-3d-bg">
                  <div class="cap-3d-overlay"></div>
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" alt="OS">
                </div>
                <div class="cap-3d-number">01</div>
                <div class="cap-3d-content">
                  <span class="cap-3d-category">OPERATION</span>
                  <h3 class="cap-3d-title">글로벌 라이브 서비스 운영</h3>
                  <ul class="cap-3d-list">
                    <li><span></span><p>KR·EN·JP·TW·TH 5개 권역 라이브 서비스 운영 실무</p></li>
                    <li><span></span><p>영어 전공 기반 현지 톤앤매너 맞춤 영문 공지·가이드·FAQ 직접 현지화</p></li>
                    <li><span></span><p>글로벌 공식 SNS 채널 약 242건 게시물 운영</p></li>
                  </ul>
                  <div class="cap-3d-plus"><span class="i-plus">+</span><span class="i-arr">↗</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 02 -->
          <div class="cap-3d-card" data-index="1">
            <div class="cap-3d-float">
              <div class="cap-3d-inner">
                <div class="cap-3d-accent"></div>
                <div class="cap-3d-bg">
                  <div class="cap-3d-overlay"></div>
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800" alt="Data">
                </div>
                <div class="cap-3d-number">02</div>
                <div class="cap-3d-content">
                  <span class="cap-3d-category">DATA ANALYSIS</span>
                  <h3 class="cap-3d-title">데이터 기반 운영 분석</h3>
                  <ul class="cap-3d-list">
                    <li><span></span><p>포럼 이벤트 지표 대시보드 직접 구축·운영</p></li>
                    <li><span></span><p>DAU·UV·VOC 정량 지표 분석으로 이벤트 운영 개선에 기여</p></li>
                    <li><span></span><p>MBA 과정을 통한 SQL·Python·R 기반 데이터 분석 방법론 학습 및 실습 적용</p></li>
                  </ul>
                  <div class="cap-3d-plus"><span class="i-plus">+</span><span class="i-arr">↗</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 03 -->
          <div class="cap-3d-card" data-index="2">
            <div class="cap-3d-float">
              <div class="cap-3d-inner">
                <div class="cap-3d-accent"></div>
                <div class="cap-3d-bg">
                  <div class="cap-3d-overlay"></div>
                  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" alt="Insight">
                </div>
                <div class="cap-3d-number">03</div>
                <div class="cap-3d-content">
                  <span class="cap-3d-category">INSIGHT</span>
                  <h3 class="cap-3d-title">VOC 분석 및 커뮤니티 인사이트</h3>
                  <ul class="cap-3d-list">
                    <li><span></span><p>글로벌 5개 권역 VOC를 유형별·감성별로 정량화</p></li>
                    <li><span></span><p>세븐나이츠2 업데이트 분석 리포트로 팀 내 긍정 평가</p></li>
                    <li><span></span><p>유저 인사이트를 사업팀 공유 자료로 구조화</p></li>
                  </ul>
                  <div class="cap-3d-plus"><span class="i-plus">+</span><span class="i-arr">↗</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 04 -->
          <div class="cap-3d-card" data-index="3">
            <div class="cap-3d-float">
              <div class="cap-3d-inner">
                <div class="cap-3d-accent"></div>
                <div class="cap-3d-bg">
                  <div class="cap-3d-overlay"></div>
                  <img src="https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&q=80&w=800" alt="Risk">
                </div>
                <div class="cap-3d-number">04</div>
                <div class="cap-3d-content">
                  <span class="cap-3d-category">RISK MGT</span>
                  <h3 class="cap-3d-title">사전 리스크 검토 및 리포팅</h3>
                  <ul class="cap-3d-list">
                    <li><span></span><p>신규 파이터 출시 전 메타 부적합 리스크 감지 및 의견 제시</p></li>
                    <li><span></span><p>콜라보 BM 보상 구조 검토 의견 반영 사례 보유</p></li>
                    <li><span></span><p>라이브 운영 기간 내 운영 사고 0건 유지</p></li>
                  </ul>
                  <div class="cap-3d-plus"><span class="i-plus">+</span><span class="i-arr">↗</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 05 -->
          <div class="cap-3d-card" data-index="4">
            <div class="cap-3d-float">
              <div class="cap-3d-inner">
                <div class="cap-3d-accent"></div>
                <div class="cap-3d-bg">
                  <div class="cap-3d-overlay"></div>
                  <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800" alt="Process">
                </div>
                <div class="cap-3d-number">05</div>
                <div class="cap-3d-content">
                  <span class="cap-3d-category">PROCESS</span>
                  <h3 class="cap-3d-title">운영 프로세스 개선 제안</h3>
                  <ul class="cap-3d-list">
                    <li><span></span><p>운영툴 기능 개선 25건 제안, 핵심 항목 실제 반영</p></li>
                    <li><span></span><p>포럼 기능 개선 제안 4건 중 1건 실적용</p></li>
                    <li><span></span><p>SNS 운영 실무 가이드 제작으로 팀 내 업무 표준화에 기여</p></li>
                  </ul>
                  <div class="cap-3d-plus"><span class="i-plus">+</span><span class="i-arr">↗</span></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 06 -->
          <div class="cap-3d-card" data-index="5">
            <div class="cap-3d-float">
              <div class="cap-3d-inner">
                <div class="cap-3d-accent"></div>
                <div class="cap-3d-bg">
                  <div class="cap-3d-overlay"></div>
                  <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800" alt="AI">
                </div>
                <div class="cap-3d-number">06</div>
                <div class="cap-3d-content">
                  <span class="cap-3d-category">AI AUTOMATION</span>
                  <h3 class="cap-3d-title">AI 활용 업무 자동화</h3>
                  <ul class="cap-3d-list">
                    <li><span></span><p>Make·n8n·Gemini 기반 AI 뉴스레터(AiGS TIMES) 자동화 구축</p></li>
                    <li><span></span><p>SNS 게시물 디스크립션·해시태그 자동 생성으로 작성 시간 단축</p></li>
                    <li><span></span><p>공지 초안·FAQ 템플릿 자동화로 반복 업무 효율화</p></li>
                  </ul>
                  <div class="cap-3d-plus"><span class="i-plus">+</span><span class="i-arr">↗</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>'''

    html = re.sub(r'<div class="cap-grid">[\s\S]*?<!-- ── EXPERIENCE ── -->', new_scene + '\n    </div>\n  </section>\n\n  <!-- ── EXPERIENCE ── -->', html)

    chatbot_html = '''
<!-- ── CHATBOT WIDGET ── -->
<div class="chatbot-widget" id="chatbot-widget">
  <div class="chatbot-window" id="chatbot-window">
    <div class="chatbot-header">
      <div class="chatbot-title">
        Ask Kevin AI <span class="status-dot"></span>
      </div>
      <button class="chatbot-close" id="cb-close">&times;</button>
    </div>
    <div class="chatbot-messages" id="cb-messages">
      <div class="cb-msg-row cb-bot">
        <div class="cb-bubble">안녕하세요! Kevin의 AI 어시스턴트입니다. 제 포트폴리오나 핵심 역량에 대해 궁금한 점이 있으신가요?</div>
      </div>
    </div>
    <div class="chatbot-input-area">
      <input type="text" id="cb-input" placeholder="Kevin의 AI 역량이 뭐야?" />
      <button id="cb-send">↑</button>
    </div>
  </div>
  <button class="chatbot-toggle" id="cb-toggle">
    <span class="icon">💬</span> Ask Kevin
  </button>
</div>
'''
    html = html.replace('</main>', '</main>\n' + chatbot_html)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    update_html()
