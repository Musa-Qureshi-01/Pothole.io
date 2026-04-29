import { savePredictionReport as saveReportToNeon, fetchUserReports as fetchReportsFromNeon, updateLeaderboard as updateNeonLeaderboard, updateReport as updateNeonReport } from './neon'

export const savePredictionReport = saveReportToNeon

export const uploadImage = async (file: File, bucket: string) => {
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`
  return `https://placeholder-url/${fileName}`
}

export const fetchUserReports = fetchReportsFromNeon

export const updateLeaderboard = updateNeonLeaderboard

export const updateReport = updateNeonReport
