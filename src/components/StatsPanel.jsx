import React from 'react';

const StatCard = ({ title, value, subtitle, color, progress, max, unit }) => (
  <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-xl hover:border-cyan-400/50 transition-all duration-300">
    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
      {title}
    </h2>
    <div className="flex items-end justify-between mb-2">
      <div className="text-4xl font-bold" style={{ color }}>
        {value}
        {unit && <span className="text-xl text-gray-500 ml-1">{unit}</span>}
      </div>
      {max && (
        <div className="text-sm text-gray-500 mb-1">
          / {max}
        </div>
      )}
    </div>
    {subtitle && (
      <div className="text-lg font-medium mb-4" style={{ color }}>
        {subtitle}
      </div>
    )}
    {progress !== undefined && (
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-4">
        <div
          className="h-full transition-all duration-500 ease-out bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    )}
  </div>
);

const ZoneIndicator = ({ pwm, currentZone }) => {
  const zones = [
    { pwm: 0, label: 'Optimal', color: '#00ff88', description: 'Perfect posture' },
    { pwm: 80, label: 'Warning', color: '#ffaa00', description: 'Minor correction needed' },
    { pwm: 160, label: 'Alert', color: '#ff6600', description: 'Significant correction required' },
    { pwm: 255, label: 'Critical', color: '#ff0000', description: 'Immediate attention needed' }
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 shadow-xl">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Posture Status
      </h2>
      
      <div className="text-2xl font-bold mb-2" style={{ color: zones.find(z => z.pwm === pwm)?.color }}>
        {currentZone}
      </div>
      
      <div className="text-sm text-gray-400 mb-4">
        {zones.find(z => z.pwm === pwm)?.description}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {zones.map((zone, index) => (
          <div
            key={zone.pwm}
            className={`h-2 rounded-full transition-all ${
              pwm === zone.pwm ? 'opacity-100 scale-110' : 'opacity-30'
            }`}
            style={{ backgroundColor: zone.color }}
            title={zone.label}
          ></div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Optimal</span>
        <span>Critical</span>
      </div>
    </div>
  );
};

export const StatsPanel = ({ data, espIP }) => {
  const getAngleProgress = () => Math.min(Math.abs(data.angle) / 90 * 100, 100);
  const getPWMProgress = () => (data.pwm / 255) * 100;

  return (
    <div className="space-y-6">
      <StatCard
        title="Spine Angle"
        value={data.angle.toFixed(1)}
        unit="°"
        color={data.pwm === 0 ? '#00ff88' : data.pwm === 80 ? '#ffaa00' : data.pwm === 160 ? '#ff6600' : '#ff0000'}
        progress={getAngleProgress()}
      />

      <ZoneIndicator pwm={data.pwm} currentZone={data.zone} />

      <StatCard
        title="Correction Intensity"
        value={data.pwm}
        max={255}
        color={data.pwm === 0 ? '#00ff88' : data.pwm === 80 ? '#ffaa00' : data.pwm === 160 ? '#ff6600' : '#ff0000'}
        progress={getPWMProgress()}
      />

      {/* System Info */}
      <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">System Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Device IP:</span>
            <span className="font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">{espIP}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Update Rate:</span>
            <span className="text-cyan-400">60 FPS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sensor Type:</span>
            <span className="text-cyan-400">MPU6050 IMU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Connection:</span>
            <span className="text-green-400">Stable</span>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
        <h3 className="text-sm font-semibold text-cyan-400 mb-4">Posture Health</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Time in optimal posture</span>
              <span className="text-cyan-400">87%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full">
              <div className="h-full bg-green-400 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Daily corrections</span>
              <span className="text-cyan-400">12</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};