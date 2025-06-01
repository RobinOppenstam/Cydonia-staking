'use client';

interface StatsCardProps {
  title: string;
  value: string;
  gradient: string;
}

export default function StatsCard({ title, value, gradient }: StatsCardProps) {
  return (
    <div className="card-cyber hover:glow-cyan group transition-all duration-500">
      <div className="text-center">
        <h3 className="text-gray-400 text-sm font-medium mb-2 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <p className={`text-2xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient} text-glow group-hover:text-glow-strong transition-all`}>
          {value}
        </p>
      </div>
      
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </div>
  );
}