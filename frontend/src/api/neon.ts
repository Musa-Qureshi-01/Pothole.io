import { neonClient } from '../lib/neonClient'

// Users
export const createUser = async (userData: { email: string; name: string; role: string }) => {
  try {
    const { data, error } = await neonClient.from('users').insert(userData).select()
    if (error) return { data: null, error }
    return { data: data?.[0], error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateUser = async (userId: string, updates: any) => {
  try {
    const { data, error } = await neonClient.from('users').update(updates).eq('id', userId).select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getUserById = async (userId: string) => {
  try {
    const { data, error } = await neonClient.from('users').select('*').eq('id', userId)
    if (error) {
      console.warn('getUserById query error:', error)
      return { data: null, error }
    }
    return { data: data?.[0] || null, error: null }
  } catch (error: any) {
    // Gracefully handle 404 (table not found) or other REST API errors
    console.warn('getUserById failed (table may not exist):', error?.message || error)
    return { data: null, error }
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    const { data, error } = await neonClient.from('users').select('*').eq('email', email)
    if (error) {
      console.warn('getUserByEmail query error:', error)
      return { data: null, error }
    }
    return { data: data?.[0] || null, error: null }
  } catch (error: any) {
    console.warn('getUserByEmail failed (table may not exist):', error?.message || error)
    return { data: null, error }
  }
}

// Reports
export const savePredictionReport = async (
  userId: string,
  imageUrl: string,
  segmentedUrl: string,
  latitude: number,
  longitude: number,
  severity: string,
  complaintText: string,
  aiSummary: string,
  detectionMetrics: any
) => {
  try {
    const { data, error } = await neonClient.from('reports').insert({
      user_id: userId,
      image_url: imageUrl,
      segmented_url: segmentedUrl,
      latitude,
      longitude,
      severity,
      complaint_text: complaintText,
      ai_summary: aiSummary,
      status: 'pending',
      metrics: detectionMetrics,
    }).select()
    if (error) {
      console.error('Error saving report:', error)
      return null
    }
    return data?.[0] || null
  } catch (error) {
    console.error('Error saving report:', error)
    return null
  }
}

export const fetchUserReports = async (userId: string) => {
  try {
    const { data, error } = await neonClient.from('reports').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const fetchAllReports = async () => {
  try {
    const { data, error } = await neonClient.from('reports').select('*').order('created_at', { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateReportStatus = async (reportId: string, status: string) => {
  try {
    const { data, error } = await neonClient.from('reports').update({ status }).eq('id', reportId).select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateReport = async (reportId: string, updates: {
  complaintText?: string
  aiSummary?: string
  severity?: string
  metrics?: any
  status?: string
  latitude?: number | null
  longitude?: number | null
}) => {
  try {
    const payload: any = {}
    if (updates.complaintText !== undefined) payload.complaint_text = updates.complaintText
    if (updates.aiSummary !== undefined) payload.ai_summary = updates.aiSummary
    if (updates.severity !== undefined) payload.severity = updates.severity
    if (updates.metrics !== undefined) payload.metrics = updates.metrics
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.latitude !== undefined) payload.latitude = updates.latitude
    if (updates.longitude !== undefined) payload.longitude = updates.longitude

    const { data, error } = await neonClient
      .from('reports')
      .update(payload)
      .eq('id', reportId)
      .select()
    return { data: data?.[0] || null, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Leaderboard
export const updateLeaderboard = async (userId: string) => {
  try {
    const { data: reports } = await neonClient.from('reports').select('*').eq('user_id', userId)

    const reportsCount = reports?.length || 0
    const resolvedCount = reports?.filter((r: any) => r.status === 'fixed').length || 0
    const score = reportsCount * 10 + resolvedCount * 50

    await neonClient.from('leaderboard').insert({
      user_id: userId,
      reports_count: reportsCount,
      resolved_count: resolvedCount,
      score,
      month: new Date().toISOString().slice(0, 7),
    })

    return null
  } catch (error) {
    console.error('Error updating leaderboard:', error)
    return error
  }
}

export const fetchLeaderboard = async (month?: string) => {
  try {
    let query = neonClient.from('leaderboard').select('*').order('score', { ascending: false })
    if (month) {
      query = query.eq('month', month)
    } else {
      query = query.limit(100)
    }
    const { data, error } = await query
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Tasks
export const fetchWorkerTasks = async (workerId: string) => {
  try {
    const { data, error } = await neonClient.from('tasks').select('*').eq('worker_id', workerId).order('created_at', { ascending: false })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateTaskStatus = async (taskId: string, status: string, progress?: number) => {
  try {
    const updates: any = { status }
    if (progress !== undefined) updates.progress = progress
    const { data, error } = await neonClient.from('tasks').update(updates).eq('id', taskId).select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Chat Messages
export const saveChatMessage = async (userId: string, message: string, response: string) => {
  try {
    const { data, error } = await neonClient.from('chat_messages').insert({
      user_id: userId,
      message,
      response,
    }).select()
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const fetchChatHistory = async (userId: string) => {
  try {
    const { data, error } = await neonClient
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}
