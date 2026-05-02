import { neonClient } from '../lib/neonClient'

export type UserRole = 'citizen' | 'admin' | 'worker'

export interface DbUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  phone?: string | null
  bio?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

interface AuthUserLike {
  id?: string
  email?: string
  name?: string | null
  image?: string | null
}

const missingTables = new Set<string>()
const appUserCache = new Map<string, Promise<{ data: DbUser | null; error: any }>>()

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const isMissingTableError = (error: any) =>
  error?.code === 'PGRST205' ||
  /could not find the table/i.test(error?.message || '') ||
  /schema cache/i.test(error?.message || '')

const rememberMissingTable = (table: string, error: any) => {
  if (isMissingTableError(error)) {
    missingTables.add(table)
    console.warn(
      `Neon table "${table}" is missing. Run backend/neon_schema.sql in Neon SQL editor, then refresh the app.`
    )
  }
}

const tableUnavailable = (table: string) => missingTables.has(table)

const first = <T,>(rows: T[] | null | undefined) => rows?.[0] ?? null

const createSchemaError = (table: string) => ({
  code: 'PGRST205',
  message: `Missing Neon table "${table}". Run backend/neon_schema.sql in Neon SQL editor.`,
})

// Users
export const createUser = async (userData: {
  id?: string
  email: string
  name?: string | null
  role?: UserRole
  phone?: string | null
  avatar_url?: string | null
}) => {
  if (tableUnavailable('users')) return { data: null, error: createSchemaError('users') }

  const payload = {
    ...userData,
    email: normalizeEmail(userData.email),
    name: userData.name || userData.email.split('@')[0],
    role: userData.role || 'citizen',
  }

  try {
    const { data, error } = await neonClient.from('users').insert(payload).select()
    if (!error) return { data: first<DbUser>(data), error: null }

    rememberMissingTable('users', error)

    // Email is unique. If another tab/request created the row first, reuse it.
    if (/duplicate|unique/i.test(error.message || error.code || '')) {
      return getUserByEmail(payload.email)
    }

    return { data: null, error }
  } catch (error) {
    rememberMissingTable('users', error)
    return { data: null, error }
  }
}

export const updateUser = async (userId: string, updates: Partial<DbUser>) => {
  if (tableUnavailable('users')) return { data: null, error: createSchemaError('users') }

  try {
    const { data, error } = await neonClient.from('users').update(updates).eq('id', userId).select()
    if (error) rememberMissingTable('users', error)
    return { data: first<DbUser>(data), error }
  } catch (error) {
    rememberMissingTable('users', error)
    return { data: null, error }
  }
}

export const getUserById = async (userId: string) => {
  if (tableUnavailable('users')) return { data: null, error: createSchemaError('users') }

  try {
    const { data, error } = await neonClient.from('users').select('*').eq('id', userId)
    if (error) {
      rememberMissingTable('users', error)
      return { data: null, error }
    }
    return { data: first<DbUser>(data), error: null }
  } catch (error) {
    rememberMissingTable('users', error)
    return { data: null, error }
  }
}

export const getUserByEmail = async (email: string) => {
  if (tableUnavailable('users')) return { data: null, error: createSchemaError('users') }

  try {
    const { data, error } = await neonClient.from('users').select('*').eq('email', normalizeEmail(email))
    if (error) {
      rememberMissingTable('users', error)
      return { data: null, error }
    }
    return { data: first<DbUser>(data), error: null }
  } catch (error) {
    rememberMissingTable('users', error)
    return { data: null, error }
  }
}

export const ensureAppUser = async (authUser: AuthUserLike, defaults?: Partial<DbUser>) => {
  if (!authUser.email) {
    return { data: null, error: { message: 'Signed-in user has no email address.' } }
  }

  const email = normalizeEmail(authUser.email)
  const cacheKey = `${authUser.id || 'email'}:${email}`
  const cached = appUserCache.get(cacheKey)
  if (cached) return cached

  const promise = (async () => {
    const byEmail = await getUserByEmail(email)
    if (byEmail.data) {
      const updates: Partial<DbUser> = {}
      if (!byEmail.data.name && (authUser.name || defaults?.name)) {
        updates.name = authUser.name || defaults?.name || null
      }
      if (!byEmail.data.avatar_url && (authUser.image || defaults?.avatar_url)) {
        updates.avatar_url = authUser.image || defaults?.avatar_url || null
      }

      if (Object.keys(updates).length > 0) {
        await updateUser(byEmail.data.id, updates)
        return { data: { ...byEmail.data, ...updates }, error: null }
      }

      return { data: byEmail.data, error: null }
    }

    if (byEmail.error && isMissingTableError(byEmail.error)) {
      return byEmail
    }

    return createUser({
      // Use the auth UUID for new rows so future lookups and foreign keys stay aligned.
      id: authUser.id,
      email,
      name: authUser.name || defaults?.name || email.split('@')[0],
      role: defaults?.role || 'citizen',
      phone: defaults?.phone,
      avatar_url: authUser.image || defaults?.avatar_url || null,
    })
  })()

  appUserCache.set(cacheKey, promise)
  const result = await promise
  if (!result.data) appUserCache.delete(cacheKey)
  return result
}

// Reports
export const savePredictionReport = async (
  userId: string,
  imageUrl: string,
  segmentedUrl: string,
  latitude: number | null,
  longitude: number | null,
  severity: string,
  complaintText: string,
  aiSummary: string,
  detectionMetrics: any
) => {
  if (tableUnavailable('reports')) return null

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
      rememberMissingTable('reports', error)
      console.error('Error saving report:', error)
      return null
    }
    return first<any>(data)
  } catch (error) {
    rememberMissingTable('reports', error)
    console.error('Error saving report:', error)
    return null
  }
}

