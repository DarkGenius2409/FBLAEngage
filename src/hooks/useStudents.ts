import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Student, StudentUpdate, StudentWithRelations } from '@/lib/models';

export function useStudent(studentId: string | null) {
  const [student, setStudent] = useState<StudentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setStudent(null);
      setLoading(false);
      return;
    }

    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          *,
          school:schools!school_id(*),
          school_roles:school_roles(*)
        `)
        .eq('id', studentId)
        .single();

      if (fetchError) throw fetchError;

      setStudent(data as StudentWithRelations);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch student'));
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (updates: StudentUpdate) => {
    if (!studentId) return { data: null, error: new Error('No student ID provided') };

    try {
      const { data, error: updateError } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select(`
          *,
          school:schools!school_id(*),
          school_roles:school_roles(*)
        `)
        .single();

      if (updateError) throw updateError;

      if (data) {
        setStudent(data as StudentWithRelations);
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update student');
      console.error('Error updating student:', err);
      return { data: null, error };
    }
  };

  return {
    student,
    loading,
    error,
    updateStudent,
    refetch: fetchStudent,
  };
}

export function useStudents(schoolId?: string | null) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [schoolId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('students').select('*').order('created_at', { ascending: false });

      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setStudents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch students'));
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  };
}
