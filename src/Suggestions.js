import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function Suggestions({ isAdmin }) {
  const [view, setView] = useState('list');
  const [suggestions, setSuggestions] = useState([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // 개선사항 불러오기
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          comments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      alert('개선사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 처음 로드시 데이터 가져오기
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // 글쓰기
  const handleWrite = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .insert([
          {
            title: title.trim(),
            content: content.trim()
          }
        ]);

      if (error) throw error;

      setTitle('');
      setContent('');
      setView('list');
      fetchSuggestions(); // 목록 새로고침
      alert('개선사항이 등록되었습니다!');
    } catch (error) {
      console.error('Error creating suggestion:', error);
      alert('개선사항 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 상세보기
  const handleItemClick = async (suggestion) => {
    setLoading(true);
    try {
      // 댓글 포함해서 다시 불러오기
      const { data, error } = await supabase
        .from('suggestions')
        .select(`
          *,
          comments (*)
        `)
        .eq('id', suggestion.id)
        .single();

      if (error) throw error;
      setCurrentSuggestion(data);
      setView('detail');
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      alert('개선사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setView('list');
      fetchSuggestions();
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 작성
  const handleAddComment = async () => {
    if (!comment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            suggestion_id: currentSuggestion.id,
            text: comment.trim(),
            is_admin: true
          }
        ]);

      if (error) throw error;

      setComment('');
      // 상세 정보 다시 불러오기
      handleItemClick(currentSuggestion);
      alert('댓글이 등록되었습니다!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // 상세 정보 다시 불러오기
      handleItemClick(currentSuggestion);
      alert('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷
  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className="container">
      <header>
        <div className="header-icon">💡</div>
        <h1>개선사항</h1>
      </header>

      {loading && <div className="loading">로딩 중...</div>}

      {/* 목록 화면 */}
      {view === 'list' && (
        <>
          <div className="suggestions-header">
            <h2>개선사항 목록</h2>
            <button 
              className="write-btn"
              onClick={() => setView('write')}
              disabled={loading}
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
                      <span className="date">{formatDate(s.created_at)}</span>
                      {s.comments && s.comments.length > 0 && (
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
                      disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button 
              className="cancel-btn"
              onClick={() => {
                setTitle('');
                setContent('');
                setView('list');
              }}
              disabled={loading}
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
              disabled={loading}
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
              작성일: {formatDate(currentSuggestion.created_at)}
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="comments-section">
            <h3>💬 댓글 ({currentSuggestion.comments?.length || 0})</h3>
            
            {currentSuggestion.comments?.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">
                    {c.is_admin && '👑'} 관리자
                  </span>
                  <span className="comment-date">{formatDate(c.created_at)}</span>
                </div>
                <div className="comment-text">{c.text}</div>
                {isAdmin && (
                  <button 
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(c.id)}
                    disabled={loading}
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
                  disabled={loading}
                />
                <button onClick={handleAddComment} disabled={loading}>
                  댓글 작성
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Suggestions;