export const fetchUserReports = async (userId: string) => {
  if (tableUnavailable('reports')) return { data: [], error: createSchemaError('reports') }

  try {
    const { data, error } = await neonClient.from('reports').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) rememberMissingTable('reports', error)
    return { data: data || [], error }
  } catch (error) {
    rememberMissingTable('reports', error)
    return { data: [], error }
  }
}

export const fetchAllReports = async () => {
  if (tableUnavailable('reports')) return { data: [], error: createSchemaError('reports') }

  try {
    const { data, error } = await neonClient.from('reports').select('*').order('created_at', { ascending: false })
    if (error) rememberMissingTable('reports', error)
    return { data: data || [], error }
  } catch (error) {
    rememberMissingTable('reports', error)
    return { data: [], error }
  }
}

export const updateReportStatus = async (reportId: string, status: string) => {
  if (tableUnavailable('reports')) return { data: null, error: createSchemaError('reports') }

  try {
    const { data, error } = await neonClient.from('reports').update({ status }).eq('id', reportId).select()
    if (error) rememberMissingTable('reports', error)
    return { data, error }
  } catch (error) {
    rememberMissingTable('reports', error)
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
  if (tableUnavailable('reports')) return { data: null, error: createSchemaError('reports') }

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
    if (error) rememberMissingTable('reports', error)
    return { data: first<any>(data), error }
  } catch (error) {
    rememberMissingTable('reports', error)
    return { data: null, error }
  }
}

// Leaderboard
export const updateLeaderboard = async (userId: string) => {
  if (tableUnavailable('reports') || tableUnavailable('leaderboard')) {
    return createSchemaError(tableUnavailable('reports') ? 'reports' : 'leaderboard')
  }

  try {
    const { data: reports, error: reportsError } = await neonClient.from('reports').select('*').eq('user_id', userId)
    if (reportsError) {
      rememberMissingTable('reports', reportsError)
      return reportsError
    }

    const reportsCount = reports?.length || 0
    const resolvedCount = reports?.filter((r: any) => r.status === 'fixed').length || 0
    const score = reportsCount * 10 + resolvedCount * 50
    const month = new Date().toISOString().slice(0, 7)

    const { error } = await neonClient.from('leaderboard').upsert({
      user_id: userId,
      reports_count: reportsCount,
      resolved_count: resolvedCount,
      score,
      month,
    }, { onConflict: 'user_id,month' })

    if (error) {
      rememberMissingTable('leaderboard', error)
      console.error('Error updating leaderboard:', error)
    }

    return error || null
  } catch (error) {
    rememberMissingTable('leaderboard', error)
    console.error('Error updating leaderboard:', error)
    return error
  }
}

export const fetchLeaderboard = async (month?: string) => {
  if (tableUnavailable('leaderboard')) return { data: [], error: createSchemaError('leaderboard') }

  try {
    let query = neonClient.from('leaderboard').select('*').order('score', { ascending: false })
    if (month) {
      query = query.eq('month', month)
    } else {
      query = query.limit(100)
    }
    const { data, error } = await query
    if (error) {
      rememberMissingTable('leaderboard', error)
      return { data: [], error }
    }

    const userIds = [...new Set((data || []).map((entry: any) => entry.user_id).filter(Boolean))]
    if (userIds.length === 0 || tableUnavailable('users')) return { data: data || [], error: null }

    const users = await Promise.all(userIds.map((id) => getUserById(id)))
    const usersById = new Map(users.filter((result) => result.data).map((result) => [result.data!.id, result.data]))

    return {
      data: (data || []).map((entry: any) => ({
        ...entry,
        users: usersById.get(entry.user_id) || null,
      })),
      error: null,
    }
  } catch (error) {
    rememberMissingTable('leaderboard', error)
    return { data: [], error }
  }
}

// Tasks
export const fetchWorkerTasks = async (workerId: string) => {
  if (tableUnavailable('tasks')) return { data: [], error: createSchemaError('tasks') }

  try {
    const { data, error } = await neonClient.from('tasks').select('*').eq('worker_id', workerId).order('created_at', { ascending: false })
    if (error) rememberMissingTable('tasks', error)
    return { data: data || [], error }
  } catch (error) {
    rememberMissingTable('tasks', error)
    return { data: [], error }
  }
}

export const updateTaskStatus = async (taskId: string, status: string, progress?: number) => {
  if (tableUnavailable('tasks')) return { data: null, error: createSchemaError('tasks') }

  try {
    const updates: any = { status }
    if (progress !== undefined) updates.progress = progress
    const { data, error } = await neonClient.from('tasks').update(updates).eq('id', taskId).select()
    if (error) rememberMissingTable('tasks', error)
    return { data, error }
  } catch (error) {
    rememberMissingTable('tasks', error)
    return { data: null, error }
  }
}

// Chat Messages
export const saveChatMessage = async (userId: string, message: string, response: string) => {
  if (tableUnavailable('chat_messages')) return { data: null, error: createSchemaError('chat_messages') }

  try {
    const { data, error } = await neonClient.from('chat_messages').insert({
      user_id: userId,
      message,
      response,
    }).select()
    if (error) rememberMissingTable('chat_messages', error)
    return { data, error }
  } catch (error) {
    rememberMissingTable('chat_messages', error)
    return { data: null, error }
  }
}

export const fetchChatHistory = async (userId: string) => {
  if (tableUnavailable('chat_messages')) return { data: [], error: createSchemaError('chat_messages') }

  try {
    const { data, error } = await neonClient
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) rememberMissingTable('chat_messages', error)
    return { data: data || [], error }
  } catch (error) {
    rememberMissingTable('chat_messages', error)
    return { data: [], error }
  }
}
