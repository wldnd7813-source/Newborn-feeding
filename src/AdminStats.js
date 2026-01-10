import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminStats() {
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 오늘 날짜 시작 시간
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 오늘 방문자 수
      const { count: todayVisitors, error: todayError } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', today.toISOString());

      if (todayError) throw todayError;

      // 전체 방문자 수
      const { count: totalVisitors, error: totalError } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      setTodayCount(todayVisitors || 0);
      setTotalCount(totalVisitors || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-stats">
      <div className="stat-card">
        <div className="stat-icon">📅</div>
        <div className="stat-content">
          <div className="stat-label">오늘 방문자</div>
          <div className="stat-value">{loading ? '...' : todayCount}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <div className="stat-label">누적 방문자</div>
          <div className="stat-value">{loading ? '...' : totalCount}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;