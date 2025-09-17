import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';

interface TrendsData {
  last7Days: Array<{
    date: string;
    dayName: string;
    present: number;
    absent: number;
    percentage: string;
  }>;
  weeklyAverage: string;
  topPerformers: Array<{
    name: string;
    attendanceCount: number;
    percentage: number;
  }>;
  bottomPerformers: Array<{
    name: string;
    attendanceCount: number;
    percentage: number;
  }>;
}

interface TrendsChartProps {
  trends: TrendsData;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ trends }) => {
  const maxAttendance = Math.max(...trends.last7Days.map(day => day.present));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-6 text-center">📊 Tren Kehadiran 7 Hari Terakhir</h2>

      {/* Weekly Average */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CountUp end={parseFloat(trends.weeklyAverage)} suffix="%" className="text-3xl font-bold text-blue-600" duration={2} />
          <div className="text-sm text-gray-600">Rata-rata Mingguan</div>
        </motion.div>
      </div>

      {/* 7-Day Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Kehadiran Harian</h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {trends.last7Days.map((day, index) => (
            <motion.div
              key={index}
              className="flex-1 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-xs text-gray-600 mb-1">
                <CountUp end={parseFloat(day.percentage)} suffix="%" duration={1.5} />
              </div>
              <motion.div
                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                initial={{ height: 0 }}
                animate={{
                  height: `${maxAttendance > 0 ? (day.present / maxAttendance) * 100 : 0}%`
                }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
                style={{ minHeight: '4px' }}
              ></motion.div>
              <div className="text-xs text-gray-500 mt-2">{day.dayName}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top and Bottom Performers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-green-600">🏆 Siswa Terbaik (30 hari)</h3>
          <div className="space-y-2">
            {trends.topPerformers.map((student, index) => (
              <motion.div
                key={index}
                className="flex justify-between items-center p-2 bg-green-50 rounded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <span className="text-sm font-medium">{student.name}</span>
                <span className="text-sm text-green-600 font-bold">{student.attendanceCount}/30 hari</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Perlu Perhatian (30 hari)</h3>
          <div className="space-y-2">
            {trends.bottomPerformers.map((student, index) => (
              <motion.div
                key={index}
                className="flex justify-between items-center p-2 bg-red-50 rounded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <span className="text-sm font-medium">{student.name}</span>
                <span className="text-sm text-red-600 font-bold">{student.attendanceCount}/30 hari</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span>Hadir</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <span>Tidak Hadir</span>
        </div>
      </div>
    </div>
  );
};

export default TrendsChart;