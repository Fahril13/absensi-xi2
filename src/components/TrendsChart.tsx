import React from 'react';

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
        <div className="text-3xl font-bold text-blue-600">{trends.weeklyAverage}%</div>
        <div className="text-sm text-gray-600">Rata-rata Mingguan</div>
      </div>

      {/* 7-Day Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Kehadiran Harian</h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {trends.last7Days.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-xs text-gray-600 mb-1">{day.percentage}%</div>
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${maxAttendance > 0 ? (day.present / maxAttendance) * 100 : 0}%`,
                  minHeight: '4px'
                }}
              ></div>
              <div className="text-xs text-gray-500 mt-2">{day.dayName}</div>
            </div>
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
              <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">{student.name}</span>
                <span className="text-sm text-green-600 font-bold">{student.attendanceCount}/30 hari</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Performers */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Perlu Perhatian (30 hari)</h3>
          <div className="space-y-2">
            {trends.bottomPerformers.map((student, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-sm font-medium">{student.name}</span>
                <span className="text-sm text-red-600 font-bold">{student.attendanceCount}/30 hari</span>
              </div>
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