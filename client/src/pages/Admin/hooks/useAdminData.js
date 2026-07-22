import { useState, useEffect, useCallback } from "react";
import { api } from "../../../lib/api";

export function useAdminDashboard(getToken) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      const [statsRes, activityRes] = await Promise.all([
        api.get("/api/admin/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/api/admin/dashboard/recent-activity", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, recentActivity, loading, error, refetch: fetchDashboardData };
}

export function useAdminUsers(getToken, enabled = true) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ role: "", search: "", status: "" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      const res = await api.get(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users);
      setPagination((prev) => ({ ...prev, total: res.data.total, totalPages: res.data.totalPages }));
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [getToken, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled) fetchUsers();
  }, [enabled, fetchUsers]);

  const updateUser = async (userId, data) => {
    const token = await getToken();
    const res = await api.patch(`/api/admin/users/${userId}`, data, { headers: { Authorization: `Bearer ${token}` } });
    setUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
    return res.data;
  };

  const deleteUser = async (userId) => {
    const token = await getToken();
    await api.delete(`/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return { users, loading, error, pagination, setPagination, filters, setFilters, updateUser, deleteUser, refetch: fetchUsers };
}

export function useAdminCourses(getToken, enabled = true) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", instructorId: "" });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      const res = await api.get(`/api/admin/courses?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(res.data.courses);
      setPagination((prev) => ({ ...prev, total: res.data.total, totalPages: res.data.totalPages }));
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [getToken, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled) fetchCourses();
  }, [enabled, fetchCourses]);

  const updateCourse = async (courseId, data) => {
    const token = await getToken();
    const res = await api.patch(`/api/admin/courses/${courseId}`, data, { headers: { Authorization: `Bearer ${token}` } });
    setCourses((prev) => prev.map((c) => (c.id === courseId ? res.data : c)));
    return res.data;
  };

  const deleteCourse = async (courseId) => {
    const token = await getToken();
    await api.delete(`/api/admin/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  return { courses, loading, error, pagination, setPagination, filters, setFilters, updateCourse, deleteCourse, refetch: fetchCourses };
}

export function useAdminInstructors(getToken, enabled = true) {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: "", status: "" });

  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      const res = await api.get(`/api/admin/instructors?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setInstructors(res.data.instructors);
      setPagination((prev) => ({ ...prev, total: res.data.total, totalPages: res.data.totalPages }));
    } catch (err) {
      setError(err.message || "Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }, [getToken, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled) fetchInstructors();
  }, [enabled, fetchInstructors]);

  const updateInstructor = async (instructorId, data) => {
    const token = await getToken();
    const res = await api.patch(`/api/admin/instructors/${instructorId}`, data, { headers: { Authorization: `Bearer ${token}` } });
    setInstructors((prev) => prev.map((i) => (i.id === instructorId ? res.data : i)));
    return res.data;
  };

  const deleteInstructor = async (instructorId) => {
    const token = await getToken();
    await api.delete(`/api/admin/instructors/${instructorId}`, { headers: { Authorization: `Bearer ${token}` } });
    setInstructors((prev) => prev.filter((i) => i.id !== instructorId));
  };

  return { instructors, loading, error, pagination, setPagination, filters, setFilters, updateInstructor, deleteInstructor, refetch: fetchInstructors };
}

export function useAdminAnalytics(getToken, enabled = true) {
  const [analytics, setAnalytics] = useState({
    revenue: { monthly: [], total: 0 },
    enrollments: { monthly: [], total: 0 },
    courses: { byCategory: [], completionRates: [] },
    users: { growth: [], byRole: {} },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const res = await api.get(`/api/admin/analytics?range=${timeRange}`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [getToken, timeRange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (enabled) fetchAnalytics();
  }, [enabled, fetchAnalytics]);

  return { analytics, loading, error, timeRange, setTimeRange, refetch: fetchAnalytics };
}
