import React, { useState, useEffect } from 'react';
import './App.css';
import Calculator from './Calculator';
import Suggestions from './Suggestions';
import FluidCalculator from './FluidCalculator';
import { supabase } from './supabaseClient';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('calculator');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 방문 기록 저장
    const trackVisit = async () => {
      try {
        await supabase
          .from('visitors')
          .insert([
            { user_agent: navigator.userAgent }
          ]);
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  const enableAdminMode = () => {
    setIsAdmin(true);
  };

  const disableAdminMode = () => {
    setIsAdmin(false);
  };

  return (
    <div className={`app ${isAdmin ? 'admin-mode' : ''}`}>
      {/* 햄버거 메뉴 버튼 */}
      <button 
        className="hamburger-btn" 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="메뉴"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* 관리자 모드 표시 */}
      {isAdmin && (
        <div className="admin-badge" onClick={disableAdminMode}>
          👑 관리자 모드 (클릭하여 해제)
        </div>
      )}

      {/* 사이드 메뉴 */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>메뉴</h2>
        </div>
        <nav className="menu-list">
          <button
            className={currentPage === 'calculator' ? 'active' : ''}
            onClick={() => navigateTo('calculator')}
          >
            🍼 신생아 수유량 계산기
          </button>
          <button
            className={currentPage === 'ivfluid' ? 'active' : ''}
            onClick={() => navigateTo('ivfluid')}
          >
            💉 수액량 계산기
          </button>
          <button
            className={currentPage === 'suggestions' ? 'active' : ''}
            onClick={() => navigateTo('suggestions')}
          >
            💡 개선사항
          </button>
        </nav>
      </div>

      {/* 메뉴 열렸을 때 배경 오버레이 */}
      {menuOpen && (
        <div 
          className="overlay" 
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="main-content">
        {currentPage === 'calculator' && (
          <Calculator onNavigate={navigateTo} onAdminMode={enableAdminMode} isAdmin={isAdmin} />
        )}
        {currentPage === 'ivfluid' && (
          <FluidCalculator />
        )}
        {currentPage === 'suggestions' && (
          <Suggestions isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}

export default App;