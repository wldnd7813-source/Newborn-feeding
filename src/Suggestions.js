import React, { useState } from 'react';

function Suggestions({ isAdmin }) {
  const [view, setView] = useState('list'); // 'list', 'write', 'detail'
  const [suggestions, setSuggestions] = useState([
    { 
      id: 1, 
      title: '예시 개선사항', 
      content: '이것은 예시 게시글입니다.', 
      date: '2025-01-10',
      comments: []
    }
  ]);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');

  const handleWrite = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const newSuggestion = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      comments: []
    };

    setSuggestions([newSuggestion, ...suggestions]);
    setTitle('');
    setContent('');
    setView('list');
  };

  const handleItemClick = (suggestion) => {
    setCurrentSuggestion(suggestion);
    setView('detail');
  };

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setSuggestions(suggestions.filter(s => s.id !== id));
      setView('list');
    }
  };

  const handleAddComment = () => {
    if (!comment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    const updatedSuggestions = suggestions.map(s => {
      if (s.id === currentSuggestion.id) {
        return {
          ...s,
          comments: [
            ...s.comments,
            {
              id: Date.now(),
              text: comment.trim(),
              date: new Date().toISOString().split('T')[0],
              isAdmin: true
            }
          ]
        };
      }
      return s;
    });

    setSuggestions(updatedSuggestions);
    setCurrentSuggestion(updatedSuggestions.find(s => s.id === currentSuggestion.id));
    setComment('');
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      const updatedSuggestions = suggestions.map(s => {
        if (s.id === currentSuggestion.id) {
          return {
            ...s,
            comments: s.comments.filter(c => c.id !== commentId)
          };
        }
        return s;
      });

      setSuggestions(updatedSuggestions);
      setCurrentSuggestion(updatedSuggestions.find(s => s.id === currentSuggestion.id));
    }
  };

  return (
    <div className="container">
      <header>
        <div className="header-icon">💡</div>
        <h1>개선사항</h1>
      </header>

      {/* 목록 화면 */}
      {view === 'list' && (
        <>
          <div className="suggestions-header">
            <h2>개선사항 목록</h2>
            <button 
              className="write-btn"
              onClick={() => setView('write')}
            >
              ✏️ 글쓰기
            </button>
          </div>

          <div className="suggestions-list">
            {suggestions.length === 0 ? (
              <div className="empty-state">
                <p>아직 등록된 개선사항이 없습니다.</p>
                <button onClick={() => setView('write')}>첫 개선사항 작성하기</button>
              </div>
            ) : (
              suggestions.map(s => (
                <div key={s.id} className="suggestion-item-wrapper">
                  <div 
                    className="suggestion-item"
                    onClick={() => handleItemClick(s)}
                  >
                    <h3>{s.title}</h3>
                    <p>{s.content.substring(0, 50)}{s.content.length > 50 ? '...' : ''}</p>
                    <div className="item-footer">
                      <span className="date">{s.date}</span>
                      {s.comments.length > 0 && (
                        <span className="comment-count">💬 {s.comments.length}</span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(s.id);
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 글쓰기 화면 */}
      {view === 'write' && (
        <>
          <div className="suggestions-header">
            <h2>개선사항 작성</h2>
            <button 
              className="submit-btn"
              onClick={handleWrite}
            >
              ✅ 작성
            </button>
          </div>

          <div className="card">
            <div className="input-group">
              <label>
                제목
                <span className="label-badge">필수</span>
              </label>
              <input 
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>
                내용
                <span className="label-badge">필수</span>
              </label>
              <textarea 
                placeholder="개선사항 내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="10"
              />
            </div>

            <button 
              className="cancel-btn"
              onClick={() => {
                setTitle('');
                setContent('');
                setView('list');
              }}
            >
              취소
            </button>
          </div>
        </>
      )}

      {/* 상세보기 화면 */}
      {view === 'detail' && currentSuggestion && (
        <>
          <div className="suggestions-header">
            <h2>개선사항 상세</h2>
            <button 
              className="back-btn"
              onClick={() => setView('list')}
            >
              ← 뒤로가기
            </button>
          </div>

          <div className="card">
            <div className="input-group">
              <label>제목</label>
              <input 
                type="text"
                value={currentSuggestion.title}
                disabled
              />
            </div>

            <div className="input-group">
              <label>내용</label>
              <textarea 
                value={currentSuggestion.content}
                disabled
                rows="10"
              />
            </div>

            <div className="detail-date">
              작성일: {currentSuggestion.date}
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="comments-section">
            <h3>💬 댓글 ({currentSuggestion.comments.length})</h3>
            
            {currentSuggestion.comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">
                    {c.isAdmin && '👑'} 관리자
                  </span>
                  <span className="comment-date">{c.date}</span>
                </div>
                <div className="comment-text">{c.text}</div>
                {isAdmin && (
                  <button 
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(c.id)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}

            {isAdmin && (
              <div className="comment-write">
                <textarea 
                  placeholder="관리자 댓글을 입력하세요..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                />
                <button onClick={handleAddComment}>댓글 작성</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Suggestions;